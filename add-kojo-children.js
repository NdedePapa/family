// Script to add Kojo's (Anthony Cudjeo) children to the family tree
// Run this script: node add-kojo-children.js

const http = require('http');

const API_BASE = 'http://localhost:3000';

// Helper function to make API requests
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

// Kojo's (Anthony Cudjeo) children data
const kojoChildren = [
  {
    name: "Antony Cudjeo",
    gender: "Male",
    notes: "Child of Kojo (Anthony)"
  },
  {
    name: "Francis Cudjeo",
    gender: "Male",
    notes: "Child of Kojo (Anthony)"
  },
  {
    name: "Georgina Cudjeo",
    gender: "Female",
    notes: "Child of Kojo (Anthony)"
  },
  {
    name: "Emmanuel Cudjeo",
    gender: "Male",
    notes: "Child of Kojo (Anthony)"
  },
  {
    name: "David Cudjeo",
    gender: "Male",
    notes: "Child of Kojo (Anthony)"
  },
  {
    name: "Hannah Cudjeo",
    gender: "Female",
    notes: "Child of Kojo (Anthony)"
  },
  {
    name: "Lucy Cudjeo",
    gender: "Female",
    notes: "Child of Kojo (Anthony)"
  },
  {
    name: "Mary Cudjeo",
    gender: "Female",
    notes: "Child of Kojo (Anthony)"
  }
];

async function main() {
  try {
    console.log('🌳 Adding Kojo\'s (Anthony Cudjeo) children...\n');

    // Step 1: Get all members to find Kojo
    console.log('📋 Fetching current family members...');
    const members = await apiRequest('GET', '/api/members');
    
    // Find Kojo in the database
    let kojo = members.find(m => m.name.toLowerCase() === 'kojo');
    
    if (!kojo) {
      console.error('❌ Error: Kojo not found in the family tree!');
      console.log('\nSearching for similar names...');
      const possibleMatches = members.filter(m => 
        m.name.toLowerCase().includes('kojo') || 
        m.name.toLowerCase().includes('anthony')
      );
      if (possibleMatches.length > 0) {
        console.log('Possible matches:', possibleMatches.map(m => `${m.name} (ID: ${m.id})`).join(', '));
      }
      process.exit(1);
    }

    console.log(`✓ Found ${kojo.name} (ID: ${kojo.id}, Gen: ${kojo.gen})\n`);

    let addedCount = 0;
    const childGen = kojo.gen + 1;

    // Step 2: Add each child of Kojo
    for (const child of kojoChildren) {
      console.log(`Adding ${child.name}...`);
      
      const childData = {
        name: child.name,
        gender: child.gender,
        gen: childGen,
        parentId: kojo.id,
        birth: '',
        death: '',
        town: '',
        notes: child.notes,
        by: 'Automated Import Script'
      };

      const addedChild = await apiRequest('POST', '/api/members', childData);
      console.log(`  ✓ Added ${addedChild.name} (ID: ${addedChild.id})`);
      addedCount++;

      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n✅ Success! Added ${addedCount} children to ${kojo.name}.`);
    console.log('\n📊 Summary:');
    console.log(`   - Parent: ${kojo.name} (Gen ${kojo.gen})`);
    console.log(`   - Children added: ${addedCount} (Gen ${childGen})`);
    console.log('\n🌐 Open your browser to see the updated family tree!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
