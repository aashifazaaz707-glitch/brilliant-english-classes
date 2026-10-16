import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SUPABASE_URL) || 'https://sybtavlkdhhqxnkvdbcq.supabase.co';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5YnRhdmxrZGhocXhua3ZkYmNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMTk2NjEsImV4cCI6MjEwNzY5NTY2MX0.1ZCuLtUy6CzL5trbHvryfBtnmsjd6lnlig1XKylfh6Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
