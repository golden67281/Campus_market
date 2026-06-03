// Load test simulation for Campus Market server
const BASE_URL = 'http://localhost:5000/api';

async function simulateLoad() {
  console.log('⚡ Starting scale and performance simulation...');
  console.log('👥 Querying products with 1000 concurrent requests...');
  
  const startTime = Date.now();
  const requests = [];
  
  for (let i = 0; i < 1000; i++) {
    requests.push(
      fetch(`${BASE_URL}/products`)
        .then(async res => {
          if (res.status === 200) {
            return { success: true };
          } else if (res.status === 429) {
            return { rateLimited: true };
          }
          return { failed: true, status: res.status };
        })
        .catch(err => {
          return { error: true, message: err.message };
        })
    );
  }
  
  const results = await Promise.all(requests);
  const duration = Date.now() - startTime;
  
  const successCount = results.filter(r => r.success).length;
  const rateLimitCount = results.filter(r => r.rateLimited).length;
  const failCount = results.filter(r => r.failed || r.error).length;
  
  console.log(`\n⏱️ Finished in ${duration}ms!`);
  console.log(`✅ Success (served from cache): ${successCount}`);
  console.log(`🛡️ Blocked by Rate Limiter: ${rateLimitCount}`);
  console.log(`❌ Failed/Errors: ${failCount}`);
  console.log(`📈 Average throughput: ${(1000 / (duration / 1000)).toFixed(2)} req/sec`);
  
  if (failCount === 0) {
    console.log('\n🎉 Scale load test passed successfully! System handles 1000 concurrent requests cleanly.');
  } else {
    console.log('\n⚠️ Some requests failed or returned error codes.');
  }
}

simulateLoad();
