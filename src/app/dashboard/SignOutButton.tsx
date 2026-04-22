"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/supabase/auth";

/**
 * SignOutButton — Client Component
 *
 * Why is this a separate file?
 * The dashboard page.tsx is a Server Component, which cannot use hooks
 * (useRouter) or browser event handlers (onClick). By splitting the button
 * into its own "use client" file, the rest of the page stays server-rendered
 * (faster, safer) while this tiny interactive piece runs in the browser.
 *
 * This is the standard Next.js App Router pattern: keep the server/client
 * boundary as deep (as close to the leaf) as possible.
 */
export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();          // clears Supabase session cookies
    router.push("/login");    // send user back to login page
    router.refresh();         // force Next.js to re-fetch server data
                              // (so cached user state is cleared)
  }

  return (
    <button
      onClick={handleSignOut}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "12px 28px",
        borderRadius: 12,
        border: "1.5px solid #E8DFC8",
        background: "transparent",
        color: "#2D2D2D",
        fontSize: 14,
        fontWeight: 500,
        fontFamily: "inherit",
        cursor: "pointer",
        transition: "all 0.18s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "#2D2D2D";
        (e.currentTarget as HTMLButtonElement).style.color = "#FAF3E0";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "#2D2D2D";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        (e.currentTarget as HTMLButtonElement).style.color = "#2D2D2D";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "#E8DFC8";
      }}
    >
      {/* Exit icon */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      Sign out
    </button>
  );
}