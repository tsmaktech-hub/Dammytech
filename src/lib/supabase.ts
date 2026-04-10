import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://esqukfrytkoiwbagfqsn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzcXVrZnJ5dGtvaXdiYWdmcXNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0OTkxNDMsImV4cCI6MjA5MTA3NTE0M30.JhbPocWBF3UZLOA9Fy5CpW3egFR470Fs-dRXKJxM1QU';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

export const isMockMode = !supabaseUrl || !supabaseAnonKey;

// Helper to get file URL from Supabase storage
export const getFileUrl = (bucket: string, path: string) => {
  if (isMockMode || path.startsWith('http')) return path;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};
