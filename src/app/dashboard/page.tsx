"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type UserProfile = {
  name: string;
  email: string;
  avatar_url: string | null;
};

function Avatar({ url, name }: { url: string | null; name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid #87A878",
          display: "block",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div style={{
      width: 38, height: 38, borderRadius: "50%",
      background: "linear-gradient(135deg, #87A878, #6BA3BE)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { router.push("/login"); return; }

  const user = session.user;

  // ✅ STEP 1: Ensure user exists in DB
  await supabase.from("users").upsert({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || "",
    avatar_url: user.user_metadata?.avatar_url || null,
  });

  // ✅ STEP 2: Now fetch safely
  const { data } = await supabase
    .from("users")
    .select("name, email, avatar_url")
    .eq("id", user.id)
    .single();

  setProfile({
    name: data?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Friend",
    email: data?.email || user.email || "",
    avatar_url: data?.avatar_url || user.user_metadata?.avatar_url || null,
  });

  setLoading(false);
}

    loadProfile();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF3E0" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #87A878", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const firstName = profile?.name?.split(" ")[0] || "Friend";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }

        @keyframes floatUp {
          0%   { transform: translateY(0px) rotate(-2deg); }
          50%  { transform: translateY(-10px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(-2deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#FAF3E0",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
      }}>

        {/* ── Topbar ── */}
        <header style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 32px",
          background: "#fff",
          borderBottom: "1px solid #ede8df",
          flexShrink: 0,
        }}>
          {/* Left: avatar + name + email */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar url={profile?.avatar_url ?? null} name={profile?.name ?? "?"} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#2D2D2D", lineHeight: 1.3 }}>
                {profile?.name}
              </div>
              <div style={{ fontSize: 11.5, color: "#a0a0a0", lineHeight: 1.3 }}>
                {profile?.email}
              </div>
            </div>
          </div>

          {/* Right: Sign Out */}
          <button
            onClick={handleSignOut}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 16px",
              borderRadius: 999,
              border: "1.5px solid #e0ddd6",
              background: "#fff",
              color: "#2D2D2D",
              fontSize: 13, fontWeight: 500,
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.cssText += "background:#2D2D2D;color:#fff;border-color:#2D2D2D;"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.cssText += "background:#fff;color:#2D2D2D;border-color:#e0ddd6;"; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </header>

        {/* ── Main content — fills remaining height ── */}
        <main style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px 16px",
          animation: "fadeUp 0.45s ease forwards",
        }}>

          {/* Balloon */}
          <div style={{ fontSize: 44, animation: "floatUp 3.5s ease-in-out infinite", marginBottom: 16 }}>
            🎈
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "'Lora', serif",
            fontSize: "clamp(1.7rem, 4vw, 2.3rem)",
            color: "#2D2D2D",
            textAlign: "center",
            lineHeight: 1.2,
          }}>
            Welcome, <span style={{ color: "#6BA3BE" }}>{firstName}!</span>
          </h1>

          <p style={{ marginTop: 8, fontSize: 13.5, color: "#b0b0b0", textAlign: "center" }}>
            Ready to create magical experiences? Choose an option below.
          </p>

          {/* Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 18,
            width: "100%",
            maxWidth: 620,
            marginTop: 36,
          }}>

            {/* Create */}
            <Link href="/create" style={{ textDecoration: "none" }}>
              <div style={{
                background: "#fff",
                borderRadius: 20,
                padding: "28px 22px 24px",
                display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
                border: "1.5px solid #ede8df",
                cursor: "pointer",
                transition: "transform 0.22s, box-shadow 0.22s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-5px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 40px rgba(0,0,0,0.07)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "none"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
              >
                <div style={{
                  width: 58, height: 58, borderRadius: 16,
                  background: "rgba(135,168,120,0.13)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, marginBottom: 14,
                }}>🎁</div>
                <div style={{ fontFamily: "'Lora', serif", fontSize: "1.1rem", color: "#2D2D2D", marginBottom: 6 }}>
                  Create a Surprise
                </div>
                <p style={{ fontSize: 12.5, color: "#b8b8b8", lineHeight: 1.6, marginBottom: 20 }}>
                  Design a personalised surprise experience for someone special.
                </p>
                <div style={{
                  width: "100%", padding: "11px 0",
                  borderRadius: 11,
                  background: "linear-gradient(135deg, #87A878, #6BA3BE)",
                  color: "#fff", fontSize: 13.5, fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                }}>
                  Start Creating ✨
                </div>
              </div>
            </Link>

            {/* History */}
            <Link href="/dashboard/history" style={{ textDecoration: "none" }}>
              <div style={{
                background: "#fff",
                borderRadius: 20,
                padding: "28px 22px 24px",
                display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
                border: "1.5px solid #ede8df",
                cursor: "pointer",
                transition: "transform 0.22s, box-shadow 0.22s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-5px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 40px rgba(0,0,0,0.07)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "none"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
              >
                <div style={{
                  width: 58, height: 58, borderRadius: 16,
                  background: "rgba(107,163,190,0.13)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, marginBottom: 14,
                }}>📜</div>
                <div style={{ fontFamily: "'Lora', serif", fontSize: "1.1rem", color: "#2D2D2D", marginBottom: 6 }}>
                  Surprise History
                </div>
                <p style={{ fontSize: 12.5, color: "#b8b8b8", lineHeight: 1.6, marginBottom: 20 }}>
                  View all the magical surprises you've created so far.
                </p>
                <div style={{
                  width: "100%", padding: "11px 0",
                  borderRadius: 11,
                  background: "transparent",
                  color: "#6BA3BE", fontSize: 13.5, fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  border: "1.8px solid #6BA3BE",
                }}>
                  View History 🎊
                </div>
              </div>
            </Link>

          </div>

          {/* Help */}
          <button style={{
            display: "flex", alignItems: "center", gap: 5,
            marginTop: 22,
            fontSize: 12.5, color: "#c8c8c8",
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Help &amp; Support
          </button>

          {/* Footer */}
          <p style={{ marginTop: 14, fontSize: 11.5, color: "#d8d2c8" }}>
            Every balloon carries a little piece of your heart 🎈
          </p>

        </main>
      </div>
    </>
  );
}