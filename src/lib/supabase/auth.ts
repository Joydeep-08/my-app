"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * lib/supabase/auth.ts
 *
 * Auth helper functions that can be imported into any Client Component.
 * This file is marked "use client" because it uses the browser Supabase
 * client — OAuth redirects only make sense in the browser.
 */

/**
 * signInWithGoogle()
 *
 * Kicks off the Google OAuth flow. Call this from a button's onClick.
 *
 * What happens:
 *  1. Supabase builds a Google authorization URL (with your Client ID,
 *     scopes, and the callback URL registered in the Google Console)
 *  2. The user's browser is redirected to Google's sign-in screen
 *  3. After the user approves, Google redirects back to /auth/callback
 *  4. The callback route (app/auth/callback/route.ts) exchanges the
 *     code for a session and logs the user in
 *
 * @param redirectTo - Optional path to send the user after login.
 *                     Defaults to /dashboard. Pass e.g. "/profile" to
 *                     send them somewhere specific after signing in.
 */
export async function signInWithGoogle(redirectTo = "/dashboard") {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      // After Google auth succeeds, Supabase redirects here.
      // Must exactly match a URL in your Google Console → Authorized redirect URIs
      // AND in Supabase Dashboard → Auth → URL Configuration → Redirect URLs.
      redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,

      // Scopes: what data we ask Google for.
      // 'openid email profile' gives us the user's name, email, and avatar.
      scopes: "openid email profile",

      // Forces Google to show the account picker every time.
      // Remove this if you want returning users to skip the picker.
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error) {
    console.error("[signInWithGoogle] OAuth initiation error:", error.message);
    throw new Error(error.message);
  }

  // No return needed — the browser is being redirected to Google.
  // Any code here after the redirect won't run.
}

/**
 * signOut()
 *
 * Signs the current user out and clears their session cookies.
 * Redirect the user to /login (or wherever) after calling this.
 */
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("[signOut] error:", error.message);
    throw new Error(error.message);
  }
}