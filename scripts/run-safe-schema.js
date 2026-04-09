// Run safe schema upgrade
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function runSafeSchema() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'family_tree',
    multipleStatements: true
  });

  try {
    console.log('📚 Reading schema-enhanced-safe.sql...');
    const sqlPath = path.join(__dirname, 'schema-enhanced-safe.sql');
    const sql = await fs.readFile(sqlPath, 'utf8');
    
    console.log('⚙️  Creating new tables...');
    await conn.query(sql);
    
    console.log('✅ All new tables created successfully!');
    console.log('\n📋 Tables created:');
    console.log('   ✅ stories');
    console.log('   ✅ relationships');
    console.log('   ✅ events');
    console.log('   ✅ photos');
    console.log('   ✅ documents');
    console.log('   ✅ reminders');
    console.log('   ✅ user_preferences');
    console.log('   ✅ statistics_cache');
    console.log('\n🎉 Database upgrade complete!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await conn.end();
  }
}

runSafeSchema().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
