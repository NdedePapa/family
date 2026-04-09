# 💾 Database Backups

This folder contains SQL backup files from database migrations.

---

## 📋 Backup Files:

| File | Date | Description |
|------|------|-------------|
| `family-tree-backup-2026-04-07T23-58-10.sql` | Apr 7, 2026 | Initial backup |
| `family-tree-mysql-2026-04-08T00-00-58.sql` | Apr 8, 2026 | MySQL export v1 |
| `family-tree-mysql-fixed-2026-04-08T00-05-12.sql` | Apr 8, 2026 | Fixed MySQL export |
| `family-tree-schema-compatible-2026-04-08T00-10-57.sql` | Apr 8, 2026 | Schema-compatible export |
| `family-tree-final-2026-04-08T00-13-44.sql` | Apr 8, 2026 | Final working backup |

---

## 🔄 How to Restore:

### Using MySQL Command Line:
```bash
mysql -u root -p family_tree < backups/family-tree-final-2026-04-08T00-13-44.sql
```

### Using MySQL Workbench:
1. Server → Data Import
2. Select file
3. Choose database: `family_tree`
4. Start Import

---

## ⚠️ Important Notes:

- **Latest backup:** `family-tree-final-2026-04-08T00-13-44.sql`
- **Keep backups safe** - These contain all family data
- **Create new backups** before major changes
- **Test restores** on a separate database first

---

## 🆕 Create New Backup:

### From Application:
1. Click **📤 Backup** button
2. Saves JSON format (for importing)

### From Database:
```bash
mysqldump -u root -p family_tree > backups/family-tree-$(date +%Y-%m-%d).sql
```

---

**Regular backups are recommended!**
