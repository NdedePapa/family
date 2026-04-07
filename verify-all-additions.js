// Verify all recent additions and check for missing genders
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
    const members = await apiRequest('GET', '/api/members');
    
    console.log('=== VERIFICATION REPORT ===\n');
    
    // Check Auntie Adjei's branch
    console.log('AUNTIE ADJEI BRANCH:');
    const auntieAdjei = members.find(m => m.id === 9);
    console.log(`Parent: ${auntieAdjei.name} (${auntieAdjei.gender})\n`);
    
    const auntieChildren = members.filter(m => m.parentId === 9);
    auntieChildren.forEach(child => {
      console.log(`  ├── ${child.name} (${child.gender || 'NO GENDER'})`);
      const grandchildren = members.filter(m => m.parentId === child.id);
      grandchildren.forEach(gc => {
        console.log(`  │   └── ${gc.name} (${gc.gender || 'NO GENDER'})`);
      });
    });
    
    console.log('\n');
    
    // Check Victoria Tandoh's branch
    console.log('VICTORIA TANDOH BRANCH:');
    const victoria = members.find(m => m.id === 17);
    console.log(`Parent: ${victoria.name} (${victoria.gender})\n`);
    
    const victoriaChildren = members.filter(m => m.parentId === 17);
    victoriaChildren.forEach(child => {
      console.log(`  ├── ${child.name} (${child.gender || 'NO GENDER'})`);
      const grandchildren = members.filter(m => m.parentId === child.id);
      if (grandchildren.length > 0) {
        grandchildren.forEach(gc => {
          console.log(`  │   └── ${gc.name} (${gc.gender || 'NO GENDER'})`);
        });
      }
    });
    
    console.log('\n=== GENDER CHECK ===');
    const noGender = members.filter(m => !m.gender || m.gender === '');
    if (noGender.length > 0) {
      console.log(`⚠️  Found ${noGender.length} members without gender:`);
      noGender.forEach(m => console.log(`  - ${m.name} (ID: ${m.id})`));
    } else {
      console.log('✓ All members have gender assigned');
    }
    
    console.log('\n=== RECENT ADDITIONS (IDs 106+) ===');
    const recent = members.filter(m => m.id >= 106).sort((a, b) => a.id - b.id);
    recent.forEach(m => {
      const parent = members.find(p => p.id === m.parentId);
      console.log(`ID ${m.id}: ${m.name.padEnd(35)} | ${m.gender || 'NO GENDER'} | Parent: ${parent?.name || 'NONE'}`);
    });
    
    console.log(`\nTotal recent additions: ${recent.length}`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
