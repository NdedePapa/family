// Fix gender assignments for all members based on names and patterns
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

// Gender inference based on Ghanaian/Akan names and patterns
function inferGender(name) {
  const lower = name.toLowerCase();
  
  // Female indicators
  const femalePatterns = [
    'auntie', 'sister', 'mother', 'maame', 'aya', 'akua', 'yaba', 'adjoa', 
    'hannah', 'anna', 'janet', 'victoria', 'stephanie', 'albertine', 
    'monica', 'monique', 'elizabeth', 'patience', 'eva', 'lucy', 
    'georgina', 'getrude', 'samuella', 'chantel', 'comfort', 'mawusi',
    'aduah', 'akos', 'ajevi', 'afriyie', 'raal3 aya', 'nda', 'ndale',
    'elize', 'neri', 'nrenza', 'ayeyi', 'ann lyse', 'coffie', 'aso'
  ];
  
  // Male indicators
  const malePatterns = [
    'wofa', 'sofo', 'uncle', 'gabriel', 'moses', 'francis', 'eric', 
    'emmanuel', 'ebenezer', 'patrick', 'samuel', 'alfred', 'frederick', 
    'william', 'jacob', 'elvis', 'thomas', 'bright', 'yaw', 'tawiah',
    'joseph', 'benjamin', 'kojo', 'andoh', 'cudjoe', 'kweku', 'kwamena',
    'assuah', 'ackah', 'mensah', 'armah', 'alu', 'nyanzu', 'kodoo',
    'ek3la', 'ajaybu', 'nyamek3', 'elie', 'elia', 'pobi', 'nana cudjoe',
    'alhaji', 'oluman', 'tobia', 'gy3ni', 'wongara', 'enzi'
  ];
  
  // Check female patterns
  for (const pattern of femalePatterns) {
    if (lower.includes(pattern)) {
      return 'Female';
    }
  }
  
  // Check male patterns
  for (const pattern of malePatterns) {
    if (lower.includes(pattern)) {
      return 'Male';
    }
  }
  
  // Default based on specific cases
  if (lower.includes('kone') || lower.includes('bomo')) return 'Male';
  
  return null; // Cannot infer
}

// Manual overrides for specific IDs where name alone isn't clear
const manualGenders = {
  2: 'Female',   // Yaba (female name)
  4: 'Female',   // Aduah (female name)
  6: 'Female',   // Raal3 Aya (Aya is female)
  8: 'Female',   // Raal3 Ahua Wongara
  9: 'Female',   // Auntie Adjei
  68: 'Male',    // 3h3l3 Le gy3ni
  76: 'Male',    // Nana Cudjoe (Cudjoe indicates male)
  77: 'Male',    // Tobia
  79: 'Male',    // Sofo Andoh (Sofo = pastor, male)
  80: 'Male',    // Sofo Kojo (Sofo = pastor, male)
  85: 'Female',  // Aduah (female name)
  86: 'Female',  // Mother
  87: 'Female',  // Aduah
  102: 'Male',   // Tawiah (male name)
  103: 'Female'  // Raal3 aso
};

async function main() {
  try {
    console.log('🔧 Fixing gender assignments for all members...\n');

    const members = await apiRequest('GET', '/api/members');
    const noGender = members.filter(m => !m.gender || m.gender === '');
    
    console.log(`Found ${noGender.length} members without gender\n`);
    
    let fixed = 0;
    let failed = [];
    
    for (const member of noGender) {
      let gender = manualGenders[member.id] || inferGender(member.name);
      
      if (gender) {
        try {
          await apiRequest('PUT', `/api/members/${member.id}`, {
            name: member.name,
            gender: gender,
            gen: member.gen,
            parentId: member.parentId,
            birth: member.birth || '',
            death: member.death || '',
            town: member.town || '',
            notes: member.notes || '',
            by: member.by || 'System'
          });
          
          const icon = gender === 'Female' ? '♀' : '♂';
          console.log(`${icon} ID ${member.id.toString().padStart(3)}: ${member.name.padEnd(35)} → ${gender}`);
          fixed++;
        } catch (e) {
          console.log(`✗ Failed to update ID ${member.id}: ${member.name}`);
          failed.push(member);
        }
      } else {
        console.log(`? ID ${member.id.toString().padStart(3)}: ${member.name.padEnd(35)} → Cannot infer`);
        failed.push(member);
      }
      
      // Small delay to avoid overwhelming server
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log(`\n✅ Fixed ${fixed} members`);
    
    if (failed.length > 0) {
      console.log(`\n⚠️  Could not fix ${failed.length} members:`);
      failed.forEach(m => console.log(`  - ID ${m.id}: ${m.name}`));
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
