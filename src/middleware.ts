import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ── Routes that require the user to be logged in ──────────────────────────
// Add any new protected path prefixes here.
const PROTECTED_ROUTES = ["/dashboard", "/create"];

// ── Routes only for guests (logged-in users get bounced to /dashboard) ────
const AUTH_ROUTES = ["/login"];

/**
 * How middleware works in Next.js (App Router)
 * ─────────────────────────────────────────────
 * Middleware runs on the EDGE — before any page or API route handler executes.
 * Think of it as a security guard standing at the door of every route.
 *
 * The lifecycle for every request:
 *
 *   Browser request
 *        │
 *        ▼
 *   middleware.ts          ← YOU ARE HERE
 *        │
 *        ├─ refresh session cookies (always)
 *        ├─ check: is this a protected route?
 *        │     yes → is user logged in?
 *        │               no  → redirect to /login
 *        │               yes → let them through
 *        ├─ check: is this an auth route (/login)?
 *        │     yes → is user already logged in?
 *        │               yes → redirect to /dashboard (no point showing login)
 *        │               no  → let them through
 *        └─ everything else → let it through
 *        │
 *        ▼
 *   Page / Route Handler renders
 *
 * Why check auth HERE instead of inside the page?
 * Because middleware runs before React renders anything. If we checked
 * inside the page, the server would start rendering and then redirect —
 * wasted work, possible flash. Middleware short-circuits immediately.
 *
 * Why use getUser() and not getSession()?
 * getSession() only reads the local cookie — it doesn't verify the token
 * with Supabase's server, so a tampered cookie could fool it.
 * getUser() makes a network call to validate the JWT with Supabase every
 * time, which is slower but secure. Always use getUser() for auth checks.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Step 1: Set up Supabase client wired to the request/response cookies ──
  // We need `supabaseResponse` to be mutable because setAll() may rebuild it.
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write refreshed tokens onto both the request and response so
          // the page handler and the browser both see the updated cookies.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ── Step 2: Refresh the session + get the current user ────────────────────
  // IMPORTANT: always call getUser() before any redirect logic.
  // This is what silently rotates expired access tokens using the refresh token.
  // If you skip this, users get logged out the moment their JWT expires (~1hr).
  const { data: { user } } = await supabase.auth.getUser();

  // ── Step 3: Protect private routes ────────────────────────────────────────
  // If the user hits /dashboard or /create without being logged in,
  // redirect them to /login and remember where they were trying to go
  // via the `next` query param (so we can send them there after login).
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname); // e.g. /login?next=/dashboard
    return NextResponse.redirect(loginUrl);
  }

  // ── Step 4: Bounce logged-in users away from /login ───────────────────────
  // If someone who is already authenticated navigates to /login,
  // send them to /dashboard instead — they don't need to log in again.
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ── Step 5: Pass through everything else ──────────────────────────────────
  // Always return supabaseResponse (not a plain NextResponse.next()) so
  // the refreshed session cookies are forwarded to the browser.
  return supabaseResponse;
}

export const config = {
  matcher: [
    // Run on every route EXCEPT static assets and built-in Next.js internals.
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};