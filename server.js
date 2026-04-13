require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs').promises;
const rateLimit = require('express-rate-limit');

const app = express();

// ═══════════════════════════════════════════════════════════════
// SECURITY CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting for all routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many authentication attempts, please try again later' }
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: 'Too many uploads, please try again later' }
});

app.use('/api/', generalLimiter);

// ═══════════════════════════════════════════════════════════════
// DATABASE CONNECTION POOL
// ═══════════════════════════════════════════════════════════════

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'family_tree',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  decimalNumbers: true
});

(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Database connected successfully');
    conn.release();
  } catch (e) {
    console.error('❌ Database connection failed:', e.message);
    process.exit(1);
  }
})();

// ═══════════════════════════════════════════════════════════════
// FILE UPLOAD CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, process.env.UPLOAD_PATH || 'uploads', 'photos');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${sanitizedFilename}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
    }
  }
});

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function sanitizeInput(str) {
  if (!str) return '';
  return String(str).trim().substring(0, 1000);
}

function toFrontend(row) {
  return {
    id: row.id,
    name: row.name,
    gender: row.gender || '',
    gen: row.gen,
    parentId: row.parent_id || null,
    birth: row.birth_year || '',
    death: row.death_year || '',
    birthDate: row.birth_date || null,
    deathDate: row.death_date || null,
    isLiving: row.is_living !== undefined ? Boolean(row.is_living) : true,
    town: row.hometown || '',
    email: row.email || '',
    phone: row.phone || '',
    notes: row.notes || '',
    by: row.added_by || '',
    photoUrl: row.photo_url || null,
    privacyLevel: row.privacy_level || 'family',
    addedAt: row.added_at
  };
}

// ═══════════════════════════════════════════════════════════════
// ROUTES - HEALTH CHECK
// ═══════════════════════════════════════════════════════════════

app.get('/health', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    conn.release();
    res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: '2.0.0'
    });
  } catch (e) {
    res.status(503).json({
      ok: false,
      error: 'Database unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// ROUTES - MEMBERS CRUD
// ═══════════════════════════════════════════════════════════════

app.get('/api/members', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM members ORDER BY gen ASC, id ASC'
    );
    res.json(rows.map(toFrontend));
  } catch (e) {
    console.error('[ERROR] GET /api/members:', e.message);
    res.status(500).json({ error: 'Failed to load family members' });
  }
});

app.post('/api/members', async (req, res) => {
  const { name, gender, gen, parentId, birth, death, town, notes, by } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (gen === undefined || gen === null) {
    return res.status(400).json({ error: 'Generation is required' });
  }
  if (!by || !by.trim()) {
    return res.status(400).json({ error: 'Added by field is required' });
  }
  
  const sanitizedData = {
    name: sanitizeInput(name),
    gender: sanitizeInput(gender) || '',
    gen: parseInt(gen),
    parentId: parentId ? parseInt(parentId) : null,
    birth: sanitizeInput(birth) || '',
    death: sanitizeInput(death) || '',
    town: sanitizeInput(town) || '',
    notes: sanitizeInput(notes) || '',
    by: sanitizeInput(by)
  };
  
  try {
    const [result] = await pool.query(
      `INSERT INTO members
       (name, gender, gen, parent_id, birth_year, death_year, hometown, notes, added_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sanitizedData.name,
        sanitizedData.gender,
        sanitizedData.gen,
        sanitizedData.parentId,
        sanitizedData.birth,
        sanitizedData.death,
        sanitizedData.town,
        sanitizedData.notes,
        sanitizedData.by
      ]
    );
    
    const [[row]] = await pool.query('SELECT * FROM members WHERE id = ?', [result.insertId]);
    res.status(201).json(toFrontend(row));
  } catch (e) {
    console.error('[ERROR] POST /api/members:', e.message);
    res.status(500).json({ error: 'Failed to add family member' });
  }
});

app.put('/api/members/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const {
    name, gender, gen, parentId, birth, death, town, notes, by,
    photoUrl, birthDate, deathDate, isLiving, privacyLevel, email, phone
  } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  if (parentId && parentId === id) {
    return res.status(400).json({ error: 'Member cannot be their own parent' });
  }
  
  if (parentId) {
    try {
      let checkId = parseInt(parentId);
      const visited = new Set();
      
      while (checkId) {
        if (visited.has(checkId)) {
          return res.status(400).json({ error: 'Circular reference detected in family tree' });
        }
        if (checkId === id) {
          return res.status(400).json({
            error: 'Cannot set parent - this person is a descendant of the selected member'
          });
        }
        visited.add(checkId);
        
        const [[row]] = await pool.query('SELECT parent_id FROM members WHERE id = ?', [checkId]);
        checkId = row ? row.parent_id : null;
      }
    } catch (e) {
      console.error('[ERROR] Circular reference check:', e.message);
    }
  }
  
  const sanitizedData = {
    name: sanitizeInput(name),
    gender: sanitizeInput(gender) || '',
    gen: parseInt(gen),
    parentId: parentId ? parseInt(parentId) : null,
    birth: sanitizeInput(birth) || '',
    death: sanitizeInput(death) || '',
    town: sanitizeInput(town) || '',
    notes: sanitizeInput(notes) || '',
    by: sanitizeInput(by) || '',
    photoUrl: photoUrl !== undefined ? sanitizeInput(photoUrl) : null,
    birthDate: birthDate || null,
    deathDate: deathDate || null,
    isLiving: isLiving !== undefined ? Boolean(isLiving) : true,
    privacyLevel: privacyLevel || 'family',
    email: sanitizeInput(email) || '',
    phone: sanitizeInput(phone) || ''
  };
  
  try {
    await pool.query(
      `UPDATE members SET
         name=?, gender=?, gen=?, parent_id=?,
         birth_year=?, death_year=?, hometown=?, notes=?, added_by=?,
         photo_url=?, birth_date=?, death_date=?, is_living=?,
         privacy_level=?, email=?, phone=?
       WHERE id=?`,
      [
        sanitizedData.name,
        sanitizedData.gender,
        sanitizedData.gen,
        sanitizedData.parentId,
        sanitizedData.birth,
        sanitizedData.death,
        sanitizedData.town,
        sanitizedData.notes,
        sanitizedData.by,
        sanitizedData.photoUrl,
        sanitizedData.birthDate,
        sanitizedData.deathDate,
        sanitizedData.isLiving,
        sanitizedData.privacyLevel,
        sanitizedData.email,
        sanitizedData.phone,
        id
      ]
    );
    
    const [[updated]] = await pool.query('SELECT * FROM members WHERE id = ?', [id]);
    if (!updated) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.json(toFrontend(updated));
  } catch (e) {
    console.error('[ERROR] PUT /api/members/:id:', e.message);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

app.delete('/api/members/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  
  try {
    const [children] = await pool.query('SELECT id FROM members WHERE parent_id = ?', [id]);
    
    if (children.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete - this member has children. Please reassign or delete children first.'
      });
    }
    
    const [result] = await pool.query('DELETE FROM members WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.json({ success: true });
  } catch (e) {
    console.error('[ERROR] DELETE /api/members/:id:', e.message);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

// ═══════════════════════════════════════════════════════════════
// ROUTES - CHANGE REQUESTS
// ═══════════════════════════════════════════════════════════════

app.get('/api/change-requests', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM change_requests ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (e) {
    console.error('[ERROR] GET /api/change-requests:', e.message);
    res.status(500).json({ error: 'Failed to load change requests' });
  }
});

app.post('/api/change-requests', async (req, res) => {
  const { memberId, memberName, issue, requestedBy } = req.body;
  
  if (!memberId || !memberName || !issue || !requestedBy) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  const sanitizedData = {
    memberId: parseInt(memberId),
    memberName: sanitizeInput(memberName),
    issue: sanitizeInput(issue),
    requestedBy: sanitizeInput(requestedBy)
  };
  
  try {
    const [result] = await pool.query(
      `INSERT INTO change_requests (member_id, member_name, issue, requested_by)
       VALUES (?, ?, ?, ?)`,
      [sanitizedData.memberId, sanitizedData.memberName, sanitizedData.issue, sanitizedData.requestedBy]
    );
    
    const [[row]] = await pool.query('SELECT * FROM change_requests WHERE id = ?', [result.insertId]);
    res.status(201).json(row);
  } catch (e) {
    console.error('[ERROR] POST /api/change-requests:', e.message);
    res.status(500).json({ error: 'Failed to submit change request' });
  }
});

app.put('/api/change-requests/:id', authLimiter, async (req, res) => {
  const id = parseInt(req.params.id);
  const { status, resolvedBy } = req.body;
  
  if (!status || !['resolved', 'dismissed'].includes(status)) {
    return res.status(400).json({ error: 'Status must be "resolved" or "dismissed"' });
  }
  
  try {
    await pool.query(
      `UPDATE change_requests 
       SET status = ?, resolved_at = NOW(), resolved_by = ?
       WHERE id = ?`,
      [status, sanitizeInput(resolvedBy) || '', id]
    );
    
    const [[updated]] = await pool.query('SELECT * FROM change_requests WHERE id = ?', [id]);
    
    if (!updated) {
      return res.status(404).json({ error: 'Change request not found' });
    }
    
    res.json(updated);
  } catch (e) {
    console.error('[ERROR] PUT /api/change-requests/:id:', e.message);
    res.status(500).json({ error: 'Failed to update change request' });
  }
});

// ═══════════════════════════════════════════════════════════════
// ROUTES - AUTHENTICATION
// ═══════════════════════════════════════════════════════════════

app.post('/api/auth/verify', authLimiter, (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ valid: false, error: 'Password is required' });
  }
  
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword || adminPassword === 'CHANGE_THIS_ADMIN_PASSWORD_NOW') {
    console.error('[SECURITY] Admin password not configured properly!');
    return res.status(500).json({
      valid: false,
      error: 'Admin authentication not configured - please contact administrator'
    });
  }
  
  if (password === adminPassword) {
    res.json({ valid: true });
  } else {
    res.status(401).json({ valid: false, error: 'Invalid password' });
  }
});

// ═══════════════════════════════════════════════════════════════
// ROUTES - DATA IMPORT/EXPORT
// ═══════════════════════════════════════════════════════════════

app.post('/api/import', authLimiter, async (req, res) => {
  const { members, password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword || adminPassword === 'CHANGE_THIS_ADMIN_PASSWORD_NOW') {
    return res.status(500).json({ error: 'Admin authentication not configured' });
  }
  
  if (password !== adminPassword) {
    return res.status(401).json({ error: 'Admin password required for import' });
  }
  
  if (!Array.isArray(members) || members.length === 0) {
    return res.status(400).json({ error: 'Invalid import data - expected array of members' });
  }
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE members');
    
    for (const m of members) {
      await connection.query(
        `INSERT INTO members (id, name, gender, gen, parent_id, birth_year, death_year, hometown, notes, added_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          m.id,
          sanitizeInput(m.name),
          sanitizeInput(m.gender) || '',
          parseInt(m.gen),
          m.parentId || null,
          sanitizeInput(m.birth) || '',
          sanitizeInput(m.death) || '',
          sanitizeInput(m.town) || '',
          sanitizeInput(m.notes) || '',
          sanitizeInput(m.by) || ''
        ]
      );
    }
    
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    await connection.commit();
    
    const [rows] = await connection.query('SELECT * FROM members ORDER BY gen ASC, id ASC');
    
    res.json({
      success: true,
      count: rows.length,
      members: rows.map(toFrontend)
    });
  } catch (e) {
    await connection.rollback();
    console.error('[ERROR] POST /api/import:', e.message);
    res.status(500).json({ error: 'Import failed: ' + e.message });
  } finally {
    connection.release();
  }
});

// ═══════════════════════════════════════════════════════════════
// ROUTES - STATISTICS
// ═══════════════════════════════════════════════════════════════

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
        COUNT(DISTINCT hometown) as unique_hometowns
      FROM members
    `);
    
    const [genDist] = await pool.query(
      'SELECT gen, COUNT(*) as count FROM members GROUP BY gen ORDER BY gen'
    );
    
    const [hometowns] = await pool.query(`
      SELECT hometown, COUNT(*) as count 
      FROM members 
      WHERE hometown != '' 
      GROUP BY hometown 
      ORDER BY count DESC 
      LIMIT 10
    `);
    
    res.json({
      ...stats[0],
      generationDistribution: genDist,
      topHometowns: hometowns
    });
  } catch (e) {
    console.error('[ERROR] GET /api/statistics:', e.message);
    res.status(500).json({ error: 'Failed to load statistics' });
  }
});

// ═══════════════════════════════════════════════════════════════
// ROUTES - TIMELINE
// ═══════════════════════════════════════════════════════════════

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
      WHERE m.birth_year != '' AND m.birth_year REGEXP '^[0-9]+$'
      
      UNION ALL
      
      SELECT 
        m.id,
        m.name,
        m.death_year as year,
        'death' as event_type,
        CONCAT('Death of ', m.name) as title,
        m.hometown as location
      FROM members m
      WHERE m.death_year != '' AND m.death_year REGEXP '^[0-9]+$' AND m.is_living = FALSE
      
      ORDER BY year
    `);
    
    res.json(events);
  } catch (e) {
    console.error('[ERROR] GET /api/timeline:', e.message);
    res.status(500).json({ error: 'Failed to load timeline' });
  }
});

// ═══════════════════════════════════════════════════════════════
// ROUTES - PHOTO UPLOAD
// ═══════════════════════════════════════════════════════════════

app.post('/api/photos/upload', uploadLimiter, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { memberId, caption, year, isProfile, uploadedBy } = req.body;
    
    if (!memberId) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'Member ID is required' });
    }
    
    const filePath = `/uploads/photos/${req.file.filename}`;
    
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const [result] = await connection.query(
        'INSERT INTO photos (member_id, file_path, caption, year, is_profile_photo, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
        [
          parseInt(memberId),
          filePath,
          sanitizeInput(caption) || null,
          sanitizeInput(year) || null,
          isProfile === 'true',
          sanitizeInput(uploadedBy) || 'User'
        ]
      );
      
      if (isProfile === 'true') {
        await connection.query(
          'UPDATE photos SET is_profile_photo = FALSE WHERE member_id = ? AND id != ?',
          [parseInt(memberId), result.insertId]
        );
        await connection.query(
          'UPDATE members SET photo_url = ? WHERE id = ?',
          [filePath, parseInt(memberId)]
        );
      }
      
      await connection.commit();
      
      res.json({
        id: result.insertId,
        filePath,
        success: true
      });
    } catch (e) {
      await connection.rollback();
      await fs.unlink(req.file.path);
      throw e;
    } finally {
      connection.release();
    }
  } catch (e) {
    console.error('[ERROR] POST /api/photos/upload:', e.message);
    res.status(500).json({ error: 'Failed to upload photo: ' + e.message });
  }
});

app.get('/api/photos/:memberId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM photos WHERE member_id = ? ORDER BY is_profile_photo DESC, uploaded_at DESC',
      [parseInt(req.params.memberId)]
    );
    res.json(rows);
  } catch (e) {
    console.error('[ERROR] GET /api/photos/:memberId:', e.message);
    res.status(500).json({ error: 'Failed to load photos' });
  }
});

// ═══════════════════════════════════════════════════════════════
// STATIC FILES & SPA ROUTING
// ═══════════════════════════════════════════════════════════════

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════

app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// ═══════════════════════════════════════════════════════════════
// SERVER START
// ═══════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🌳 FAMILY TREE APPLICATION - SERVER STARTED');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  → Local:    http://localhost:${PORT}`);
  console.log(`  → Network:  http://${getLocalIP()}:${PORT}`);
  console.log(`  → Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('═══════════════════════════════════════════════════════════════');
});

function getLocalIP() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
