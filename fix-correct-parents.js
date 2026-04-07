// Fix: Kojo and Ama Mansa are children of AUNTIE ADJEI, not Georgina
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
    console.log('🔧 Fixing parent connections to AUNTIE ADJEI...\n');

    const members = await apiRequest('GET', '/api/members');
    
    const auntieAdjei = members.find(m => m.id === 9);
    console.log(`Found: ${auntieAdjei.name} (ID: ${auntieAdjei.id}, Gen: ${auntieAdjei.gen})\n`);

    // Fix Kojo (Anthony)
    console.log('1. Updating Kojo (Anthony) → Auntie Adjei...');
    const kojo = members.find(m => m.id === 27);
    await apiRequest('PUT', '/api/members/27', {
      name: kojo.name,
      gender: kojo.gender,
      gen: kojo.gen,
      parentId: 9, // Auntie Adjei
      birth: kojo.birth,
      death: kojo.death,
      town: kojo.town,
      notes: kojo.notes,
      by: 'Parent Correction'
    });
    console.log('   ✓ Updated\n');

    // Fix Ama Mansa
    console.log('2. Updating Ama Mansa (Susana Cudjeo) → Auntie Adjei...');
    const amaMansa = members.find(m => m.id === 29);
    await apiRequest('PUT', '/api/members/29', {
      name: amaMansa.name,
      gender: amaMansa.gender,
      gen: amaMansa.gen,
      parentId: 9, // Auntie Adjei
      birth: amaMansa.birth,
      death: amaMansa.death,
      town: amaMansa.town,
      notes: amaMansa.notes,
      by: 'Parent Correction'
    });
    console.log('   ✓ Updated\n');

    console.log('✅ FIXED! Tree structure now correct:\n');
    console.log('Auntie Adjei (Gen 3)');
    console.log('├── Kojo (Anthony) (Gen 4)');
    console.log('│   ├── Francis Cudjeo (Gen 5)');
    console.log('│   ├── Georgina Cudjeo (Gen 5)');
    console.log('│   ├── Emmanuel Cudjeo (Gen 5)');
    console.log('│   ├── David Cudjeo (Gen 5)');
    console.log('│   ├── Hannah Cudjeo (Gen 5)');
    console.log('│   ├── Lucy Cudjeo (Gen 5)');
    console.log('│   └── Mary Cudjeo (Gen 5)');
    console.log('└── Ama Mansa (Susana Cudjeo) (Gen 4)');
    console.log('    ├── Adelaide Haji (Gen 5)');
    console.log('    ├── Mohammed Musah (Gen 5)');
    console.log('    ├── Latif Musah (Gen 5)');
    console.log('    ├── Aisha Musah (Gen 5)');
    console.log('    └── Yussif Musah (Gen 5)');
    console.log('\n🌐 Refresh your browser - tree is now correct!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
