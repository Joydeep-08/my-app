import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js Middleware — runs on every request before it hits a page or API route.
 *
 * Its one job right now: refresh the user's Supabase session if it has expired.
 *
 * Why is this needed?
 * Supabase uses short-lived JWTs (access tokens). When one expires, the
 * @supabase/ssr library can silently exchange the refresh token for a new
 * access token — but only if something runs *before* the page renders to
 * update the cookies. Middleware is the right place for that.
 *
 * What this does NOT do yet:
 * - It does NOT protect any routes (no redirects to /login)
 * - It does NOT check roles or permissions
 * Route protection will be added later.
 */
export async function middleware(request: NextRequest) {
  // Start with a response that passes the request through unchanged
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Step 1: write cookies onto the outgoing request
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Step 2: rebuild the response so it carries the updated cookies
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // This call refreshes the session if the access token has expired.
  // Do NOT remove this line — the session won't refresh without it.
  await supabase.auth.getUser();

  return supabaseResponse;
}

/**
 * Matcher config — controls which paths run this middleware.
 *
 * This pattern skips:
 *   - _next/static  (compiled JS/CSS bundles)
 *   - _next/image   (Next.js image optimisation)
 *   - favicon.ico, sitemap.xml, robots.txt
 * Everything else (pages, API routes) goes through middleware.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};