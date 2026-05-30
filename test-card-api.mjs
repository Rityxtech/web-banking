import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, anonKey);

const TEST_EMAIL = 'frenzyblizz@gmail.com';
const TEST_PASSWORD = '123456';

console.log('\n=== DIAGNOSING: Card creation failure ===\n');

// 1. Login
console.log('1. Logging in as normal user...');
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
});

if (authError) {
  console.log(`   ❌ Login failed: ${authError.message}`);
  process.exit(1);
}

const userId = authData.user.id;
const token = authData.session.access_token;
console.log(`   ✅ Logged in: ${authData.user.email}`);
console.log(`   User ID: ${userId}`);

// 2. Test the exact payload the frontend sends
console.log('\n2. Testing MVP API with exact frontend payload...');

const payload = {
  op: 'create',
  table: 'mvp_cards',
  data: {
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
  }
};

console.log('   Payload:', JSON.stringify(payload, null, 2));

// Try multiple possible API URLs
const urlsToTry = [
  'https://web-banking.vercel.app/api/db',
  'https://web-banking-git-main-rityxtech.vercel.app/api/db',
  'https://web-banking-rityxtech.vercel.app/api/db',
];

for (const apiUrl of urlsToTry) {
  console.log(`\n   Trying: ${apiUrl}`);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const text = await response.text();
    console.log(`   HTTP ${response.status}: ${text.substring(0, 300)}`);

    if (response.ok) {
      try {
        const json = JSON.parse(text);
        console.log('   ✅ API SUCCESS!');
        console.log('   Response keys:', Object.keys(json));
        if (json.id) console.log('   Created ID:', json.id);
        if (json.error) console.log('   API returned error:', json.error);
      } catch {
        console.log('   Response (not JSON):', text);
      }
    } else {
      console.log('   ❌ API returned error status');
    }
  } catch (err) {
    console.log(`   ❌ FETCH FAILED: ${err.message}`);
    if (err.name === 'AbortError') {
      console.log('   Reason: Request timed out after 20s');
    }
  }
}

// 3. Also test direct Supabase to confirm DB is fine
console.log('\n3. Testing direct Supabase insert...');
const { data: directData, error: directError } = await supabase
  .from('mvp_cards')
  .insert([payload.data])
  .select();

if (directError) {
  console.log(`   ❌ Direct insert failed: ${directError.message}`);
} else {
  console.log(`   ✅ Direct insert success! ID: ${directData[0]?.id}`);
  // Cleanup
  await supabase.from('mvp_cards').delete().eq('id', directData[0].id);
  console.log('   Cleaned up test card');
}

await supabase.auth.signOut();
console.log('\n=== DIAGNOSIS COMPLETE ===');
