"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareableLink = slug ? `${origin}/s/${slug}` : "";
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareableLink);
    } catch {
      const el = document.createElement("textarea");
      el.value = shareableLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const whatsappText = encodeURIComponent(
    `🎈 I made a special surprise just for you — pop the balloons to see it! ✨\n${shareableLink}`
  );

  const emojis = ["🎈", "✨", "🎉", "⭐", "🎊", "💌", "🎈", "✨", "🎉", "⭐", "🎊", "💌"];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #faf3e0 0%, #e8f4f0 50%, #e8eef6 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.25rem",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Georgia', serif",
      }}
    >
      {/* Keyframe styles */}
      <style>{`
        @keyframes decoFall {
          0%   { transform: translateY(-40px) rotate(0deg); opacity: 0; }
          8%   { opacity: 0.7; }
          92%  { opacity: 0.5; }
          100% { transform: translateY(110vh) rotate(30deg); opacity: 0; }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(32px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes trophyBounce {
          0%, 100% { transform: rotate(-5deg) scale(1); }
          50%       { transform: rotate(5deg) scale(1.1); }
        }
        .success-card { animation: cardIn 0.7s cubic-bezier(0.22,1,0.36,1) both; }
        .trophy-emoji { animation: trophyBounce 2s ease-in-out infinite; display: block; }
        .deco-emoji { position: absolute; top: -2rem; animation: decoFall linear infinite; }
        .copy-btn {
          flex-shrink: 0; padding: 0.4rem 0.9rem;
          background: linear-gradient(135deg, #87A878, #6BA3BE);
          color: white; border: none; border-radius: 9px;
          font-family: 'Courier New', monospace; font-size: 0.75rem; font-weight: 700;
          cursor: pointer; letter-spacing: 0.04em;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 3px 10px rgba(107,163,190,0.3); white-space: nowrap;
        }
        .copy-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 14px rgba(107,163,190,0.4); }
        .copy-btn.copied { background: linear-gradient(135deg, #6BA3BE, #87A878); }
        .whatsapp-btn {
          display: flex; align-items: center; justify-content: center; gap: 0.6rem;
          width: 100%; padding: 0.85rem;
          background: #25D366; color: white; border-radius: 14px;
          font-family: 'Courier New', monospace; font-size: 0.88rem; font-weight: 700;
          text-decoration: none; letter-spacing: 0.04em; margin-bottom: 1.5rem;
          box-shadow: 0 4px 16px rgba(37,211,102,0.35);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .whatsapp-btn:hover { transform: translateY(-2px); box-shadow: 0 7px 22px rgba(37,211,102,0.45); }
        .history-link {
          font-family: 'Courier New', monospace; font-size: 0.75rem;
          color: #6BA3BE; text-decoration: none; letter-spacing: 0.04em;
          transition: color 0.15s;
        }
        .history-link:hover { color: #4a7a96; }
        .dash-link {
          font-family: 'Courier New', monospace; font-size: 0.75rem;
          color: #aaa; text-decoration: none; letter-spacing: 0.04em;
          transition: color 0.15s;
        }
        .dash-link:hover { color: #777; }
      `}</style>

      {/* Floating decorations */}
      <div
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}
      >
        {emojis.map((emoji, i) => (
          <span
            key={i}
            className="deco-emoji"
            style={{
              left: `${(i * 8 + 3) % 100}%`,
              animationDuration: `${3 + (i % 5) * 0.7}s`,
              animationDelay: `${-(i * 0.55)}s`,
              fontSize: `${1.1 + (i % 3) * 0.35}rem`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      {/* Card */}
      <div
        className="success-card"
        style={{
          position: "relative",
          zIndex: 1,
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(24px)",
          border: "1.5px solid rgba(255,255,255,0.95)",
          borderRadius: 28,
          padding: "2.75rem 2.25rem 2.25rem",
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 20px 60px rgba(107,163,190,0.18), 0 4px 12px rgba(0,0,0,0.06)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <span className="trophy-emoji" style={{ fontSize: "3.5rem", marginBottom: "0.75rem" }}>
            🎊
          </span>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#2D2D2D",
              margin: "0.75rem 0 0.5rem",
              lineHeight: 1.2,
            }}
          >
            Your Surprise is Live!
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#777", margin: 0, fontStyle: "italic" }}>
            Share the link below. It stays active for <strong>15 days</strong>.
          </p>
        </div>

        {/* Link box */}
        <div style={{ marginBottom: "1rem" }}>
          <p
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "0.68rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#B8A9C9",
              margin: "0 0 0.5rem",
            }}
          >
            Shareable Link
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              background: "#faf3e0",
              border: "1.5px solid rgba(135,168,120,0.25)",
              borderRadius: 14,
              padding: "0.75rem 1rem",
            }}
          >
            <span
              style={{
                flex: 1,
                fontFamily: "'Courier New', monospace",
                fontSize: "0.75rem",
                color: "#2D2D2D",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {shareableLink || "generating link…"}
            </span>
            <button
              className={`copy-btn${copied ? " copied" : ""}`}
              onClick={handleCopy}
            >
              {copied ? "✓ Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-btn"
        >
          <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, flexShrink: 0 }} fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.137.564 4.143 1.546 5.875L0 24l6.304-1.516A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.802 9.802 0 01-5.001-1.368l-.357-.213-3.742.9.942-3.63-.235-.374A9.786 9.786 0 012.182 12C2.182 6.573 6.573 2.182 12 2.182S21.818 6.573 21.818 12c0 5.426-4.392 9.818-9.818 9.818z" />
          </svg>
          Share on WhatsApp
        </a>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            marginBottom: "1.5rem",
          }}
        >
          <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(135,168,120,0.25), transparent)" }} />
          <span style={{ color: "#87A878", fontSize: "0.55rem" }}>✦</span>
          <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(135,168,120,0.25), transparent)" }} />
        </div>

        {/* Next steps */}
        <div style={{ marginBottom: "1.75rem" }}>
          <p
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#B8A9C9",
              margin: "0 0 0.85rem",
            }}
          >
            What happens next?
          </p>
          {[
            { n: "1", text: <>Send the link to <strong>your recipient</strong></> },
            { n: "2", text: <>They tap each balloon to <strong>pop it</strong> 🎈</> },
            { n: "3", text: <>Your final message <strong>appears</strong> ✨</> },
          ].map(({ n, text }) => (
            <div
              key={n}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                marginBottom: "0.6rem",
                fontSize: "0.88rem",
                color: "#555",
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #87A878, #6BA3BE)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Courier New', monospace",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  marginTop: 1,
                }}
              >
                {n}
              </span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/dashboard/history" className="history-link">
            View all surprises →
          </a>
          <a href="/dashboard" className="dash-link">
            ← Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #faf3e0 0%, #e8f4f0 50%, #e8eef6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Courier New', monospace",
            color: "#87A878",
            fontSize: "0.9rem",
            letterSpacing: "0.08em",
          }}
        >
          Loading your surprise…
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}