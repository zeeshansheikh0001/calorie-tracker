// TODO: Uncomment when Supabase auth is fully implemented
/*
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
*/

// Temporary mock client for development
export function createClient() {
  return null as any;
}
