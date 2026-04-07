// List all members without gender
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
    
    const noGender = members.filter(m => !m.gender || m.gender === '').sort((a, b) => a.id - b.id);
    
    console.log(`Found ${noGender.length} members without gender:\n`);
    
    noGender.forEach(m => {
      console.log(`ID: ${m.id.toString().padStart(3)} | Gen: ${m.gen} | ${m.name}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
