/**
 * Payment API Test Script
 * 
 * Usage:
 * 1. First, login to get auth cookie
 * 2. Run this script with the auth cookie
 * 
 * Example:
 * npx ts-node src/scripts/test-payment-api.ts
 */

const BASE_URL = 'http://localhost:5000/api/v1';

// Test configuration
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

// Helper to make requests
async function makeRequest(
  endpoint: string, 
  options: RequestInit = {},
  cookie?: string
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };
  
  if (cookie) {
    headers['Cookie'] = cookie;
  }
  
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });
  
  try {
    const data = await response.json();
    return { status: response.status, data };
  } catch {
    return { status: response.status, data: null };
  }
}

async function testPaymentAPI(authCookie?: string) {
  console.log('\n========== Payment API Test ==========\n');
  
  if (!authCookie) {
    console.log('❌ No auth cookie provided');
    console.log('   Please login first to get auth cookie');
    console.log('   Then run: npx ts-node src/scripts/test-payment-api.ts "your-cookie"');
    return;
  }

  // Test 1: Get Payment Status (should be free initially)
  console.log('📋 Test 1: Get Payment Status');
  const statusResult = await makeRequest('/payment/status', {}, authCookie);
  console.log('   Status:', statusResult.status === 200 ? '✅' : '❌');
  console.log('   Response:', JSON.stringify(statusResult.data, null, 2));
  
  // Test 2: Create PRO Monthly Checkout
  console.log('\n📋 Test 2: Create PRO MONTHLY Checkout');
  const proMonthlyResult = await makeRequest(
    '/payment/checkout',
    {
      method: 'POST',
      body: JSON.stringify({
        planType: 'PRO',
        planMode: 'MONTHLY'
      })
    },
    authCookie
  );
  console.log('   Status:', proMonthlyResult.status === 200 ? '✅' : '❌');
  if (proMonthlyResult.data?.data?.url) {
    console.log('   Checkout URL:', proMonthlyResult.data.data.url);
  } else {
    console.log('   Response:', JSON.stringify(proMonthlyResult.data, null, 2));
  }
  
  // Test 3: Create GROWTH Yearly Checkout
  console.log('\n📋 Test 3: Create GROWTH YEARLY Checkout');
  const growthYearlyResult = await makeRequest(
    '/payment/checkout',
    {
      method: 'POST',
      body: JSON.stringify({
        planType: 'GROWTH',
        planMode: 'YEARLY'
      })
    },
    authCookie
  );
  console.log('   Status:', growthYearlyResult.status === 200 ? '✅' : '❌');
  if (growthYearlyResult.data?.data?.url) {
    console.log('   Checkout URL:', growthYearlyResult.data.data.url);
  } else {
    console.log('   Response:', JSON.stringify(growthYearlyResult.data, null, 2));
  }
  
  // Test 4: Create Billing Portal (if user has subscription)
  console.log('\n📋 Test 4: Create Billing Portal Session');
  const portalResult = await makeRequest(
    '/payment/portal',
    { method: 'POST' },
    authCookie
  );
  console.log('   Status:', portalResult.status === 200 ? '✅' : '❌');
  console.log('   Response:', JSON.stringify(portalResult.data, null, 2));
  
  // Test 5: Get Payment Status Again
  console.log('\n📋 Test 5: Get Updated Payment Status');
  const finalStatusResult = await makeRequest('/payment/status', {}, authCookie);
  console.log('   Status:', finalStatusResult.status === 200 ? '✅' : '❌');
  console.log('   Has Paid:', finalStatusResult.data?.data?.hasPaid);
  console.log('   Active Plan:', finalStatusResult.data?.data?.activePlan);
  
  console.log('\n========== Test Complete ==========\n');
}

// Get auth cookie from command line argument
const authCookie = process.argv[2];
testPaymentAPI(authCookie).catch(console.error);
