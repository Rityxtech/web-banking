import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://web-banking.vercel.app/api/db';

const supabase = createClient(url, anonKey);

const TEST_EMAIL = 'frenzyblizz@gmail.com';
const TEST_PASSWORD = '123456';

console.log('\n=== TESTING: Card creation flow ===\n');

// 1. Login
console.log('1. Logging in...');
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
});

if (authError) {
  console.log(`   ❌ Login failed: ${authError.message}`);
  process.exit(1);
}

const userId = authData.user.id;
console.log(`   ✅ Logged in as: ${authData.user.email}`);
console.log(`   User ID: ${userId}`);

// 2. Get auth token
const { data: sessionData } = await supabase.auth.getSession();
const token = sessionData.session?.access_token;
console.log(`   Token available: ${!!token}`);

// 3. Check direct insert works (to verify DB/schema is fine)
console.log('\n2. Testing direct Supabase insert...');
const testCard = {
  user_id: userId,
  type: 'VISA',
  number: '4111111111111111',
  holder: 'TEST USER',
  expiry: '12/28',
  pin: 'RESET',
  cvv: '123',
  is_frozen: true,
  gradient: 'from-blue-600 to-indigo-600',
  shadow: 'shadow-blue-500/30'
};

const { data: insertData, error: insertError } = await supabase
  .from('mvp_cards')
  .insert([testCard])
  .select();

if (insertError) {
  console.log(`   ❌ Direct insert FAILED: ${insertError.message}`);
  console.log(`   Code: ${insertError.code}`);
} else {
  console.log(`   ✅ Direct insert success! Card ID: ${insertData?.[0]?.id}`);
}

// 4. Now test via the actual deployed MVP backend API
console.log('\n3. Testing via deployed MVP backend API...');
console.log(`   API URL: ${API_BASE_URL}`);

const payload = {
  op: 'create',
  table: 'mvp_cards',
  data: {
    type: 'VISA',
    number: '4111111111111112',
    holder: 'TEST USER 2',
    expiry: '12/28',
    pin: 'RESET',
    cvv: '123',
    is_frozen: true,
    gradient: 'from-blue-600 to-indigo-600',
    shadow: 'shadow-blue-500/30'
  }
};

try {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  console.log(`   HTTP Status: ${response.status}`);
  console.log(`   Response: ${text.substring(0, 500)}`);

  try {
    const json = JSON.parse(text);
    console.log(`   Parsed:`, json);
    if (json.error) {
      console.log(`   ❌ API ERROR: ${json.error}`);
    } else if (json.id || json.success) {
      console.log(`   ✅ API create success!`);
    }
  } catch {
    console.log(`   Raw (not JSON): ${text}`);
  }
} catch (fetchErr) {
  console.log(`   ❌ FETCH ERROR: ${fetchErr.message}`);
  console.log(`   Name: ${fetchErr.name}`);
  console.log(`\n   🔴 THIS IS THE ISSUE!`);
  console.log(`   The frontend hits this URL and gets this error.`);
  console.log(`   Users see "connection lost" because fetch fails.`);
}

// 5. Cleanup
if (insertData?.[0]?.id) {
  console.log('\n4. Cleaning up test card...');
  await supabase.from('mvp_cards').delete().eq('id', insertData[0].id);
  console.log('   ✅ Deleted');
}

await supabase.auth.signOut();
console.log('\n=== TEST COMPLETE ===');
