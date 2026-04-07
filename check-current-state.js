// Check current database state to understand what was broken
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
    
    console.log('=== CURRENT DATABASE STATE ===\n');
    
    // Show Kojo
    const kojo = members.find(m => m.id === 27);
    console.log('KOJO (ID: 27):');
    console.log(`  Name: ${kojo.name}`);
    console.log(`  Parent ID: ${kojo.parentId}`);
    console.log(`  Generation: ${kojo.gen}`);
    const kojoChildren = members.filter(m => m.parentId === 27);
    console.log(`  Children: ${kojoChildren.length}`);
    kojoChildren.forEach(c => console.log(`    - ${c.name} (ID: ${c.id})`));
    
    console.log('\n');
    
    // Show Ama Mansa
    const amaMansa = members.find(m => m.id === 29);
    console.log('AMA MANSA (ID: 29):');
    console.log(`  Name: ${amaMansa.name}`);
    console.log(`  Parent ID: ${amaMansa.parentId}`);
    console.log(`  Generation: ${amaMansa.gen}`);
    const amaMansaChildren = members.filter(m => m.parentId === 29);
    console.log(`  Children: ${amaMansaChildren.length}`);
    amaMansaChildren.forEach(c => console.log(`    - ${c.name} (ID: ${c.id})`));
    
    console.log('\n=== GENERATION 3 MEMBERS (Possible Parents) ===');
    const gen3 = members.filter(m => m.gen === 3).sort((a, b) => a.id - b.id);
    gen3.forEach(m => {
      const childCount = members.filter(c => c.parentId === m.id).length;
      console.log(`ID: ${m.id.toString().padStart(3)} | ${m.name} | Children: ${childCount}`);
    });
    
    console.log('\n=== GENERATION 4 MEMBERS WITH THEIR PARENTS ===');
    const gen4 = members.filter(m => m.gen === 4).sort((a, b) => a.id - b.id);
    gen4.slice(0, 15).forEach(m => {
      const parent = members.find(p => p.id === m.parentId);
      console.log(`ID: ${m.id.toString().padStart(3)} | ${m.name.padEnd(35)} | Parent: ${parent ? parent.name : 'NONE'}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
