import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseAnonKey.includes('placeholder') &&
    supabaseUrl.startsWith('http')
  );
};

let clientInstance: SupabaseClient<any> | null = null;

export const getSupabaseBrowserClient = (): SupabaseClient<any> => {
  if (clientInstance) {
    return clientInstance;
  }

  if (!isSupabaseConfigured()) {
    // Provide a dummy / mock-safe client that prevents runtime exceptions when credentials are absent
    const mockUrl = 'https://mock-kinetic.supabase.co';
    const mockKey = 'mock-anon-key-kinetic-msme-2026';
    clientInstance = createClient<any>(mockUrl, mockKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return clientInstance;
  }

  clientInstance = createClient<any>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return clientInstance;
};

export const supabase = getSupabaseBrowserClient();
