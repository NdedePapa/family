// List all family members to find Susana Cudjeo/Amamansa
const http = require('http');

http.get('http://localhost:3000/api/members', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const members = JSON.parse(data);
    console.log('All family members:\n');
    members.forEach(m => {
      console.log(`ID: ${m.id.toString().padStart(3)} | Gen: ${m.gen} | ${m.name}`);
    });
    console.log(`\nTotal: ${members.length} members`);
  });
});
