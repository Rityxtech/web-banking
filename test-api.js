import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function test() {
  // First, check if the columns exist
  console.log('Testing mvp_profiles update with fields from Profile.tsx...');

  // Try to find a profile first
  const { data: profiles } = await supabase.from('mvp_profiles').select('id').limit(1);
  console.log('Found profiles:', profiles?.length || 0);

  if (!profiles || profiles.length === 0) {
    console.log('No profiles found to test update on. Creating test profile...');
    // We can't test without a profile
    return;
  }

  const testId = profiles[0].id;
  console.log('Testing update on profile id:', testId);

  // Try the exact update that Profile.tsx sends
  const { data, error } = await supabase.from('mvp_profiles')
    .update({
      full_name: 'Test User',
      phone: '123-456-7890',
      gender: 'Male',
      dob: '1990-01-01',
      occupation: 'Developer',
      address: '123 Test St',
      city: 'Test City',
      zip: '12345',
      country: 'USA'
    })
    .eq('id', testId)
    .select()
    .single();

  if (error) {
    console.error('UPDATE FAILED:');
    console.error('  code:', error.code);
    console.error('  message:', error.message);
    console.error('  details:', error.details);
    console.error('  hint:', error.hint);
  } else {
    console.log('UPDATE SUCCESS:', data);
  }
}

test().catch(e => console.error('Test error:', e));
