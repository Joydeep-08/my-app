import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /auth/callback
 *
 * This is the URL Google redirects the user back to after they approve
 * (or deny) the Google sign-in screen. Supabase calls it the "callback URL."
 *
 * What happens here, in order:
 *  1. Google sends a one-time `code` in the URL query string
 *  2. We hand that code to Supabase with exchangeCodeForSession()
 *  3. Supabase talks to Google behind the scenes, verifies the code,
 *     and gets back the user's profile + tokens
 *  4. Supabase stores the session in cookies (handled by server.ts)
 *  5. We redirect the user onward — to /dashboard, or wherever you choose
 *
 * If anything goes wrong (code missing, expired, etc.) we redirect to
 * /auth/error so we can show a friendly message instead of a blank crash.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  // The one-time code Google sent back in the redirect URL
  const code = searchParams.get("code");

  // Where to send the user after a successful login.
  // You can pass a `next` param when starting the OAuth flow to
  // redirect users to a specific page (e.g. the page they tried to visit).
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    // No code means something went wrong before we were even called
    // (e.g. the user denied Google access, or the URL was tampered with)
    console.error("[auth/callback] No code in callback URL");
    return NextResponse.redirect(`${origin}/auth/error?reason=missing_code`);
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // Code already used, expired, or Supabase/Google misconfiguration
    console.error("[auth/callback] exchangeCodeForSession error:", error.message);
    return NextResponse.redirect(`${origin}/auth/error?reason=${error.message}`);
  }

  // Session is now set in cookies — user is logged in.
  // Redirect them to their destination.
  return NextResponse.redirect(`${origin}${next}`);
}