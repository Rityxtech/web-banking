import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, anonKey);

const TEST_EMAIL = 'frenzyblizz@gmail.com';
const TEST_PASSWORD = '123456';

console.log('\n=== TESTING: Top-up / Balance Update ===\n');

// 1. Login
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
});

if (authError) {
  console.log(`   ❌ Login failed: ${authError.message}`);
  process.exit(1);
}

const userId = authData.user.id;
console.log(`   ✅ Logged in: ${authData.user.email}`);
console.log(`   User ID: ${userId}`);

// 2. Find user's account
console.log('\n2. Finding user account...');
const { data: accounts, error: accError } = await supabase
  .from('mvp_accounts')
  .select('*')
  .eq('user_id', userId);

if (accError) {
  console.log(`   ❌ Error reading accounts: ${accError.message}`);
} else {
  console.log(`   Accounts found: ${accounts?.length || 0}`);
  if (accounts && accounts.length > 0) {
    const main = accounts.find(a => a.is_main) || accounts[0];
    console.log(`   Main account ID: ${main.id}`);
    console.log(`   Current balance: ${main.balance}`);

    // 3. Test balance update (simulating top-up)
    console.log('\n3. Testing balance update (+1000)...');
    const newBalance = Number(main.balance) + 1000;
    const { error: updateErr } = await supabase
      .from('mvp_accounts')
      .update({ balance: newBalance })
      .eq('id', main.id);

    if (updateErr) {
      console.log(`   ❌ Update failed: ${updateErr.message}`);
    } else {
      console.log(`   ✅ Balance updated to ${newBalance}`);
    }

    // 4. Test transaction insert
    console.log('\n4. Testing transaction insert...');
    const txId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const { data: txData, error: txErr } = await supabase
      .from('mvp_transactions')
      .insert([{
        uuid: txId,
        user_id: userId,
        account_id: main.id,
        amount: 1000,
        description: 'Wallet Top Up',
        type: 'Deposit',
        category: 'Deposit',
        status: 'Success',
        date: now
      }])
      .select();

    if (txErr) {
      console.log(`   ❌ Transaction insert failed: ${txErr.message}`);
    } else {
      console.log(`   ✅ Transaction inserted! ID: ${txData?.[0]?.id || 'unknown'}`);
    }

    // 5. Test notification insert
    console.log('\n5. Testing notification insert...');
    const { data: notifData, error: notifErr } = await supabase
      .from('mvp_notifications')
      .insert([{
        user_id: userId,
        title: 'Money Received',
        message: 'You received $1,000 from Wallet Top Up.',
        type: 'money',
        is_read: false
      }])
      .select();

    if (notifErr) {
      console.log(`   ❌ Notification insert failed: ${notifErr.message}`);
    } else {
      console.log(`   ✅ Notification inserted! ID: ${notifData?.[0]?.id || 'unknown'}`);
    }

    // 6. Revert balance change
    console.log('\n6. Reverting balance change...');
    await supabase.from('mvp_accounts').update({ balance: main.balance }).eq('id', main.id);
    console.log(`   ✅ Balance reverted to ${main.balance}`);
  }
}

await supabase.auth.signOut();
console.log('\n=== TEST COMPLETE ===');
