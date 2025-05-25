import { createClient } from '@supabase/supabase-js';
import { CLIENT_ENV } from '@/config/client-env';

export const supabase = createClient(CLIENT_ENV.SUPABASE_URL, CLIENT_ENV.SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
}); 