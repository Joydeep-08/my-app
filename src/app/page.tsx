'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const features = [
  {
    icon: '💌',
    label: 'Personal Messages',
    title: 'Words that land differently',
    description:
      'Craft heartfelt notes with animated reveals, custom typography, and layouts that feel made — not generated.',
    gradient: 'from-[#eef3eb] to-[#f7f9f5]',
    accent: '#9CAF88',
    tag: 'Writing',
  },
  {
    icon: '🎮',
    label: 'Interactive Elements',
    title: 'Surprises inside surprises',
    description:
      'Confetti bursts, countdown timers, photo carousels, embedded playlists — moments your recipient will replay.',
    gradient: 'from-[#fdf0eb] to-[#fdf7f5]',
    accent: '#D4956A',
    tag: 'Delight',
  },
  {
    icon: '🔗',
    label: 'Shareable Links',
    title: 'One tap. Full magic.',
    description:
      'A beautiful link opens your surprise on any device, instantly — no app, no account, no friction.',
    gradient: 'from-[#fdf8e8] to-[#fdfaf2]',
    accent: '#C4A84A',
    tag: 'Delivery',
  },
]

export default function Home() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="min-h-screen font-sans antialiased overflow-x-hidden"
      style={{
        backgroundColor: '#FDFAF5',
        color: '#2E2A26',
        fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
        backgroundImage:
          'radial-gradient(ellipse at 15% 20%, rgba(156,175,136,0.18) 0%, transparent 55%), radial-gradient(ellipse at 85% 10%, rgba(248,210,195,0.22) 0%, transparent 50%), radial-gradient(ellipse at 60% 85%, rgba(240,200,96,0.1) 0%, transparent 45%)',
      }}
    >
      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

        .font-display { font-family: 'Playfair Display', Georgia, serif; }

        @keyframes floatA {
          0%,100% { transform: translateY(0px) rotate(-2deg); }
          50%      { transform: translateY(-18px) rotate(2deg); }
        }
        @keyframes floatB {
          0%,100% { transform: translateY(0px) rotate(1deg); }
          50%      { transform: translateY(-14px) rotate(-2deg); }
        }
        @keyframes floatC {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-22px) rotate(3deg); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%,100% { opacity:.55; }
          50%      { opacity:1; }
        }
        @keyframes spin20 {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .float-a { animation: floatA 6s ease-in-out infinite; }
        .float-b { animation: floatB 8s ease-in-out infinite; }
        .float-c { animation: floatC 5s ease-in-out infinite; }
        .fade-up-1 { animation: fadeUp .75s ease-out .15s both; }
        .fade-up-2 { animation: fadeUp .75s ease-out .3s  both; }
        .fade-up-3 { animation: fadeUp .75s ease-out .45s both; }
        .fade-up-4 { animation: fadeUp .75s ease-out .6s  both; }
        .shimmer   { animation: shimmer 2.8s ease-in-out infinite; }
        .spin20    { animation: spin20 22s linear infinite; }

        .card-hover {
          transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s ease;
        }
        .card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 64px rgba(0,0,0,.09);
        }

        .btn-primary {
          background: #9CAF88;
          color: #fff;
          transition: background .25s ease, transform .2s ease, box-shadow .25s ease;
        }
        .btn-primary:hover {
          background: #7a9467;
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(156,175,136,.45);
        }
        .btn-primary:active { transform: translateY(0); }

        .btn-ghost {
          background: rgba(255,255,255,.65);
          border: 1.5px solid rgba(156,175,136,.4);
          color: #4a6640;
          backdrop-filter: blur(8px);
          transition: background .25s ease, border-color .25s ease, transform .2s ease;
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,.9);
          border-color: #9CAF88;
          transform: translateY(-2px);
        }

        .nav-pill {
          background: rgba(255,255,255,.72);
          border: 1px solid rgba(156,175,136,.25);
          backdrop-filter: blur(16px);
        }
        .nav-scrolled {
          background: rgba(255,255,255,.88);
          border-color: rgba(156,175,136,.35);
          box-shadow: 0 4px 24px rgba(0,0,0,.06);
        }
      `}</style>

      {/* ══════════════════ NAVBAR ══════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-6 pt-4">
        <nav
          className={`nav-pill w-full max-w-5xl rounded-2xl px-5 py-3 flex items-center justify-between transition-all duration-500 ${
            scrolled ? 'nav-scrolled' : ''
          }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm shadow-md"
              style={{ background: 'linear-gradient(135deg,#9CAF88,#6d8b58)' }}
            >
              ✦
            </div>
            <span
              className="font-display font-semibold text-lg leading-none"
              style={{ color: '#2E2A26' }}
            >
              Create My{' '}
              <em className="not-italic italic" style={{ color: '#9CAF88' }}>
                Surprise
              </em>
            </span>
          </div>

          {/* Login */}
          <Link
            href="/login"
            className="btn-primary text-sm font-medium px-5 py-2 rounded-full"
          >
            Log in
          </Link>
        </nav>
      </header>

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center pt-28 pb-20 px-6 overflow-hidden">
        {/* Blurred orbs */}
        <div
          className="absolute top-1/4 -left-24 w-80 h-80 rounded-full shimmer pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(156,175,136,.28) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute bottom-1/3 -right-20 w-72 h-72 rounded-full shimmer pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(248,208,193,.35) 0%, transparent 70%)',
            filter: 'blur(40px)',
            animationDelay: '1.4s',
          }}
        />
        {/* Spinning ring */}
        <div
          className="spin20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full pointer-events-none hidden md:block"
          style={{
            border: '1px dashed rgba(156,175,136,.18)',
          }}
        />

        {/* Floating cards */}
        <div
          className="float-a absolute top-36 left-[7%] hidden lg:block"
          style={{
            background: 'rgba(255,255,255,.68)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,.85)',
            borderRadius: '14px',
            padding: '10px 14px',
            fontSize: '22px',
            boxShadow: '0 8px 24px rgba(0,0,0,.07)',
          }}
        >
          🎁
        </div>
        <div
          className="float-b absolute top-52 right-[9%] hidden lg:block"
          style={{
            background: 'rgba(255,255,255,.68)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,.85)',
            borderRadius: '14px',
            padding: '10px 14px',
            fontSize: '22px',
            boxShadow: '0 8px 24px rgba(0,0,0,.07)',
          }}
        >
          💌
        </div>
        <div
          className="float-c absolute bottom-44 left-[14%] hidden lg:block"
          style={{
            background: 'rgba(255,255,255,.68)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,.85)',
            borderRadius: '14px',
            padding: '8px 12px',
            fontSize: '18px',
            boxShadow: '0 8px 24px rgba(0,0,0,.07)',
          }}
        >
          ✨
        </div>
        <div
          className="float-a absolute bottom-52 right-[11%] hidden lg:block"
          style={{
            background: 'rgba(255,255,255,.68)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,.85)',
            borderRadius: '14px',
            padding: '8px 12px',
            fontSize: '18px',
            boxShadow: '0 8px 24px rgba(0,0,0,.07)',
            animationDelay: '1s',
          }}
        >
          🌸
        </div>

        {/* Main content */}
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          {/* Pill tag */}
          <div
            className="fade-up-1 inline-flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-full mb-8"
            style={{
              background: 'rgba(156,175,136,.14)',
              border: '1px solid rgba(156,175,136,.35)',
              color: '#5a7a4a',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shimmer"
              style={{ background: '#9CAF88', display: 'inline-block' }}
            />
            Now in early access · 2,400+ creators
          </div>

          {/* Headline */}
          <h1
            className="fade-up-2 font-display text-5xl md:text-6xl lg:text-[4.25rem] font-semibold leading-[1.12] mb-6"
            style={{ color: '#1e1c19' }}
          >
            Create{' '}
            <span className="relative inline-block" style={{ color: '#9CAF88' }}>
              <em className="not-italic italic">unforgettable</em>
              <svg
                className="absolute -bottom-1 left-0 w-full"
                viewBox="0 0 280 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 7.5C55 2.5 110 1 140 3C170 5 225 8 278 6"
                  stroke="#9CAF88"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  opacity=".55"
                />
              </svg>
            </span>
            <br />
            digital surprises
          </h1>

          {/* Subheading */}
          <p
            className="fade-up-3 text-lg md:text-xl font-light leading-relaxed max-w-xl mx-auto mb-10"
            style={{ color: '#6b6560' }}
          >
            Send magical, interactive experiences to your loved ones — birthdays,
            anniversaries, or just because.{' '}
            <span style={{ color: '#7a9467', fontWeight: 500 }}>
              No design skills needed.
            </span>
          </p>

          {/* CTA buttons */}
          <div className="fade-up-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="btn-primary font-medium text-base px-9 py-4 rounded-full w-full sm:w-auto">
              ✦ Get Started Free
            </button>
            <button className="btn-ghost font-medium text-base px-9 py-4 rounded-full w-full sm:w-auto flex items-center justify-center gap-2.5">
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                style={{ background: 'rgba(156,175,136,.18)', color: '#5a7a4a' }}
              >
                ▶
              </span>
              View Demo
            </button>
          </div>

          {/* Social proof */}
          <div
            className="fade-up-4 mt-12 flex flex-col sm:flex-row items-center justify-center gap-5"
            style={{ animationDelay: '.7s' }}
          >
            <div className="flex -space-x-2.5">
              {(
                [
                  ['#c4a0a0', 'P'],
                  ['#a0bfa0', 'M'],
                  ['#e8c98a', 'S'],
                  ['#c4a8c4', 'J'],
                  ['#a0b8d4', 'R'],
                ] as [string, string][]
              ).map(([bg, initial], i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold text-white shadow-sm"
                  style={{ backgroundColor: bg }}
                >
                  {initial}
                </div>
              ))}
            </div>
            <p className="text-sm" style={{ color: '#8a847e' }}>
              <strong style={{ color: '#3d3530' }}>4.9 / 5</strong> from over{' '}
              <strong style={{ color: '#3d3530' }}>800 reviews</strong> &nbsp;⭐⭐⭐⭐⭐
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════ FEATURES ══════════════════ */}
      <section
        id="features"
        className="py-28 px-6 relative"
      >
        <div className="max-w-5xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <span
              className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-full mb-5"
              style={{
                background: 'rgba(156,175,136,.12)',
                border: '1px solid rgba(156,175,136,.3)',
                color: '#5a7a4a',
              }}
            >
              🌿 What you can do
            </span>
            <h2
              className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-4"
              style={{ color: '#1e1c19' }}
            >
              Everything to make them
              <br />
              <em className="italic" style={{ color: '#9CAF88' }}>
                feel something real
              </em>
            </h2>
            <p
              className="text-lg font-light max-w-md mx-auto"
              style={{ color: '#7a746e' }}
            >
              A full suite of expressive tools, designed for moments that matter.
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="card-hover relative rounded-3xl p-8 overflow-hidden"
                style={{
                  background: `linear-gradient(145deg, ${f.gradient.replace('from-', '').replace(' to-', ', ')})`,
                  border: '1.5px solid rgba(255,255,255,.85)',
                  boxShadow: '0 8px 32px rgba(0,0,0,.055)',
                }}
              >
                {/* Decorative blob */}
                <div
                  className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 pointer-events-none"
                  style={{ background: f.accent }}
                />

                {/* Tag */}
                <span
                  className="inline-block text-xs font-semibold px-3 py-1 rounded-full text-white mb-6"
                  style={{ background: f.accent, opacity: 0.9 }}
                >
                  {f.tag}
                </span>

                {/* Icon */}
                <div className="text-4xl mb-5">{f.icon}</div>

                {/* Label */}
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: f.accent }}
                >
                  {f.label}
                </p>

                {/* Title */}
                <h3
                  className="font-display text-xl font-semibold mb-3 leading-snug"
                  style={{ color: '#1e1c19' }}
                >
                  {f.title}
                </h3>

                {/* Description */}
                <p
                  className="text-sm font-light leading-relaxed"
                  style={{ color: '#7a746e' }}
                >
                  {f.description}
                </p>

                {/* Arrow */}
                <div
                  className="absolute bottom-7 right-7 w-8 h-8 rounded-full flex items-center justify-center text-sm opacity-0 transition-all duration-300 translate-x-2"
                  style={{
                    background: 'rgba(255,255,255,.7)',
                    color: '#5a5550',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget
                    el.style.opacity = '1'
                    el.style.transform = 'translateX(0)'
                  }}
                >
                  →
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ FOOTER STRIP ══════════════════ */}
      <footer
        className="py-10 px-6 text-center text-sm font-light"
        style={{
          borderTop: '1px solid rgba(156,175,136,.18)',
          color: '#a09a94',
        }}
      >
        © 2025 Create My Surprise &nbsp;·&nbsp; Made with 💚 for the people you love
      </footer>
    </div>
  )
}