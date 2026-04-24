"use client";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 20% 20%, #eaf7ec, transparent), linear-gradient(135deg, #f8faf7, #e4efe6)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#1f2937",
      }}
    >
      {/* NAVBAR */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* BRAND */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
  <span
    style={{
      fontSize: "22px",
      fontWeight: 700,
      letterSpacing: "-0.4px",
      background: "linear-gradient(90deg, #22c55e, #4ade80)",
      WebkitBackgroundClip: "text",
      color: "transparent",
    }}
  >
    ✨ Lumina
  </span>

  <span
    style={{
      fontSize: "13px",
      color: "#9ca3af",
      fontWeight: 500,
      letterSpacing: "0.2px",
    }}
  >
    · Brightening lives
  </span>
</div>

        {/* LOGIN */}
        <a
          href="/login"
          style={{
            padding: "10px 20px",
            background: "rgba(0,0,0,0.85)",
            color: "white",
            borderRadius: "999px",
            textDecoration: "none",
            fontSize: "14px",
            boxShadow: "0 5px 15px rgba(0,0,0,0.15)",
          }}
        >
          Login
        </a>
      </div>

      {/* HERO */}
      <div
        style={{
          maxWidth: "850px",
          margin: "100px auto 60px",
          textAlign: "center",
          padding: "0 20px",
        }}
      >
        <h1
          style={{
            fontSize: "54px",
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-1px",
          }}
        >
          Create unforgettable{" "}
          <span
            style={{
              background:
                "linear-gradient(90deg, #16a34a, #4ade80, #22c55e)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            digital surprises
          </span>
        </h1>

        <p
          style={{
            marginTop: "24px",
            color: "#4b5563",
            fontSize: "18px",
            lineHeight: 1.6,
          }}
        >
          Send magical, interactive experiences ✨  
          that people actually remember.
        </p>

        <div style={{ marginTop: "40px" }}>
          <a
            href="/login"
            style={{
              padding: "14px 28px",
              background:
                "linear-gradient(90deg, #16a34a, #22c55e)",
              color: "white",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: 500,
              boxShadow: "0 10px 30px rgba(34,197,94,0.3)",
              transition: "all 0.2s ease",
            }}
          >
            Get Started 🚀
          </a>
        </div>
      </div>

      {/* FEATURES */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "40px auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "24px",
          padding: "20px",
        }}
      >
        {[
          {
            title: "💌 Personal Messages",
            desc: "Write something that actually hits, not generic stuff.",
          },
          {
            title: "🎈 Interactive Surprises",
            desc: "Clicks, reveals, animations. Make it feel alive.",
          },
          {
            title: "🔗 Shareable Links",
            desc: "One link. Instant reaction. No friction.",
          },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(12px)",
              padding: "26px",
              borderRadius: "18px",
              boxShadow:
                "0 15px 40px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.4)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            className="feature-card"
          >
            <h3 style={{ fontSize: "18px", fontWeight: 600 }}>
              {item.title}
            </h3>
            <p
              style={{
                marginTop: "10px",
                color: "#555",
                lineHeight: 1.5,
              }}
            >
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div
        style={{
          textAlign: "center",
          marginTop: "100px",
          paddingBottom: "80px",
        }}
      >
        <h2
          style={{
            fontSize: "30px",
            fontWeight: 600,
          }}
        >
          Make someone smile today ✨
        </h2>

        <a
          href="/login"
          style={{
            display: "inline-block",
            marginTop: "24px",
            padding: "14px 32px",
            background: "#111",
            color: "white",
            borderRadius: "999px",
            textDecoration: "none",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          }}
        >
          Start Creating →
        </a>
      </div>

      {/* HOVER FIX (no JS needed) */}
      <style>
        {`
          .feature-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 25px 60px rgba(0,0,0,0.12);
          }
        `}
      </style>
    </main>
  );
}