"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";

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

// ─── Theme System ─────────────────────────────────────────────────────────────

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
    accentString: "#604820" ,
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
  "Girlfriend's Day": "QJO3ROT-A4E", // you're beautiful
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

// ─── Circular cluster positions ───────────────────────────────────────────────
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
  const allPoppedTriggeredRef = useRef(false);

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
      imageUrl: balloon.image_url,
      balloonIndex,
    };

    const newPopped = new Set(Array.from(popped).concat(id));
    poppedContentRef.current.set(id, content);
    setPopOrder((prev) => [...prev, id]);
    setPopped(newPopped);
    setActivePolaroid(content);

    if (newPopped.size === balloons.length && !allPoppedTriggeredRef.current) {
      allPoppedTriggeredRef.current = true;
    }
  }

  function handleClose() {
    setActivePolaroid(null);
    if (allPoppedTriggeredRef.current) {
      setTimeout(() => onAllPopped(), 400);
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
          const jitterX = ((i * 7 + 3) % 13) - 6;
          const jitterY = ((i * 11 + 5) % 13) - 6;
          const pos = { left: base.left + jitterX, top: base.top + jitterY, scale: base.scale };
          const rotate = ((i * 13 + 7) % 25) - 12;
          const floatDur = 3.2 + (i % 6) * 0.55;
          const floatDelay = -(i * 0.7);

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
                {activePolaroid.imageUrl ? (
                  <img src={activePolaroid.imageUrl} alt="Surprise" className="polaroid-img" />
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
          position: fixed; top: 0; left: 50%; transform: translateX(-50%);
          z-index: 50; background: rgba(255,255,255,0.92); backdrop-filter: blur(12px);
          border: 1.5px solid rgba(255,255,255,0.95); border-radius: 50px;
          padding: 0.42rem 1.3rem; font-size: 0.8rem; font-family: 'Courier New', monospace;
          font-weight: 600; color: #2D2D2D; letter-spacing: 0.03em;
          box-shadow: 0 4px 16px rgba(0,0,0,0.09); white-space: nowrap;
          margin-top: 0.75rem;
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
        }
        .balloon-btn:active {
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
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .polaroid-photo { width: 100%; aspect-ratio: 1/1; border-radius: 2px; overflow: hidden; position: relative; background: #f0ece4; }
        .polaroid-img { width: 100%; height: 100%; object-fit: cover; display: block; }
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

// ─── Final Message Screen ─────────────────────────────────────────────────────
function FinalMessageScreen({
  finalMessage,
  recipientName,
  occasion,
  theme,
  onReplay,
}: {
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

        <button className="replay-link" onClick={onReplay}>
          ↺ Experience Again
        </button>
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
        .fs-occasion-tag { font-family: 'Courier New', monospace; font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: #B8A9C9; margin: 0 0 0.5rem; }
        .fs-headline { font-family: 'Georgia', serif; font-size: 2rem; font-weight: 700; color: ${theme.text}; margin: 0; line-height: 1.2; }
        .fs-name { background: linear-gradient(135deg, ${theme.accent}, ${theme.accentShine}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .fs-message-card {
          width: 100%; background: ${theme.cardBg}; backdrop-filter: blur(24px);
          border: 1.5px solid rgba(255,255,255,0.95); border-radius: 28px;
          padding: 2.5rem 2.25rem 2.25rem; text-align: center; position: relative;
          box-shadow: 0 16px 48px rgba(107,163,190,0.18), 0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9);
          animation: cardReveal 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s both; overflow: hidden;
        }
        @keyframes cardReveal { from { opacity: 0; transform: translateY(32px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .corner-ornament { position: absolute; font-size: 0.7rem; color: rgba(107,163,190,0.35); line-height: 1; }
        .tl { top: 14px; left: 16px; } .tr { top: 14px; right: 16px; } .bl { bottom: 14px; left: 16px; } .br { bottom: 14px; right: 16px; }
        .fs-quote-icon { font-size: 2.6rem; margin-bottom: 1rem; animation: iconFloat 2.4s ease-in-out infinite; filter: drop-shadow(0 4px 10px rgba(107,163,190,0.25)); }
        @keyframes iconFloat { 0%, 100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-6px) rotate(3deg); } }
        .fs-divider { display: flex; align-items: center; gap: 0.6rem; margin: 0 auto 1.35rem; max-width: 180px; }
        .fs-divider span:not(.fs-divider-star) { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(107,163,190,0.3), transparent); }
        .fs-divider-star { color: ${theme.accent}; font-size: 0.6rem; }
        .fs-divider-bottom { margin-top: 1.35rem; margin-bottom: 1rem; }
        .fs-message-text { font-family: 'Georgia', serif; font-size: 1.08rem; line-height: 1.85; color: ${theme.text}; font-style: italic; margin: 0; position: relative; padding: 0 0.5rem; }
        .fs-sign-off { font-family: 'Courier New', monospace; font-size: 0.72rem; letter-spacing: 0.1em; color: #B8A9C9; margin: 0; text-transform: uppercase; }
        .fs-balloon-row { display: flex; justify-content: center; gap: 0.5rem; animation: balloonRowIn 0.9s cubic-bezier(0.22,1,0.36,1) 0.35s both; }
        @keyframes balloonRowIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fs-balloon { animation: miniBob ease-in-out infinite; }
        @keyframes miniBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .replay-link {
          background: rgba(255,255,255,0.75); backdrop-filter: blur(10px);
          border: 1.5px solid ${theme.border}; border-radius: 50px;
          padding: 0.45rem 1.25rem; font-family: 'Courier New', monospace; font-size: 0.72rem;
          font-weight: 600; color: ${theme.accent}; cursor: pointer; letter-spacing: 0.04em;
          transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 3px 12px ${theme.accent}25;
        }
        .replay-link:hover { transform: translateY(-2px); box-shadow: 0 5px 18px ${theme.accent}35; }
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

// ─── Main Page ────────────────────────────────────────────────────────────────
const BgMusic = forwardRef(function BgMusic(
  { occasion }: { occasion: string },
  ref: React.Ref<{ play: () => void }>
) {
  const videoId = OCCASION_MUSIC[occasion];
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);
  const playerRef = useRef<any>(null);
  useImperativeHandle(ref, () => ({
  play() {
    playerRef.current?.playVideo?.();
  }
}));
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
});

export default function RecipientPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [surprise, setSurprise] = useState<Surprise | null>(null);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [screen, setScreen] = useState<"welcome" | "pop" | "final">("welcome");
  const bgMusicRef = useRef<{ play: () => void } | null>(null);

  useEffect(() => {
  if (!slug) return;
  const supabase = createClient();
  (async () => {
    const { data: surpriseData, error: sErr } = await supabase
      .from("surprises")
      .select("*")
      .eq("unique_slug", slug)
      .single();

    if (sErr || !surpriseData) {
      setError("not_found");
      setLoading(false);
      return;
    }

    if (surpriseData.status !== "active") {
      setError("expired");
      setLoading(false);
      return;
    }

    if (surpriseData.expires_at && new Date(surpriseData.expires_at) < new Date()) {
      setError("expired");
      setLoading(false);
      return;
    }

    const { data: balloonData } = await supabase
      .from("balloons")
      .select("*")
      .eq("surprise_id", surpriseData.id)
      .order("order_index");

    setSurprise(surpriseData);
    setBalloons(balloonData ?? []);
    setLoading(false);
  })();
}, [slug]);

  const theme = surprise ? getTheme(surprise.occasion) : getTheme("Other");

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #faf3e0, #e8f4f0)",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, animation: "balloonBobLoad 2s ease-in-out infinite" }}>🎈</div>
          <p style={{ marginTop: 16, fontFamily: "Georgia, serif", color: "#2D2D2D", fontSize: 16, opacity: 0.7 }}>
            Unwrapping your surprise…
          </p>
        </div>
        <style>{`
          @keyframes balloonBobLoad {
            0%, 100% { transform: translateY(0) rotate(-4deg); }
            50% { transform: translateY(-18px) rotate(4deg); }
          }
        `}</style>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    const isExpired = error === "expired";
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #2D2D2D, #4A4A5A)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}>
        <div style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 24,
          padding: "48px 40px",
          maxWidth: 420,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>{isExpired ? "⏳" : "🔍"}</div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 26, color: "#fff", margin: "0 0 12px" }}>
            {isExpired ? "This surprise has expired" : "Surprise not found"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            {isExpired
              ? "Surprises are available for 15 days. This one has already been unwrapped and put to rest."
              : "We couldn't find a surprise at this link. Double-check the URL and try again."}
          </p>
        </div>
      </div>
    );
  }

  if (!surprise) return null;

  return (
    <div className="recipient-root">
      <div className="recipient-bg" />
      {surprise && <BgMusic occasion={surprise.occasion} ref={bgMusicRef} />}

      {screen === "welcome" && (
        <WelcomeScreen
          recipientName={surprise.recipient_name}
          occasion={surprise.occasion}
          onStart={() => {
  bgMusicRef.current?.play();
  setScreen("pop");
}}
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
          finalMessage={surprise.final_message}
          recipientName={surprise.recipient_name}
          occasion={surprise.occasion}
          theme={theme}
          onReplay={() => setScreen("welcome")}
        />
      )}

      <style jsx>{`
        .recipient-root {
          min-height: 100vh;
          font-family: 'Georgia', 'Times New Roman', serif;
          position: relative;
        }
        .recipient-bg {
          position: fixed;
          inset: 0;
          background: ${theme.gradient};
          z-index: -1;
        }
      `}</style>
    </div>
  );
}