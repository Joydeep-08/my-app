"use client";

import { forwardRef, useImperativeHandle, useRef, useState, useCallback, useEffect } from "react";
import { OCCASION_MUSIC, getTheme } from "@/lib/themes";

// ─── Types ────────────────────────────────────────────────────────────────────

type Balloon = {
  id: string;
  message: string;
  image_url: string | null;
  order_index: number;
};

type Surprise = {
  id: string;
  recipient_name: string;
  occasion: string;
  final_message: string;
  status: string;
  expires_at: string;
};

type Props = {
  surprise: Surprise | null;
  balloons: Balloon[];
  errorType: "not_found" | "expired" | null;
};

// ─── Balloon SVG ──────────────────────────────────────────────────────────────
function BalloonSVG({ color, size = 90 }: { color: { body: string; shine: string; string: string }; size?: number }) {
  const gid = `bg-${color.body.replace("#", "")}-${size}`;
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
      <path d="M40 4 C20 4, 6 18, 6 36 C6 56, 18 72, 40 78 C62 72, 74 56, 74 36 C74 18, 60 4, 40 4 Z" fill={`url(#${gid})`} filter="url(#bshadow)" />
      <ellipse cx="28" cy="24" rx="10" ry="14" fill="white" opacity="0.28" transform="rotate(-20 28 24)" />
      <ellipse cx="24" cy="18" rx="4" ry="5.5" fill="white" opacity="0.45" transform="rotate(-20 24 18)" />
      <path d="M37 78 Q40 84 43 78" stroke={color.body} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="40" cy="82" r="2.5" fill={color.string} opacity="0.7" />
      <path d="M40 85 C34 95, 46 105, 40 125" stroke={color.string} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.75" />
    </svg>
  );
}

// ─── Cluster positions ────────────────────────────────────────────────────────
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
  imageUrl: string | null;
  balloonIndex?: number;
}

// ─── Welcome Screen ───────────────────────────────────────────────────────────
function WelcomeScreen({ recipientName, occasion, onStart, theme }: {
  recipientName: string;
  occasion: string;
  onStart: () => void;
  theme: ReturnType<typeof getTheme>;
}) {
  return (
    <div className="preview-body">
      <div className="welcome-balloons" aria-hidden="true">
        {theme.balloonColors.slice(0, 7).map((color, i) => (
          <div key={i} className={`float-balloon fb-${i}`}>
            <BalloonSVG color={color} size={55 + (i % 3) * 12} />
          </div>
        ))}
      </div>
      <div className="welcome-card">
        <p className="welcome-occasion">{occasion} 🎉</p>
        <h1 className="welcome-name">Hey <span className="name-highlight">{recipientName}</span>!</h1>
        <p className="welcome-teaser">{theme.tagline}<br />Click below to start the magic ✨</p>
        <button className="magic-btn" onClick={onStart}>Start the Magic ✨</button>
      </div>
      <style jsx>{`
        .preview-body { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        .welcome-balloons { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .float-balloon { position: absolute; animation: balloonFloat linear infinite; opacity: 0.82; }
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
        .welcome-card { background: ${theme.cardBg}; backdrop-filter: blur(20px); border: 1.5px solid rgba(255,255,255,0.9); border-radius: 28px; box-shadow: 0 12px 48px rgba(107,163,190,0.2), 0 2px 8px rgba(0,0,0,0.06); padding: 3rem 2.5rem 2.75rem; width: 100%; max-width: 480px; text-align: center; position: relative; z-index: 1; animation: cardIn 0.7s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes cardIn { from { opacity: 0; transform: translateY(32px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .welcome-occasion { font-size: 0.8rem; font-family: 'Courier New', monospace; letter-spacing: 0.1em; text-transform: uppercase; color: ${theme.accent}; margin: 0 0 0.75rem; }
        .welcome-name { font-size: 2.6rem; font-weight: 700; color: ${theme.text}; margin: 0 0 1rem; line-height: 1.1; font-family: 'Georgia', serif; }
        .name-highlight { background: linear-gradient(135deg, ${theme.accent}, ${theme.accentShine}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .welcome-teaser { font-size: 0.95rem; color: ${theme.subtext}; line-height: 1.65; font-family: 'Georgia', serif; font-style: italic; margin: 0 0 2rem; }
        .magic-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 1rem 2.25rem; background: linear-gradient(135deg, ${theme.accent}, ${theme.accentShine}); color: white; border: none; border-radius: 50px; font-size: 1.05rem; font-weight: 700; font-family: 'Courier New', monospace; letter-spacing: 0.04em; cursor: pointer; box-shadow: 0 6px 24px ${theme.accent}55; transition: transform 0.2s, box-shadow 0.2s; animation: pulse 2.5s ease-in-out infinite; }
        .magic-btn:hover { transform: translateY(-3px) scale(1.04); box-shadow: 0 10px 32px ${theme.accent}70; animation: none; }
        @keyframes pulse { 0%, 100% { box-shadow: 0 6px 24px ${theme.accent}55; } 50% { box-shadow: 0 6px 32px ${theme.accentShine}70; } }
        @media (max-width: 520px) { .welcome-card { padding: 2.25rem 1.5rem 2rem; } .welcome-name { font-size: 2rem; } }
      `}</style>
    </div>
  );
}

// ─── Pop Screen ───────────────────────────────────────────────────────────────
function PopScreen({ balloons, onAllPopped, theme }: {
  balloons: Balloon[];
  onAllPopped: () => void;
  theme: ReturnType<typeof getTheme>;
}) {
  const [popped, setPopped] = useState<Set<string>>(new Set());
  const [activePolaroid, setActivePolaroid] = useState<ModalContent | null>(null);
  const poppedContentRef = useRef<Map<string, ModalContent>>(new Map());
  const allPoppedTriggeredRef = useRef(false);
  const positions = getClusterPositions(balloons.length);

  const triggerConfetti = useCallback(async (x: number, y: number) => {
    const confetti = (await import("canvas-confetti")).default;
    confetti({ particleCount: 80, spread: 75, origin: { x: x / window.innerWidth, y: y / window.innerHeight }, colors: theme.confettiColors, ticks: 210, gravity: 0.88, scalar: 1.1 });
    setTimeout(() => confetti({ particleCount: 35, spread: 40, origin: { x: x / window.innerWidth, y: y / window.innerHeight }, colors: ["#ffffff", "#fef3c7"], ticks: 140, gravity: 1.1, scalar: 0.72, shapes: ["circle"] }), 200);
  }, [theme]);

  function playPopSound() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const thudOsc = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thudOsc.type = "sine";
      thudOsc.frequency.setValueAtTime(120, ctx.currentTime);
      thudOsc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.18);
      thudGain.gain.setValueAtTime(2.8, ctx.currentTime);
      thudGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      thudOsc.connect(thudGain);
      thudGain.connect(ctx.destination);
      thudOsc.start();
      thudOsc.stop(ctx.currentTime + 0.22);
      const bufferSize = ctx.sampleRate * 0.18;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.value = 800;
      bandpass.Q.value = 0.7;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(3.5, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      noise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start();
    } catch (e) {}
  }

  async function handlePop(id: string, e: React.MouseEvent) {
    if (popped.has(id)) return;
    playPopSound();
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    el.classList.add("popping");
    await triggerConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
    const balloonIndex = balloons.findIndex((b) => b.id === id);
    const balloon = balloons[balloonIndex];
    const content: ModalContent = { message: balloon.message, imageUrl: balloon.image_url, balloonIndex };
    const newPopped = new Set(Array.from(popped).concat(id));
    poppedContentRef.current.set(id, content);
    setPopped(newPopped);
    setActivePolaroid(content);
    if (newPopped.size === balloons.length && !allPoppedTriggeredRef.current) {
      allPoppedTriggeredRef.current = true;
    }
  }

  function handleClose() {
    setActivePolaroid(null);
    if (allPoppedTriggeredRef.current) setTimeout(() => onAllPopped(), 400);
  }

  const remaining = balloons.length - popped.size;

  return (
    <div className="pop-screen">
      <div className="pop-counter">
        {remaining > 0 ? `🎈 ${remaining} surprise${remaining !== 1 ? "s" : ""} left — tap to pop!` : "🎊 All popped! Opening final message…"}
      </div>
      <div className="pop-arena">
        {balloons.map((balloon, i) => {
          const isPopped = popped.has(balloon.id);
          const color = theme.balloonColors[i % theme.balloonColors.length];
          const base = positions[i] ?? { left: 50, top: 50, scale: 1 };
          const jitterX = ((i * 7 + 3) % 13) - 6;
          const jitterY = ((i * 11 + 5) % 13) - 6;
          const pos = { left: base.left + jitterX, top: base.top + jitterY, scale: base.scale };
          const rotate = ((i * 13 + 7) % 25) - 12;
          const floatDur = 3.2 + (i % 6) * 0.55;
          const floatDelay = -(i * 0.7);
          return (
            <div key={balloon.id} className="balloon-slot" style={{ left: `${pos.left}%`, top: `${pos.top}%`, zIndex: 2 + i }}>
              {!isPopped ? (
                <button className="balloon-btn" style={{ ["--float-dur" as string]: `${floatDur}s`, ["--float-delay" as string]: `${floatDelay}s`, ["--bscale" as string]: pos.scale, ["--rotate" as string]: `${rotate}deg` }} onClick={(e) => handlePop(balloon.id, e)} aria-label={`Pop balloon ${i + 1}`}>
                  <BalloonSVG color={color} size={88} />
                </button>
              ) : (
                <button className="popped-peek" onClick={() => { const stored = poppedContentRef.current.get(balloon.id); if (stored) setActivePolaroid(stored); }} title="View card">💌</button>
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
            <div className="polaroid-card" style={{ transform: `rotate(${rot}deg)` }} onClick={(e) => e.stopPropagation()}>
              <div className="polaroid-photo">
                {activePolaroid.imageUrl ? (
                  <img src={activePolaroid.imageUrl} alt="Surprise" className="polaroid-img" />
                ) : (
                  <div className="polaroid-placeholder" style={{ background: ["linear-gradient(135deg,#fde68a,#fca5a5)", "linear-gradient(135deg,#a7f3d0,#6EE7B7)", "linear-gradient(135deg,#c4b5fd,#93c5fd)", "linear-gradient(135deg,#fda4af,#fb923c)", "linear-gradient(135deg,#86efac,#fde68a)"][origIdx % 5] }}>
                    <span className="placeholder-balloon">🎈</span>
                  </div>
                )}
              </div>
              <div className="polaroid-caption">
                {activePolaroid.message ? <p className="polaroid-msg">{activePolaroid.message}</p> : <p className="polaroid-msg polaroid-msg-empty">✨ a little surprise for you</p>}
              </div>
              <button className="modal-close" onClick={handleClose} aria-label="Close">×</button>
            </div>
          </div>
        );
      })()}
      <p className="pop-hint">Tap each balloon to pop it! 🎉</p>
      <style jsx>{`
        .pop-screen { min-height: 100vh; padding-top: 54px; position: relative; overflow: hidden; }
        .pop-counter { position: fixed; top: 0; left: 50%; transform: translateX(-50%); z-index: 50; background: rgba(255,255,255,0.92); backdrop-filter: blur(12px); border: 1.5px solid rgba(255,255,255,0.95); border-radius: 50px; padding: 0.42rem 1.3rem; font-size: 0.8rem; font-family: 'Courier New', monospace; font-weight: 600; color: #2D2D2D; letter-spacing: 0.03em; box-shadow: 0 4px 16px rgba(0,0,0,0.09); white-space: nowrap; margin-top: 0.75rem; }
        .pop-arena { position: relative; width: 100%; height: calc(100vh - 54px); }
        .balloon-slot { position: absolute; transform: translate(-50%, -50%); }
        .balloon-btn { background: none; border: none; padding: 0; cursor: pointer; display: block; transform: scale(var(--bscale, 1)) rotate(var(--rotate, 0deg)); transform-origin: 50% 100%; animation: balloonBob var(--float-dur, 3.5s) ease-in-out var(--float-delay, 0s) infinite; filter: drop-shadow(0 6px 14px rgba(0,0,0,0.14)); transition: filter 0.15s; }
        .balloon-btn:hover { filter: drop-shadow(0 10px 24px rgba(0,0,0,0.22)) brightness(1.07); animation-play-state: paused; }
        .balloon-btn.popping { animation: popBurst 0.28s ease-out forwards !important; transform-origin: center center; }
        @keyframes popBurst { 0% { transform: scale(var(--bscale, 1)); opacity: 1; filter: brightness(2.5); } 55% { transform: scale(calc(var(--bscale, 1) * 1.5)); opacity: 0.5; } 100% { transform: scale(0.02); opacity: 0; } }
        @keyframes balloonBob { 0% { margin-top: 0px; } 28% { margin-top: -18px; } 58% { margin-top: -12px; } 100% { margin-top: 0px; } }
        .popped-peek { background: rgba(255,255,255,0.92); backdrop-filter: blur(8px); border: 1.5px solid rgba(255,255,255,0.95); border-radius: 50%; width: 46px; height: 46px; font-size: 1.35rem; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 12px rgba(0,0,0,0.13); transition: transform 0.15s; animation: peekIn 0.3s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes peekIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
        .popped-peek:hover { transform: scale(1.22); }
        .polaroid-overlay { position: fixed; inset: 0; z-index: 300; background: rgba(15,12,8,0.55); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 1.5rem; animation: overlayIn 0.22s ease both; cursor: pointer; }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        .polaroid-card { background: #fffef9; border-radius: 3px; padding: 0.9rem 0.9rem 1.4rem; width: 100%; max-width: 290px; box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.12); position: relative; cursor: default; animation: polaroidPop 0.42s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes polaroidPop { from { opacity: 0; transform: scale(0.6) translateY(40px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .polaroid-photo { width: 100%; aspect-ratio: 1/1; border-radius: 2px; overflow: hidden; background: #f0ece4; }
        .polaroid-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .polaroid-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .placeholder-balloon { font-size: 3.5rem; }
        .polaroid-caption { padding: 0.85rem 0.25rem 0; min-height: 3.5rem; display: flex; align-items: flex-start; justify-content: center; }
        .polaroid-msg { font-family: 'Georgia', serif; font-size: 0.88rem; line-height: 1.6; color: #3a3630; text-align: center; margin: 0; }
        .polaroid-msg-empty { font-style: italic; color: #b0a898; }
        .modal-close { position: absolute; top: -12px; right: -12px; width: 28px; height: 28px; border-radius: 50%; background: #2D2D2D; color: #fff; border: 2px solid #fffef9; font-size: 1.05rem; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.25); transition: background 0.15s; }
        .modal-close:hover { background: #c85a5a; }
        .pop-hint { position: fixed; bottom: 1.25rem; left: 50%; transform: translateX(-50%); font-size: 0.75rem; font-family: 'Courier New', monospace; color: rgba(45,45,45,0.45); letter-spacing: 0.05em; white-space: nowrap; z-index: 5; animation: hintPulse 2.8s ease-in-out infinite; pointer-events: none; }
        @keyframes hintPulse { 0%, 100% { opacity: 0.38; } 50% { opacity: 0.85; } }
      `}</style>
    </div>
  );
}

// ─── Final Message Screen ─────────────────────────────────────────────────────
function FinalMessageScreen({ finalMessage, recipientName, occasion, theme, onReplay }: {
  finalMessage: string;
  recipientName: string;
  occasion: string;
  theme: ReturnType<typeof getTheme>;
  onReplay: () => void;
}) {
  return (
    <div className="final-screen">
      <div className="stars-container" aria-hidden="true">
        {Array.from({ length: 28 }, (_, i) => (
          <span key={i} className="falling-star" style={{ left: `${(i * 37 + 7) % 100}%`, animationDuration: `${2.5 + (i % 7) * 0.45}s`, animationDelay: `${-(i * 0.38)}s`, fontSize: `${0.6 + (i % 4) * 0.22}rem`, opacity: 0.6 + (i % 3) * 0.15, color: theme.starColors[i % theme.starColors.length] }}>
            {["✦", "✧", "⭐", "✨", "★"][i % 5]}
          </span>
        ))}
      </div>
      <div className="fs-content">
        <div className="fs-header">
          <div className="fs-emoji-row">
            <span className="bounce-emoji" style={{ animationDelay: "0s" }}>🎊</span>
            <span className="bounce-emoji" style={{ animationDelay: "0.15s" }}>🎉</span>
            <span className="bounce-emoji" style={{ animationDelay: "0.3s" }}>🎊</span>
          </div>
          <p className="fs-occasion-tag">{occasion}</p>
          <h2 className="fs-headline">For you, <span className="fs-name">{recipientName}</span></h2>
        </div>
        <div className="fs-message-card">
          <span className="corner-ornament tl">✦</span>
          <span className="corner-ornament tr">✦</span>
          <span className="corner-ornament bl">✦</span>
          <span className="corner-ornament br">✦</span>
          <div className="fs-quote-icon">💌</div>
          <div className="fs-divider"><span /><span className="fs-divider-star">✦</span><span /></div>
          <p className="fs-message-text">{finalMessage || "✨ Wishing you all the happiness and joy in the world. You deserve every bit of it!"}</p>
          <div className="fs-divider fs-divider-bottom"><span /><span className="fs-divider-star">✧</span><span /></div>
          <p className="fs-sign-off">With love &amp; celebration ✨</p>
        </div>
        <div className="fs-balloon-row">
          {theme.balloonColors.slice(0, 5).map((color, i) => (
            <div key={i} className="fs-balloon" style={{ animationDuration: `${2.8 + i * 0.4}s`, animationDelay: `${-(i * 0.6)}s` }}>
              <BalloonSVG color={color} size={42} />
            </div>
          ))}
        </div>
        <button className="replay-link" onClick={onReplay}>↺ Experience Again</button>
      </div>
      <style jsx>{`
        .final-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 5rem 1.25rem 3rem; position: relative; overflow: hidden; }
        .stars-container { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .falling-star { position: absolute; top: -2rem; animation: starFall linear infinite; }
        @keyframes starFall { 0% { transform: translateY(-40px) rotate(0deg); opacity: 0; } 8% { opacity: 1; } 85% { opacity: 0.7; } 100% { transform: translateY(105vh) rotate(360deg); opacity: 0; } }
        .fs-content { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 1.75rem; width: 100%; max-width: 520px; }
        .fs-header { text-align: center; }
        .fs-emoji-row { display: flex; justify-content: center; gap: 0.35rem; margin-bottom: 0.65rem; }
        .bounce-emoji { display: inline-block; font-size: 2rem; animation: emojiBounce 1.6s ease-in-out infinite; }
        @keyframes emojiBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .fs-occasion-tag { font-family: 'Courier New', monospace; font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: ${theme.accent}; margin: 0 0 0.5rem; }
        .fs-headline { font-family: 'Georgia', serif; font-size: 2rem; font-weight: 700; color: ${theme.text}; margin: 0; line-height: 1.2; }
        .fs-name { background: linear-gradient(135deg, ${theme.accent}, ${theme.accentShine}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .fs-message-card { width: 100%; background: ${theme.cardBg}; backdrop-filter: blur(24px); border: 1.5px solid rgba(255,255,255,0.95); border-radius: 28px; padding: 2.5rem 2.25rem 2.25rem; text-align: center; position: relative; box-shadow: 0 16px 48px rgba(107,163,190,0.18), 0 4px 12px rgba(0,0,0,0.06); animation: cardReveal 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s both; overflow: hidden; }
        @keyframes cardReveal { from { opacity: 0; transform: translateY(32px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .corner-ornament { position: absolute; font-size: 0.7rem; color: ${theme.accent}55; line-height: 1; }
        .tl { top: 14px; left: 16px; } .tr { top: 14px; right: 16px; } .bl { bottom: 14px; left: 16px; } .br { bottom: 14px; right: 16px; }
        .fs-quote-icon { font-size: 2.6rem; margin-bottom: 1rem; animation: iconFloat 2.4s ease-in-out infinite; }
        @keyframes iconFloat { 0%, 100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-6px) rotate(3deg); } }
        .fs-divider { display: flex; align-items: center; gap: 0.6rem; margin: 0 auto 1.35rem; max-width: 180px; }
        .fs-divider span:not(.fs-divider-star) { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, ${theme.accent}50, transparent); }
        .fs-divider-star { color: ${theme.accent}; font-size: 0.6rem; }
        .fs-divider-bottom { margin-top: 1.35rem; margin-bottom: 1rem; }
        .fs-message-text { font-family: 'Georgia', serif; font-size: 1.08rem; line-height: 1.85; color: ${theme.text}; font-style: italic; margin: 0; padding: 0 0.5rem; }
        .fs-sign-off { font-family: 'Courier New', monospace; font-size: 0.72rem; letter-spacing: 0.1em; color: ${theme.accent}; margin: 0; text-transform: uppercase; }
        .fs-balloon-row { display: flex; justify-content: center; gap: 0.5rem; }
        .fs-balloon { animation: miniBob ease-in-out infinite; }
        @keyframes miniBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .replay-link { background: rgba(255,255,255,0.75); backdrop-filter: blur(10px); border: 1.5px solid ${theme.border}; border-radius: 50px; padding: 0.45rem 1.25rem; font-family: 'Courier New', monospace; font-size: 0.72rem; font-weight: 600; color: ${theme.accent}; cursor: pointer; letter-spacing: 0.04em; transition: transform 0.15s; }
        .replay-link:hover { transform: translateY(-2px); }
        @media (max-width: 520px) { .final-screen { padding: 4.5rem 1rem 2rem; } .fs-message-card { padding: 2rem 1.5rem 1.75rem; } .fs-headline { font-size: 1.65rem; } .fs-message-text { font-size: 0.95rem; } }
      `}</style>
    </div>
  );
}

// ─── Background Music ─────────────────────────────────────────────────────────
const BgMusic = forwardRef(function BgMusic({ occasion }: { occasion: string }, ref: React.Ref<{ play: () => void }>) {
  const videoId = OCCASION_MUSIC[occasion];
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);
  const playerRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({ play() { playerRef.current?.playVideo?.(); } }));

  useEffect(() => {
    if (!videoId) return;
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
    const initPlayer = () => {
      if (!(window as any).YT?.Player) return;
      playerRef.current = new (window as any).YT.Player(`yt-bg-player-${occasion.replace(/\s/g, "")}`, {
        videoId,
        playerVars: { autoplay: 0, loop: 1, playlist: videoId, controls: 0, disablekb: 1, fs: 0, modestbranding: 1, playsinline: 1 },
        events: { onReady: (e: any) => { e.target.setVolume(60); setReady(true); } },
      });
    };
    if ((window as any).YT?.Player) initPlayer();
    else (window as any).onYouTubeIframeAPIReady = initPlayer;
    return () => { playerRef.current?.destroy?.(); };
  }, [videoId]);

  function toggleMute() {
    if (!playerRef.current) return;
    if (muted) { playerRef.current.unMute(); playerRef.current.setVolume(60); }
    else { playerRef.current.mute(); }
    setMuted(!muted);
  }

  if (!videoId) return null;

  return (
    <>
      <div id={`yt-bg-player-${occasion.replace(/\s/g, "")}`} style={{ position: "fixed", bottom: -9999, left: -9999, width: 1, height: 1, opacity: 0, pointerEvents: "none", zIndex: -1 }} />
      {ready && (
        <button onClick={toggleMute} title={muted ? "Unmute music" : "Mute music"} style={{ position: "fixed", bottom: "1.5rem", right: "1.25rem", zIndex: 200, width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.88)", backdropFilter: "blur(12px)", border: "1.5px solid rgba(255,255,255,0.95)", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {muted ? "🔇" : "🎵"}
        </button>
      )}
    </>
  );
});

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function RecipientClient({ surprise, balloons, errorType }: Props) {
  const [screen, setScreen] = useState<"welcome" | "pop" | "final">("welcome");
  const bgMusicRef = useRef<{ play: () => void } | null>(null);
  const theme = surprise ? getTheme(surprise.occasion) : getTheme("Other");

  if (errorType) {
    const isExpired = errorType === "expired";
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #2D2D2D, #4A4A5A)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 24, padding: "48px 40px", maxWidth: 420, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>{isExpired ? "⏳" : "🔍"}</div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 26, color: "#fff", margin: "0 0 12px" }}>
            {isExpired ? "This surprise has expired" : "Surprise not found"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            {isExpired ? "Surprises are available for 15 days. This one has already been unwrapped and put to rest." : "We couldn't find a surprise at this link. Double-check the URL and try again."}
          </p>
        </div>
      </div>
    );
  }

  if (!surprise) return null;

  return (
    <div className="recipient-root">
      <div className="recipient-bg" />
      <BgMusic occasion={surprise.occasion} ref={bgMusicRef} />
      {screen === "welcome" && (
        <WelcomeScreen recipientName={surprise.recipient_name} occasion={surprise.occasion} onStart={() => { bgMusicRef.current?.play(); setScreen("pop"); }} theme={theme} />
      )}
      {screen === "pop" && (
        <PopScreen balloons={balloons} onAllPopped={() => setScreen("final")} theme={theme} />
      )}
      {screen === "final" && (
        <FinalMessageScreen finalMessage={surprise.final_message} recipientName={surprise.recipient_name} occasion={surprise.occasion} theme={theme} onReplay={() => setScreen("welcome")} />
      )}
      <style jsx>{`
        .recipient-root { min-height: 100vh; font-family: 'Georgia', 'Times New Roman', serif; position: relative; }
        .recipient-bg { position: fixed; inset: 0; background: ${theme.gradient}; z-index: -1; }
      `}</style>
    </div>
  );
}