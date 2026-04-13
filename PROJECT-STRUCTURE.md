# 📁 Project Structure Guide

## Overview

This is the complete file structure of the Family Tree Application v2.0.

```
family-tree-v2/
├── 📄 server.js                    ⭐ MAIN PRODUCTION SERVER
├── 📄 package.json                 Dependencies and scripts
├── 📄 .env.example                 Environment configuration template
├── 📄 .env                         🔒 Your actual config (NOT in git)
├── 📄 .gitignore                   Git exclusions
│
├── 📁 public/                      Frontend files
│   ├── index.html                  Main HTML
│   ├── app.js                      Application logic (1905 lines)
│   ├── styles.css                  All CSS styling
│   ├── i18n.js                     Translations (English/Twi)
│   └── d3.min.js                   D3.js library
│
├── 📁 uploads/                     User uploaded files
│   └── photos/                     Family member photos
│       └── .gitkeep
│
├── 📁 scripts/                     Utility scripts
│   ├── run-migration.js            Database migration v1→v2
│   └── test-endpoints.js           API endpoint tests
│
├── 📁 legacy/                      Archived old versions
│   ├── README.md                   Legacy files explanation
│   ├── server.basic.js             Original v1.0 server
│   ├── server-enhanced.js          v1.5 server
│   └── schema.legacy.sql           Original database schema
│
├── 📁 backups/                     Database backups
│   └── README.md
│
├── 📁 docs/                        Additional documentation
│   └── README.md
│
├── 📄 schema.sql                   ⭐ PRODUCTION DATABASE SCHEMA
├── 📄 database-migration.sql       SQL migration script
│
├── 📄 README.md                    📖 Main documentation
├── 📄 CHANGELOG.md                 Version history
├── 📄 DEPLOYMENT-GUIDE.md          How to deploy
├── 📄 CLEANUP-SUMMARY.md           What was fixed in v2.0
├── 📄 FIXES-APPLIED.md             CSP & D3 fixes
├── 📄 MOBILE-PHOTO-FIXES.md        Mobile & photo improvements
└── 📄 PROJECT-STRUCTURE.md         ⬅️ This file
```

---

## 🎯 Which Files to Use

### For Production Deployment

**Server:**
```bash
npm start              # Runs: node server.js
```
✅ Use: `server.js`  
❌ DO NOT use: Files in `/legacy/` folder

**Database:**
```bash
# New installation
mysql -u root -p < schema.sql

# Migration from v1.0
npm run migrate
```
✅ Use: `schema.sql`  
❌ DO NOT use: `schema.legacy.sql`

**Environment:**
```bash
# Copy example and configure
cp .env.example .env
# Then edit .env with your values
```
✅ Use: `.env` (create from `.env.example`)  
⚠️ NEVER commit `.env` to git

---

## 📂 Folder Breakdown

### `/public/` - Frontend
**Purpose:** All client-side files  
**Served:** Statically by Express  
**Key Files:**
- `index.html` - Main page (196 lines)
- `app.js` - Core application logic (1905 lines)
- `styles.css` - All CSS (405 lines)
- `i18n.js` - Multi-language support
- `d3.min.js` - Tree visualization library

**Access:** Automatically served at `http://localhost:3000/`

---

### `/uploads/` - User Content
**Purpose:** Store uploaded family photos  
**Subdirectories:**
- `photos/` - Profile photos for family members

**Configuration:**
- Max file size: 5MB (configurable in `.env`)
- Allowed types: JPEG, PNG, GIF, WebP
- Structure: `/uploads/photos/[timestamp]-[random]-[filename]`

**Security:**
- Files validated before upload
- Size limits enforced
- Type checking enabled
- Path traversal prevented

**Git:** Excluded via `.gitignore` (photos not committed)

---

### `/scripts/` - Utility Tools
**Purpose:** Development and deployment utilities

**Files:**

1. **`run-migration.js`**
   - Migrates v1.0 database to v2.0
   - Adds missing columns
   - Creates photos table
   - Safe to run multiple times
   ```bash
   npm run migrate
   ```

2. **`test-endpoints.js`**
   - Tests all API endpoints
   - Runs 12 test cases
   - Creates/deletes test member
   ```bash
   npm test
   ```

---

### `/legacy/` - Archived Files
**Purpose:** Keep old versions for reference  
**DO NOT USE IN PRODUCTION**

**Files:**
- `server.basic.js` - Original v1.0 server
- `server-enhanced.js` - v1.5 server
- `schema.legacy.sql` - Original database schema
- `README.md` - Explanation of legacy files

**Why kept:**
- Reference for understanding code evolution
- Emergency rollback if needed
- Documentation of changes

---

### `/backups/` - Database Backups
**Purpose:** Store database backup files  
**Not tracked by git**

**Recommended backup command:**
```bash
mysqldump -u root -p family_tree > backups/backup-$(date +%Y%m%d).sql
```

---

### `/docs/` - Additional Documentation
**Purpose:** Extended documentation and guides  
**Currently:** Placeholder for future docs

---

## 🔑 Key Files Explained

### `server.js` ⭐
**The main production server**

**Features:**
- ✅ Rate limiting (prevents abuse)
- ✅ Input sanitization (XSS protection)
- ✅ CORS configuration (security)
- ✅ Helmet security headers
- ✅ Photo upload handling
- ✅ Transaction safety
- ✅ Graceful shutdown

**Endpoints:**
- `/health` - Health check
- `/api/members` - CRUD operations
- `/api/photos/upload` - Photo uploads
- `/api/statistics` - Family stats
- `/api/timeline` - Chronological events
- `/api/change-requests` - Change management
- `/api/auth/verify` - Admin auth

---

### `schema.sql` ⭐
**Production database schema v2.0**

**Tables:**
1. `members` - Family members (enhanced with photos, dates, privacy)
2. `change_requests` - Crowdsourced change requests
3. `photos` - Photo management with metadata
4. Plus: stories, relationships, events, documents, reminders, preferences, cache

**Indexes:**
- Performance optimized for common queries
- Foreign keys properly configured
- UTF8MB4 for emoji support

---

### `package.json`
**npm configuration**

**Scripts:**
```json
{
  "start": "node server.js",        // Production
  "dev": "nodemon server.js",       // Development (auto-restart)
  "migrate": "node scripts/run-migration.js",
  "test": "node scripts/test-endpoints.js"
}
```

**Dependencies:**
- express - Web framework
- mysql2 - Database driver
- multer - File uploads
- helmet - Security headers
- cors - Cross-origin requests
- express-rate-limit - Rate limiting
- dotenv - Environment variables

---

### `.env` (You create this)
**Environment configuration**

**Required variables:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=family_tree
PORT=3000
NODE_ENV=production
ADMIN_PASSWORD=your_admin_password
ALLOWED_ORIGINS=https://yourdomain.com
SESSION_SECRET=random_secret_key
```

⚠️ **NEVER commit `.env` to git!**

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Set up database
mysql -u root -p < schema.sql

# Run migration (if upgrading from v1.0)
npm run migrate

# Test everything
npm test

# Start server
npm start                  # Production
npm run dev               # Development (auto-restart)
```

---

## 📝 Development Workflow

### 1. Local Development
```bash
npm run dev               # Auto-restart on changes
```

### 2. Test Changes
```bash
npm test                  # Run API tests
```

### 3. Database Changes
```bash
# Edit schema.sql
mysql -u root -p family_tree < schema.sql
```

### 4. Production Deployment
See `DEPLOYMENT-GUIDE.md`

---

## 🔒 Security Files

**Excluded from git:**
- `.env` - Your actual credentials
- `node_modules/` - Dependencies (reinstall with npm)
- `uploads/photos/*` - User uploaded photos
- `backups/*.sql` - Database backups
- `*.log` - Log files

**Included in git:**
- `.env.example` - Template (no actual passwords)
- `schema.sql` - Database structure
- `server.js` - Application code
- `public/*` - Frontend assets

---

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Main project documentation |
| `CHANGELOG.md` | Version history |
| `DEPLOYMENT-GUIDE.md` | How to deploy to production |
| `CLEANUP-SUMMARY.md` | Summary of v2.0 improvements |
| `FIXES-APPLIED.md` | CSP & D3 multiple roots fixes |
| `MOBILE-PHOTO-FIXES.md` | Mobile UI & photo display fixes |
| `PROJECT-STRUCTURE.md` | This file - project layout |

---

## 🎯 Next Steps

1. **Read:** `README.md` for overview
2. **Configure:** Copy `.env.example` to `.env`
3. **Setup:** Run `npm install` and database setup
4. **Test:** Run `npm test` to verify
5. **Deploy:** Follow `DEPLOYMENT-GUIDE.md`

---

**Version:** 2.0.0  
**Last Updated:** April 13, 2026  
**Server File:** `server.js` (consolidated production server)
