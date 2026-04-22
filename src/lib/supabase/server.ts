import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client.
 *
 * Use this inside:
 *   - Server Components (the default in App Router)
 *   - Route Handlers (app/api/.../route.ts)
 *   - Server Actions
 *
 * It reads and writes auth cookies via Next.js's `cookies()` API.
 * This is what lets the server know who the logged-in user is.
 *
 * Note: `cookies()` from next/headers makes this function async-safe
 * but it CANNOT be used in Client Components — use client.ts for those.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll is called from Server Components where cookies
            // cannot be set. This is safe to ignore if middleware is
            // handling session refresh (which it is — see middleware.ts).
          }
        },
      },
    }
  );
}