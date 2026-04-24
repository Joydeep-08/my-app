"use client";

import { useState, useCallback, useRef, useEffect } from "react";

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

// ─── Theme System (mirrored from recipient page) ──────────────────────────────
const THEMES: Record<string, {
  gradient: string;
  cardBg: string;
  accent: string;
  accentShine: string;
  accentString: string;
  text: string;
  subtext: string;
  border: string;
  confettiColors: string[];
  floatingEmojis: string[];
  balloonColors: { body: string; shine: string; string: string }[];
  label: string;
  tagline: string;
  starColors: string[];
}> = {
  Birthday: {
    gradient: "linear-gradient(135deg, #faf3e0 0%, #fde8c8 50%, #e8f0f8 100%)",
    cardBg: "rgba(255,245,230,0.92)",
    accent: "#F4A261",
    accentShine: "#f7bc8a",
    accentString: "#c07840",
    text: "#2D2D2D",
    subtext: "#7A4528",
    border: "rgba(244,162,97,0.3)",
    confettiColors: ["#F4A261", "#f7bc8a", "#E8704A", "#FFCE4A", "#FF7043"],
    floatingEmojis: ["🎈", "🎂", "🎉", "✨", "🎊", "🥳", "⭐"],
    balloonColors: [
      { body: "#F4A261", shine: "#f7bc8a", string: "#c07840" },
      { body: "#E8704A", shine: "#f0946e", string: "#b85030" },
      { body: "#FFCE4A", shine: "#ffe07a", string: "#c09a20" },
      { body: "#FF8C69", shine: "#ffaa8a", string: "#c06050" },
      { body: "#F4A261", shine: "#f7bc8a", string: "#c07840" },
      { body: "#E8704A", shine: "#f0946e", string: "#b85030" },
      { body: "#FFCE4A", shine: "#ffe07a", string: "#c09a20" },
      { body: "#FF8C69", shine: "#ffaa8a", string: "#c06050" },
      { body: "#F4A261", shine: "#f7bc8a", string: "#c07840" },
    ],
    label: "Birthday",
    tagline: "It's time to celebrate YOU! 🎂",
    starColors: ["#FFCE4A", "#F4A261", "#fff"],
  },
  Anniversary: {
    gradient: "linear-gradient(135deg, #faf3e0 0%, #f5e8dc 50%, #ede0f0 100%)",
    cardBg: "rgba(255,250,245,0.93)",
    accent: "#C9A0A0",
    accentShine: "#ddbfbf",
    accentString: "#a07878",
    text: "#3D2015",
    subtext: "#7A5040",
    border: "rgba(201,160,160,0.3)",
    confettiColors: ["#C9A0A0", "#E8D5C4", "#C4A882", "#D4B896", "#F2E6D9"],
    floatingEmojis: ["💍", "🌹", "✨", "🕯️", "💫", "🥂", "💝"],
    balloonColors: [
      { body: "#C9A0A0", shine: "#ddbfbf", string: "#a07878" },
      { body: "#E8D5C4", shine: "#f0e4d8", string: "#c0a898" },
      { body: "#C4A882", shine: "#d8c09e", string: "#a08060" },
      { body: "#D4A5A5", shine: "#e0bfbf", string: "#a07878" },
      { body: "#E6C9B8", shine: "#f0d8cc", string: "#c0a090" },
      { body: "#C9A0A0", shine: "#ddbfbf", string: "#a07878" },
      { body: "#E8D5C4", shine: "#f0e4d8", string: "#c0a898" },
      { body: "#C4A882", shine: "#d8c09e", string: "#a08060" },
      { body: "#D4A5A5", shine: "#e0bfbf", string: "#a07878" },
    ],
    label: "Anniversary",
    tagline: "Every moment with you is a treasure 💍",
    starColors: ["#E8D5C4", "#C4A882", "#fff8f0"],
  },
  Farewell: {
    gradient: "linear-gradient(135deg, #faf3e0 0%, #e8f4f0 50%, #e8eef6 100%)",
    cardBg: "rgba(245,248,242,0.93)",
    accent: "#6BA3BE",
    accentShine: "#8ec0d8",
    accentString: "#4a7a96",
    text: "#1E2D1E",
    subtext: "#3D5040",
    border: "rgba(107,163,190,0.3)",
    confettiColors: ["#87A878", "#6BA3BE", "#C4B896", "#A8C4A0", "#8FA8C4"],
    floatingEmojis: ["🌅", "✈️", "🌿", "⭐", "🌙", "🍃", "💫"],
    balloonColors: [
      { body: "#87A878", shine: "#a8c99a", string: "#5a7a52" },
      { body: "#6BA3BE", shine: "#8ec0d8", string: "#4a7a96" },
      { body: "#B8A9C9", shine: "#d0c4de", string: "#8a7aa0" },
      { body: "#C4B896", shine: "#d8ceb0", string: "#a09070" },
      { body: "#8FA8C4", shine: "#aac4d8", string: "#6a88a0" },
      { body: "#87A878", shine: "#a8c99a", string: "#5a7a52" },
      { body: "#6BA3BE", shine: "#8ec0d8", string: "#4a7a96" },
      { body: "#B8A9C9", shine: "#d0c4de", string: "#8a7aa0" },
      { body: "#C4B896", shine: "#d8ceb0", string: "#a09070" },
    ],
    label: "Farewell",
    tagline: "New adventures await you 🌅",
    starColors: ["#C4B896", "#87A878", "#e8f0e8"],
  },
  Wedding: {
    gradient: "linear-gradient(135deg, #faf3e0 0%, #f5f0e8 50%, #ede8f5 100%)",
    cardBg: "rgba(255,253,248,0.95)",
    accent: "#C8A878",
    accentShine: "#dcc89a",
    accentString: "#a08050",
    text: "#2A1E0A",
    subtext: "#6A4E28",
    border: "rgba(200,168,120,0.3)",
    confettiColors: ["#F5F0E8", "#EDD9B8", "#D4C4A0", "#FFFFFF", "#C8B896"],
    floatingEmojis: ["💒", "💐", "✨", "🌸", "💍", "🕊️", "⭐"],
    balloonColors: [
      { body: "#F5F0E8", shine: "#fff8f0", string: "#c8b896" },
      { body: "#EDD9B8", shine: "#f8eed0", string: "#c0a880" },
      { body: "#D4C4A0", shine: "#e8d8b8", string: "#a89870" },
      { body: "#F0E8D8", shine: "#fff4e8", string: "#c8b898" },
      { body: "#E8D8C0", shine: "#f8ecd8", string: "#c0a888" },
      { body: "#F5F0E8", shine: "#fff8f0", string: "#c8b896" },
      { body: "#EDD9B8", shine: "#f8eed0", string: "#c0a880" },
      { body: "#D4C4A0", shine: "#e8d8b8", string: "#a89870" },
      { body: "#F0E8D8", shine: "#fff4e8", string: "#c8b898" },
    ],
    label: "Wedding",
    tagline: "Two hearts, one beautiful story 💒",
    starColors: ["#EDD9B8", "#D4C4A0", "#fffdf5"],
  },
  "Valentine's Day": {
    gradient: "linear-gradient(135deg, #fdf0f0 0%, #fae0e0 50%, #f5e0f0 100%)",
    cardBg: "rgba(255,248,248,0.93)",
    accent: "#C85A5A",
    accentShine: "#e08080",
    accentString: "#a03838",
    text: "#2A0A0A",
    subtext: "#6A2828",
    border: "rgba(200,90,90,0.3)",
    confettiColors: ["#C85A5A", "#E8A0A0", "#F5D5C8", "#FF6B6B", "#FFB8B8"],
    floatingEmojis: ["❤️", "💕", "🌹", "💋", "✨", "💝", "🌸"],
    balloonColors: [
      { body: "#C85A5A", shine: "#e08080", string: "#a03838" },
      { body: "#E8A0A0", shine: "#f0bfbf", string: "#c07878" },
      { body: "#F5D5C8", shine: "#ffe8e0", string: "#d0a898" },
      { body: "#FF8080", shine: "#ffa0a0", string: "#cc5858" },
      { body: "#FFB8B8", shine: "#ffcece", string: "#d08888" },
      { body: "#C85A5A", shine: "#e08080", string: "#a03838" },
      { body: "#E8A0A0", shine: "#f0bfbf", string: "#c07878" },
      { body: "#F5D5C8", shine: "#ffe8e0", string: "#d0a898" },
      { body: "#FF8080", shine: "#ffa0a0", string: "#cc5858" },
    ],
    label: "Valentine's Day",
    tagline: "With all my love, for you 💕",
    starColors: ["#E8A0A0", "#F5D5C8", "#fff0f0"],
  },
  "Girlfriend's Day": {
  gradient: "linear-gradient(135deg, #fff0f5 0%, #fce4ec 40%, #f3e5f5 100%)",
  cardBg: "rgba(255,245,250,0.94)",
  accent: "#D4607A",
  accentShine: "#e88fa3",
  accentString: "#a83858",
  text: "#2A0A18",
  subtext: "#6A2840",
  border: "rgba(212,96,122,0.3)",
  confettiColors: ["#D4607A", "#E8A0B4", "#C9A0C8", "#F5C2D0", "#FF8FAB"],
  floatingEmojis: ["💕", "🌸", "💋", "🦋", "✨", "🌺", "💗"],
  balloonColors: [
    { body: "#D4607A", shine: "#e88fa3", string: "#a83858" },
    { body: "#E8A0B4", shine: "#f0bfcc", string: "#c07888" },
    { body: "#C9A0C8", shine: "#debede", string: "#a078a0" },
    { body: "#F5C2D0", shine: "#ffdae4", string: "#d090a0" },
    { body: "#FF8FAB", shine: "#ffadc4", string: "#cc6080" },
    { body: "#D4607A", shine: "#e88fa3", string: "#a83858" },
    { body: "#E8A0B4", shine: "#f0bfcc", string: "#c07888" },
    { body: "#C9A0C8", shine: "#debede", string: "#a078a0" },
    { body: "#F5C2D0", shine: "#ffdae4", string: "#d090a0" },
  ],
  label: "Girlfriend's Day",
  tagline: "Because every day with you is a love story 💕",
  starColors: ["#E8A0B4", "#C9A0C8", "#fff0f5"],
},
  "Women's Day": {
    gradient: "linear-gradient(135deg, #f5f0ff 0%, #ffe0f5 50%, #e8f5e8 100%)",
    cardBg: "rgba(250,245,255,0.93)",
    accent: "#9878A8",
    accentShine: "#b898c8",
    accentString: "#785888",
    text: "#1E0A2A",
    subtext: "#4A2862",
    border: "rgba(152,120,168,0.3)",
    confettiColors: ["#B8A0C8", "#D4A8C8", "#87A878", "#C8B8D8", "#A890C0"],
    floatingEmojis: ["🌸", "💜", "🌿", "✨", "🦋", "🌺", "⭐"],
    balloonColors: [
      { body: "#B8A0C8", shine: "#cebede", string: "#907898" },
      { body: "#D4A8C8", shine: "#e8c4e0", string: "#a87898" },
      { body: "#87A878", shine: "#a8c99a", string: "#5a7a52" },
      { body: "#C8A0B8", shine: "#debece", string: "#a07888" },
      { body: "#A890C0", shine: "#c0aad8", string: "#806890" },
      { body: "#B8A0C8", shine: "#cebede", string: "#907898" },
      { body: "#D4A8C8", shine: "#e8c4e0", string: "#a87898" },
      { body: "#87A878", shine: "#a8c99a", string: "#5a7a52" },
      { body: "#C8A0B8", shine: "#debece", string: "#a07888" },
    ],
    label: "Women's Day",
    tagline: "Celebrating the incredible you 🌸",
    starColors: ["#D4A8C8", "#B8A0C8", "#f5eeff"],
  },
  "Mother's Day": {
    gradient: "linear-gradient(135deg, #fff8f0 0%, #ffeee0 50%, #f0ffe8 100%)",
    cardBg: "rgba(255,252,248,0.94)",
    accent: "#D4826A",
    accentShine: "#e8a08a",
    accentString: "#a85848",
    text: "#2A150A",
    subtext: "#6A3828",
    border: "rgba(212,130,106,0.3)",
    confettiColors: ["#F5C8A8", "#F0E8D8", "#87A878", "#F5B896", "#D4A890"],
    floatingEmojis: ["🌸", "💐", "☕", "✨", "🌷", "💝", "🌿"],
    balloonColors: [
      { body: "#F5C8A8", shine: "#ffe0c0", string: "#c89870" },
      { body: "#D4A890", shine: "#e8c0a8", string: "#a87868" },
      { body: "#87A878", shine: "#a8c99a", string: "#5a7a52" },
      { body: "#F5B896", shine: "#ffceb0", string: "#c08868" },
      { body: "#E8C8B0", shine: "#f8dcc8", string: "#c09880" },
      { body: "#F5C8A8", shine: "#ffe0c0", string: "#c89870" },
      { body: "#D4A890", shine: "#e8c0a8", string: "#a87868" },
      { body: "#87A878", shine: "#a8c99a", string: "#5a7a52" },
      { body: "#F5B896", shine: "#ffceb0", string: "#c08868" },
    ],
    label: "Mother's Day",
    tagline: "For the woman who means everything 🌷",
    starColors: ["#F5C8A8", "#F0E8D8", "#fff8f0"],
  },
  "Father's Day": {
    gradient: "linear-gradient(135deg, #f5f0e0 0%, #e8e0c8 50%, #e0ece0 100%)",
    cardBg: "rgba(248,245,235,0.93)",
    accent: "#8A6840",
    accentShine: "#a88458",
    accentString: "#604820",
    text: "#1A1408",
    subtext: "#4A3820",
    border: "rgba(138,104,64,0.3)",
    confettiColors: ["#6B7840", "#C4A060", "#8A6840", "#A89060", "#D4B870"],
    floatingEmojis: ["🏆", "⭐", "🌲", "💪", "🍂", "🎖️", "✨"],
    balloonColors: [
      { body: "#6B7840", shine: "#8a9860", string: "#485828" },
      { body: "#C4A060", shine: "#d8bc80", string: "#987840" },
      { body: "#8A6840", shine: "#a88458", string: "#604820" },
      { body: "#A89060", shine: "#c0aa78", string: "#806840" },
      { body: "#5A7030", shine: "#789050", string: "#384818" },
      { body: "#6B7840", shine: "#8a9860", string: "#485828" },
      { body: "#C4A060", shine: "#d8bc80", string: "#987840" },
      { body: "#8A6840", shine: "#a88458", string: "#604820" },
      { body: "#A89060", shine: "#c0aa78", string: "#806840" },
    ],
    label: "Father's Day",
    tagline: "To the strongest person I know 🏆",
    starColors: ["#C4A060", "#8A6840", "#f5f0e0"],
  },
  "Friendship Day": {
    gradient: "linear-gradient(135deg, #fffde0 0%, #fff0c8 50%, #e8f5e0 100%)",
    cardBg: "rgba(255,252,235,0.93)",
    accent: "#E8902A",
    accentShine: "#f0a848",
    accentString: "#b86810",
    text: "#1E1408",
    subtext: "#5A3A10",
    border: "rgba(232,144,42,0.3)",
    confettiColors: ["#F5C842", "#F4A234", "#87A878", "#F9D854", "#FFB347"],
    floatingEmojis: ["🌻", "🎒", "🌈", "✨", "🎵", "🤝", "⭐"],
    balloonColors: [
      { body: "#F5C842", shine: "#ffe060", string: "#c09818" },
      { body: "#F4A234", shine: "#f8bc58", string: "#c07810" },
      { body: "#87A878", shine: "#a8c99a", string: "#5a7a52" },
      { body: "#F9D854", shine: "#ffe870", string: "#c8a828" },
      { body: "#FFB347", shine: "#ffc868", string: "#cc8018" },
      { body: "#F5C842", shine: "#ffe060", string: "#c09818" },
      { body: "#F4A234", shine: "#f8bc58", string: "#c07810" },
      { body: "#87A878", shine: "#a8c99a", string: "#5a7a52" },
      { body: "#F9D854", shine: "#ffe870", string: "#c8a828" },
    ],
    label: "Friendship Day",
    tagline: "Here's to the best humans I know 🌻",
    starColors: ["#F5C842", "#F4A234", "#fffae0"],
  },
  Other: {
    gradient: "linear-gradient(135deg, #faf3e0 0%, #e8f4f0 50%, #e8eef6 100%)",
    cardBg: "rgba(255,255,255,0.88)",
    accent: "#6BA3BE",
    accentShine: "#8ec0d8",
    accentString: "#4a7a96",
    text: "#2D2D2D",
    subtext: "#3A5060",
    border: "rgba(107,163,190,0.3)",
    confettiColors: ["#87A878", "#6BA3BE", "#B8A9C9", "#FAF3E0", "#9BC4D8"],
    floatingEmojis: ["✨", "🎈", "💫", "⭐", "🌟", "🎊", "🎉"],
    balloonColors: [
      { body: "#87A878", shine: "#a8c99a", string: "#5a7a52" },
      { body: "#6BA3BE", shine: "#8ec0d8", string: "#4a7a96" },
      { body: "#B8A9C9", shine: "#d0c4de", string: "#8a7aa0" },
      { body: "#F4A261", shine: "#f7bc8a", string: "#c07840" },
      { body: "#E8A0BF", shine: "#f0bdd4", string: "#b87898" },
      { body: "#87A878", shine: "#a8c99a", string: "#5a7a52" },
      { body: "#6BA3BE", shine: "#8ec0d8", string: "#4a7a96" },
      { body: "#B8A9C9", shine: "#d0c4de", string: "#8a7aa0" },
      { body: "#F4A261", shine: "#f7bc8a", string: "#c07840" },
    ],
    label: "Special Occasion",
    tagline: "Something magical, just for you ✨",
    starColors: ["#B8A9C9", "#6BA3BE", "#f0f5ff"],
  },
};
const OCCASION_MUSIC: Record<string, string> = {
  "Birthday": "AYZlME0mQB8",           // Birthday – Katy Perry
  "Anniversary": "2takcmxWiqU",         // Perfect – Ed Sheeran
  "Wedding": "oyDGsTCmtIs",             // Kabira instrumental
  "Mother's Day": "3HFBFrQJBKs",        // Maa – Taare Zameen Par
  "Father's Day": "gzAIGissHDs",        // Papa Kehte Hain
  "Friendship Day": "2P7fcKBRa_I",      // Tera Yaar Hoon Main
  "Women's Day": "VF-r7WG_Qzg",        // Run the World – Beyoncé
  "Girlfriend's Day": "nfWlot6h_JM", // Lover – Taylor Swift
  "Farewell": "RgKAFK5djSk",            // See You Again – Wiz Khalifa
  "Valentine's Day": "XclDkLEkCd8",     // Wanna Be Yours – Arctic Monkeys
};

function getTheme(occasion: string) {
  return THEMES[occasion] ?? THEMES["Other"];
}

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
  imageBase64: string | null;
  balloonIndex?: number;
}

// ─── Welcome Screen ───────────────────────────────────────────────────────────
function WelcomeScreen({
  recipientName,
  occasion,
  onStart,
  theme,
}: {
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
        <h1 className="welcome-name">
          Hey <span className="name-highlight">{recipientName}</span>!
        </h1>
        <p className="welcome-teaser">
          {theme.tagline}
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
          background: ${theme.cardBg};
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1.5px solid rgba(255,255,255,0.9);
          border-radius: 28px;
          box-shadow: 0 12px 48px ${theme.accent}33, 0 2px 8px rgba(0,0,0,0.06);
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
          color: ${theme.accent};
          margin: 0 0 0.75rem;
          opacity: 0.85;
        }
        .welcome-name {
          font-size: 2.6rem;
          font-weight: 700;
          color: ${theme.text};
          margin: 0 0 1rem;
          line-height: 1.1;
          font-family: 'Georgia', serif;
        }
        .name-highlight {
          background: linear-gradient(135deg, ${theme.accent}, ${theme.accentShine});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .welcome-teaser {
          font-size: 0.95rem;
          color: ${theme.subtext};
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
          background: linear-gradient(135deg, ${theme.accent}, ${theme.accentShine});
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 1.05rem;
          font-weight: 700;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.04em;
          cursor: pointer;
          box-shadow: 0 6px 24px ${theme.accent}55;
          transition: transform 0.2s, box-shadow 0.2s;
          animation: pulse 2.5s ease-in-out infinite;
        }
        .magic-btn:hover {
          transform: translateY(-3px) scale(1.04);
          box-shadow: 0 10px 32px ${theme.accent}70;
          animation: none;
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 6px 24px ${theme.accent}55; }
          50%       { box-shadow: 0 6px 32px ${theme.accentShine}70; }
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
  theme,
}: {
  balloons: Balloon[];
  onAllPopped: () => void;
  theme: ReturnType<typeof getTheme>;
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
      colors: theme.confettiColors,
      ticks: 210, gravity: 0.88, scalar: 1.1,
    });
    setTimeout(() => confetti({
      particleCount: 35, spread: 40,
      origin: { x: x / window.innerWidth, y: y / window.innerHeight },
      colors: ["#ffffff", "#fef3c7"],
      ticks: 140, gravity: 1.1, scalar: 0.72, shapes: ["circle"],
    }), 200);
  }, [theme]);

  function playPopSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    // ── Low thud (body of the explosion) ──────────────────────────────────
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

    // ── Noise burst (the "crack") ──────────────────────────────────────────
    const bufferSize = ctx.sampleRate * 0.18;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Band-pass to give it a punchy "pop" character
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

    // ── Sub-bass click for impact ──────────────────────────────────────────
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = "sine";
    clickOsc.frequency.setValueAtTime(60, ctx.currentTime);
    clickGain.gain.setValueAtTime(4.0, ctx.currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start();
    clickOsc.stop(ctx.currentTime + 0.06);

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

    const newPopped = new Set(Array.from(popped).concat(id));
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
          const color = theme.balloonColors[i % theme.balloonColors.length];
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
                  style={{ boxShadow: `0 3px 12px rgba(0,0,0,0.13), 0 0 0 3px ${theme.accent}25` }}
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
          font-weight: 600; color: ${theme.text}; letter-spacing: 0.03em;
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
          transition: transform 0.15s, box-shadow 0.15s;
          animation: peekIn 0.3s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes peekIn {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
        .popped-peek:hover { transform: scale(1.22); }
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
          to   { opacity: 1; transform: scale(1) translateY(0); }
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
  theme,
  onFinalize,
}: {
  finalMessage: string;
  recipientName: string;
  occasion: string;
  theme: ReturnType<typeof getTheme>;
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
              color: theme.starColors[i % theme.starColors.length],
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
          {theme.balloonColors.slice(0, 5).map((color, i) => (
            <div key={i} className="fs-balloon" style={{ animationDuration: `${2.8 + i * 0.4}s`, animationDelay: `${-(i * 0.6)}s` }}>
              <BalloonSVG color={color} size={42} />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .final-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 5rem 1.25rem 3rem; position: relative; overflow: hidden; }
        .stars-container { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .falling-star { position: absolute; top: -2rem; animation: starFall linear infinite; text-shadow: 0 0 6px currentColor; }
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
        .fs-occasion-tag { font-family: 'Courier New', monospace; font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: ${theme.accent}; margin: 0 0 0.5rem; opacity: 0.85; }
        .fs-headline { font-family: 'Georgia', serif; font-size: 2rem; font-weight: 700; color: ${theme.text}; margin: 0; line-height: 1.2; }
        .fs-name { background: linear-gradient(135deg, ${theme.accent}, ${theme.accentShine}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .fs-message-card {
          width: 100%; background: ${theme.cardBg}; backdrop-filter: blur(24px);
          border: 1.5px solid rgba(255,255,255,0.95); border-radius: 28px;
          padding: 2.5rem 2.25rem 2.25rem; text-align: center; position: relative;
          box-shadow: 0 16px 48px ${theme.accent}28, 0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9);
          animation: cardReveal 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s both; overflow: hidden;
        }
        @keyframes cardReveal { from { opacity: 0; transform: translateY(32px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .fs-message-card::before {
          content: ''; position: absolute; inset: 0; border-radius: 28px;
          background: radial-gradient(ellipse at 15% 15%, ${theme.accent}12 0%, transparent 55%), radial-gradient(ellipse at 85% 80%, ${theme.accentShine}12 0%, transparent 55%);
          pointer-events: none;
        }
        .corner-ornament { position: absolute; font-size: 0.7rem; color: ${theme.accent}55; line-height: 1; }
        .tl { top: 14px; left: 16px; } .tr { top: 14px; right: 16px; } .bl { bottom: 14px; left: 16px; } .br { bottom: 14px; right: 16px; }
        .fs-quote-icon { font-size: 2.6rem; margin-bottom: 1rem; animation: iconFloat 2.4s ease-in-out infinite; filter: drop-shadow(0 4px 10px ${theme.accent}40); }
        @keyframes iconFloat { 0%, 100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-6px) rotate(3deg); } }
        .fs-divider { display: flex; align-items: center; gap: 0.6rem; margin: 0 auto 1.35rem; max-width: 180px; }
        .fs-divider span:not(.fs-divider-star) { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, ${theme.accent}50, transparent); }
        .fs-divider-star { color: ${theme.accent}; font-size: 0.6rem; }
        .fs-divider-bottom { margin-top: 1.35rem; margin-bottom: 1rem; }
        .fs-message-text { font-family: 'Georgia', serif; font-size: 1.08rem; line-height: 1.85; color: ${theme.text}; font-style: italic; margin: 0; position: relative; padding: 0 0.5rem; }
        .fs-sign-off { font-family: 'Courier New', monospace; font-size: 0.72rem; letter-spacing: 0.1em; color: ${theme.accent}; margin: 0; text-transform: uppercase; opacity: 0.75; }
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

// ─── Finalize Modal — WITH RAZORPAY (unchanged) ───────────────────────────────
function FinalizeModal({
  onClose,
  onPaymentSuccess,
  theme,
}: {
  onClose: () => void;
  onPaymentSuccess: (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  theme: ReturnType<typeof getTheme>;
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
      const orderRes = await fetch("/api/create-razorpay-order", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    coupon, // from your state
  }),
});
      if (!orderRes.ok) throw new Error("Could not create payment order. Please try again.");
      const { orderId, amount, currency } = await orderRes.json();

      await loadRazorpayScript();

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount,
        currency,
        name: "SurpriseGift",
        description: "Balloon Surprise Package",
        order_id: orderId,
        theme: { color: theme.accent },
        method: { upi: true, card: true, netbanking: true, wallet: true },
        handler: async (response) => {
          onPaymentSuccess({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
        },
        modal: {
          ondismiss: () => { setIsLoading(false); },
        },
        prefill: { email: "", contact: "" },
      };

      // @ts-ignore
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
        <div className="fm-header">
          <div className="fm-icon">🎁</div>
          <h2 className="fm-title">Finalize Your Surprise</h2>
          <p className="fm-subtitle">You're one step away from sending magic ✨</p>
        </div>

        <div className="fm-price-block">
          <div className="fm-price-row">
            <span className="fm-price-label">Surprise Package</span>
            <div className="fm-price-values">
              <span className="fm-price-inr">₹79</span>
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

        {payError && (
          <div className="fm-pay-error">⚠ {payError}</div>
        )}

        <div className="fm-divider">
          <span /><span className="fm-divider-dot">✦</span><span />
        </div>

        <div className="fm-actions">
          <button className="fm-confirm-btn" onClick={handlePayNow} disabled={isLoading}>
            {isLoading ? (
              <><span className="fm-spinner" />Opening Payment…</>
            ) : (
              <><span className="fm-confirm-icon">✨</span>Yes, Finalize &amp; Pay</>
            )}
          </button>
          <button className="fm-cancel-btn" onClick={onClose} disabled={isLoading}>Cancel</button>
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
          background: ${theme.cardBg}; border-radius: 28px; padding: 2.25rem 2rem 2rem;
          box-shadow: 0 0 0 1.5px ${theme.accent}40, 0 24px 72px rgba(45,45,45,0.28), inset 0 1px 0 rgba(255,255,255,0.9);
          animation: fModalIn 0.4s cubic-bezier(0.22,1,0.36,1) both; overflow: hidden;
        }
        @keyframes fModalIn { from { opacity: 0; transform: scale(0.88) translateY(24px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .finalize-modal::before {
          content: ''; position: absolute; inset: 0; border-radius: 28px;
          background: radial-gradient(circle at 15% 10%, ${theme.accent}14 0%, transparent 50%), radial-gradient(circle at 85% 88%, ${theme.accentShine}12 0%, transparent 50%);
          pointer-events: none;
        }
        .fm-header { text-align: center; margin-bottom: 1.5rem; }
        .fm-icon { font-size: 2.8rem; margin-bottom: 0.6rem; display: block; animation: giftBounce 2s ease-in-out infinite; filter: drop-shadow(0 4px 8px ${theme.accent}50); }
        @keyframes giftBounce { 0%, 100% { transform: rotate(-4deg) scale(1); } 50% { transform: rotate(4deg) scale(1.08); } }
        .fm-title { font-family: 'Georgia', serif; font-size: 1.45rem; font-weight: 700; color: ${theme.text}; margin: 0 0 0.3rem; }
        .fm-subtitle { font-family: 'Courier New', monospace; font-size: 0.72rem; color: ${theme.accent}; letter-spacing: 0.06em; margin: 0; opacity: 0.8; }
        .fm-price-block { background: rgba(255,255,255,0.7); border: 1.5px solid ${theme.accent}30; border-radius: 16px; padding: 1.1rem 1.25rem; margin-bottom: 1.25rem; }
        .fm-price-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
        .fm-price-label { font-family: 'Courier New', monospace; font-size: 0.8rem; font-weight: 600; color: ${theme.text}; letter-spacing: 0.04em; }
        .fm-price-values { display: flex; align-items: baseline; gap: 0.35rem; }
        .fm-price-inr { font-family: 'Georgia', serif; font-size: 1.6rem; font-weight: 700; color: ${theme.accent}; line-height: 1; }
        .fm-price-sep { color: #ccc; font-size: 0.8rem; }
        .fm-price-usd { font-family: 'Courier New', monospace; font-size: 0.85rem; color: #aaa; }
        .fm-price-features { display: flex; flex-direction: column; gap: 0.22rem; }
        .fm-feature { font-family: 'Courier New', monospace; font-size: 0.72rem; color: ${theme.accent}; letter-spacing: 0.03em; opacity: 0.85; }
        .fm-coupon-section { margin-bottom: 1rem; }
        .fm-coupon-label { font-family: 'Courier New', monospace; font-size: 0.72rem; color: #888; letter-spacing: 0.05em; margin: 0 0 0.5rem; }
        .fm-coupon-row { display: flex; gap: 0.5rem; }
        .fm-coupon-input {
          flex: 1; padding: 0.6rem 0.9rem; background: rgba(255,255,255,0.85);
          border: 1.5px solid ${theme.accent}35; border-radius: 10px;
          font-family: 'Courier New', monospace; font-size: 0.82rem; font-weight: 600;
          color: ${theme.text}; letter-spacing: 0.08em; outline: none; transition: border-color 0.15s, box-shadow 0.15s;
        }
        .fm-coupon-input::placeholder { color: #ccc; font-weight: 400; letter-spacing: 0; }
        .fm-coupon-input:focus { border-color: ${theme.accent}; box-shadow: 0 0 0 3px ${theme.accent}20; }
        .fm-coupon-input.error { border-color: #e57373; }
        .fm-coupon-input.success { border-color: ${theme.accent}; }
        .fm-coupon-input:disabled { opacity: 0.6; cursor: not-allowed; }
        .fm-apply-btn {
          padding: 0.6rem 1.1rem; background: linear-gradient(135deg, ${theme.accent}, ${theme.accentShine});
          color: white; border: none; border-radius: 10px;
          font-family: 'Courier New', monospace; font-size: 0.78rem; font-weight: 700;
          cursor: pointer; letter-spacing: 0.04em; white-space: nowrap;
          transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 3px 10px ${theme.accent}40;
        }
        .fm-apply-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 14px ${theme.accent}55; }
        .fm-apply-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .fm-coupon-msg { font-family: 'Courier New', monospace; font-size: 0.7rem; margin: 0.4rem 0 0; letter-spacing: 0.04em; }
        .fm-coupon-error   { color: #e57373; }
        .fm-coupon-success { color: ${theme.accent}; }
        .fm-pay-error {
          background: rgba(229,115,115,0.1); border: 1px solid rgba(229,115,115,0.3);
          border-radius: 10px; padding: 0.65rem 0.9rem; margin-bottom: 1rem;
          font-family: 'Courier New', monospace; font-size: 0.72rem; color: #c62828; letter-spacing: 0.03em;
        }
        .fm-divider { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.25rem; }
        .fm-divider span:not(.fm-divider-dot) { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, ${theme.accent}35, transparent); }
        .fm-divider-dot { color: ${theme.accent}; font-size: 0.55rem; opacity: 0.7; }
        .fm-actions { display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 0.85rem; }
        .fm-confirm-btn {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.9rem 1.5rem;
          background: linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentShine} 100%);
          color: white; border: none; border-radius: 14px;
          font-family: 'Courier New', monospace; font-size: 0.9rem; font-weight: 700;
          letter-spacing: 0.04em; cursor: pointer;
          box-shadow: 0 6px 20px ${theme.accent}55, inset 0 1px 0 rgba(255,255,255,0.2);
          transition: transform 0.18s, box-shadow 0.18s;
          animation: confirmPulse 2.6s ease-in-out infinite;
        }
        .fm-confirm-btn:hover:not(:disabled) { transform: translateY(-2px) scale(1.02); box-shadow: 0 10px 28px ${theme.accent}70; animation: none; }
        .fm-confirm-btn:disabled { opacity: 0.8; cursor: not-allowed; animation: none; }
        @keyframes confirmPulse {
          0%, 100% { box-shadow: 0 6px 20px ${theme.accent}55, inset 0 1px 0 rgba(255,255,255,0.2); }
          50%       { box-shadow: 0 6px 28px ${theme.accentShine}70, inset 0 1px 0 rgba(255,255,255,0.2); }
        }
        .fm-confirm-icon { font-size: 1.05rem; animation: sparkSpin 3s linear infinite; }
        @keyframes sparkSpin { 0% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(1.2); } 100% { transform: rotate(360deg) scale(1); } }
        .fm-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
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
  method?: { upi?: boolean; card?: boolean; netbanking?: boolean; wallet?: boolean; };
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string; }) => void;
  modal: { ondismiss: () => void };
  prefill?: { email?: string; contact?: string };
}
function BgMusic({ occasion }: { occasion: string }) {
  const videoId = OCCASION_MUSIC[occasion];
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);
  const playerRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
  if (!videoId) return;

  if (!(window as any).YT) {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }

  const initPlayer = () => {
    if (!(window as any).YT?.Player) return;
    playerRef.current = new (window as any).YT.Player(
      `yt-bg-player-${occasion.replace(/\s/g, "")}`,
      {
        videoId,
        playerVars: {
          autoplay: 0, // 👈 don't autoplay, we trigger manually
          loop: 1,
          playlist: videoId,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (e: any) => {
            e.target.setVolume(60);
            setReady(true);
            // Play on first user interaction
            const startMusic = () => {
              e.target.playVideo();
              window.removeEventListener("click", startMusic);
              window.removeEventListener("touchstart", startMusic);
            };
            window.addEventListener("click", startMusic);
            window.addEventListener("touchstart", startMusic);
          },
        },
      }
    );
  };

  if ((window as any).YT?.Player) {
    initPlayer();
  } else {
    (window as any).onYouTubeIframeAPIReady = initPlayer;
  }

  return () => {
    playerRef.current?.destroy?.();
  };
}, [videoId]);

  function toggleMute() {
    if (!playerRef.current) return;
    if (muted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(60);
    } else {
      playerRef.current.mute();
    }
    setMuted(!muted);
  }

  if (!videoId) return null;

  return (
    <>
      <div
        id={`yt-bg-player-${occasion.replace(/\s/g, "")}`}
        style={{
          position: "fixed", bottom: -9999, left: -9999,
          width: 1, height: 1, opacity: 0, pointerEvents: "none",
          zIndex: -1,
        }}
      />
      {ready && (
        <button
          onClick={toggleMute}
          title={muted ? "Unmute music" : "Mute music"}
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.25rem",
            zIndex: 200,
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(12px)",
            border: "1.5px solid rgba(255,255,255,0.95)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            fontSize: "1.2rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.12)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          {muted ? "🔇" : "🎵"}
        </button>
      )}
    </>
  );
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

  const theme = getTheme(occasion);
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
          recipientName,
          occasion,
          finalMessage,
          balloons,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Finalize failed. Please contact support.");
      }

      const data = await res.json();
      window.location.href = `/dashboard/success?slug=${data.slug}`;
    } catch (err) {
      setFinalizeError(
        err instanceof Error ? err.message : "Something went wrong finalizing your surprise."
      );
      setIsFinalizingPayment(false);
    }
  }

  return (
    <div className="preview-root">
      <div className="preview-bg" />
      <BgMusic occasion={occasion} />

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
          theme={theme}
        />
      )}

      {screen === "pop" && (
        <PopScreen
          balloons={balloons}
          onAllPopped={() => setScreen("final")}
          theme={theme}
        />
      )}

      {screen === "final" && (
        <FinalMessageScreen
          finalMessage={finalMessage}
          recipientName={recipientName}
          occasion={occasion}
          theme={theme}
          onFinalize={() => setShowFinalizeModal(true)}
        />
      )}

      {screen === "final" && (
        <div className="replay-bar">
          <button className="replay-link" style={{ color: theme.accent, borderColor: theme.border }} onClick={() => setScreen("welcome")}>
            ↺ Replay Preview
          </button>
        </div>
      )}

      {/* Finalize error */}
      {finalizeError && (
        <div className="global-error">
          ⚠ {finalizeError}
          <button onClick={() => setFinalizeError("")}>✕</button>
        </div>
      )}

      {/* ── Finalize Modal ── */}
      {showFinalizeModal && (
        <FinalizeModal
          onClose={() => setShowFinalizeModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
          theme={theme}
        />
      )}

      <style jsx>{`
        .preview-root { min-height: 100vh; font-family: 'Georgia', 'Times New Roman', serif; position: relative; }
        .preview-bg { position: fixed; inset: 0; background: ${theme.gradient}; z-index: -1; }
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
          border: 1.5px solid; border-radius: 50px;
          padding: 0.45rem 1.25rem; font-family: 'Courier New', monospace; font-size: 0.72rem;
          font-weight: 600; cursor: pointer; letter-spacing: 0.04em;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .replay-link:hover { transform: translateY(-2px); }
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