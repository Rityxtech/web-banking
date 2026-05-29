import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

const { data, error } = await sb
  .from('mvp_profiles')
  .update({ role: 'admin' })
  .eq('user_id', 'd8542107-85d8-48d0-b1c5-3ca2c014c1f0')
  .select('id, user_id, role');

if (error) {
  console.error('❌ Failed:', error.message);
} else {
  console.log('✅ Updated profile role to admin:', data);
}
