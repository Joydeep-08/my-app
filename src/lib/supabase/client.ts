import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser (client-side) Supabase client.
 *
 * Use this inside Client Components ("use client") — e.g. login forms,
 * any component that runs in the browser. It reads auth tokens from
 * cookies automatically via @supabase/ssr.
 *
 * Call createClient() wherever you need it; it's lightweight to create.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}