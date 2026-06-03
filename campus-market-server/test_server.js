// Integration validation test script for Campus Market server
// Runs queries against the local server using native fetch.

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🚀 Starting integration validation tests...');

  // Test 1: Ping base route
  try {
    const pingRes = await fetch('http://localhost:5000/ping');
    const pingData = await pingRes.json();
    console.log(`✅ Test 1 Passed: Ping response -> "${pingData.message}"`);
  } catch (err) {
    console.error('❌ Test 1 Failed: Server not reachable.', err.message);
    process.exit(1);
  }

  // Test 2: User Login
  let token = '';
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile: '9876543210',
        password: 'Password123'
      })
    });
    
    if (loginRes.status !== 200) {
      throw new Error(`Status code: ${loginRes.status}`);
    }

    const loginData = await loginRes.json();
    token = loginData.token;
    console.log(`✅ Test 2 Passed: User login success! Welcome "${loginData.user.name}"`);
    console.log(`🔑 Received JWT Token: ${token.substring(0, 20)}...`);
  } catch (err) {
    console.error('❌ Test 2 Failed: Login endpoint error.', err.message);
    process.exit(1);
  }

  // Test 3: Get listings (authenticated)
  try {
    const listRes = await fetch(`${BASE_URL}/products`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (listRes.status !== 200) {
      throw new Error(`Status code: ${listRes.status}`);
    }

    const listData = await listRes.json();
    console.log(`✅ Test 3 Passed: Successfully retrieved ${listData.length} listings!`);
    listData.forEach(p => {
      console.log(`  - [${p.condition}] ${p.title} - ₹${p.price} (Seller: ${p.seller?.name || p.sellerId})`);
    });
  } catch (err) {
    console.error('❌ Test 3 Failed: Fetch listings error.', err.message);
    process.exit(1);
  }

  console.log('\n🎉 All integration validation tests passed successfully!');
}

runTests();
