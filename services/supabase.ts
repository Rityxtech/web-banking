
import { createClient } from '@supabase/supabase-js';

// User provided credentials for the Lennox Bank project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// SERVICE ROLE KEY - WARNING: In a production environment, this should only be used on the server side.
// Since this is an MVP architecture, we are using it here to allow user deletion from Auth.
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Privileged client for Administrative tasks (Delete users, bypass RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
