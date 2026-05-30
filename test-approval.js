import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function testApprove() {
    console.log('\n=== TESTING DEPOSIT APPROVAL ===\n');

    // 0. List ALL pending transactions
    console.log('0. Listing ALL pending transactions...');
    const { data: allPending, error: allErr } = await supabase
        .from('mvp_transactions')
        .select('*')
        .eq('status', 'Pending')
        .order('date', { ascending: false })
        .limit(20);

    if (allErr) {
        console.error('   Error:', allErr.message);
    } else if (!allPending || allPending.length === 0) {
        console.log('   No pending transactions found.');
    } else {
        console.log('   Found', allPending.length, 'pending transaction(s):');
        allPending.forEach((t, i) => {
            console.log(`   [${i}] id=${t.id} uuid=${t.uuid} amount=${t.amount} account_id=${t.account_id} user_id=${t.user_id} type=${t.type} date=${t.date}`);
        });
    }

    // 1. Find the most recent pending transaction
    console.log('\n1. Fetching most recent pending transaction...');
    const { data: tx, error: txErr } = await supabase
        .from('mvp_transactions')
        .select('*')
        .eq('status', 'Pending')
        .order('date', { ascending: false })
        .limit(1)
        .single();

    if (txErr || !tx) {
        console.error('   No pending transaction found or error:', txErr?.message);
        console.log('\n=== TEST COMPLETE (no pending tx) ===\n');
        return;
    }

    console.log('   Found transaction:', JSON.stringify(tx, null, 2));
    console.log('   tx.id type:', typeof tx.id, 'value:', tx.id);
    console.log('   tx.uuid type:', typeof tx.uuid, 'value:', tx.uuid);
    console.log('   tx.account_id type:', typeof tx.account_id, 'value:', tx.account_id);
    console.log('   tx.user_id type:', typeof tx.user_id, 'value:', tx.user_id);
    console.log('   tx.amount type:', typeof tx.amount, 'value:', tx.amount);

    // 2. Find the user's accounts
    console.log('\n2. Fetching user accounts for user_id:', tx.user_id);
    const { data: accounts, error: accErr } = await supabase
        .from('mvp_accounts')
        .select('*')
        .eq('user_id', tx.user_id);

    if (accErr) {
        console.error('   Error fetching accounts:', accErr.message, accErr.code);
    } else {
        console.log('   Accounts found:', accounts?.length || 0);
        accounts?.forEach(a => {
            console.log('   - account id:', a.id, 'balance:', a.balance, 'name:', a.name);
        });
    }

    const acc = accounts?.find(a => String(a.id) === String(tx.account_id));
    console.log('   Matching account:', acc ? JSON.stringify(acc, null, 2) : 'NOT FOUND');

    if (!acc) {
        console.error('\n   CRITICAL: No account matched account_id', tx.account_id);
        console.log('   Available account IDs:', accounts?.map(a => a.id));
        console.log('\n=== TEST COMPLETE (account mismatch) ===\n');
        return;
    }

    // 3. Update transaction status
    console.log('\n3. Updating transaction status to Success (id=' + tx.id + ')...');
    const { error: updErr } = await supabase
        .from('mvp_transactions')
        .update({ status: 'Success' })
        .eq('id', tx.id);

    if (updErr) {
        console.error('   Transaction update FAILED:', updErr.message, updErr.code);
    } else {
        console.log('   Transaction updated successfully.');
    }

    // 4. Update account balance
    const currentBal = Number(acc.balance) || 0;
    const txAmount = Number(tx.amount) || 0;
    const newBalance = currentBal + txAmount;
    console.log('\n4. Updating account balance...');
    console.log('   Current balance:', currentBal);
    console.log('   Transaction amount:', txAmount);
    console.log('   New balance will be:', newBalance);

    const { error: balErr } = await supabase
        .from('mvp_accounts')
        .update({ balance: newBalance })
        .eq('id', acc.id);

    if (balErr) {
        console.error('   Balance update FAILED:', balErr.message, balErr.code);
    } else {
        console.log('   Balance updated successfully.');
    }

    // 5. Verify
    console.log('\n5. Verifying final state...');
    const { data: finalTx } = await supabase.from('mvp_transactions').select('status').eq('id', tx.id).single();
    const { data: finalAcc } = await supabase.from('mvp_accounts').select('balance').eq('id', acc.id).single();

    console.log('   Final transaction status:', finalTx?.status);
    console.log('   Final account balance:', finalAcc?.balance);
    console.log('   Expected balance:', newBalance);
    console.log('   Match:', Number(finalAcc?.balance) === newBalance ? 'YES' : 'NO');

    console.log('\n=== TEST COMPLETE ===\n');
}

testApprove().catch(e => {
    console.error('Test failed:', e);
    process.exit(1);
});
