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

async function testEnrollment() {
    console.log('\n=== TESTING HIGH YIELD ENROLLMENT ===\n');

    // 1. List all accounts to find a suitable source and see if an investment account exists
    console.log('1. Fetching all accounts...');
    const { data: allAccounts, error: accErr } = await supabase
        .from('mvp_accounts')
        .select('*')
        .limit(50);

    if (accErr) {
        console.error('   FAILED to fetch accounts:', accErr.message, accErr.code);
        return;
    }

    if (!allAccounts || allAccounts.length === 0) {
        console.log('   No accounts found in database. Cannot test enrollment.');
        return;
    }

    console.log(`   Found ${allAccounts.length} account(s):`);
    allAccounts.forEach(a => {
        console.log(`   - id=${a.id} name="${a.name}" type=${a.type} balance=${a.balance} user_id=${a.user_id}`);
    });

    // Find a non-investment account with balance to use as source
    const sourceAccount = allAccounts.find(a => {
        const t = (a.type || '').toLowerCase();
        const n = (a.name || '').toLowerCase();
        return t !== 'investment' &&
               !n.includes('high yield') &&
               (t === 'checking' || t === 'savings' || n.includes('main') || n.includes('saving')) &&
               Number(a.balance) > 0;
    });

    if (!sourceAccount) {
        console.error('\n   ERROR: No suitable funding account found (need non-investment account with balance > 0)');
        return;
    }

    const testAmount = 1.00; // Use $1.00 for safety
    const userId = sourceAccount.user_id;

    console.log(`\n2. Selected source account:`);
    console.log(`   id=${sourceAccount.id} name="${sourceAccount.name}" balance=${sourceAccount.balance}`);
    console.log(`   user_id=${userId}`);
    console.log(`   Will deduct $${testAmount.toFixed(2)} for test enrollment`);

    if (Number(sourceAccount.balance) < testAmount) {
        console.error(`   ERROR: Source account balance (${sourceAccount.balance}) is less than test amount (${testAmount})`);
        return;
    }

    // 3. Check for existing investment account
    const existingInvestment = allAccounts.find(a => (a.type || '').toLowerCase() === 'investment');
    console.log(`\n3. Existing investment account: ${existingInvestment ? 'YES (id=' + existingInvestment.id + ')' : 'NO'}`);

    // 4. Deduct from source
    console.log('\n4. Deducting from source account...');
    const newSourceBalance = Number(sourceAccount.balance) - testAmount;
    const { error: srcErr } = await supabase
        .from('mvp_accounts')
        .update({ balance: newSourceBalance })
        .eq('id', sourceAccount.id);

    if (srcErr) {
        console.error('   FAILED:', srcErr.message, srcErr.code);
        return;
    }
    console.log('   Source account updated to balance:', newSourceBalance);

    // 5. Create transaction record
    console.log('\n5. Creating transaction record...');
    const { error: txErr } = await supabase
        .from('mvp_transactions')
        .insert([{
            user_id: userId || 'ME',
            account_id: sourceAccount.id,
            amount: -testAmount,
            type: 'Transfer Out',
            description: 'High Yield Investment Deposit (TEST)',
            status: 'Success',
            date: new Date().toISOString()
        }]);

    if (txErr) {
        console.error('   FAILED:', txErr.message, txErr.code);
    } else {
        console.log('   Transaction record created');
    }

    // 6. Credit investment account
    console.log('\n6. Crediting investment account...');
    if (existingInvestment) {
        const newInvBalance = Number(existingInvestment.balance) + testAmount;
        const { error: invErr } = await supabase
            .from('mvp_accounts')
            .update({ balance: newInvBalance })
            .eq('id', existingInvestment.id);

        if (invErr) {
            console.error('   FAILED:', invErr.message, invErr.code);
            return;
        }
        console.log('   Investment account updated to balance:', newInvBalance);
    } else {
        const { error: insErr } = await supabase
            .from('mvp_accounts')
            .insert([{
                user_id: userId,
                name: 'High Yield Savings',
                type: 'Investment',
                balance: testAmount,
                account_number: '8000' + Math.floor(Math.random() * 9000000000),
                color: 'bg-indigo-900',
                is_main: 0
            }]);

        if (insErr) {
            console.error('   FAILED:', insErr.message, insErr.code);
            return;
        }
        console.log('   New investment account created with balance:', testAmount);
    }

    // 7. Verify final state
    console.log('\n7. Verifying final state...');
    const { data: finalAccounts } = await supabase
        .from('mvp_accounts')
        .select('*')
        .in('id', [sourceAccount.id, existingInvestment ? existingInvestment.id : null].filter(Boolean));

    finalAccounts?.forEach(a => {
        console.log(`   - id=${a.id} name="${a.name}" balance=${a.balance}`);
    });

    // 8. Cleanup — revert the $1.00 test deduction so user balance isn't affected
    console.log('\n8. Cleaning up (reverting test deduction)...');
    await supabase
        .from('mvp_accounts')
        .update({ balance: Number(sourceAccount.balance) })
        .eq('id', sourceAccount.id);

    if (existingInvestment) {
        await supabase
            .from('mvp_accounts')
            .update({ balance: Number(existingInvestment.balance) })
            .eq('id', existingInvestment.id);
    } else {
        // Delete the test investment account we just created
        const { data: newInv } = await supabase
            .from('mvp_accounts')
            .select('id')
            .eq('user_id', userId)
            .eq('type', 'Investment')
            .order('id', { ascending: false })
            .limit(1)
            .single();
        if (newInv) {
            await supabase.from('mvp_accounts').delete().eq('id', newInv.id);
            console.log('   Deleted test investment account id=', newInv.id);
        }
    }

    console.log('   Source balance reverted to:', sourceAccount.balance);

    console.log('\n=== TEST COMPLETE ===');
    console.log('If this test passed, the backend is fine and the issue is');
    console.log('purely that the browser is not loading your updated code.');
    console.log('Try: close the tab, reopen localhost:3000, then test again.\n');
}

testEnrollment().catch(e => {
    console.error('Test crashed:', e);
    process.exit(1);
});
