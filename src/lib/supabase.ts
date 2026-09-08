import { createClient, SupabaseClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};

export const getStoredUrl = () => localStorage.getItem('custom_supabase_url') || env.VITE_SUPABASE_URL || '';
export const getStoredKey = () => localStorage.getItem('custom_supabase_anon_key') || env.VITE_SUPABASE_ANON_KEY || '';

let cachedClient: SupabaseClient | null = null;
let cachedUrl = getStoredUrl();
let cachedKey = getStoredKey();

export function getSupabaseClient(): SupabaseClient | null {
  const url = getStoredUrl();
  const key = getStoredKey();
  if (!url || !key) return null;
  if (!cachedClient || cachedUrl !== url || cachedKey !== key) {
    cachedUrl = url;
    cachedKey = key;
    try {
      cachedClient = createClient(url, key);
    } catch (e) {
      console.error('Failed to create Supabase client:', e);
      cachedClient = null;
    }
  }
  return cachedClient;
}

export const supabase = getSupabaseClient();

export function isSupabaseConfigured(): boolean {
  return !!getStoredUrl() && !!getStoredKey();
}

export function saveSupabaseConfig(url: string, key: string) {
  localStorage.setItem('custom_supabase_url', url.trim());
  localStorage.setItem('custom_supabase_anon_key', key.trim());
  window.location.reload();
}

export function clearSupabaseConfig() {
  localStorage.removeItem('custom_supabase_url');
  localStorage.removeItem('custom_supabase_anon_key');
  window.location.reload();
}
