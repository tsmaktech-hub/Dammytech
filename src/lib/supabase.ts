import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export const isMockMode = !supabaseUrl || !supabaseAnonKey;

// Helper to get file URL from Supabase storage
export const getFileUrl = (bucket: string, path: string) => {
  if (isMockMode) return path;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};
