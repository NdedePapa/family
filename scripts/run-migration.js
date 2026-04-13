#!/usr/bin/env node

/**
 * Database Migration Runner
 * Runs the database migration to upgrade from v1.0 to v2.0
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🔄 DATABASE MIGRATION - v1.0 → v2.0');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'family_tree',
    multipleStatements: true
  });

  try {
    console.log('→ Connecting to database...');
    await connection.connect();
    console.log('✅ Connected successfully\n');

    // Add missing columns to members table
    console.log('→ Adding missing columns to members table...');
    
    const columns = [
      { name: 'birth_date', sql: 'ALTER TABLE members ADD COLUMN birth_date DATE DEFAULT NULL AFTER birth_year' },
      { name: 'death_date', sql: 'ALTER TABLE members ADD COLUMN death_date DATE DEFAULT NULL AFTER death_year' },
      { name: 'is_living', sql: 'ALTER TABLE members ADD COLUMN is_living BOOLEAN DEFAULT TRUE AFTER death_date' },
      { name: 'photo_url', sql: 'ALTER TABLE members ADD COLUMN photo_url VARCHAR(500) DEFAULT NULL AFTER is_living' },
      { name: 'privacy_level', sql: "ALTER TABLE members ADD COLUMN privacy_level ENUM('public', 'family', 'private') DEFAULT 'family' AFTER photo_url" },
      { name: 'email', sql: 'ALTER TABLE members ADD COLUMN email VARCHAR(255) DEFAULT NULL AFTER privacy_level' },
      { name: 'phone', sql: 'ALTER TABLE members ADD COLUMN phone VARCHAR(50) DEFAULT NULL AFTER email' }
    ];

    for (const col of columns) {
      try {
        const [rows] = await connection.query(
          `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'members' AND COLUMN_NAME = ?`,
          [process.env.DB_NAME || 'family_tree', col.name]
        );
        
        if (rows[0].count === 0) {
          await connection.query(col.sql);
          console.log(`  ✅ Added column: ${col.name}`);
        } else {
          console.log(`  ℹ️  Column already exists: ${col.name}`);
        }
      } catch (err) {
        console.error(`  ❌ Error adding ${col.name}:`, err.message);
      }
    }

    // Create photos table
    console.log('\n→ Creating photos table...');
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS photos (
          id INT NOT NULL AUTO_INCREMENT,
          member_id INT NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          caption TEXT,
          year VARCHAR(10) DEFAULT NULL,
          is_profile_photo BOOLEAN DEFAULT FALSE,
          uploaded_by VARCHAR(255) NOT NULL DEFAULT 'User',
          uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
          INDEX idx_member(member_id),
          INDEX idx_profile(is_profile_photo),
          INDEX idx_uploaded(uploaded_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('  ✅ Photos table created');
    } catch (err) {
      console.log('  ℹ️  Photos table already exists');
    }

    // Add performance indexes
    console.log('\n→ Adding performance indexes...');
    
    const indexes = [
      { name: 'idx_name_search', sql: 'ALTER TABLE members ADD INDEX idx_name_search (name(50))' },
      { name: 'idx_living', sql: 'ALTER TABLE members ADD INDEX idx_living (is_living)' }
    ];

    for (const idx of indexes) {
      try {
        const [rows] = await connection.query(
          `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.STATISTICS 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'members' AND INDEX_NAME = ?`,
          [process.env.DB_NAME || 'family_tree', idx.name]
        );
        
        if (rows[0].count === 0) {
          await connection.query(idx.sql);
          console.log(`  ✅ Added index: ${idx.name}`);
        } else {
          console.log(`  ℹ️  Index already exists: ${idx.name}`);
        }
      } catch (err) {
        console.error(`  ❌ Error adding ${idx.name}:`, err.message);
      }
    }

    // Update existing data
    console.log('\n→ Updating existing member records...');
    await connection.query(`
      UPDATE members 
      SET is_living = (death_year = '' OR death_year IS NULL)
      WHERE is_living IS NULL OR is_living = TRUE
    `);
    console.log('  ✅ Updated living status based on death_year');

    // Show statistics
    console.log('\n→ Database statistics:');
    const [stats] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM members) AS total_members,
        (SELECT COUNT(*) FROM change_requests) AS total_change_requests,
        (SELECT COUNT(*) FROM photos) AS total_photos
    `);
    console.log(`  📊 Total members: ${stats[0].total_members}`);
    console.log(`  📊 Change requests: ${stats[0].total_change_requests}`);
    console.log(`  📊 Photos: ${stats[0].total_photos}`);

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  ✅ MIGRATION COMPLETED SUCCESSFULLY');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  🎉 Your database is now ready for v2.0!');
    console.log('  Next step: npm start');
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
