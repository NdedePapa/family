// Script to add Victoria Tandoh's descendants to the family tree
// Run this script: node add-victoria-children.js

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

// Victoria Tandoh's children data
const victoriaChildren = [
  {
    name: "Hagar Alhassan (Hajara)",
    gender: "Female",
    gen: 3,
    notes: "School name: Hagar Alhassan, Home name: Hajara",
    children: [
      { name: "Samuel Kojo Kuma Quainoo", gender: "Male" },
      { name: "Joseph Quainoo", gender: "Male" }
    ]
  },
  {
    name: "Mercy Alhassan (Ramatu)",
    gender: "Female",
    gen: 3,
    notes: "School name: Mercy Alhassan, Home name: Ramatu",
    children: []
  },
  {
    name: "Alhaji Ibrahim Cobbinah",
    gender: "Male",
    gen: 3,
    notes: "School name: Alhaji Ibrahim Cobbinah, Home name: Alhaji",
    children: []
  },
  {
    name: "Kadijah Alhassan",
    gender: "Female",
    gen: 3,
    notes: "School name: Kadijah Alhassan, Home name: Kadijah",
    children: [
      { name: "Hafiza Alhassan", gender: "Female" },
      { name: "Alfred Beikwa", gender: "Male" },
      { name: "Ernestina Bekwaw", gender: "Female" }
    ]
  },
  {
    name: "Abudulai Alhassan",
    gender: "Male",
    gen: 3,
    notes: "School name: Abudulai Alhassan, Home name: Abudulai",
    children: []
  },
  {
    name: "Fadima Alhassan",
    gender: "Female",
    gen: 3,
    notes: "School name: Fadima Alhassan, Home name: Fadima",
    children: []
  }
];

async function main() {
  try {
    console.log('🌳 Adding Victoria Tandoh\'s descendants...\n');

    // Step 1: Get all members to find Victoria Tandoh
    console.log('📋 Fetching current family members...');
    const members = await apiRequest('GET', '/api/members');
    
    const victoria = members.find(m => m.name.toLowerCase().includes('victoria tandoh'));
    
    if (!victoria) {
      console.error('❌ Error: Victoria Tandoh not found in the family tree!');
      console.log('Available members:', members.map(m => m.name).join(', '));
      process.exit(1);
    }

    console.log(`✓ Found Victoria Tandoh (ID: ${victoria.id}, Gen: ${victoria.gen})\n`);

    let addedCount = 0;

    // Step 2: Add each child of Victoria
    for (const child of victoriaChildren) {
      console.log(`Adding ${child.name}...`);
      
      const childData = {
        name: child.name,
        gender: child.gender,
        gen: child.gen,
        parentId: victoria.id,
        birth: '',
        death: '',
        town: '',
        notes: child.notes,
        by: 'Automated Import Script'
      };

      const addedChild = await apiRequest('POST', '/api/members', childData);
      console.log(`  ✓ Added ${addedChild.name} (ID: ${addedChild.id})`);
      addedCount++;

      // Step 3: Add grandchildren if any
      if (child.children && child.children.length > 0) {
        for (const grandchild of child.children) {
          console.log(`  Adding child: ${grandchild.name}...`);
          
          const grandchildData = {
            name: grandchild.name,
            gender: grandchild.gender,
            gen: 4,
            parentId: addedChild.id,
            birth: '',
            death: '',
            town: '',
            notes: `Child of ${child.name}`,
            by: 'Automated Import Script'
          };

          const addedGrandchild = await apiRequest('POST', '/api/members', grandchildData);
          console.log(`    ✓ Added ${addedGrandchild.name} (ID: ${addedGrandchild.id})`);
          addedCount++;
        }
      }

      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n✅ Success! Added ${addedCount} new family members.`);
    console.log('\n📊 Summary:');
    console.log(`   - Victoria Tandoh's children: 6`);
    console.log(`   - Grandchildren (Gen IV): ${addedCount - 6}`);
    console.log(`   - Total added: ${addedCount}`);
    console.log('\n🌐 Open your browser to see the updated family tree!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
