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

const testLogoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function testLogoSave() {
    console.log('\n=== TESTING SITE LOGO SAVE/READ ===\n');

    // 1. Check if mvp_app_settings table exists and has site_logo column
    console.log('1. Checking table schema...');
    const { data: columns, error: schemaError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'mvp_app_settings')
        .eq('table_schema', 'public');

    if (schemaError) {
        console.error('   Schema check error:', schemaError.message);
    } else {
        const hasSiteLogo = columns?.some(c => c.column_name === 'site_logo');
        const siteLogoCol = columns?.find(c => c.column_name === 'site_logo');
        console.log('   Columns found:', columns?.map(c => c.column_name).join(', '));
        console.log('   site_logo column exists:', hasSiteLogo ? 'YES' : 'NO');
        if (siteLogoCol) console.log('   site_logo type:', siteLogoCol.data_type);
    }

    // 2. Check current value
    console.log('\n2. Reading current app_settings (id=1)...');
    const { data: before, error: readError } = await supabase
        .from('mvp_app_settings')
        .select('*')
        .eq('id', 1)
        .single();

    if (readError) {
        console.error('   Read error:', readError.message, readError.code);
        if (readError.code === 'PGRST116') {
            console.log('   No row with id=1 exists. Creating seed row...');
        }
    } else {
        console.log('   Current site_name:', before?.site_name);
        console.log('   Current site_logo length:', before?.site_logo ? before.site_logo.length : 0);
        console.log('   Current site_logo preview:', before?.site_logo ? before.site_logo.substring(0, 100) + '...' : 'NULL');
    }

    // 3. Test save with small logo
    console.log('\n3. Testing UPDATE with test logo (small 1x1 pixel)...');
    const { data: updateResult, error: updateError } = await supabase
        .from('mvp_app_settings')
        .update({ site_logo: testLogoBase64, site_name: 'Test Bank' })
        .eq('id', 1)
        .select()
        .single();

    if (updateError) {
        console.error('   UPDATE ERROR:', updateError.message);
        console.error('   Code:', updateError.code);
        console.error('   Details:', updateError.details);
        console.error('   Hint:', updateError.hint);
    } else {
        console.log('   UPDATE SUCCESS');
        console.log('   Returned site_logo length:', updateResult?.site_logo?.length || 0);
    }

    // 4. Read back immediately
    console.log('\n4. Reading back after update...');
    const { data: after, error: readError2 } = await supabase
        .from('mvp_app_settings')
        .select('*')
        .eq('id', 1)
        .single();

    if (readError2) {
        console.error('   Read error:', readError2.message);
    } else {
        console.log('   site_name:', after?.site_name);
        console.log('   site_logo length:', after?.site_logo?.length || 0);
        console.log('   site_logo matches test:', after?.site_logo === testLogoBase64 ? 'YES' : 'NO');
        if (after?.site_logo !== testLogoBase64) {
            console.log('   Expected:', testLogoBase64.substring(0, 50) + '...');
            console.log('   Got:', after?.site_logo ? after.site_logo.substring(0, 50) + '...' : 'NULL');
        }
    }

    // 5. Test with larger base64 (simulating real image)
    console.log('\n5. Testing with larger base64 (10KB simulated)...');
    const largeLogo = 'data:image/png;base64,' + 'A'.repeat(10000);
    const { error: largeError } = await supabase
        .from('mvp_app_settings')
        .update({ site_logo: largeLogo })
        .eq('id', 1);

    if (largeError) {
        console.error('   Large logo UPDATE ERROR:', largeError.message);
        console.error('   Code:', largeError.code);
    } else {
        const { data: largeCheck } = await supabase.from('mvp_app_settings').select('site_logo').eq('id', 1).single();
        console.log('   Large logo saved successfully');
        console.log('   Retrieved length:', largeCheck?.site_logo?.length || 0);
        console.log('   Data matches:', largeCheck?.site_logo === largeLogo ? 'YES' : 'NO');
    }

    // 6. Test RLS policies
    console.log('\n6. Checking RLS policies on mvp_app_settings...');
    const { data: policies, error: policyError } = await supabase
        .rpc('get_policies', { table_name: 'mvp_app_settings' })
        .catch(() => ({ data: null, error: true }));

    if (policyError || !policies) {
        // Alternative: query pg_policies directly
        const { data: pgPolicies } = await supabase
            .from('pg_policies')
            .select('*')
            .eq('tablename', 'mvp_app_settings');
        console.log('   Policies found:', pgPolicies?.length || 0);
        pgPolicies?.forEach(p => console.log('   -', p.policyname, ':', p.permissive, p.cmd));
    } else {
        console.log('   Policies:', policies);
    }

    // 7. Check if id=1 row exists via raw count
    console.log('\n7. Checking row count in mvp_app_settings...');
    const { count, error: countError } = await supabase
        .from('mvp_app_settings')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('   Count error:', countError.message);
    } else {
        console.log('   Total rows:', count);
    }

    // Cleanup - restore test row
    console.log('\n8. Cleanup - restoring original values...');
    await supabase.from('mvp_app_settings').update({
        site_name: before?.site_name || 'Lennox Bank',
        site_logo: before?.site_logo || ''
    }).eq('id', 1);

    console.log('\n=== TEST COMPLETE ===\n');
}

testLogoSave().catch(e => {
    console.error('Test failed:', e);
    process.exit(1);
});
