/**
 * Test maintenance mode admin login flow
 * Run: node test-maintenance.mjs
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

// --- Replace with your admin credentials ---
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'akugbof@gmail.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || '';

if (!ADMIN_PASSWORD) {
    console.error('Set TEST_ADMIN_PASSWORD env var: TEST_ADMIN_PASSWORD=xxx node test-maintenance.mjs');
    process.exit(1);
}

async function run() {
    console.log('\n=== MAINTENANCE MODE ADMIN LOGIN TEST ===\n');

    // 1. Check maintenance mode
    console.log('1. Checking maintenance mode from DB...');
    const { data: settings, error: settingsErr } = await supabaseAdmin
        .from('mvp_app_settings')
        .select('maintenance_mode, site_name')
        .eq('id', 1)
        .single();

    if (settingsErr) {
        console.error('   ERROR reading settings:', settingsErr.message);
    } else {
        const mm = settings?.maintenance_mode;
        const isOn = mm == "1" || mm == 1 || mm === true;
        console.log(`   maintenance_mode raw value: ${JSON.stringify(mm)}`);
        console.log(`   maintenance_mode is ON: ${isOn}`);
    }

    // 2. Sign in as admin
    console.log('\n2. Signing in as admin...');
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });

    if (authErr) {
        console.error('   LOGIN FAILED:', authErr.message);
        process.exit(1);
    }
    console.log('   Login SUCCESS. User ID:', authData.user?.id);

    // 3. Check hardcoded email match
    const email = ADMIN_EMAIL.toLowerCase();
    let isAdmin = email === 'admin@lennox.bank' || email === 'akugbof@gmail.com';
    console.log(`\n3. Hardcoded email check: isAdmin=${isAdmin} (email=${email})`);

    // 4. Read profile with useMe=false (same as App.tsx handleSession)
    console.log('\n4. Reading profile (no-filter, like App.tsx handleSession)...');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/mvp_profiles?select=id,user_id,role&limit=1000`, {
        headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
        }
    });
    const allProfiles = await response.json();
    if (!Array.isArray(allProfiles)) {
        console.error('   ERROR: got non-array response:', allProfiles);
    } else {
        console.log(`   Total profiles returned: ${allProfiles.length}`);
        const adminProfile = allProfiles.find(p => p.user_id === authData.user?.id);
        console.log(`   Admin profile found: ${!!adminProfile}`);
        console.log(`   Admin profile role: ${adminProfile?.role}`);
        if (adminProfile?.role === 'admin') {
            isAdmin = true;
            console.log('   ✅ isAdmin=true via profile role');
        } else {
            console.log('   ❌ isAdmin still false — role is NOT "admin" in DB!');
            console.log('   This means the admin gets SIGNED OUT during maintenance!');
            console.log('\n   FIX: Run this SQL in Supabase:\n');
            console.log(`   UPDATE mvp_profiles SET role = 'admin' WHERE user_id = '${authData.user?.id}';`);
        }
    }

    // 5. Read profile with useMe=true (same as Auth.tsx check)
    console.log('\n5. Reading profile (with auth token, like Auth.tsx maintenance check)...');
    const meResponse = await fetch(`${SUPABASE_URL}/rest/v1/mvp_profiles?select=id,user_id,role&limit=1`, {
        headers: {
            'apikey': ANON_KEY,
            'Authorization': `Bearer ${authData.session?.access_token}`,
        }
    });
    const myProfiles = await meResponse.json();
    if (!Array.isArray(myProfiles)) {
        console.error('   ERROR reading own profile:', myProfiles);
    } else {
        const myProfile = myProfiles.find(p => p.user_id === authData.user?.id);
        console.log(`   Own profile found: ${!!myProfile}`);
        console.log(`   Own profile role: ${myProfile?.role}`);
    }

    // 6. Final verdict
    console.log('\n=== RESULT ===');
    console.log(`Final isAdmin: ${isAdmin}`);
    if (!isAdmin) {
        console.log('❌ PROBLEM FOUND: Admin profile does not have role="admin" in database.');
        console.log('   The maintenance check correctly blocks them — but they ARE admin.');
        console.log('   Fix: Update the profile role to "admin" in the database.');
    } else {
        console.log('✅ Profile check passes. Look for code-level race condition.');
    }

    await supabase.auth.signOut();
}

run().catch(console.error);
