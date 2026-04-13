require('dotenv').config();
const express  = require('express');
const mysql    = require('mysql2/promise');
const helmet   = require('helmet');
const cors     = require('cors');
const path     = require('path');
const multer   = require('multer');
const fs       = require('fs').promises;

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));

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

// ─── Multer Photo Upload ──────────────────────────────────────────
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads', 'photos');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

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
    birthDate: r.birth_date || null,
    deathDate: r.death_date || null,
    isLiving: r.is_living !== undefined ? Boolean(r.is_living) : true,
    town:     r.hometown   || '',
    email:    r.email      || '',
    phone:    r.phone      || '',
    notes:    r.notes      || '',
    by:       r.added_by   || '',
    photoUrl: r.photo_url  || null,
    privacyLevel: r.privacy_level || 'family',
    addedAt:  r.added_at,
  };
}

// ─── Routes ───────────────────────────────────────────────────────

app.get('/health', (req, res) => res.json({ ok: true }));

// Health check for API
app.get('/api/health', (req, res) => res.json({ ok: true, enhanced: true }));

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
  const { name, gender, gen, parentId, birth, death, town, notes, by, photoUrl, birthDate, deathDate, isLiving, privacyLevel, email, phone } = req.body;
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
             birth_year=?, death_year=?, hometown=?, notes=?, added_by=?,
             photo_url=?, birth_date=?, death_date=?, is_living=?, privacy_level=?, email=?, phone=?
       WHERE id=?`,
      [
        name.trim(), 
        gender||'', 
        parseInt(gen), 
        parentId||null, 
        birth||'', 
        death||'', 
        town||'', 
        notes||'', 
        by||'',
        photoUrl !== undefined ? photoUrl : null,
        birthDate||null,
        deathDate||null,
        isLiving !== undefined ? isLiving : true,
        privacyLevel||'family',
        email||'',
        phone||'',
        id
      ]
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

// ═══════════════════════════════════════════════════════════════
// NEW ENHANCED ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// Statistics endpoint
app.get('/api/statistics', async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_members,
        COUNT(CASE WHEN is_living = TRUE THEN 1 END) as living_members,
        COUNT(CASE WHEN is_living = FALSE THEN 1 END) as deceased_members,
        COUNT(CASE WHEN gender = 'Female' THEN 1 END) as female_count,
        COUNT(CASE WHEN gender = 'Male' THEN 1 END) as male_count,
        MAX(gen) as max_generation,
        MIN(gen) as min_generation,
        COUNT(DISTINCT hometown) as unique_hometowns,
        MIN(birth_year) as earliest_birth,
        MAX(birth_year) as latest_birth
      FROM members
    `);
    
    const [genDist] = await pool.query('SELECT gen, COUNT(*) as count FROM members GROUP BY gen ORDER BY gen');
    const [hometowns] = await pool.query(`
      SELECT hometown, COUNT(*) as count 
      FROM members 
      WHERE hometown != '' 
      GROUP BY hometown 
      ORDER BY count DESC 
      LIMIT 10
    `);
    
    const [lifespan] = await pool.query(`
      SELECT AVG(CAST(death_year AS SIGNED) - CAST(birth_year AS SIGNED)) as avg_lifespan
      FROM members
      WHERE is_living = FALSE 
        AND birth_year REGEXP '^[0-9]+$' 
        AND death_year REGEXP '^[0-9]+$'
        AND CAST(death_year AS SIGNED) > CAST(birth_year AS SIGNED)
    `);
    
    res.json({
      ...stats[0],
      generationDistribution: genDist,
      topHometowns: hometowns,
      averageLifespan: lifespan[0].avg_lifespan
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Timeline endpoint
app.get('/api/timeline', async (req, res) => {
  try {
    const [events] = await pool.query(`
      SELECT 
        m.id,
        m.name,
        m.birth_year as year,
        'birth' as event_type,
        CONCAT('Birth of ', m.name) as title,
        m.hometown as location
      FROM members m
      WHERE m.birth_year != ''
      
      UNION ALL
      
      SELECT 
        m.id,
        m.name,
        m.death_year as year,
        'death' as event_type,
        CONCAT('Death of ', m.name) as title,
        m.hometown as location
      FROM members m
      WHERE m.death_year != '' AND m.is_living = FALSE
      
      ORDER BY year
    `);
    
    res.json(events);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Photo upload endpoint
app.post('/api/photos/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const { memberId, caption, year, isProfile } = req.body;
    const filePath = `/uploads/photos/${req.file.filename}`;
    
    const [result] = await pool.query(
      'INSERT INTO photos (member_id, file_path, caption, year, is_profile_photo, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
      [memberId, filePath, caption || null, year || null, isProfile === 'true', req.body.uploadedBy || 'User']
    );
    
    if (isProfile === 'true') {
      await pool.query('UPDATE photos SET is_profile_photo = FALSE WHERE member_id = ? AND id != ?', [memberId, result.insertId]);
      await pool.query('UPDATE members SET photo_url = ? WHERE id = ?', [filePath, memberId]);
    }
    
    res.json({ id: result.insertId, filePath, success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get photos for a member
app.get('/api/photos/:memberId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM photos WHERE member_id = ? ORDER BY is_profile_photo DESC, uploaded_at DESC',
      [req.params.memberId]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════════

// Static files AFTER API routes to prevent conflicts
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// SPA fallback - serve index.html for any non-API routes (MUST be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌳 My Family Tree server → http://localhost:${PORT}`);
});
