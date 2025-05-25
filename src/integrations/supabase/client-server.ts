import { createClient } from '@supabase/supabase-js';
import { SERVER_ENV } from '@/config/server-env';

export const supabase = createClient(SERVER_ENV.SUPABASE_URL, SERVER_ENV.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
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