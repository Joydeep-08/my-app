"use client";

import { useState, useCallback, useRef } from "react";

interface Balloon {
  id: string;
  message: string;
  imageBase64: string | null;
}

type PreviewScreen = "welcome" | "pop" | "final" | "done";

interface Step4Props {
  recipientName: string;
  occasion: string;
  balloons: Balloon[];
  finalMessage: string;
  onEditSurprise: () => void;
}

// ─── Balloon colours ──────────────────────────────────────────────────────────
const BALLOON_COLORS = [
  { body: "#87A878", shine: "#a8c99a", string: "#5a7a52" },
  { body: "#6BA3BE", shine: "#8ec0d8", string: "#4a7a96" },
  { body: "#B8A9C9", shine: "#d0c4de", string: "#8a7aa0" },
  { body: "#F4A261", shine: "#f7bc8a", string: "#c07840" },
  { body: "#E8A0BF", shine: "#f0bdd4", string: "#b87898" },
  { body: "#87A878", shine: "#a8c99a", string: "#5a7a52" },
  { body: "#6BA3BE", shine: "#8ec0d8", string: "#4a7a96" },
  { body: "#B8A9C9", shine: "#d0c4de", string: "#8a7aa0" },
  { body: "#F4A261", shine: "#f7bc8a", string: "#c07840" },
];

// ─── Regular balloon SVG ──────────────────────────────────────────────────────
function BalloonSVG({ color, size = 90 }: { color: (typeof BALLOON_COLORS)[0]; size?: number }) {
  const gid = `bg-${color.body.replace("#", "")}`;
  return (
    <svg width={size} height={size * 1.625} viewBox="0 0 80 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="bshadow" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(0,0,0,0.18)" />
        </filter>
        <radialGradient id={gid} cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor={color.shine} />
          <stop offset="100%" stopColor={color.body} />
        </radialGradient>
      </defs>
      <path
        d="M40 4 C20 4, 6 18, 6 36 C6 56, 18 72, 40 78 C62 72, 74 56, 74 36 C74 18, 60 4, 40 4 Z"
        fill={`url(#${gid})`}
        filter="url(#bshadow)"
      />
      <ellipse cx="28" cy="24" rx="10" ry="14" fill="white" opacity="0.28" transform="rotate(-20 28 24)" />
      <ellipse cx="24" cy="18" rx="4" ry="5.5" fill="white" opacity="0.45" transform="rotate(-20 24 18)" />
      <path d="M37 78 Q40 84 43 78" stroke={color.body} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="40" cy="82" r="2.5" fill={color.string} opacity="0.7" />
      <path d="M40 85 C34 95, 46 105, 40 125" stroke={color.string} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.75" />
    </svg>
  );
}

// ─── Organic cluster positions ────────────────────────────────────────────────
function getClusterPositions(total: number) {
  const radius = 28;
  const centerX = 50;
  const centerY = 50;
  return Array.from({ length: total }, (_, i) => {
    const angle = (i / total) * Math.PI * 2;
    return {
      left: centerX + radius * Math.cos(angle),
      top: centerY + radius * Math.sin(angle),
      scale: 0.9 + (i % 3) * 0.08,
    };
  });
}

interface ModalContent {
  message: string;
  imageBase64: string | null;
  balloonIndex?: number;
}

// ─── Welcome Screen ───────────────────────────────────────────────────────────
function WelcomeScreen({
  recipientName,
  occasion,
  onStart,
}: {
  recipientName: string;
  occasion: string;
  onStart: () => void;
}) {
  return (
    <div className="preview-body">
      <div className="welcome-balloons" aria-hidden="true">
        {BALLOON_COLORS.slice(0, 7).map((color, i) => (
          <div key={i} className={`float-balloon fb-${i}`}>
            <BalloonSVG color={color} size={55 + (i % 3) * 12} />
          </div>
        ))}
      </div>

      <div className="welcome-card">
        <p className="welcome-occasion">{occasion} 🎉</p>
        <h1 className="welcome-name">
          Hey <span className="name-highlight">{recipientName}</span>!
        </h1>
        <p className="welcome-teaser">
          Someone special has crafted a magical surprise just for you.
          <br />
          Click below to start the magic ✨
        </p>
        <button className="magic-btn" onClick={onStart}>
          Start the Magic ✨
        </button>
      </div>

      <style jsx>{`
        .preview-body {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .welcome-balloons {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .float-balloon {
          position: absolute;
          animation: balloonFloat linear infinite;
          opacity: 0.82;
        }
        .fb-0 { left: 5%;  bottom: -120px; animation-duration: 9s;   animation-delay: 0s; }
        .fb-1 { left: 18%; bottom: -120px; animation-duration: 11s;  animation-delay: -3s; }
        .fb-2 { left: 35%; bottom: -120px; animation-duration: 8s;   animation-delay: -6s; }
        .fb-3 { left: 52%; bottom: -120px; animation-duration: 13s;  animation-delay: -1s; }
        .fb-4 { left: 67%; bottom: -120px; animation-duration: 10s;  animation-delay: -5s; }
        .fb-5 { left: 80%; bottom: -120px; animation-duration: 12s;  animation-delay: -2s; }
        .fb-6 { left: 90%; bottom: -120px; animation-duration: 9.5s; animation-delay: -8s; }
        @keyframes balloonFloat {
          0%   { transform: translateY(0) rotate(-4deg); opacity: 0; }
          5%   { opacity: 0.82; }
          48%  { transform: translateY(-55vh) rotate(4deg); }
          52%  { transform: translateY(-55vh) rotate(-2deg); }
          95%  { opacity: 0.6; }
          100% { transform: translateY(-115vh) rotate(3deg); opacity: 0; }
        }
        .welcome-card {
          background: rgba(255,255,255,0.78);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1.5px solid rgba(255,255,255,0.9);
          border-radius: 28px;
          box-shadow: 0 12px 48px rgba(107,163,190,0.2), 0 2px 8px rgba(0,0,0,0.06);
          padding: 3rem 2.5rem 2.75rem;
          width: 100%;
          max-width: 480px;
          text-align: center;
          position: relative;
          z-index: 1;
          animation: cardIn 0.7s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(32px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .welcome-occasion {
          font-size: 0.8rem;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #B8A9C9;
          margin: 0 0 0.75rem;
        }
        .welcome-name {
          font-size: 2.6rem;
          font-weight: 700;
          color: #2D2D2D;
          margin: 0 0 1rem;
          line-height: 1.1;
          font-family: 'Georgia', serif;
        }
        .name-highlight {
          background: linear-gradient(135deg, #87A878, #6BA3BE);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .welcome-teaser {
          font-size: 0.95rem;
          color: #777;
          line-height: 1.65;
          font-family: 'Georgia', serif;
          font-style: italic;
          margin: 0 0 2rem;
        }
        .magic-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2.25rem;
          background: linear-gradient(135deg, #87A878, #6BA3BE);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 1.05rem;
          font-weight: 700;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.04em;
          cursor: pointer;
          box-shadow: 0 6px 24px rgba(107,163,190,0.35);
          transition: transform 0.2s, box-shadow 0.2s;
          animation: pulse 2.5s ease-in-out infinite;
        }
        .magic-btn:hover {
          transform: translateY(-3px) scale(1.04);
          box-shadow: 0 10px 32px rgba(107,163,190,0.45);
          animation: none;
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 6px 24px rgba(107,163,190,0.35); }
          50%       { box-shadow: 0 6px 32px rgba(135,168,120,0.5); }
        }
        @media (max-width: 520px) {
          .welcome-card { padding: 2.25rem 1.5rem 2rem; }
          .welcome-name { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
}

// ─── Pop Screen ───────────────────────────────────────────────────────────────
function PopScreen({
  balloons,
  onAllPopped,
}: {
  balloons: Balloon[];
  onAllPopped: () => void;
}) {
  const [popped, setPopped] = useState<Set<string>>(new Set());
  const [activePolaroid, setActivePolaroid] = useState<ModalContent | null>(null);
  const [popOrder, setPopOrder] = useState<string[]>([]);
  const poppedContentRef = useRef<Map<string, ModalContent>>(new Map());

  const positions = getClusterPositions(balloons.length);

  const triggerConfetti = useCallback(async (x: number, y: number) => {
    const confetti = (await import("canvas-confetti")).default;
    confetti({
      particleCount: 80, spread: 75,
      origin: { x: x / window.innerWidth, y: y / window.innerHeight },
      colors: ["#87A878", "#6BA3BE", "#B8A9C9", "#F4A261", "#E8A0BF", "#ffffff"],
      ticks: 210, gravity: 0.88, scalar: 1.1,
    });
    setTimeout(() => confetti({
      particleCount: 35, spread: 40,
      origin: { x: x / window.innerWidth, y: y / window.innerHeight },
      colors: ["#ffffff", "#fef3c7"],
      ticks: 140, gravity: 1.1, scalar: 0.72, shapes: ["circle"],
    }), 200);
  }, []);

  function playPopSound() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(1.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start();
    } catch (e) {}
  }

  async function handlePop(id: string, e: React.MouseEvent) {
    if (popped.has(id)) return;
    playPopSound();
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    el.classList.add("popping");
    await triggerConfetti(cx, cy);

    const balloonIndex = balloons.findIndex((b) => b.id === id);
    const balloon = balloons[balloonIndex];
    const content: ModalContent = {
      message: balloon.message,
      imageBase64: balloon.imageBase64,
      balloonIndex,
    };

    const newPopped = new Set([...popped, id]);
    const newOrder = [...popOrder, id];
    poppedContentRef.current.set(id, content);
    setPopOrder(newOrder);
    setPopped(newPopped);
    setActivePolaroid(content);

    if (newPopped.size === balloons.length) {
      // handled in handleClose
    }
  }

  function handleClose() {
    setActivePolaroid(null);
    if (popped.size + 1 >= balloons.length && activePolaroid !== null) {
      const totalPopped = poppedContentRef.current.size;
      if (totalPopped >= balloons.length) {
        setTimeout(() => onAllPopped(), 300);
      }
    }
  }

  const remaining = balloons.length - popped.size;

  return (
    <div className="pop-screen">
      <div className="pop-counter">
        {remaining > 0
          ? `🎈 ${remaining} surprise${remaining !== 1 ? "s" : ""} left — tap to pop!`
          : "🎊 All popped! Opening final message…"}
      </div>

      <div className="pop-arena">
        {balloons.map((balloon, i) => {
          const isPopped = popped.has(balloon.id);
          const color = BALLOON_COLORS[i % BALLOON_COLORS.length];
          const base = positions[i] ?? { left: 50, top: 50, scale: 1 };
          const jitterX = (Math.random() - 0.5) * 6;
          const jitterY = (Math.random() - 0.5) * 6;
          const pos = { left: base.left + jitterX, top: base.top + jitterY, scale: base.scale };
          const rotate = (Math.random() - 0.5) * 12;
          const floatDur = 3.2 + (i % 6) * 0.55;
          const floatDelay = -(i * 0.7);
          const swayDir = i % 2 === 0 ? 1 : -1;

          return (
            <div
              key={balloon.id}
              className="balloon-slot"
              style={{ left: `${pos.left}%`, top: `${pos.top}%`, zIndex: 2 + i }}
            >
              {!isPopped ? (
                <button
                  className="balloon-btn"
                  style={{
                    ["--float-dur" as string]: `${floatDur}s`,
                    ["--float-delay" as string]: `${floatDelay}s`,
                    ["--sway" as string]: `${swayDir * 6}px`,
                    ["--bscale" as string]: pos.scale,
                    ["--rotate" as string]: `${rotate}deg`,
                  }}
                  onClick={(e) => handlePop(balloon.id, e)}
                  aria-label={`Pop balloon ${i + 1}`}
                >
                  <BalloonSVG color={color} size={88} />
                </button>
              ) : (
                <button
                  className="popped-peek"
                  onClick={() => {
                    const stored = poppedContentRef.current.get(balloon.id);
                    if (stored) setActivePolaroid(stored);
                  }}
                  title="View card"
                >
                  💌
                </button>
              )}
            </div>
          );
        })}
      </div>

      {activePolaroid && (() => {
        const origIdx = activePolaroid.balloonIndex ?? 0;
        const rot = [-2.5, 1.8, -1.2, 2.2, -3, 1.5, -2, 2.8][origIdx % 8];
        return (
          <div className="polaroid-overlay" onClick={handleClose}>
            <div
              className="polaroid-card"
              style={{ transform: `rotate(${rot}deg)` }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="polaroid-photo">
                {activePolaroid.imageBase64 ? (
                  <>
                    <img src={activePolaroid.imageBase64} alt="Surprise" className="polaroid-img" />
                    <div className="watermark-wrap" aria-hidden="true">
                      <span className="watermark-text">PREVIEW ONLY</span>
                    </div>
                  </>
                ) : (
                  <div
                    className="polaroid-placeholder"
                    style={{
                      background: [
                        "linear-gradient(135deg,#fde68a,#fca5a5)",
                        "linear-gradient(135deg,#a7f3d0,#6EE7B7)",
                        "linear-gradient(135deg,#c4b5fd,#93c5fd)",
                        "linear-gradient(135deg,#fda4af,#fb923c)",
                        "linear-gradient(135deg,#86efac,#fde68a)",
                      ][origIdx % 5],
                    }}
                  >
                    <span className="placeholder-balloon">🎈</span>
                  </div>
                )}
              </div>
              <div className="polaroid-caption">
                {activePolaroid.message
                  ? <p className="polaroid-msg">{activePolaroid.message}</p>
                  : <p className="polaroid-msg polaroid-msg-empty">✨ a little surprise for you</p>
                }
              </div>
              <button className="modal-close" onClick={handleClose} aria-label="Close">×</button>
            </div>
          </div>
        );
      })()}

      <p className="pop-hint">Tap each balloon to pop it! 🎉</p>

      <style jsx>{`
        .pop-screen { min-height: 100vh; padding-top: 54px; position: relative; overflow: hidden; }
        .pop-counter {
          position: fixed; top: 52px; left: 50%; transform: translateX(-50%);
          z-index: 50; background: rgba(255,255,255,0.92); backdrop-filter: blur(12px);
          border: 1.5px solid rgba(255,255,255,0.95); border-radius: 50px;
          padding: 0.42rem 1.3rem; font-size: 0.8rem; font-family: 'Courier New', monospace;
          font-weight: 600; color: #2D2D2D; letter-spacing: 0.03em;
          box-shadow: 0 4px 16px rgba(0,0,0,0.09); white-space: nowrap;
          animation: slideDown 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .pop-arena { position: relative; width: 100%; height: calc(100vh - 54px); }
        .balloon-slot { position: absolute; transform: translate(-50%, -50%); }
        .balloon-btn {
          background: none; border: none; padding: 0; cursor: pointer; display: block;
          position: relative;
          transform: scale(var(--bscale, 1)) rotate(var(--rotate, 0deg));
          transform-origin: 50% 100%;
          animation: balloonBob var(--float-dur, 3.5s) ease-in-out var(--float-delay, 0s) infinite;
          filter: drop-shadow(0 6px 14px rgba(0,0,0,0.14)); transition: filter 0.15s;
        }
        .balloon-btn:hover {
          filter: drop-shadow(0 10px 24px rgba(0,0,0,0.22)) brightness(1.07);
          animation-play-state: paused;
          transform: scale(calc(var(--bscale, 1) * 1.1)) !important;
        }
        .balloon-btn:active {
          transform: scale(calc(var(--bscale, 1) * 0.88)) !important;
          filter: drop-shadow(0 2px 6px rgba(0,0,0,0.1));
        }
        .balloon-btn.popping {
          animation: popBurst 0.28s ease-out forwards !important;
          transform-origin: center center;
        }
        @keyframes popBurst {
          0%   { transform: scale(var(--bscale, 1));             opacity: 1; filter: brightness(2.5); }
          55%  { transform: scale(calc(var(--bscale, 1) * 1.5)); opacity: 0.5; }
          100% { transform: scale(0.02);                         opacity: 0; }
        }
        @keyframes balloonBob {
          0%   { margin-top: 0px; }
          28%  { margin-top: -18px; }
          58%  { margin-top: -12px; }
          100% { margin-top: 0px; }
        }
        .popped-peek {
          background: rgba(255,255,255,0.92); backdrop-filter: blur(8px);
          border: 1.5px solid rgba(255,255,255,0.95); border-radius: 50%;
          width: 46px; height: 46px; font-size: 1.35rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 3px 12px rgba(0,0,0,0.13), 0 0 0 3px rgba(107,163,190,0.15);
          transition: transform 0.15s, box-shadow 0.15s;
          animation: peekIn 0.3s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes peekIn {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
        .popped-peek:hover {
          transform: scale(1.22);
          box-shadow: 0 6px 20px rgba(107,163,190,0.3), 0 0 0 3px rgba(107,163,190,0.3);
        }
        .polaroid-overlay {
          position: fixed; inset: 0; z-index: 300;
          background: rgba(15,12,8,0.55); backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 1.5rem; animation: overlayIn 0.22s ease both; cursor: pointer;
        }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        .polaroid-card {
          background: #fffef9; border-radius: 3px; padding: 0.9rem 0.9rem 1.4rem;
          width: 100%; max-width: 290px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(0,0,0,0.04);
          position: relative; cursor: default;
          animation: polaroidPop 0.42s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes polaroidPop {
          from { opacity: 0; transform: scale(0.6) translateY(40px); }
          to   { opacity: 1; transform: scale(1)   translateY(0); }
        }
        .polaroid-photo { width: 100%; aspect-ratio: 1/1; border-radius: 2px; overflow: hidden; position: relative; background: #f0ece4; }
        .polaroid-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .watermark-wrap {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          background: repeating-linear-gradient(-45deg, transparent, transparent 22px, rgba(0,0,0,0.07) 22px, rgba(0,0,0,0.07) 24px);
          pointer-events: none;
        }
        .watermark-text {
          font-family: 'Courier New', monospace; font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.18em; color: rgba(255,255,255,0.78);
          text-shadow: 0 1px 4px rgba(0,0,0,0.55); background: rgba(0,0,0,0.22);
          padding: 0.18rem 0.55rem; border-radius: 3px;
        }
        .polaroid-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .placeholder-balloon { font-size: 3.5rem; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15)); }
        .polaroid-caption {
          padding: 0.85rem 0.25rem 0; min-height: 3.5rem;
          display: flex; align-items: flex-start; justify-content: center;
        }
        .polaroid-msg { font-family: 'Georgia', serif; font-size: 0.88rem; line-height: 1.6; color: #3a3630; text-align: center; margin: 0; }
        .polaroid-msg-empty { font-style: italic; color: #b0a898; }
        .modal-close {
          position: absolute; top: -12px; right: -12px; width: 28px; height: 28px;
          border-radius: 50%; background: #2D2D2D; color: #fff; border: 2px solid #fffef9;
          font-size: 1.05rem; display: flex; align-items: center; justify-content: center;
          cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.25); transition: background 0.15s, transform 0.15s;
        }
        .modal-close:hover { background: #c85a5a; transform: scale(1.12); }
        .pop-hint {
          position: fixed; bottom: 1.25rem; left: 50%; transform: translateX(-50%);
          font-size: 0.75rem; font-family: 'Courier New', monospace;
          color: rgba(45,45,45,0.45); letter-spacing: 0.05em; white-space: nowrap;
          z-index: 5; animation: hintPulse 2.8s ease-in-out infinite; pointer-events: none;
        }
        @keyframes hintPulse { 0%, 100% { opacity: 0.38; } 50% { opacity: 0.85; } }
        @media (max-width: 520px) {
          .polaroid-card { max-width: 260px; padding: 0.75rem 0.75rem 1.25rem; }
          .polaroid-msg  { font-size: 0.82rem; }
        }
      `}</style>
    </div>
  );
}

// ─── Final Message Screen (Screen 3) ─────────────────────────────────────────
function FinalMessageScreen({
  finalMessage,
  recipientName,
  occasion,
  onFinalize,
}: {
  finalMessage: string;
  recipientName: string;
  occasion: string;
  onFinalize: () => void;
}) {
  return (
    <div className="final-screen">
      <div className="stars-container" aria-hidden="true">
        {Array.from({ length: 28 }, (_, i) => (
          <span
            key={i}
            className="falling-star"
            style={{
              left: `${(i * 37 + 7) % 100}%`,
              animationDuration: `${2.5 + (i % 7) * 0.45}s`,
              animationDelay: `${-(i * 0.38)}s`,
              fontSize: `${0.6 + (i % 4) * 0.22}rem`,
              opacity: 0.6 + (i % 3) * 0.15,
            }}
          >
            {["✦", "✧", "⭐", "✨", "★"][i % 5]}
          </span>
        ))}
      </div>

      <div className="fs-content">
        <div className="fs-header">
          <div className="fs-emoji-row" aria-hidden="true">
            <span className="bounce-emoji" style={{ animationDelay: "0s" }}>🎊</span>
            <span className="bounce-emoji" style={{ animationDelay: "0.15s" }}>🎉</span>
            <span className="bounce-emoji" style={{ animationDelay: "0.3s" }}>🎊</span>
          </div>
          <p className="fs-occasion-tag">{occasion}</p>
          <h2 className="fs-headline">
            For you, <span className="fs-name">{recipientName}</span>
          </h2>
        </div>

        <div className="fs-message-card">
          <span className="corner-ornament tl">✦</span>
          <span className="corner-ornament tr">✦</span>
          <span className="corner-ornament bl">✦</span>
          <span className="corner-ornament br">✦</span>
          <div className="fs-quote-icon">💌</div>
          <div className="fs-divider">
            <span /><span className="fs-divider-star">✦</span><span />
          </div>
          <p className="fs-message-text">
            {finalMessage || "✨ Wishing you all the happiness and joy in the world. You deserve every bit of it!"}
          </p>
          <div className="fs-divider fs-divider-bottom">
            <span /><span className="fs-divider-star">✧</span><span />
          </div>
          <p className="fs-sign-off">With love &amp; celebration ✨</p>
        </div>

        <div className="fs-balloon-row" aria-hidden="true">
          {BALLOON_COLORS.slice(0, 5).map((color, i) => (
            <div key={i} className="fs-balloon" style={{ animationDuration: `${2.8 + i * 0.4}s`, animationDelay: `${-(i * 0.6)}s` }}>
              <BalloonSVG color={color} size={42} />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .final-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 5rem 1.25rem 3rem; position: relative; overflow: hidden; }
        .stars-container { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .falling-star { position: absolute; top: -2rem; animation: starFall linear infinite; color: #F4C430; text-shadow: 0 0 6px rgba(244,196,48,0.6); }
        @keyframes starFall {
          0%   { transform: translateY(-40px) rotate(0deg);   opacity: 0; }
          8%   { opacity: 1; }
          85%  { opacity: 0.7; }
          100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
        }
        .fs-content { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 1.75rem; width: 100%; max-width: 520px; }
        .fs-header { text-align: center; animation: fsHeaderIn 0.7s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes fsHeaderIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .fs-emoji-row { display: flex; justify-content: center; gap: 0.35rem; margin-bottom: 0.65rem; }
        .bounce-emoji { display: inline-block; font-size: 2rem; animation: emojiBounce 1.6s ease-in-out infinite; }
        @keyframes emojiBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .fs-occasion-tag { font-family: 'Courier New', monospace; font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: #B8A9C9; margin: 0 0 0.5rem; }
        .fs-headline { font-family: 'Georgia', serif; font-size: 2rem; font-weight: 700; color: #2D2D2D; margin: 0; line-height: 1.2; }
        .fs-name { background: linear-gradient(135deg, #87A878, #6BA3BE); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .fs-message-card {
          width: 100%; background: rgba(255,255,255,0.88); backdrop-filter: blur(24px);
          border: 1.5px solid rgba(255,255,255,0.95); border-radius: 28px;
          padding: 2.5rem 2.25rem 2.25rem; text-align: center; position: relative;
          box-shadow: 0 16px 48px rgba(107,163,190,0.18), 0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9);
          animation: cardReveal 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s both; overflow: hidden;
        }
        @keyframes cardReveal { from { opacity: 0; transform: translateY(32px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .fs-message-card::before {
          content: ''; position: absolute; inset: 0; border-radius: 28px;
          background: radial-gradient(ellipse at 15% 15%, rgba(135,168,120,0.07) 0%, transparent 55%), radial-gradient(ellipse at 85% 80%, rgba(184,169,201,0.07) 0%, transparent 55%);
          pointer-events: none;
        }
        .corner-ornament { position: absolute; font-size: 0.7rem; color: rgba(107,163,190,0.35); line-height: 1; }
        .tl { top: 14px; left: 16px; } .tr { top: 14px; right: 16px; } .bl { bottom: 14px; left: 16px; } .br { bottom: 14px; right: 16px; }
        .fs-quote-icon { font-size: 2.6rem; margin-bottom: 1rem; animation: iconFloat 2.4s ease-in-out infinite; filter: drop-shadow(0 4px 10px rgba(107,163,190,0.25)); }
        @keyframes iconFloat { 0%, 100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-6px) rotate(3deg); } }
        .fs-divider { display: flex; align-items: center; gap: 0.6rem; margin: 0 auto 1.35rem; max-width: 180px; }
        .fs-divider span:not(.fs-divider-star) { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(107,163,190,0.3), transparent); }
        .fs-divider-star { color: #87A878; font-size: 0.6rem; }
        .fs-divider-bottom { margin-top: 1.35rem; margin-bottom: 1rem; }
        .fs-message-text { font-family: 'Georgia', serif; font-size: 1.08rem; line-height: 1.85; color: #3a3630; font-style: italic; margin: 0; position: relative; padding: 0 0.5rem; }
        .fs-sign-off { font-family: 'Courier New', monospace; font-size: 0.72rem; letter-spacing: 0.1em; color: #B8A9C9; margin: 0; text-transform: uppercase; }
        .fs-balloon-row { display: flex; justify-content: center; gap: 0.5rem; animation: balloonRowIn 0.9s cubic-bezier(0.22,1,0.36,1) 0.35s both; }
        @keyframes balloonRowIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fs-balloon { animation: miniBob ease-in-out infinite; }
        @keyframes miniBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @media (max-width: 520px) {
          .final-screen { padding: 4.5rem 1rem 2rem; }
          .fs-message-card { padding: 2rem 1.5rem 1.75rem; }
          .fs-headline { font-size: 1.65rem; }
          .fs-message-text { font-size: 0.95rem; }
        }
      `}</style>
    </div>
  );
}

// ─── Finalize Modal — NOW WITH RAZORPAY ──────────────────────────────────────
function FinalizeModal({
  onClose,
  onPaymentSuccess,
}: {
  onClose: () => void;
  onPaymentSuccess: (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
}) {
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [payError, setPayError] = useState("");

  function handleApplyCoupon() {
    if (coupon.trim() === "") {
      setCouponError("Please enter a coupon code.");
      setCouponApplied(false);
      return;
    }
    setCouponError("Invalid or expired coupon code.");
    setCouponApplied(false);
  }

  async function handlePayNow() {
    setIsLoading(true);
    setPayError("");

    try {
      // Step 1 — Create a Razorpay order on our server
      const orderRes = await fetch("/api/create-razorpay-order", { method: "POST" });
      if (!orderRes.ok) throw new Error("Could not create payment order. Please try again.");
      const { orderId, amount, currency } = await orderRes.json();

      // Step 2 — Load Razorpay checkout script dynamically (if not already loaded)
      await loadRazorpayScript();

      // Step 3 — Open Razorpay checkout popup
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount,          // in paise — passed from server so we never trust client
        currency,
        name: "SurpriseGift",
        description: "Balloon Surprise Package",
        order_id: orderId,
        theme: { color: "#87A878" },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
        handler: async (response) => {
          // Step 4 — Payment succeeded; call our finalize route
          onPaymentSuccess({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
        },
        modal: {
          ondismiss: () => {
            // User closed the Razorpay popup without paying
            setIsLoading(false);
          },
        },
        prefill: {
          // These can be pre-filled if you have the creator's email from Supabase session
          email: "",
          contact: "",
        },
      };

      // @ts-ignore — Razorpay is loaded via script tag, not typed
      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response: { error: { description: string } }) => {
        setPayError(response.error.description || "Payment failed. Please try again.");
        setIsLoading(false);
      });

      rzp.open();
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Something went wrong.");
      setIsLoading(false);
    }
  }

  return (
    <div className="finalize-overlay" onClick={isLoading ? undefined : onClose}>
      <div className="finalize-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="fm-header">
          <div className="fm-icon">🎁</div>
          <h2 className="fm-title">Finalize Your Surprise</h2>
          <p className="fm-subtitle">You're one step away from sending magic ✨</p>
        </div>

        {/* Price */}
        <div className="fm-price-block">
          <div className="fm-price-row">
            <span className="fm-price-label">Surprise Package</span>
            <div className="fm-price-values">
              <span className="fm-price-inr">₹149</span>
              <span className="fm-price-sep">·</span>
              <span className="fm-price-usd">$2.99</span>
            </div>
          </div>
          <div className="fm-price-features">
            <span className="fm-feature">✓ 15-day access link</span>
            <span className="fm-feature">✓ All balloon cards</span>
            <span className="fm-feature">✓ Personal final message</span>
          </div>
        </div>

        {/* Coupon */}
        <div className="fm-coupon-section">
          <p className="fm-coupon-label">Have a coupon code?</p>
          <div className="fm-coupon-row">
            <input
              type="text"
              className={`fm-coupon-input ${couponError ? "error" : ""} ${couponApplied ? "success" : ""}`}
              placeholder="Enter code…"
              value={coupon}
              onChange={(e) => {
                setCoupon(e.target.value.toUpperCase());
                setCouponError("");
              }}
              maxLength={20}
              disabled={isLoading}
            />
            <button className="fm-apply-btn" onClick={handleApplyCoupon} disabled={isLoading}>
              Apply
            </button>
          </div>
          {couponError && <p className="fm-coupon-msg fm-coupon-error">⚠ {couponError}</p>}
          {couponApplied && <p className="fm-coupon-msg fm-coupon-success">✓ Coupon applied!</p>}
        </div>

        {/* Payment error */}
        {payError && (
          <div className="fm-pay-error">
            ⚠ {payError}
          </div>
        )}

        <div className="fm-divider">
          <span /><span className="fm-divider-dot">✦</span><span />
        </div>

        {/* Actions */}
        <div className="fm-actions">
          <button
            className="fm-confirm-btn"
            onClick={handlePayNow}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="fm-spinner" />
                Opening Payment…
              </>
            ) : (
              <>
                <span className="fm-confirm-icon">✨</span>
                Yes, Finalize &amp; Pay
              </>
            )}
          </button>
          <button className="fm-cancel-btn" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
        </div>

        <p className="fm-trust">🔒 Powered by Razorpay · Secure payment · No hidden charges</p>

        {!isLoading && (
          <button className="fm-close-x" onClick={onClose} aria-label="Close modal">×</button>
        )}
      </div>

      <style jsx>{`
        .finalize-overlay {
          position: fixed; inset: 0; z-index: 500;
          background: rgba(10, 8, 6, 0.6); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 1.5rem; animation: fOverlayIn 0.25s ease both; cursor: pointer;
        }
        @keyframes fOverlayIn { from { opacity: 0; } to { opacity: 1; } }
        .finalize-modal {
          position: relative; cursor: default; width: 100%; max-width: 400px;
          background: #faf3e0; border-radius: 28px; padding: 2.25rem 2rem 2rem;
          box-shadow: 0 0 0 1.5px rgba(135,168,120,0.25), 0 24px 72px rgba(45,45,45,0.28), inset 0 1px 0 rgba(255,255,255,0.9);
          animation: fModalIn 0.4s cubic-bezier(0.22,1,0.36,1) both; overflow: hidden;
        }
        @keyframes fModalIn { from { opacity: 0; transform: scale(0.88) translateY(24px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .finalize-modal::before {
          content: ''; position: absolute; inset: 0; border-radius: 28px;
          background: radial-gradient(circle at 15% 10%, rgba(135,168,120,0.08) 0%, transparent 50%), radial-gradient(circle at 85% 88%, rgba(107,163,190,0.07) 0%, transparent 50%);
          pointer-events: none;
        }
        .fm-header { text-align: center; margin-bottom: 1.5rem; }
        .fm-icon { font-size: 2.8rem; margin-bottom: 0.6rem; display: block; animation: giftBounce 2s ease-in-out infinite; filter: drop-shadow(0 4px 8px rgba(135,168,120,0.3)); }
        @keyframes giftBounce { 0%, 100% { transform: rotate(-4deg) scale(1); } 50% { transform: rotate(4deg) scale(1.08); } }
        .fm-title { font-family: 'Georgia', serif; font-size: 1.45rem; font-weight: 700; color: #2D2D2D; margin: 0 0 0.3rem; }
        .fm-subtitle { font-family: 'Courier New', monospace; font-size: 0.72rem; color: #B8A9C9; letter-spacing: 0.06em; margin: 0; }
        .fm-price-block { background: rgba(255,255,255,0.7); border: 1.5px solid rgba(135,168,120,0.2); border-radius: 16px; padding: 1.1rem 1.25rem; margin-bottom: 1.25rem; }
        .fm-price-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
        .fm-price-label { font-family: 'Courier New', monospace; font-size: 0.8rem; font-weight: 600; color: #2D2D2D; letter-spacing: 0.04em; }
        .fm-price-values { display: flex; align-items: baseline; gap: 0.35rem; }
        .fm-price-inr { font-family: 'Georgia', serif; font-size: 1.6rem; font-weight: 700; color: #87A878; line-height: 1; }
        .fm-price-sep { color: #ccc; font-size: 0.8rem; }
        .fm-price-usd { font-family: 'Courier New', monospace; font-size: 0.85rem; color: #aaa; }
        .fm-price-features { display: flex; flex-direction: column; gap: 0.22rem; }
        .fm-feature { font-family: 'Courier New', monospace; font-size: 0.72rem; color: #6BA3BE; letter-spacing: 0.03em; }
        .fm-coupon-section { margin-bottom: 1rem; }
        .fm-coupon-label { font-family: 'Courier New', monospace; font-size: 0.72rem; color: #888; letter-spacing: 0.05em; margin: 0 0 0.5rem; }
        .fm-coupon-row { display: flex; gap: 0.5rem; }
        .fm-coupon-input {
          flex: 1; padding: 0.6rem 0.9rem; background: rgba(255,255,255,0.85);
          border: 1.5px solid rgba(135,168,120,0.25); border-radius: 10px;
          font-family: 'Courier New', monospace; font-size: 0.82rem; font-weight: 600;
          color: #2D2D2D; letter-spacing: 0.08em; outline: none; transition: border-color 0.15s, box-shadow 0.15s;
        }
        .fm-coupon-input::placeholder { color: #ccc; font-weight: 400; letter-spacing: 0; }
        .fm-coupon-input:focus { border-color: #87A878; box-shadow: 0 0 0 3px rgba(135,168,120,0.15); }
        .fm-coupon-input.error { border-color: #e57373; }
        .fm-coupon-input.success { border-color: #87A878; }
        .fm-coupon-input:disabled { opacity: 0.6; cursor: not-allowed; }
        .fm-apply-btn {
          padding: 0.6rem 1.1rem; background: linear-gradient(135deg, #87A878, #6BA3BE);
          color: white; border: none; border-radius: 10px;
          font-family: 'Courier New', monospace; font-size: 0.78rem; font-weight: 700;
          cursor: pointer; letter-spacing: 0.04em; white-space: nowrap;
          transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 3px 10px rgba(107,163,190,0.3);
        }
        .fm-apply-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 14px rgba(107,163,190,0.4); }
        .fm-apply-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .fm-coupon-msg { font-family: 'Courier New', monospace; font-size: 0.7rem; margin: 0.4rem 0 0; letter-spacing: 0.04em; }
        .fm-coupon-error   { color: #e57373; }
        .fm-coupon-success { color: #87A878; }
        /* Payment error */
        .fm-pay-error {
          background: rgba(229,115,115,0.1); border: 1px solid rgba(229,115,115,0.3);
          border-radius: 10px; padding: 0.65rem 0.9rem; margin-bottom: 1rem;
          font-family: 'Courier New', monospace; font-size: 0.72rem; color: #c62828; letter-spacing: 0.03em;
        }
        .fm-divider { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.25rem; }
        .fm-divider span:not(.fm-divider-dot) { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(135,168,120,0.25), transparent); }
        .fm-divider-dot { color: #B8A9C9; font-size: 0.55rem; }
        .fm-actions { display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 0.85rem; }
        .fm-confirm-btn {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.9rem 1.5rem;
          background: linear-gradient(135deg, #87A878 0%, #6BA3BE 100%);
          color: white; border: none; border-radius: 14px;
          font-family: 'Courier New', monospace; font-size: 0.9rem; font-weight: 700;
          letter-spacing: 0.04em; cursor: pointer;
          box-shadow: 0 6px 20px rgba(107,163,190,0.38), inset 0 1px 0 rgba(255,255,255,0.2);
          transition: transform 0.18s, box-shadow 0.18s;
          animation: confirmPulse 2.6s ease-in-out infinite;
        }
        .fm-confirm-btn:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 10px 28px rgba(107,163,190,0.48);
          animation: none;
        }
        .fm-confirm-btn:disabled { opacity: 0.8; cursor: not-allowed; animation: none; }
        @keyframes confirmPulse {
          0%, 100% { box-shadow: 0 6px 20px rgba(107,163,190,0.38), inset 0 1px 0 rgba(255,255,255,0.2); }
          50%       { box-shadow: 0 6px 28px rgba(135,168,120,0.5),  inset 0 1px 0 rgba(255,255,255,0.2); }
        }
        .fm-confirm-icon { font-size: 1.05rem; animation: sparkSpin 3s linear infinite; }
        @keyframes sparkSpin { 0% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(1.2); } 100% { transform: rotate(360deg) scale(1); } }
        /* Loading spinner inside button */
        .fm-spinner {
          width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.7s linear infinite; flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fm-cancel-btn {
          padding: 0.75rem; background: transparent;
          border: 1.5px solid rgba(45,45,45,0.15); border-radius: 14px;
          font-family: 'Courier New', monospace; font-size: 0.82rem; color: #888; cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s; letter-spacing: 0.04em;
        }
        .fm-cancel-btn:hover:not(:disabled) { background: rgba(0,0,0,0.05); color: #555; border-color: rgba(45,45,45,0.25); }
        .fm-cancel-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .fm-trust { font-family: 'Courier New', monospace; font-size: 0.65rem; text-align: center; color: #bbb; letter-spacing: 0.06em; margin: 0; }
        .fm-close-x {
          position: absolute; top: 14px; right: 14px; width: 30px; height: 30px;
          background: rgba(45,45,45,0.08); border: 1px solid rgba(45,45,45,0.12);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; color: #888; cursor: pointer;
          transition: background 0.15s, color 0.15s, transform 0.15s; line-height: 1;
        }
        .fm-close-x:hover { background: rgba(200,90,90,0.12); color: #c85a5a; transform: scale(1.1); }
        @media (max-width: 440px) {
          .finalize-modal { padding: 1.85rem 1.5rem 1.75rem; }
          .fm-title { font-size: 1.25rem; }
          .fm-price-inr { font-size: 1.4rem; }
        }
      `}</style>
    </div>
  );
}

// ─── Helper: load Razorpay script once ───────────────────────────────────────
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Already loaded
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });
}

// ─── Razorpay types (minimal) ─────────────────────────────────────────────────
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  theme: { color: string };
  method?: {
    upi?: boolean;
    card?: boolean;
    netbanking?: boolean;
    wallet?: boolean;
  };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal: { ondismiss: () => void };
  prefill?: { email?: string; contact?: string };
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Step4Preview({
  recipientName,
  occasion,
  balloons,
  finalMessage,
  onEditSurprise,
}: Step4Props) {
  const [screen, setScreen] = useState<PreviewScreen>("welcome");
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [isFinalizingPayment, setIsFinalizingPayment] = useState(false);
  const [finalizeError, setFinalizeError] = useState("");

  const allBalloonsPopped = screen === "final";

  // Called by FinalizeModal after Razorpay confirms payment on client
  async function handlePaymentSuccess(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    setShowFinalizeModal(false);
    setIsFinalizingPayment(true);
    setFinalizeError("");

    try {
      const res = await fetch("/api/finalize-surprise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paymentData,
          // Prompt 15 will add: recipientName, occasion, balloons, finalMessage
        }),
      });

      if (!res.ok) throw new Error("Finalize failed. Please contact support.");
      const data = await res.json();

      // Prompt 15 will redirect to: /dashboard/success?slug=data.slug
      // For now show a success alert
      alert(`🎉 Payment successful! Surprise ID: ${paymentData.razorpay_payment_id}\nSave logic comes in Prompt 15.`);
    } catch (err) {
      setFinalizeError(err instanceof Error ? err.message : "Something went wrong finalizing your surprise.");
    } finally {
      setIsFinalizingPayment(false);
    }
  }

  return (
    <div className="preview-root">
      <div className="preview-bg" />

      {/* ── Banner ── */}
      <div className="preview-banner">
        <span className="banner-text">👁 Preview Mode — this is how your recipient will see it</span>
        <div className="banner-actions">
          {allBalloonsPopped && (
            <button
              className="finalize-btn"
              onClick={() => setShowFinalizeModal(true)}
              disabled={isFinalizingPayment}
            >
              {isFinalizingPayment ? "Saving…" : "✨ Finalize"}
            </button>
          )}
          <button className="edit-btn" onClick={onEditSurprise}>✏️ Edit</button>
        </div>
      </div>

      {/* ── Screens ── */}
      {screen === "welcome" && (
        <WelcomeScreen
          recipientName={recipientName}
          occasion={occasion}
          onStart={() => setScreen("pop")}
        />
      )}

      {screen === "pop" && (
        <PopScreen
          balloons={balloons}
          onAllPopped={() => setScreen("final")}
        />
      )}

      {screen === "final" && (
        <FinalMessageScreen
          finalMessage={finalMessage}
          recipientName={recipientName}
          occasion={occasion}
          onFinalize={() => setShowFinalizeModal(true)}
        />
      )}

      {screen === "final" && (
        <div className="replay-bar">
          <button className="replay-link" onClick={() => setScreen("welcome")}>
            ↺ Replay Preview
          </button>
        </div>
      )}

      {/* Finalize error (shown if server call after payment fails) */}
      {finalizeError && (
        <div className="global-error">
          ⚠ {finalizeError}
          <button onClick={() => setFinalizeError("")}>✕</button>
        </div>
      )}

      {/* ── Finalize Modal (with Razorpay) ── */}
      {showFinalizeModal && (
        <FinalizeModal
          onClose={() => setShowFinalizeModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      <style jsx>{`
        .preview-root { min-height: 100vh; font-family: 'Georgia', 'Times New Roman', serif; position: relative; }
        .preview-bg { position: fixed; inset: 0; background: linear-gradient(135deg, #faf3e0 0%, #e8f4f0 50%, #e8eef6 100%); z-index: -1; }
        .preview-banner {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: linear-gradient(90deg, #fbbf24, #f59e0b); color: #1a1a1a;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.55rem 1.25rem;
          box-shadow: 0 2px 12px rgba(245,158,11,0.35); gap: 1rem;
        }
        .banner-text { font-size: 0.78rem; font-family: 'Courier New', monospace; font-weight: 600; letter-spacing: 0.02em; flex: 1; }
        .banner-actions { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
        .edit-btn {
          padding: 0.35rem 0.9rem; background: rgba(0,0,0,0.12); border: 1.5px solid rgba(0,0,0,0.18);
          border-radius: 8px; font-size: 0.75rem; font-family: 'Courier New', monospace; font-weight: 700;
          color: #1a1a1a; cursor: pointer; white-space: nowrap; transition: background 0.15s;
        }
        .edit-btn:hover { background: rgba(0,0,0,0.22); }
        .finalize-btn {
          padding: 0.38rem 1rem; background: #2D2D2D; border: none; border-radius: 8px;
          font-size: 0.78rem; font-family: 'Courier New', monospace; font-weight: 700;
          color: #fbbf24; cursor: pointer; white-space: nowrap; letter-spacing: 0.04em;
          transition: background 0.15s, transform 0.15s; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          animation: finalizePulse 2.2s ease-in-out infinite;
        }
        .finalize-btn:hover:not(:disabled) { background: #1a1a1a; transform: scale(1.04); animation: none; }
        .finalize-btn:disabled { opacity: 0.6; cursor: not-allowed; animation: none; }
        @keyframes finalizePulse {
          0%, 100% { box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
          50%       { box-shadow: 0 2px 16px rgba(245,158,11,0.5); }
        }
        .replay-bar { position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%); z-index: 10; }
        .replay-link {
          background: rgba(255,255,255,0.75); backdrop-filter: blur(10px);
          border: 1.5px solid rgba(135,168,120,0.25); border-radius: 50px;
          padding: 0.45rem 1.25rem; font-family: 'Courier New', monospace; font-size: 0.72rem;
          font-weight: 600; color: #87A878; cursor: pointer; letter-spacing: 0.04em;
          transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 3px 12px rgba(135,168,120,0.15);
        }
        .replay-link:hover { transform: translateY(-2px); box-shadow: 0 5px 18px rgba(135,168,120,0.25); }
        /* Global error toast */
        .global-error {
          position: fixed; bottom: 5rem; left: 50%; transform: translateX(-50%);
          z-index: 200; background: #fff; border: 1.5px solid #e57373; border-radius: 12px;
          padding: 0.75rem 1.25rem; font-family: 'Courier New', monospace; font-size: 0.78rem;
          color: #c62828; box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          display: flex; align-items: center; gap: 0.75rem; white-space: nowrap;
          animation: toastIn 0.3s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        .global-error button { background: none; border: none; cursor: pointer; color: #c62828; font-size: 0.9rem; padding: 0; line-height: 1; }
        @media (max-width: 520px) {
          .banner-text { font-size: 0.65rem; }
          .finalize-btn { font-size: 0.7rem; padding: 0.32rem 0.75rem; }
        }
      `}</style>
    </div>
  );
}