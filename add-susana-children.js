// Script to add Susana Cudjeo's (Amamansa) children to the family tree
// Run this script: node add-susana-children.js

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

// Susana Cudjeo's children data
const susanaChildren = [
  {
    name: "Adelaide Haji",
    gender: "Female",
    notes: "Child of Susana Cudjeo (Amamansa)"
  },
  {
    name: "Mohammed Musah",
    gender: "Male",
    notes: "Child of Susana Cudjeo (Amamansa)"
  },
  {
    name: "Latif Musah",
    gender: "Male",
    notes: "Child of Susana Cudjeo (Amamansa)"
  },
  {
    name: "Aisha Musah",
    gender: "Female",
    notes: "Child of Susana Cudjeo (Amamansa)"
  },
  {
    name: "Yussif Musah",
    gender: "Male",
    notes: "Child of Susana Cudjeo (Amamansa)"
  }
];

async function main() {
  try {
    console.log('🌳 Adding Susana Cudjeo\'s (Amamansa) children...\n');

    // Step 1: Get all members to find Susana Cudjeo/Amamansa
    console.log('📋 Fetching current family members...');
    const members = await apiRequest('GET', '/api/members');
    
    // Try to find by either Susana Cudjeo, Amamansa, or Ama Mansa
    let susana = members.find(m => 
      m.name.toLowerCase().includes('susana') && m.name.toLowerCase().includes('cudjeo')
    );
    
    if (!susana) {
      susana = members.find(m => m.name.toLowerCase().includes('amamansa'));
    }
    
    if (!susana) {
      susana = members.find(m => m.name.toLowerCase().includes('ama mansa'));
    }
    
    if (!susana) {
      console.error('❌ Error: Susana Cudjeo (Amamansa) not found in the family tree!');
      console.log('\nSearching for similar names...');
      const possibleMatches = members.filter(m => 
        m.name.toLowerCase().includes('susana') || 
        m.name.toLowerCase().includes('cudjeo') ||
        m.name.toLowerCase().includes('amamansa')
      );
      if (possibleMatches.length > 0) {
        console.log('Possible matches:', possibleMatches.map(m => `${m.name} (ID: ${m.id})`).join(', '));
      }
      process.exit(1);
    }

    console.log(`✓ Found ${susana.name} (ID: ${susana.id}, Gen: ${susana.gen})\n`);

    let addedCount = 0;
    const childGen = susana.gen + 1;

    // Step 2: Add each child of Susana
    for (const child of susanaChildren) {
      console.log(`Adding ${child.name}...`);
      
      const childData = {
        name: child.name,
        gender: child.gender,
        gen: childGen,
        parentId: susana.id,
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

    console.log(`\n✅ Success! Added ${addedCount} children to ${susana.name}.`);
    console.log('\n📊 Summary:');
    console.log(`   - Parent: ${susana.name} (Gen ${susana.gen})`);
    console.log(`   - Children added: ${addedCount} (Gen ${childGen})`);
    console.log('\n🌐 Open your browser to see the updated family tree!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
