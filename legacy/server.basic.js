require('dotenv').config();
const express  = require('express');
const mysql    = require('mysql2/promise');
const helmet   = require('helmet');
const cors     = require('cors');
const path     = require('path');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── DB pool ──────────────────────────────────────────────────────
const pool = mysql.createPool({
  host:            process.env.DB_HOST     || 'localhost',
  port:            process.env.DB_PORT     || 3306,
  user:            process.env.DB_USER     || 'root',
  password:        process.env.DB_PASSWORD || '',
  database:        process.env.DB_NAME     || 'family_tree',
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers:  true,
});

(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Database connected');
    conn.release();
  } catch (e) {
    console.error('❌ Database connection failed:', e.message);
    process.exit(1);
  }
})();

// ─── Helper ───────────────────────────────────────────────────────
function toFront(r) {
  return {
    id:       r.id,
    name:     r.name,
    gender:   r.gender     || '',
    gen:      r.gen,
    parentId: r.parent_id  || null,
    birth:    r.birth_year || '',
    death:    r.death_year || '',
    town:     r.hometown   || '',
    notes:    r.notes      || '',
    by:       r.added_by   || '',
    addedAt:  r.added_at,
  };
}

// ─── Routes ───────────────────────────────────────────────────────

app.get('/health', (req, res) => res.json({ ok: true }));

// GET all members — ordered top-down (lowest gen = ancestors first)
app.get('/api/members', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM members ORDER BY gen ASC, id ASC'
    );
    res.json(rows.map(toFront));
  } catch (e) {
    console.error('GET /api/members', e.message);
    res.status(500).json({ error: 'Could not load members' });
  }
});

// POST add member
// gen can be any integer — negative for ancestors above Nana Aku
app.post('/api/members', async (req, res) => {
  const { name, gender, gen, parentId, birth, death, town, notes, by } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
  if (gen === undefined || gen === null) return res.status(400).json({ error: 'Generation is required' });
  try {
    const [result] = await pool.query(
      `INSERT INTO members
         (name, gender, gen, parent_id, birth_year, death_year, hometown, notes, added_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name.trim(), gender||'', parseInt(gen), parentId||null, birth||'', death||'', town||'', notes||'', by||'']
    );
    const [[row]] = await pool.query('SELECT * FROM members WHERE id = ?', [result.insertId]);
    res.status(201).json(toFront(row));
  } catch (e) {
    console.error('POST /api/members', e.message);
    res.status(500).json({ error: 'Could not add member' });
  }
});

// PUT update member — including setting a parent on Nana Aku herself
app.put('/api/members/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, gender, gen, parentId, birth, death, town, notes, by } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
  if (parentId && parentId === id) return res.status(400).json({ error: 'Member cannot be their own parent' });

  // Circular reference check — parentId cannot be a descendant of id
  if (parentId) {
    try {
      let checkId = parseInt(parentId);
      const visited = new Set();
      while (checkId) {
        if (visited.has(checkId)) break;
        if (checkId === id) return res.status(400).json({ error: 'Circular reference — that person is a descendant of this member' });
        visited.add(checkId);
        const [[row]] = await pool.query('SELECT parent_id FROM members WHERE id = ?', [checkId]);
        checkId = row ? row.parent_id : null;
      }
    } catch(e) { /* non-fatal */ }
  }

  try {
    await pool.query(
      `UPDATE members
         SET name=?, gender=?, gen=?, parent_id=?,
             birth_year=?, death_year=?, hometown=?, notes=?, added_by=?
       WHERE id=?`,
      [name.trim(), gender||'', parseInt(gen), parentId||null, birth||'', death||'', town||'', notes||'', by||'', id]
    );
    const [[updated]] = await pool.query('SELECT * FROM members WHERE id = ?', [id]);
    if (!updated) return res.status(404).json({ error: 'Member not found' });
    res.json(toFront(updated));
  } catch (e) {
    console.error('PUT /api/members/:id', e.message);
    res.status(500).json({ error: 'Could not update member' });
  }
});

// DELETE member
app.delete('/api/members/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [children] = await pool.query('SELECT id FROM members WHERE parent_id = ?', [id]);
    if (children.length > 0) return res.status(400).json({ error: 'This member has children — reassign or delete them first' });
    const [result] = await pool.query('DELETE FROM members WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Member not found' });
    res.json({ success: true });
  } catch (e) {
    console.error('DELETE /api/members/:id', e.message);
    res.status(500).json({ error: 'Could not delete member' });
  }
});

// ─── Change Requests ──────────────────────────────────────────

// GET all change requests
app.get('/api/change-requests', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM change_requests ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (e) {
    console.error('GET /api/change-requests', e.message);
    res.status(500).json({ error: 'Could not load change requests' });
  }
});

// POST submit change request
app.post('/api/change-requests', async (req, res) => {
  const { memberId, memberName, issue, requestedBy } = req.body;
  if (!memberId || !memberName || !issue || !requestedBy) {
    return res.status(400).json({ error: 'All fields required' });
  }
  try {
    const [result] = await pool.query(
      `INSERT INTO change_requests (member_id, member_name, issue, requested_by)
       VALUES (?, ?, ?, ?)`,
      [memberId, memberName, issue.trim(), requestedBy.trim()]
    );
    const [[row]] = await pool.query('SELECT * FROM change_requests WHERE id = ?', [result.insertId]);
    res.status(201).json(row);
  } catch (e) {
    console.error('POST /api/change-requests', e.message);
    res.status(500).json({ error: 'Could not submit change request' });
  }
});

// PUT resolve/dismiss change request
app.put('/api/change-requests/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { status, resolvedBy } = req.body;
  if (!status || !['resolved', 'dismissed'].includes(status)) {
    return res.status(400).json({ error: 'Status must be resolved or dismissed' });
  }
  try {
    await pool.query(
      `UPDATE change_requests 
       SET status = ?, resolved_at = NOW(), resolved_by = ?
       WHERE id = ?`,
      [status, resolvedBy || '', id]
    );
    const [[updated]] = await pool.query('SELECT * FROM change_requests WHERE id = ?', [id]);
    if (!updated) return res.status(404).json({ error: 'Request not found' });
    res.json(updated);
  } catch (e) {
    console.error('PUT /api/change-requests/:id', e.message);
    res.status(500).json({ error: 'Could not update change request' });
  }
});

// Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Admin authentication
app.post('/api/auth/verify', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'FamilyTree2026';
  if (password === adminPassword) {
    res.json({ valid: true });
  } else {
    res.status(401).json({ valid: false, error: 'Invalid password' });
  }
});

// Import members (restore from backup)
app.post('/api/import', async (req, res) => {
  const { members, password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'FamilyTree2026';
  
  if (password !== adminPassword) {
    return res.status(401).json({ error: 'Admin password required for import' });
  }
  
  if (!Array.isArray(members) || members.length === 0) {
    return res.status(400).json({ error: 'Invalid import data' });
  }
  
  try {
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('TRUNCATE TABLE members');
    
    for (const m of members) {
      await pool.query(
        `INSERT INTO members (id, name, gender, gen, parent_id, birth_year, death_year, hometown, notes, added_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [m.id, m.name, m.gender || '', m.gen, m.parentId || null, m.birth || '', m.death || '', m.town || '', m.notes || '', m.by || '']
      );
    }
    
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    const [rows] = await pool.query('SELECT * FROM members ORDER BY gen ASC, id ASC');
    res.json({ success: true, count: rows.length, members: rows.map(toFront) });
  } catch (e) {
    console.error('POST /api/import', e.message);
    res.status(500).json({ error: 'Import failed: ' + e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌳 My Family Tree server → http://localhost:${PORT}`);
});
