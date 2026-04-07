// Script to restore parent links for Kojo and Ama Mansa
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
    console.log('🔧 Restoring parent links...\n');

    // Get all members to find the correct parents
    const members = await apiRequest('GET', '/api/members');
    
    // Find Gen 3 members who might be parents
    const gen3Members = members.filter(m => m.gen === 3);
    console.log('Gen 3 members (potential parents):');
    gen3Members.forEach(m => console.log(`  - ${m.name} (ID: ${m.id})`));
    
    // Kojo and Ama Mansa are Gen 4, so they need Gen 3 parents
    // Looking at the tree structure, they are likely children of Georgina (3b3la) or another Gen 3 member
    
    // Find Georgina
    const georgina = members.find(m => m.name.includes('Georgina') && m.name.includes('3b3la'));
    
    if (georgina) {
      console.log(`\nFound Georgina (ID: ${georgina.id}) as likely parent`);
      
      // Update Kojo
      console.log('\n1. Updating Kojo (Anthony) parent link...');
      const kojo = members.find(m => m.id === 27);
      await apiRequest('PUT', '/api/members/27', {
        name: kojo.name,
        gender: kojo.gender,
        gen: kojo.gen,
        parentId: georgina.id,
        birth: kojo.birth,
        death: kojo.death,
        town: kojo.town,
        notes: kojo.notes,
        by: 'Parent Link Restored'
      });
      console.log('   ✓ Restored Kojo parent link to Georgina');

      // Update Ama Mansa
      console.log('\n2. Updating Ama Mansa (Susana Cudjeo) parent link...');
      const amaMansa = members.find(m => m.id === 29);
      await apiRequest('PUT', '/api/members/29', {
        name: amaMansa.name,
        gender: amaMansa.gender,
        gen: amaMansa.gen,
        parentId: georgina.id,
        birth: amaMansa.birth,
        death: amaMansa.death,
        town: amaMansa.town,
        notes: amaMansa.notes,
        by: 'Parent Link Restored'
      });
      console.log('   ✓ Restored Ama Mansa parent link to Georgina');
      
      console.log('\n✅ Parent links restored successfully!');
      console.log('\n🌐 Refresh your browser - the tree should work now!');
    } else {
      console.log('\n⚠️  Could not find Georgina. Checking all Gen 4 members with parents...');
      const gen4WithParents = members.filter(m => m.gen === 4 && m.parentId);
      console.log('Gen 4 members with parents:');
      gen4WithParents.slice(0, 5).forEach(m => {
        const parent = members.find(p => p.id === m.parentId);
        console.log(`  - ${m.name} → parent: ${parent?.name} (ID: ${m.parentId})`);
      });
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
