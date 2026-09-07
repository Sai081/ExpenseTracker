import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://skfjnwiyhtknluqtipff.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZmpud2l5aHRrbmx1cXRpcGZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2ODkyMzEsImV4cCI6MjEwNDI2NTIzMX0.C0PspOW-MY9kcVQyfai0-O8LZecqOwYffnAfP5RGvKk';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;
