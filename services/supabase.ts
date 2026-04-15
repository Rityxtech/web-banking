
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing environment variables. ' +
    'Copy .env.example to .env.local and fill in your Supabase credentials.'
  );
}

// Standard client — uses the anon key + Row Level Security.
// Never expose the service_role key in client-side code.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * supabaseAdmin is intentionally NOT exported here.
 * Admin-privileged operations (user deletion, bypassing RLS) must be
 * performed in a server environment (Supabase Edge Functions or
 * a Vercel/Node API route) where the SERVICE_ROLE key is safe.
 *
 * See: /supabase/functions/admin-delete-user/index.ts (included in docs)
 */
