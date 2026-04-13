#!/usr/bin/env node

/**
 * API Endpoint Test Suite
 * Tests all endpoints to ensure they're working correctly
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'FamilyTree2026';

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  return async () => {
    try {
      await fn();
      console.log(`✅ ${name}`);
      testsPassed++;
    } catch (err) {
      console.error(`❌ ${name}: ${err.message}`);
      testsFailed++;
    }
  };
}

async function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  🧪 FAMILY TREE API TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Test 1: Health Check
  await test('Health Check', async () => {
    const res = await request('GET', '/health');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.data.ok) throw new Error('Health check failed');
    if (res.data.database !== 'connected') throw new Error('Database not connected');
  })();

  // Test 2: Get All Members
  await test('GET /api/members', async () => {
    const res = await request('GET', '/api/members');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(res.data)) throw new Error('Expected array response');
    if (res.data.length === 0) throw new Error('No members returned');
  })();

  // Test 3: Add Member (without auth - should work)
  let newMemberId;
  await test('POST /api/members (add member)', async () => {
    const res = await request('POST', '/api/members', {
      name: 'Test Member',
      gender: 'Male',
      gen: 5,
      parentId: null,
      birth: '1990',
      death: '',
      town: 'Test Town',
      notes: 'Auto-generated test member',
      by: 'Test Suite'
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    if (!res.data.id) throw new Error('No ID returned');
    newMemberId = res.data.id;
  })();

  // Test 4: Update Member
  await test('PUT /api/members/:id (update member)', async () => {
    const res = await request('PUT', `/api/members/${newMemberId}`, {
      name: 'Test Member Updated',
      gender: 'Male',
      gen: 5,
      parentId: null,
      birth: '1990',
      death: '',
      town: 'Test Town Updated',
      notes: 'Updated by test suite',
      by: 'Test Suite'
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.data.town !== 'Test Town Updated') throw new Error('Update failed');
  })();

  // Test 5: Admin Auth - Valid Password
  await test('POST /api/auth/verify (valid password)', async () => {
    const res = await request('POST', '/api/auth/verify', {
      password: ADMIN_PASSWORD
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.data.valid) throw new Error('Auth should be valid');
  })();

  // Test 6: Admin Auth - Invalid Password
  await test('POST /api/auth/verify (invalid password)', async () => {
    const res = await request('POST', '/api/auth/verify', {
      password: 'WrongPassword123'
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    if (res.data.valid) throw new Error('Auth should be invalid');
  })();

  // Test 7: Get Statistics
  await test('GET /api/statistics', async () => {
    const res = await request('GET', '/api/statistics');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (typeof res.data.total_members === 'undefined') throw new Error('Missing total_members');
  })();

  // Test 8: Get Timeline
  await test('GET /api/timeline', async () => {
    const res = await request('GET', '/api/timeline');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(res.data)) throw new Error('Expected array response');
  })();

  // Test 9: Get Change Requests
  await test('GET /api/change-requests', async () => {
    const res = await request('GET', '/api/change-requests');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(res.data)) throw new Error('Expected array response');
  })();

  // Test 10: Submit Change Request
  await test('POST /api/change-requests', async () => {
    const res = await request('POST', '/api/change-requests', {
      memberId: newMemberId,
      memberName: 'Test Member Updated',
      issue: 'Test issue - please ignore',
      requestedBy: 'Test Suite'
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
  })();

  // Test 11: Delete Member (cleanup)
  await test('DELETE /api/members/:id (cleanup test member)', async () => {
    const res = await request('DELETE', `/api/members/${newMemberId}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.data.success) throw new Error('Delete failed');
  })();

  // Test 12: CORS Headers
  await test('CORS headers present', async () => {
    const res = await request('GET', '/health');
    if (!res.headers['access-control-allow-origin']) {
      throw new Error('CORS headers missing');
    }
  })();

  // Results
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  📊 TEST RESULTS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  ✅ Passed: ${testsPassed}`);
  console.log(`  ❌ Failed: ${testsFailed}`);
  console.log(`  📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('\n❌ Test suite crashed:', err);
  process.exit(1);
});
