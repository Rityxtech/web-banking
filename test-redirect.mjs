import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(url, anonKey);

const TEST_EMAIL = 'frenzyblizz@gmail.com';
const TEST_PASSWORD = '123456';

console.log('\n=== TESTING: Normal user login during maintenance ===\n');

// 1. Check maintenance mode
console.log('1. Checking if maintenance mode is ON...');
const { data: settings } = await supabase
  .from('mvp_app_settings')
  .select('maintenance_mode')
  .eq('id', 1)
  .single();

const isMaintenance = settings?.maintenance_mode == "1" || settings?.maintenance_mode == 1;
console.log(`   Maintenance mode: ${isMaintenance ? 'ON ⚠️' : 'OFF'}`);

if (!isMaintenance) {
  console.log('\n   ⚠️  WARNING: Maintenance mode is OFF - test won\'t show the issue');
  console.log('   Enable it in admin settings first!');
}

// 2. Try to sign in
console.log('\n2. Attempting login with normal user...');
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
});

if (authError) {
  console.log(`   Login error: ${authError.message}`);
} else {
  console.log(`   ✅ Login succeeded - User ID: ${authData.user?.id}`);
  console.log(`   Session exists: ${!!authData.session}`);
}

// 3. Check if user is admin
console.log('\n3. Checking user role in database...');
const { data: profiles } = await supabase
  .from('mvp_profiles')
  .select('role, user_id')
  .eq('user_id', authData?.user?.id)
  .single();

console.log(`   Profile role: ${profiles?.role || 'NOT FOUND'}`);
console.log(`   Is admin: ${profiles?.role === 'admin' ? 'YES' : 'NO ❌'}`);

// 4. The issue: If maintenance is ON and user is NOT admin
// App.tsx will sign them out and redirect
if (isMaintenance && profiles?.role !== 'admin' && authData?.session) {
  console.log('\n4. 🔴 ISSUE CONFIRMED:');
  console.log('   - Maintenance mode is ON');
  console.log('   - User is NOT admin');
  console.log('   - User has valid session');
  console.log('   → App.tsx will signOut() and redirect to home!');
}

// 5. Sign out
await supabase.auth.signOut();
console.log('\n5. Signed out.');

console.log('\n=== ROOT CAUSE FOUND ===');
console.log('The redirect happens because:');
console.log('1. Auth.tsx: shows modal locally (good)');
console.log('2. App.tsx handleSession: also runs on auth state change');
console.log('3. App.tsx sees non-admin + maintenance = calls signOut()');
console.log('4. signOut() triggers SIGNED_OUT → window.location.hash = ""');
console.log('5. This redirects to homepage!');
console.log('\nFIX: App.tsx should NOT signOut non-admins, let Auth.tsx handle it');
