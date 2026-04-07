// Script to fix parent names - add English names
// Kojo -> Kojo (Anthony)
// Ama Mansa -> Ama Mansa (Susana Cudjeo)
// Remove duplicate "Antony Cudjeo" child

const http = require('http');

function apiRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            reject(new Error(response.error || `HTTP ${res.statusCode}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function main() {
  try {
    console.log('🔧 Fixing parent names...\n');

    // Update Kojo to include Anthony
    console.log('1. Updating Kojo to "Kojo (Anthony)"...');
    await apiRequest('PUT', '/api/members/27', {
      name: 'Kojo (Anthony)',
      gender: 'Male',
      gen: 4,
      parentId: null,
      birth: '',
      death: '',
      town: '',
      notes: 'Also known as Anthony',
      by: 'Name Update'
    });
    console.log('   ✓ Updated Kojo (ID: 27)\n');

    // Update Ama Mansa to include Susana Cudjeo
    console.log('2. Updating Ama Mansa to "Ama Mansa (Susana Cudjeo)"...');
    await apiRequest('PUT', '/api/members/29', {
      name: 'Ama Mansa (Susana Cudjeo)',
      gender: 'Female',
      gen: 4,
      parentId: null,
      birth: '',
      death: '',
      town: '',
      notes: 'Also known as Susana Cudjeo or Amamansa',
      by: 'Name Update'
    });
    console.log('   ✓ Updated Ama Mansa (ID: 29)\n');

    // Delete the incorrectly added "Antony Cudjeo" child (ID: 122)
    console.log('3. Removing duplicate "Antony Cudjeo" (was added as child by mistake)...');
    await apiRequest('DELETE', '/api/members/122');
    console.log('   ✓ Deleted Antony Cudjeo (ID: 122)\n');

    console.log('✅ All fixes completed successfully!');
    console.log('\n📊 Changes:');
    console.log('   - Kojo → Kojo (Anthony)');
    console.log('   - Ama Mansa → Ama Mansa (Susana Cudjeo)');
    console.log('   - Removed duplicate "Antony Cudjeo" child');
    console.log('\n🌐 Refresh your browser to see the updates!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
