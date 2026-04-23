"use client";

// /app/dashboard/history/HistoryClient.tsx
// Client Component — handles interactivity (copy button state)

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Surprise = {
  id: string;
  recipient_name: string;
  occasion: string;
  status: string;
  unique_slug: string;
  created_at: string;
  expires_at: string;
  balloon_count: number;
};

const occasionColors: Record<string, { bg: string; text: string; border: string }> = {
  Birthday:       { bg: "#FFF3E0", text: "#E65100", border: "#FFB74D" },
  Anniversary:    { bg: "#FCE4EC", text: "#880E4F", border: "#F48FB1" },
  Farewell:       { bg: "#E8EAF6", text: "#283593", border: "#9FA8DA" },
  Wedding:        { bg: "#F3E5F5", text: "#4A148C", border: "#CE93D8" },
  "Women's Day":  { bg: "#FCE4EC", text: "#AD1457", border: "#F06292" },
  "Valentine's Day": { bg: "#FFEBEE", text: "#B71C1C", border: "#EF9A9A" },
  "Mother's Day": { bg: "#E8F5E9", text: "#1B5E20", border: "#A5D6A7" },
  "Father's Day": { bg: "#E3F2FD", text: "#0D47A1", border: "#90CAF9" },
  "Friendship Day": { bg: "#FFFDE7", text: "#F57F17", border: "#FFF176" },
  Other:          { bg: "#F5F5F5", text: "#424242", border: "#BDBDBD" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isActive(expiresAt: string) {
  return new Date(expiresAt) > new Date();
}

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://yourdomain.com";
}

export default function HistoryClient({ surprises }: { surprises: Surprise[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function copyLink(slug: string, id: string) {
    const url = `${getBaseUrl()}/s/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const totalCount = surprises.length;
  const activeCount = surprises.filter((s) => isActive(s.expires_at)).length;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #FAF3E0 0%, #f0ebe8 50%, #e8f0ed 100%)", fontFamily: "'Georgia', serif" }}>

      {/* Floating blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "380px", height: "380px", borderRadius: "50%", background: "radial-gradient(circle, rgba(107,163,190,0.12) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "-60px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(135,168,120,0.1) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: "40%", right: "5%", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(184,169,201,0.1) 0%, transparent 70%)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "6px", color: "#87A878", textDecoration: "none", fontFamily: "sans-serif", fontSize: "14px", fontWeight: 500, padding: "6px 14px", border: "1.5px solid #87A878", borderRadius: "20px", transition: "all 0.2s" }}
              onMouseOver={e => (e.currentTarget.style.background = "rgba(135,168,120,0.1)")}
              onMouseOut={e => (e.currentTarget.style.background = "transparent")}
            >
              ← Dashboard
            </Link>
            <div>
              <h1 style={{ margin: 0, fontSize: "clamp(1.5rem, 4vw, 2rem)", color: "#2D2D2D", fontWeight: 700, letterSpacing: "-0.5px" }}>
                Your Surprises 🎁
              </h1>
              <p style={{ margin: "4px 0 0", fontFamily: "sans-serif", fontSize: "14px", color: "#6B6B6B" }}>
                {totalCount === 0
                  ? "No surprises yet"
                  : `${totalCount} surprise${totalCount !== 1 ? "s" : ""} created · ${activeCount} active`}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            style={{ fontFamily: "sans-serif", fontSize: "13px", color: "#888", background: "transparent", border: "1px solid #ddd", borderRadius: "20px", padding: "6px 16px", cursor: "pointer", transition: "all 0.2s" }}
            onMouseOver={e => { e.currentTarget.style.color = "#e74c3c"; e.currentTarget.style.borderColor = "#e74c3c"; }}
            onMouseOut={e => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "#ddd"; }}
          >
            Sign out
          </button>
        </div>

        {/* Empty State */}
        {totalCount === 0 && (
          <div style={{ textAlign: "center", padding: "5rem 2rem", background: "white", borderRadius: "24px", boxShadow: "0 4px 40px rgba(0,0,0,0.06)", border: "1px dashed #ddd" }}>
            <div style={{ fontSize: "72px", marginBottom: "1rem", lineHeight: 1 }}>🎈</div>
            <h2 style={{ margin: "0 0 0.75rem", fontSize: "1.5rem", color: "#2D2D2D", fontWeight: 700 }}>No surprises yet!</h2>
            <p style={{ fontFamily: "sans-serif", color: "#888", marginBottom: "2rem", fontSize: "15px" }}>
              Create your first surprise and make someone's day unforgettable.
            </p>
            <Link href="/create" style={{ display: "inline-block", background: "linear-gradient(135deg, #87A878, #6BA3BE)", color: "white", textDecoration: "none", padding: "12px 32px", borderRadius: "30px", fontFamily: "sans-serif", fontWeight: 600, fontSize: "15px", letterSpacing: "0.3px" }}>
              Create your first surprise →
            </Link>
          </div>
        )}

        {/* Surprise Cards Grid */}
        {totalCount > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "1.25rem" }}>
            {surprises.map((surprise) => {
              const active = isActive(surprise.expires_at);
              const occasionStyle = occasionColors[surprise.occasion] ?? occasionColors["Other"];
              const shareUrl = `${getBaseUrl()}/s/${surprise.unique_slug}`;
              const copied = copiedId === surprise.id;

              return (
                <div key={surprise.id} style={{ background: "white", borderRadius: "20px", boxShadow: "0 2px 20px rgba(0,0,0,0.07)", border: `1px solid ${active ? "rgba(135,168,120,0.25)" : "rgba(0,0,0,0.06)"}`, overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s", cursor: "default" }}
                  onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.11)"; }}
                  onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 20px rgba(0,0,0,0.07)"; }}
                >
                  {/* Card top bar */}
                  <div style={{ height: "5px", background: active ? "linear-gradient(90deg, #87A878, #6BA3BE)" : "linear-gradient(90deg, #ddd, #bbb)" }} />

                  <div style={{ padding: "1.25rem 1.5rem" }}>
                    {/* Top row: name + status */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.75rem", gap: "0.75rem" }}>
                      <div>
                        <p style={{ margin: 0, fontFamily: "sans-serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "#aaa", marginBottom: "3px" }}>For</p>
                        <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#2D2D2D", fontWeight: 700, lineHeight: 1.2 }}>{surprise.recipient_name}</h3>
                      </div>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        fontFamily: "sans-serif", fontSize: "11px", fontWeight: 600,
                        padding: "4px 10px", borderRadius: "20px",
                        background: active ? "rgba(135,168,120,0.12)" : "rgba(200,200,200,0.2)",
                        color: active ? "#4a7c42" : "#888",
                        border: `1px solid ${active ? "rgba(135,168,120,0.3)" : "#ddd"}`,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: active ? "#87A878" : "#bbb", display: "inline-block" }} />
                        {active ? "Active" : "Expired"}
                      </span>
                    </div>

                    {/* Occasion badge */}
                    <div style={{ marginBottom: "1rem" }}>
                      <span style={{ display: "inline-block", fontFamily: "sans-serif", fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", background: occasionStyle.bg, color: occasionStyle.text, border: `1px solid ${occasionStyle.border}` }}>
                        {surprise.occasion}
                      </span>
                    </div>

                    {/* Metadata row */}
                    <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                      <div>
                        <p style={{ margin: 0, fontFamily: "sans-serif", fontSize: "11px", color: "#aaa", marginBottom: "2px" }}>Created</p>
                        <p style={{ margin: 0, fontFamily: "sans-serif", fontSize: "13px", color: "#555", fontWeight: 500 }}>{formatDate(surprise.created_at)}</p>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontFamily: "sans-serif", fontSize: "11px", color: "#aaa", marginBottom: "2px" }}>{active ? "Expires" : "Expired"}</p>
                        <p style={{ margin: 0, fontFamily: "sans-serif", fontSize: "13px", color: active ? "#555" : "#e57373", fontWeight: 500 }}>{formatDate(surprise.expires_at)}</p>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontFamily: "sans-serif", fontSize: "11px", color: "#aaa", marginBottom: "2px" }}>Balloons</p>
                        <p style={{ margin: 0, fontFamily: "sans-serif", fontSize: "13px", color: "#555", fontWeight: 500 }}>🎈 {surprise.balloon_count}</p>
                      </div>
                    </div>

                    {/* Share link */}
                    <div style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: "10px", padding: "8px 12px", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#888", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {shareUrl}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "10px" }}>
                      {active && (
                        <button
                          onClick={() => copyLink(surprise.unique_slug, surprise.id)}
                          style={{
                            flex: 1, fontFamily: "sans-serif", fontSize: "13px", fontWeight: 600,
                            padding: "9px 16px", borderRadius: "10px", cursor: "pointer", transition: "all 0.2s",
                            background: copied ? "rgba(135,168,120,0.12)" : "linear-gradient(135deg, #87A878, #6BA3BE)",
                            color: copied ? "#4a7c42" : "white",
                            border: copied ? "1.5px solid #87A878" : "none",
                          }}
                        >
                          {copied ? "✓ Copied!" : "Copy Link"}
                        </button>
                      )}
                      <a
                        href={shareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: active ? "0 0 auto" : 1,
                          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "5px",
                          fontFamily: "sans-serif", fontSize: "13px", fontWeight: 600,
                          padding: "9px 16px", borderRadius: "10px", cursor: "pointer", transition: "all 0.2s",
                          background: "transparent", color: "#6BA3BE",
                          border: "1.5px solid #6BA3BE", textDecoration: "none",
                        }}
                        onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(107,163,190,0.08)"; }}
                        onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
                      >
                        View ↗
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA if has items */}
        {totalCount > 0 && (
          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <Link href="/create" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #87A878, #6BA3BE)", color: "white", textDecoration: "none", padding: "12px 30px", borderRadius: "30px", fontFamily: "sans-serif", fontWeight: 600, fontSize: "15px" }}>
              🎈 Create another surprise
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}