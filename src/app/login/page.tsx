"use client";

import { useState } from "react";
import { signInWithGoogle } from "@/lib/supabase/auth";

// ── Sparkle data: each has a fixed position, size, animation delay & duration ──
const SPARKLES = [
  { id: 1,  top: "8%",  left: "12%", size: 3,   delay: "0s",    dur: "4.2s", opacity: 0.7 },
  { id: 2,  top: "15%", left: "78%", size: 5,   delay: "0.8s",  dur: "5.1s", opacity: 0.5 },
  { id: 3,  top: "23%", left: "45%", size: 2,   delay: "1.5s",  dur: "3.8s", opacity: 0.8 },
  { id: 4,  top: "35%", left: "88%", size: 4,   delay: "0.3s",  dur: "6.0s", opacity: 0.4 },
  { id: 5,  top: "42%", left: "6%",  size: 6,   delay: "2.1s",  dur: "4.5s", opacity: 0.6 },
  { id: 6,  top: "55%", left: "62%", size: 2,   delay: "0.6s",  dur: "3.2s", opacity: 0.9 },
  { id: 7,  top: "63%", left: "28%", size: 4,   delay: "1.9s",  dur: "5.7s", opacity: 0.5 },
  { id: 8,  top: "71%", left: "91%", size: 3,   delay: "0.4s",  dur: "4.0s", opacity: 0.7 },
  { id: 9,  top: "82%", left: "18%", size: 5,   delay: "1.2s",  dur: "6.3s", opacity: 0.4 },
  { id: 10, top: "88%", left: "54%", size: 2,   delay: "2.7s",  dur: "3.5s", opacity: 0.8 },
  { id: 11, top: "5%",  left: "35%", size: 4,   delay: "1.0s",  dur: "5.4s", opacity: 0.5 },
  { id: 12, top: "48%", left: "75%", size: 3,   delay: "3.1s",  dur: "4.8s", opacity: 0.6 },
  { id: 13, top: "76%", left: "40%", size: 6,   delay: "0.2s",  dur: "7.0s", opacity: 0.3 },
  { id: 14, top: "30%", left: "20%", size: 2,   delay: "2.4s",  dur: "3.9s", opacity: 0.7 },
  { id: 15, top: "92%", left: "82%", size: 4,   delay: "1.7s",  dur: "5.2s", opacity: 0.5 },
  { id: 16, top: "18%", left: "58%", size: 3,   delay: "0.9s",  dur: "4.6s", opacity: 0.6 },
  { id: 17, top: "60%", left: "3%",  size: 2,   delay: "3.5s",  dur: "3.3s", opacity: 0.8 },
  { id: 18, top: "40%", left: "95%", size: 5,   delay: "1.3s",  dur: "5.9s", opacity: 0.4 },
];

const STEPS = [
  {
    num: "01",
    title: "Sign in with Google",
    desc: "One tap — no new password to remember. Your Google account is all you need.",
    color: "#87A878", // sage
  },
  {
    num: "02",
    title: "We set up your space",
    desc: "Your personal workspace is created instantly. Everything's ready before you blink.",
    color: "#6BA3BE", // skyblue
  },
  {
    num: "03",
    title: "Start creating",
    desc: "Jump straight in. Your data is yours, synced, and waiting wherever you left off.",
    color: "#B8A9C9", // lavender
  },
];

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleGoogleSignIn() {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      {/* ── Keyframe animations injected as a style tag ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes float-up {
          0%   { transform: translateY(0px) scale(1);   opacity: var(--op); }
          50%  { transform: translateY(-18px) scale(1.15); opacity: calc(var(--op) * 0.6); }
          100% { transform: translateY(0px) scale(1);   opacity: var(--op); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: var(--op); transform: scale(1); }
          50%       { opacity: calc(var(--op) * 0.2); transform: scale(0.6); }
        }
        @keyframes drift {
          0%   { transform: translate(0,0) rotate(0deg); }
          33%  { transform: translate(6px, -10px) rotate(120deg); }
          66%  { transform: translate(-4px, -6px) rotate(240deg); }
          100% { transform: translate(0,0) rotate(360deg); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(135,168,120,0.35); }
          70%  { box-shadow: 0 0 0 14px rgba(135,168,120,0); }
          100% { box-shadow: 0 0 0 0 rgba(135,168,120,0); }
        }

        .sparkle {
          animation: twinkle var(--dur) ease-in-out infinite,
                     drift   calc(var(--dur) * 2.5) ease-in-out infinite;
        }
        .card-enter { animation: slide-up 0.7s cubic-bezier(.22,1,.36,1) both; }
        .steps-enter { animation: fade-in 0.9s ease 0.3s both; }

        .google-btn {
          position: relative;
          overflow: hidden;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .google-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(135,168,120,0.28);
          animation: pulse-ring 1.4s ease infinite;
        }
        .google-btn:active:not(:disabled) {
          transform: translateY(0px) scale(0.98);
        }
        .google-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%);
          background-size: 200% 100%;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .google-btn:hover::after {
          opacity: 1;
          animation: shimmer 0.8s ease forwards;
        }

        .step-card {
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .step-card:hover {
          transform: translateX(6px);
          box-shadow: -4px 0 0 0 currentColor;
        }

        /* Organic blob shapes in background */
        .blob {
          position: absolute;
          border-radius: 60% 40% 70% 30% / 50% 60% 40% 70%;
          filter: blur(48px);
          opacity: 0.18;
          pointer-events: none;
        }
      `}</style>

      {/* ── Page shell ── */}
      <main
        style={{
          minHeight: "100dvh",
          background: "#FAF3E0",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
        }}
      >
        {/* ── Ambient blobs ── */}
        <div className="blob" style={{ width: 480, height: 380, background: "#87A878", top: "-80px", left: "-120px" }} />
        <div className="blob" style={{ width: 360, height: 420, background: "#6BA3BE", bottom: "-60px", right: "-80px" }} />
        <div className="blob" style={{ width: 300, height: 280, background: "#B8A9C9", top: "40%", left: "30%" }} />

        {/* ── Floating sparkles ── */}
        {SPARKLES.map((s) => (
          <span
            key={s.id}
            className="sparkle"
            style={{
              position: "absolute",
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              borderRadius: "50%",
              background: s.id % 3 === 0 ? "#87A878" : s.id % 3 === 1 ? "#6BA3BE" : "#B8A9C9",
              // CSS custom props for animation
              ["--op" as string]: s.opacity,
              ["--dur" as string]: s.dur,
              animationDelay: s.delay,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* ── Additional star shapes (4-pointed) ── */}
        {[
          { top: "12%", left: "55%", color: "#87A878", delay: "1.1s", dur: "5.5s" },
          { top: "67%", left: "70%", color: "#B8A9C9", delay: "2.2s", dur: "4.1s" },
          { top: "85%", left: "30%", color: "#6BA3BE", delay: "0.5s", dur: "6.2s" },
          { top: "25%", left: "92%", color: "#87A878", delay: "3.0s", dur: "3.7s" },
        ].map((star, i) => (
          <svg
            key={i}
            className="sparkle"
            style={{
              position: "absolute",
              top: star.top,
              left: star.left,
              ["--op" as string]: 0.55,
              ["--dur" as string]: star.dur,
              animationDelay: star.delay,
              pointerEvents: "none",
            }}
            width="12" height="12" viewBox="0 0 12 12"
          >
            <path
              d="M6 0 L6.8 4.8 L12 6 L6.8 7.2 L6 12 L5.2 7.2 L0 6 L5.2 4.8 Z"
              fill={star.color}
              opacity="0.7"
            />
          </svg>
        ))}

        {/* ── Two-column card ── */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: 960,
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 0,
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 32px 80px rgba(45,45,45,0.13), 0 2px 8px rgba(45,45,45,0.06)",
          }}
          className="card-enter lg:grid-cols-[1fr_1fr]"
        >
          {/* ── LEFT: Login card ── */}
          <div
            style={{
              background: "#FEFAF2",
              padding: "52px 44px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 32,
            }}
          >
            {/* Logo / wordmark */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg, #87A878, #6BA3BE)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2L11.5 7H16L12 10.5L13.5 16L9 13L4.5 16L6 10.5L2 7H6.5Z" fill="white" />
                </svg>
              </div>
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 20, fontWeight: 700, color: "#2D2D2D", letterSpacing: "-0.3px",
              }}>
                Lumina
              </span>
            </div>

            {/* Heading */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(28px, 4vw, 38px)",
                fontWeight: 700,
                color: "#2D2D2D",
                lineHeight: 1.15,
                margin: 0,
              }}>
                Welcome<br />
                <em style={{ color: "#87A878", fontStyle: "italic" }}>back.</em>
              </h1>
              <p style={{
                fontSize: 15, color: "#6b6b6b", margin: 0, lineHeight: 1.6, fontWeight: 300,
              }}>
                Sign in to continue. No password needed —<br />just your Google account.
              </p>
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: "#E8DFC8" }} />
              <span style={{ fontSize: 12, color: "#aaa", letterSpacing: "0.05em" }}>CONTINUE WITH</span>
              <div style={{ flex: 1, height: 1, background: "#E8DFC8" }} />
            </div>

            {/* Google button */}
            <button
              className="google-btn"
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: "15px 24px",
                borderRadius: 14,
                border: "1.5px solid #E8DFC8",
                background: loading
                  ? "#f0ebe0"
                  : "linear-gradient(135deg, #87A878 0%, #6BA3BE 100%)",
                color: loading ? "#aaa" : "#fff",
                fontSize: 15,
                fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
                cursor: loading ? "not-allowed" : "pointer",
                width: "100%",
                letterSpacing: "0.01em",
              }}
            >
              {loading ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
                    </path>
                  </svg>
                  Signing you in…
                </>
              ) : (
                <>
                  {/* Google "G" icon */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="rgba(255,255,255,0.9)"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="rgba(255,255,255,0.75)"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="rgba(255,255,255,0.85)"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="rgba(255,255,255,0.95)"/>
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>

            {/* Error message */}
            {error && (
              <p style={{
                fontSize: 13, color: "#c0392b", textAlign: "center",
                background: "#fdf0f0", borderRadius: 8, padding: "10px 14px",
                border: "1px solid #f5c6c6", margin: 0,
              }}>
                {error}
              </p>
            )}

            {/* Footer note */}
            <p style={{ fontSize: 12, color: "#bbb", margin: 0, lineHeight: 1.5 }}>
              By signing in you agree to our{" "}
              <span style={{ color: "#87A878", cursor: "pointer" }}>Terms</span> and{" "}
              <span style={{ color: "#87A878", cursor: "pointer" }}>Privacy Policy</span>.
            </p>
          </div>

          {/* ── RIGHT: How it works ── */}
          <div
            className="steps-enter"
            style={{
              background: "linear-gradient(160deg, #2D2D2D 0%, #3d3d3d 100%)",
              padding: "52px 44px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 36,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative background circles */}
            <div style={{
              position: "absolute", width: 280, height: 280, borderRadius: "50%",
              border: "1px solid rgba(135,168,120,0.12)",
              top: -80, right: -80, pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", width: 200, height: 200, borderRadius: "50%",
              border: "1px solid rgba(107,163,190,0.1)",
              bottom: -60, left: -60, pointerEvents: "none",
            }} />

            {/* Heading */}
            <div>
              <p style={{
                fontSize: 11, letterSpacing: "0.15em", color: "#87A878",
                textTransform: "uppercase", fontWeight: 500, margin: "0 0 10px",
              }}>
                Getting started
              </p>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(22px, 3vw, 30px)",
                fontWeight: 700,
                color: "#FAF3E0",
                margin: 0,
                lineHeight: 1.2,
              }}>
                Up and running<br />
                <em style={{ color: "#B8A9C9", fontStyle: "italic" }}>in three steps.</em>
              </h2>
            </div>

            {/* Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {STEPS.map((step, i) => (
                <div
                  key={step.num}
                  className="step-card"
                  style={{
                    display: "flex",
                    gap: 18,
                    alignItems: "flex-start",
                    padding: "18px 20px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    color: step.color,
                    animationDelay: `${0.4 + i * 0.15}s`,
                  }}
                >
                  {/* Number badge */}
                  <div style={{
                    minWidth: 36, height: 36, borderRadius: 10,
                    background: `${step.color}20`,
                    border: `1.5px solid ${step.color}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 13, fontWeight: 700, color: step.color,
                    flexShrink: 0,
                  }}>
                    {step.num}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <p style={{
                      margin: 0, fontSize: 14, fontWeight: 500,
                      color: "#FAF3E0", lineHeight: 1.3,
                    }}>
                      {step.title}
                    </p>
                    <p style={{
                      margin: 0, fontSize: 13, color: "rgba(250,243,224,0.55)",
                      lineHeight: 1.55, fontWeight: 300,
                    }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom testimonial / tagline */}
            <div style={{
              borderTop: "1px solid rgba(255,255,255,0.07)",
              paddingTop: 24,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}>
              {/* Avatar stack */}
              <div style={{ display: "flex" }}>
                {["#87A878", "#6BA3BE", "#B8A9C9"].map((c, i) => (
                  <div key={i} style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: `${c}55`,
                    border: `2px solid #2D2D2D`,
                    marginLeft: i > 0 ? -8 : 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11,
                  }}>
                    {["🌿", "✦", "🌸"][i]}
                  </div>
                ))}
              </div>
              <p style={{
                margin: 0, fontSize: 12, color: "rgba(250,243,224,0.45)",
                fontWeight: 300, lineHeight: 1.4,
              }}>
                Join thousands already creating with Lumina
              </p>
            </div>
          </div>
        </div>

        {/* ── Responsive: stack on mobile ── */}
        <style>{`
          @media (min-width: 768px) {
            .lg\\:grid-cols-\\[1fr_1fr\\] {
              grid-template-columns: 1fr 1fr !important;
            }
          }
        `}</style>
      </main>
    </>
  );
}