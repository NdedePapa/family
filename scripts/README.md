# 🛠️ Utility Scripts

This folder contains database management and migration scripts.

---

## 📊 Database Scripts

### Schema Management:
- **`run-safe-schema.js`** - Run enhanced schema (creates new tables)
- **`add-member-columns.js`** - Add new columns to members table
- **`schema-enhanced.sql`** - Original enhanced schema (deprecated)

### Data Migration:
- **`add-victoria-children.js`** - Add Victoria Tandoh's children
- **`add-susana-children.js`** - Add Susana's children
- **`add-kojo-children.js`** - Add Kojo's children

### Data Fixes:
- **`fix-all-genders.js`** - Fix gender data
- **`fix-correct-parents.js`** - Fix parent relationships
- **`fix-parent-names.js`** - Fix parent name issues
- **`restore-parent-links.js`** - Restore broken parent links

### Export Scripts:
- **`export-database.js`** - Export database to JSON
- **`export-database-mysql.js`** - Export to MySQL dump
- **`export-database-mysql-fixed.js`** - Fixed MySQL export
- **`export-final-working.js`** - Final working export
- **`export-schema-compatible.js`** - Schema-compatible export

### Verification:
- **`check-current-state.js`** - Check database state
- **`final-verification.js`** - Final verification checks
- **`verify-all-additions.js`** - Verify data additions
- **`list-members.js`** - List all members
- **`list-no-gender.js`** - List members without gender

---

## 📝 Data Files:
- **`victoria-tandoh-descendants.json`** - Victoria's family data

---

## ⚠️ Important Notes:

1. **Always backup** before running migration scripts
2. **Test scripts** on a copy of the database first
3. **Check dependencies** - Most scripts require `.env` configuration
4. **One-time use** - Most of these were for initial setup

---

## 🚀 Common Tasks:

### Check Database State:
```bash
node scripts/check-current-state.js
```

### List All Members:
```bash
node scripts/list-members.js
```

### Export Database:
```bash
node scripts/export-final-working.js
```

---

**Most scripts here are for historical reference and troubleshooting.**  
**The main application uses:** `server-enhanced.js` and `schema-enhanced-safe.sql`
