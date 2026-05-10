"use client";

import { compressImage } from "@/lib/compressImage";

import Step4Preview from "./Step4Preview";

import { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Balloon {
  id: string;
  message: string;
  imageBase64: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const OCCASIONS = [
  "Birthday",
  "Anniversary",
  "Farewell",
  "Wedding",
  "Women's Day",
  "Valentine's Day",
  "Girlfriend's Day",
  "Mother's Day",
  "Father's Day",
  "Friendship Day",
  "Other",
];

const MAX_BALLOONS = 9;
const MIN_BALLOONS = 5;

function makeBalloon(): Balloon {
  return { id: crypto.randomUUID(), message: "", imageBase64: null };
}

// ─── Crop helpers ─────────────────────────────────────────────────────────────
interface CropArea { x: number; y: number; width: number; height: number; }

async function getCroppedBase64(imageSrc: string, pixelCrop: CropArea): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = imageSrc;
  });
  const canvas = document.createElement("canvas");
 const MAX_W = 600;
const scale = Math.min(1, MAX_W / pixelCrop.width);

canvas.width = pixelCrop.width * scale;
canvas.height = pixelCrop.height * scale;
  const ctx = canvas.getContext("2d")!;

  ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0,
    pixelCrop.width, pixelCrop.height
  );
  return canvas.toDataURL("image/webp", 0.55);
}

// ─── Crop Modal ───────────────────────────────────────────────────────────────
function CropModal({
  imageSrc,
  onSave,
  onCancel,
}: {
  imageSrc: string;
  onSave: (croppedBase64: string) => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_: unknown, pixels: CropArea) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleSave() {
    if (!croppedAreaPixels) return;
    setSaving(true);
    const result = await getCroppedBase64(imageSrc, croppedAreaPixels);
    onSave(result);
  }

  return (
    <div className="crop-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="crop-modal">
        <div className="crop-modal-header">
          <span className="crop-modal-title">Crop Photo ✂️</span>
          <p className="crop-modal-hint">Drag to reposition · Pinch or scroll to zoom</p>
        </div>

        <div className="crop-viewport">
          <Cropper
  image={imageSrc}
  crop={crop}
  zoom={zoom}
  aspect={4/5}
  onCropChange={setCrop}
  onZoomChange={setZoom}
  onCropComplete={onCropComplete}
  cropShape="rect"
  showGrid={true}
  style={{
    containerStyle: { borderRadius: "8px" },
    cropAreaStyle: {
      border: "2px solid rgba(135,168,120,0.9)",
      boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
    },
  }}
/>
        </div>

        {/* Zoom slider */}
        <div className="crop-zoom-row">
          <span className="crop-zoom-label">🔍</span>
          <input
            type="range"
            min={1} max={3} step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="crop-zoom-slider"
          />
          <span className="crop-zoom-label">🔎</span>
        </div>

        {/* Buttons */}
        <div className="crop-modal-actions">
          <button className="crop-cancel-btn" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button className="crop-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Crop ✓"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .crop-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.65);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          backdrop-filter: blur(4px);
          animation: overlayIn 0.2s ease;
        }
        @keyframes overlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .crop-modal {
          background: #fff;
          border-radius: 20px;
          padding: 1.5rem;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.3);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          animation: modalIn 0.25s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.93) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .crop-modal-header { text-align: center; }
        .crop-modal-title {
          font-size: 1.1rem;
          font-weight: 700;
          font-family: 'Courier New', monospace;
          color: #2D2D2D;
        }
        .crop-modal-hint {
          font-size: 0.73rem;
          color: #aaa;
          font-family: 'Courier New', monospace;
          margin: 0.25rem 0 0;
        }
        .crop-viewport {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          background: #111;
          border-radius: 8px;
          overflow: hidden;
        }
        .crop-zoom-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .crop-zoom-label { font-size: 1rem; }
        .crop-zoom-slider {
          flex: 1;
          height: 4px;
          accent-color: #87A878;
          cursor: pointer;
        }
        .crop-modal-actions {
          display: flex;
          gap: 0.75rem;
        }
        .crop-cancel-btn {
          flex: 1;
          padding: 0.75rem;
          border: 1.5px solid #e0ddd5;
          border-radius: 12px;
          background: transparent;
          font-family: 'Courier New', monospace;
          font-size: 0.88rem;
          color: #888;
          cursor: pointer;
          transition: background 0.15s;
        }
        .crop-cancel-btn:hover { background: #f5f2ee; }
        .crop-save-btn {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #87A878, #6BA3BE);
          color: white;
          font-family: 'Courier New', monospace;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.15s;
          box-shadow: 0 4px 14px rgba(107,163,190,0.3);
        }
        .crop-save-btn:hover { transform: translateY(-1px); opacity: 0.92; }
        .crop-save-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
      `}</style>
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────
function Step2({
  recipientName,
  occasion,
  onBack,
  onContinue,
}: {
  recipientName: string;
  occasion: string;
  onBack: () => void;
  onContinue: (balloons: Balloon[]) => void;
}) {
  const [balloons, setBalloons] = useState<Balloon[]>(
    Array.from({ length: MIN_BALLOONS }, makeBalloon)
  );

  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // ── Crop modal state ──
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropTargetId, setCropTargetId] = useState<string | null>(null);

  function updateBalloon(id: string, field: keyof Balloon, value: string | null) {
    setBalloons((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  }

  function addBalloon() {
    if (balloons.length < MAX_BALLOONS) {
      setBalloons((prev) => [...prev, makeBalloon()]);
    }
  }

  function removeBalloon(id: string) {
    if (balloons.length > MIN_BALLOONS) {
      setBalloons((prev) => prev.filter((b) => b.id !== id));
    }
  }

  // Opens the crop modal instead of storing base64 directly
  function handleImageSelect(id: string, file: File) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const raw = e.target?.result as string;
    const compressed = await compressImage(raw);
    setCropSrc(compressed);
    setCropTargetId(id);
  };
  reader.readAsDataURL(file);
}

  function handleCropSave(croppedBase64: string) {
    if (cropTargetId) updateBalloon(cropTargetId, "imageBase64", croppedBase64);
    setCropSrc(null);
    setCropTargetId(null);
  }

  function handleCropCancel() {
    setCropSrc(null);
    setCropTargetId(null);
  }

  const canContinue = balloons.length >= MIN_BALLOONS;

  return (
    <div className="create-page">
      {/* Crop modal — rendered above everything when active */}
      {cropSrc && (
        <CropModal
          imageSrc={cropSrc}
          onSave={handleCropSave}
          onCancel={handleCropCancel}
        />
      )}

      {/* Background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Floating confetti dots */}
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} className={`confetti-dot dot-${i}`} />
      ))}

      <div className="create-card step2-card">
        {/* Step indicator */}
        <div className="step-indicator">
          {[1, 2, 3].map((s) => (
            <div key={s} className="step-item">
              <div className={`step-circle ${s === 2 ? "active" : s < 2 ? "done" : ""}`}>
                {s < 2 ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l3.5 3.5L12 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  s
                )}
              </div>
              {s < 3 && <div className={`step-line ${s < 2 ? "done" : ""}`} />}
            </div>
          ))}
        </div>
        <p className="step-label">Step 2 of 3 — Fill the balloons 🎈</p>

        {/* Header */}
        <header className="create-header">
          <h1 className="create-title">
            Add Your Balloons
            <span className="title-emoji">🎈</span>
          </h1>
          <p className="create-subtitle">
            Each balloon holds a message for <strong style={{ color: "#87A878", fontStyle: "normal" }}>{recipientName}</strong>.
            Add at least 5, up to 9. You can also add a photo to each!
          </p>
        </header>

        {/* Balloon count bar */}
        <div className="balloon-bar">
          <span className="balloon-bar-count">
            {balloons.length}/{MAX_BALLOONS} balloons
          </span>
          {balloons.length < MAX_BALLOONS && (
            <button className="add-balloon-btn" onClick={addBalloon}>
              <span>+</span> Add Balloon
            </button>
          )}
        </div>

        {/* Balloon cards grid */}
        <div className="balloons-grid">
          {balloons.map((balloon, index) => (
            <div key={balloon.id} className="polaroid-card">
              {/* Remove button */}
              {balloons.length > MIN_BALLOONS && (
                <button
                  className="remove-btn"
                  onClick={() => removeBalloon(balloon.id)}
                  title="Remove this balloon"
                >
                  ×
                </button>
              )}

              {/* Polaroid image area */}
              <div className="polaroid-photo-wrap">
                {balloon.imageBase64 ? (
                  <div className="polaroid-photo-filled">
                    <img
                      src={balloon.imageBase64}
                      alt={`Balloon ${index + 1}`}
                      className="polaroid-img"
                    />
                    <button
                      className="change-photo-btn"
                      onClick={() => fileRefs.current[balloon.id]?.click()}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    className="upload-photo-btn"
                    onClick={() => fileRefs.current[balloon.id]?.click()}
                  >
                    <span className="upload-icon">📷</span>
                    <span className="upload-label">Upload Photo</span>
                    <span className="upload-hint">optional</span>
                  </button>
                )}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  ref={(el) => { fileRefs.current[balloon.id] = el; }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageSelect(balloon.id, file);
                    e.target.value = "";
                  }}
                />
              </div>

              {/* Balloon number tag */}
              <div className="balloon-tag">🎈 #{index + 1}</div>

              {/* Message textarea */}
              <div className="polaroid-message-wrap">
                <textarea
                  className="polaroid-textarea"
                  placeholder={`Write a sweet message…`}
                  maxLength={120}
                  value={balloon.message}
                  onChange={(e) => updateBalloon(balloon.id, "message", e.target.value)}
                  rows={3}
                />
                <span className={`msg-counter ${balloon.message.length >= 110 ? "counter-warn" : ""}`}>
                  {balloon.message.length}/120
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Minimum note */}
        {!canContinue && (
          <p className="min-note">Add at least {MIN_BALLOONS} balloons to continue.</p>
        )}

        {/* Actions */}
        <div className="step2-actions">
          <button className="back-btn" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 8H4M8 4L4 8l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>

          {canContinue && (
            <button className="next-btn" onClick={() => onContinue(balloons)}>
              <span>Continue</span>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 9h10M9 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        /* ── Page shell ── */
        .create-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #faf3e0 0%, #e8f4f0 50%, #e8eef6 100%);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 2rem 1rem;
          position: relative;
          overflow: hidden;
          font-family: 'Georgia', 'Times New Roman', serif;
        }

        /* ── Background blobs ── */
        .blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0.35;
          animation: blobDrift 12s ease-in-out infinite alternate;
          pointer-events: none;
        }
        .blob-1 {
          width: 420px; height: 420px;
          background: #87A878;
          top: -120px; left: -100px;
          animation-duration: 14s;
        }
        .blob-2 {
          width: 340px; height: 340px;
          background: #6BA3BE;
          bottom: -80px; right: -80px;
          animation-duration: 11s;
          animation-delay: -4s;
        }
        .blob-3 {
          width: 260px; height: 260px;
          background: #B8A9C9;
          top: 50%; left: 60%;
          animation-duration: 16s;
          animation-delay: -8s;
        }
        @keyframes blobDrift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, -30px) scale(1.08); }
        }

        /* ── Confetti dots ── */
        .confetti-dot {
          position: fixed;
          width: 8px; height: 8px;
          border-radius: 50%;
          pointer-events: none;
          animation: floatDot linear infinite;
          opacity: 0.55;
        }
        ${Array.from({ length: 18 })
          .map((_, i) => {
            const colors = ["#87A878", "#6BA3BE", "#B8A9C9", "#FAD4A0", "#F8B4C8"];
            const color = colors[i % colors.length];
            const left = (i * 5.5 + 2) % 100;
            const size = 5 + (i % 6);
            const duration = 6 + (i % 8);
            const delay = -(i * 0.9);
            return `.dot-${i} {
              left: ${left}%;
              bottom: -10px;
              width: ${size}px;
              height: ${size}px;
              background: ${color};
              animation-duration: ${duration}s;
              animation-delay: ${delay}s;
            }`;
          })
          .join("\n")}
        @keyframes floatDot {
          from { transform: translateY(0) rotate(0deg); opacity: 0.6; }
          80%  { opacity: 0.5; }
          to   { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
        }

        /* ── Card ── */
        .create-card {
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1.5px solid rgba(255, 255, 255, 0.85);
          border-radius: 28px;
          box-shadow:
            0 8px 32px rgba(107, 163, 190, 0.18),
            0 2px 8px rgba(0, 0, 0, 0.06);
          padding: 2.5rem 2.25rem 2.75rem;
          width: 100%;
          max-width: 500px;
          position: relative;
          z-index: 1;
          animation: cardIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .step2-card {
          max-width: 680px;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Step indicator ── */
        .step-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          margin-bottom: 0.4rem;
        }
        .step-item {
          display: flex;
          align-items: center;
        }
        .step-circle {
          width: 32px; height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          font-family: 'Courier New', monospace;
          border: 2px solid #d0cfc8;
          background: white;
          color: #aaa;
          transition: all 0.3s ease;
        }
        .step-circle.active {
          background: #87A878;
          border-color: #87A878;
          color: white;
          box-shadow: 0 0 0 4px rgba(135, 168, 120, 0.22);
        }
        .step-circle.done {
          background: #6BA3BE;
          border-color: #6BA3BE;
          color: white;
        }
        .step-line {
          width: 48px;
          height: 2px;
          background: #e0ddd5;
          margin: 0 2px;
          transition: background 0.3s ease;
        }
        .step-line.done {
          background: #6BA3BE;
        }
        .step-label {
          text-align: center;
          font-size: 0.75rem;
          color: #9a9a8a;
          letter-spacing: 0.04em;
          margin: 0.35rem 0 1.6rem;
          font-family: 'Courier New', monospace;
          text-transform: uppercase;
        }

        /* ── Header ── */
        .create-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .create-title {
          font-size: 2rem;
          font-weight: 700;
          color: #2D2D2D;
          line-height: 1.15;
          margin: 0 0 0.6rem;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: baseline;
          gap: 0.3rem;
        }
        .title-emoji {
          margin-left: 0.25rem;
          font-size: 1.9rem;
          animation: emojiFloat 3s ease-in-out infinite;
          display: inline-block;
        }
        @keyframes emojiFloat {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50%       { transform: translateY(-6px) rotate(5deg); }
        }
        .create-subtitle {
          font-size: 0.88rem;
          color: #777;
          margin: 0;
          line-height: 1.55;
          font-family: 'Georgia', serif;
          font-style: italic;
        }

        /* ── Balloon bar ── */
        .balloon-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .balloon-bar-count {
          font-size: 0.8rem;
          font-family: 'Courier New', monospace;
          color: #9a9a8a;
          letter-spacing: 0.03em;
        }
        .add-balloon-btn {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.4rem 1rem;
          background: rgba(184, 169, 201, 0.2);
          border: 1.5px dashed #B8A9C9;
          border-radius: 50px;
          color: #8a7a99;
          font-size: 0.82rem;
          font-family: 'Courier New', monospace;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .add-balloon-btn:hover {
          background: rgba(184, 169, 201, 0.35);
          transform: scale(1.04);
        }
        .add-balloon-btn span {
          font-size: 1.1rem;
          line-height: 1;
        }

        /* ── Balloons grid ── */
        .balloons-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
          gap: 1.25rem;
          margin-bottom: 1.25rem;
        }

        /* ── Polaroid card ── */
        .polaroid-card {
  background: #fff;
  border-radius: 4px;
  padding: 0.75rem 0.75rem 0.6rem;
  box-shadow:
    0 4px 16px rgba(0,0,0,0.10),
    0 1px 4px rgba(0,0,0,0.07),
    2px 3px 0 rgba(0,0,0,0.04);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  animation: cardPopIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  transition: box-shadow 0.2s, transform 0.2s;
}

/* alternating tilt */
.polaroid-card:nth-child(odd) {
  transform: rotate(-2.5deg);
}
.polaroid-card:nth-child(even) {
  transform: rotate(2deg);
}
.polaroid-card:hover {
  transform: rotate(0deg) translateY(-4px) scale(1.03) !important;
  box-shadow:
    0 12px 28px rgba(0,0,0,0.15),
    0 2px 6px rgba(0,0,0,0.08);
}
        .polaroid-card:hover {
          transform: translateY(-3px) rotate(0.4deg);
          box-shadow:
            0 8px 24px rgba(0,0,0,0.13),
            0 2px 6px rgba(0,0,0,0.08);
        }
        @keyframes cardPopIn {
          from { opacity: 0; transform: scale(0.88) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* Remove button */
        .remove-btn {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #e07070;
          color: white;
          border: none;
          font-size: 1rem;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          transition: transform 0.15s, background 0.15s;
          z-index: 2;
        }
        .remove-btn:hover {
          background: #c85a5a;
          transform: scale(1.15);
        }

        /* Photo area */
        .polaroid-photo-wrap {
  width: 100%;
  aspect-ratio: 4/5;   /* ← was 1/1, now taller */
  background: linear-gradient(135deg, #f5f0e8 0%, #edf4f8 100%);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}
        .upload-photo-btn {
          width: 100%;
          height: 100%;
          background: none;
          border: 1.5px dashed #c5bfb5;
          border-radius: 2px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          padding: 0;
        }
        .upload-photo-btn:hover {
          border-color: #87A878;
          background: rgba(135, 168, 120, 0.06);
        }
        .upload-icon { font-size: 1.5rem; }
        .upload-label {
          font-size: 0.72rem;
          font-family: 'Courier New', monospace;
          color: #888;
          font-weight: 700;
        }
        .upload-hint {
          font-size: 0.65rem;
          color: #bbb;
          font-family: 'Courier New', monospace;
        }
        .polaroid-photo-filled {
          width: 100%;
          height: 100%;
          position: relative;
        }
        .polaroid-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .change-photo-btn {
          position: absolute;
          bottom: 6px;
          right: 6px;
          padding: 0.2rem 0.55rem;
          background: rgba(0,0,0,0.55);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 0.65rem;
          font-family: 'Courier New', monospace;
          cursor: pointer;
          transition: background 0.15s;
        }
        .change-photo-btn:hover { background: rgba(0,0,0,0.75); }

        /* Balloon tag */
        .balloon-tag {
          font-size: 0.7rem;
          font-family: 'Courier New', monospace;
          color: #B8A9C9;
          letter-spacing: 0.04em;
          text-align: center;
        }

        /* Message textarea */
        .polaroid-message-wrap {
          position: relative;
        }
        .polaroid-textarea {
  width: 100%;
  border: none;
  border-top: 1px solid #f0ece4;
  padding: 0.35rem 0.25rem 1rem;  /* ← reduced padding */
  font-size: 0.75rem;              /* ← slightly smaller */
  font-family: 'Georgia', serif;
  color: #2D2D2D;
  resize: none;
  outline: none;
  background: transparent;
  line-height: 1.4;
  box-sizing: border-box;
}
        .polaroid-textarea::placeholder { color: #ccc; font-style: italic; }
        .msg-counter {
          position: absolute;
          bottom: 0;
          right: 0;
          font-size: 0.62rem;
          color: #ccc;
          font-family: 'Courier New', monospace;
          transition: color 0.2s;
        }
        .msg-counter.counter-warn { color: #e07070; }

        /* ── Min note ── */
        .min-note {
          text-align: center;
          font-size: 0.78rem;
          color: #B8A9C9;
          font-family: 'Courier New', monospace;
          margin: 0 0 1rem;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        /* ── Actions ── */
        .step2-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.75rem 1.25rem;
          background: rgba(255,255,255,0.7);
          border: 1.5px solid #e0ddd5;
          border-radius: 12px;
          font-size: 0.9rem;
          font-family: 'Courier New', monospace;
          color: #888;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .back-btn:hover {
          background: rgba(255,255,255,0.95);
          color: #555;
        }
        .next-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.85rem 1.5rem;
          background: linear-gradient(135deg, #87A878, #6BA3BE);
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 1rem;
          font-weight: 700;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: transform 0.18s, box-shadow 0.18s, opacity 0.18s;
          box-shadow: 0 4px 18px rgba(107, 163, 190, 0.3);
        }
        .next-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(107, 163, 190, 0.38);
        }
        .next-btn:active {
          transform: translateY(0);
          opacity: 0.88;
        }

        /* ── Responsive ── */
        @media (max-width: 520px) {
          .create-card {
            padding: 2rem 1.25rem 2.25rem;
            border-radius: 20px;
          }
          .create-title { font-size: 1.55rem; }
          .step-line { width: 32px; }
          .balloons-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────
function Step3({
  recipientName,
  occasion,
  balloons,
  onBack,
  onContinue,
}: {
  recipientName: string;
  occasion: string;
  balloons: Balloon[];
  onBack: () => void;
  onContinue: (finalMessage: string) => void;
}) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_MSG = 850;

  async function generateMessage() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientName, occasion }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      setMessage(data.message);
    } catch {
      setError("Couldn't generate a message. You can write one yourself below!");
    } finally {
      setLoading(false);
    }
  }

  // Auto-generate once when Step 3 mounts
  const hasFetched = useRef(false);
  if (!hasFetched.current) {
    hasFetched.current = true;
    // Schedule after paint so React finishes rendering first
    Promise.resolve().then(generateMessage);
  }

  return (
    <div className="create-page">
      {/* Background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Floating confetti dots */}
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} className={`confetti-dot dot-${i}`} />
      ))}

      <div className="create-card step3-card">
        {/* Step indicator */}
        <div className="step-indicator">
          {[1, 2, 3].map((s) => (
            <div key={s} className="step-item">
              <div className={`step-circle ${s === 3 ? "active" : "done"}`}>
                {s < 3 ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l3.5 3.5L12 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  s
                )}
              </div>
              {s < 3 && <div className="step-line done" />}
            </div>
          ))}
        </div>
        <p className="step-label">Step 3 of 3 — The final message ✨</p>

        {/* Header */}
        <header className="create-header">
          <h1 className="create-title">
            Final Message
            <span className="title-emoji">💌</span>
          </h1>
          <p className="create-subtitle">
            A heartfelt closing note for <strong style={{ color: "#87A878", fontStyle: "normal" }}>{recipientName}</strong> —
            AI-crafted, but yours to edit.
          </p>
        </header>

        {/* Message area */}
        <div className="s3-message-section">
          {loading ? (
            <div className="s3-spinner-wrap">
              <div className="s3-spinner" />
              <p className="s3-spinner-label">Crafting a warm message for {recipientName}…</p>
            </div>
          ) : (
            <>
              {error && (
                <p className="s3-error">{error}</p>
              )}
              <div className="s3-textarea-wrap">
                <textarea
                  className="s3-textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, MAX_MSG))}
                  placeholder="Your heartfelt message will appear here…"
                  rows={8}
                />
                <div className="s3-textarea-footer">
                  <button
                    className="s3-regen-btn"
                    onClick={generateMessage}
                    title="Generate a new message"
                  >
                    ↺ Regenerate
                  </button>
                  <span className={`s3-char-counter ${message.length >= MAX_MSG - 20 ? "counter-warn" : ""}`}>
                    {message.length}/{MAX_MSG}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="step2-actions">
          <button className="back-btn" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 8H4M8 4L4 8l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>

          {!loading && (
            <button
              className="next-btn s3-preview-btn"
              onClick={() => onContinue(message)}
              disabled={!message.trim()}
            >
              <span>Ready to Preview!</span>
              <span style={{ fontSize: "1.1rem" }}>✨</span>
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        /* ── Reuse page shell + blob + confetti from Step1/2 ── */
        .create-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #faf3e0 0%, #e8f4f0 50%, #e8eef6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          position: relative;
          overflow: hidden;
          font-family: 'Georgia', 'Times New Roman', serif;
        }
        .blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0.35;
          animation: blobDrift 12s ease-in-out infinite alternate;
          pointer-events: none;
        }
        .blob-1 { width: 420px; height: 420px; background: #87A878; top: -120px; left: -100px; animation-duration: 14s; }
        .blob-2 { width: 340px; height: 340px; background: #6BA3BE; bottom: -80px; right: -80px; animation-duration: 11s; animation-delay: -4s; }
        .blob-3 { width: 260px; height: 260px; background: #B8A9C9; top: 50%; left: 60%; animation-duration: 16s; animation-delay: -8s; }
        @keyframes blobDrift {
          from { transform: translate(0,0) scale(1); }
          to { transform: translate(30px,-30px) scale(1.08); }
        }
        .confetti-dot {
          position: fixed; width: 8px; height: 8px; border-radius: 50%;
          pointer-events: none; animation: floatDot linear infinite; opacity: 0.55;
        }
        ${Array.from({ length: 18 }).map((_, i) => {
          const colors = ["#87A878","#6BA3BE","#B8A9C9","#FAD4A0","#F8B4C8"];
          return `.dot-${i}{left:${(i*5.5+2)%100}%;bottom:-10px;width:${5+(i%6)}px;height:${5+(i%6)}px;background:${colors[i%colors.length]};animation-duration:${6+(i%8)}s;animation-delay:${-(i*0.9)}s;}`;
        }).join("")}
        @keyframes floatDot {
          from { transform: translateY(0) rotate(0deg); opacity: 0.6; }
          80% { opacity: 0.5; }
          to { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
        }

        /* ── Card ── */
        .create-card {
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1.5px solid rgba(255,255,255,0.85);
          border-radius: 28px;
          box-shadow: 0 8px 32px rgba(107,163,190,0.18), 0 2px 8px rgba(0,0,0,0.06);
          padding: 2.5rem 2.25rem 2.75rem;
          width: 100%;
          max-width: 500px;
          position: relative;
          z-index: 1;
          animation: cardIn 0.6s cubic-bezier(0.22,1,0.36,1) both;
        }
        .step3-card { max-width: 540px; }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Step indicator (reuse exact classes) ── */
        .step-indicator { display: flex; align-items: center; justify-content: center; margin-bottom: 0.4rem; }
        .step-item { display: flex; align-items: center; }
        .step-circle {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; font-weight: 700; font-family: 'Courier New', monospace;
          border: 2px solid #d0cfc8; background: white; color: #aaa; transition: all 0.3s ease;
        }
        .step-circle.active { background: #87A878; border-color: #87A878; color: white; box-shadow: 0 0 0 4px rgba(135,168,120,0.22); }
        .step-circle.done { background: #6BA3BE; border-color: #6BA3BE; color: white; }
        .step-line { width: 48px; height: 2px; background: #e0ddd5; margin: 0 2px; transition: background 0.3s ease; }
        .step-line.done { background: #6BA3BE; }
        .step-label {
          text-align: center; font-size: 0.75rem; color: #9a9a8a;
          letter-spacing: 0.04em; margin: 0.35rem 0 1.6rem;
          font-family: 'Courier New', monospace; text-transform: uppercase;
        }

        /* ── Header ── */
        .create-header { text-align: center; margin-bottom: 1.75rem; }
        .create-title {
          font-size: 2rem; font-weight: 700; color: #2D2D2D;
          line-height: 1.15; margin: 0 0 0.6rem;
          display: flex; flex-wrap: wrap; justify-content: center; align-items: baseline; gap: 0.3rem;
        }
        .title-emoji { margin-left: 0.25rem; font-size: 1.9rem; animation: emojiFloat 3s ease-in-out infinite; display: inline-block; }
        @keyframes emojiFloat {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-6px) rotate(5deg); }
        }
        .create-subtitle { font-size: 0.88rem; color: #777; margin: 0; line-height: 1.55; font-family: 'Georgia', serif; font-style: italic; }

        /* ── Spinner ── */
        .s3-spinner-wrap {
          display: flex; flex-direction: column; align-items: center;
          gap: 1rem; padding: 2.5rem 0;
        }
        .s3-spinner {
          width: 44px; height: 44px; border-radius: 50%;
          border: 3px solid #e0ddd5;
          border-top-color: #87A878;
          animation: spin 0.9s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .s3-spinner-label {
          font-size: 0.85rem; color: #999; font-family: 'Courier New', monospace;
          font-style: italic; text-align: center;
        }

        /* ── Error ── */
        .s3-error {
          font-size: 0.78rem; color: #e07070; margin: 0 0 0.75rem;
          font-family: 'Courier New', monospace; text-align: center;
        }

        /* ── Message section ── */
        .s3-message-section { margin-bottom: 1.5rem; }
        .s3-textarea-wrap { position: relative; }
        .s3-textarea {
          width: 100%; box-sizing: border-box;
          padding: 1rem 1rem 2.5rem;
          border: 2px solid #e0ddd5; border-radius: 14px;
          font-size: 0.95rem; line-height: 1.65;
          font-family: 'Georgia', serif; color: #2D2D2D;
          background: rgba(255,255,255,0.85);
          resize: vertical; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          animation: textareaIn 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes textareaIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .s3-textarea:focus { border-color: #B8A9C9; box-shadow: 0 0 0 3px rgba(184,169,201,0.2); }
        .s3-textarea::placeholder { color: #ccc; font-style: italic; }
        .s3-textarea-footer {
          position: absolute; bottom: 0.6rem; left: 0.75rem; right: 0.75rem;
          display: flex; align-items: center; justify-content: space-between;
        }
        .s3-regen-btn {
          background: none; border: none; padding: 0;
          font-size: 0.72rem; font-family: 'Courier New', monospace;
          color: #B8A9C9; cursor: pointer; letter-spacing: 0.03em;
          transition: color 0.15s;
        }
        .s3-regen-btn:hover { color: #87A878; }
        .s3-char-counter {
          font-size: 0.68rem; font-family: 'Courier New', monospace;
          color: #ccc; transition: color 0.2s;
        }
        .s3-char-counter.counter-warn { color: #e07070; }

        /* ── Actions (reuse step2-actions + back-btn + next-btn) ── */
        .step2-actions {
          display: flex; align-items: center; justify-content: space-between;
          gap: 1rem; margin-top: 0.25rem;
        }
        .back-btn {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.75rem 1.25rem; background: rgba(255,255,255,0.7);
          border: 1.5px solid #e0ddd5; border-radius: 12px;
          font-size: 0.9rem; font-family: 'Courier New', monospace;
          color: #888; cursor: pointer; transition: background 0.2s, color 0.2s;
        }
        .back-btn:hover { background: rgba(255,255,255,0.95); color: #555; }
        .next-btn {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.85rem 1.5rem;
          background: linear-gradient(135deg, #87A878, #6BA3BE);
          color: white; border: none; border-radius: 14px;
          font-size: 1rem; font-weight: 700; font-family: 'Courier New', monospace;
          letter-spacing: 0.04em; cursor: pointer;
          transition: transform 0.18s, box-shadow 0.18s, opacity 0.18s;
          box-shadow: 0 4px 18px rgba(107,163,190,0.3);
        }
        .next-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(107,163,190,0.38); }
        .next-btn:active { transform: translateY(0); opacity: 0.88; }
        .next-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }
        .s3-preview-btn { background: linear-gradient(135deg, #B8A9C9, #87A878); }

        @media (max-width: 520px) {
          .create-card { padding: 2rem 1.25rem 2.25rem; border-radius: 20px; }
          .create-title { font-size: 1.55rem; }
          .step-line { width: 32px; }
        }
      `}</style>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CreatePage() {
  const [step, setStep] = useState(1);
  const [recipientName, setRecipientName] = useState("");
  const [occasion, setOccasion] = useState("");
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [finalMessage, setFinalMessage] = useState("");
  const [errors, setErrors] = useState<{ name?: string; occasion?: string }>({});

  function validate() {
    const newErrors: { name?: string; occasion?: string } = {};
    if (!recipientName.trim()) newErrors.name = "Please enter a name.";
    if (!occasion) newErrors.occasion = "Please pick an occasion.";
    return newErrors;
  }

  function handleNext() {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setStep(2);
  }
   // ── Render Step 4 ──
if (step === 4)
  return (
    <Step4Preview
      recipientName={recipientName}
      occasion={occasion}
      balloons={balloons}
      finalMessage={finalMessage}
      onEditSurprise={() => setStep(2)}
    />
  );
  
  // ── Render Step 3 ──
  if (step === 3)
    return (
      <Step3
        recipientName={recipientName}
        occasion={occasion}
        balloons={balloons}
        onBack={() => setStep(2)}
        onContinue={(msg) => {
          setFinalMessage(msg);
          setStep(4); // Step 4 (Preview) — coming in Prompt 12
        }}
      />
    );

  // ── Render Step 2 ──
  if (step === 2)
    return (
      <Step2
        recipientName={recipientName}
        occasion={occasion}
        onBack={() => setStep(1)}
        onContinue={(b) => {
          setBalloons(b);
          setStep(3);
        }}
      />
    );

  // ── Render Step 1 (UNCHANGED) ──
  return (
    <div className="create-page">
      {/* Animated background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Floating confetti dots */}
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} className={`confetti-dot dot-${i}`} />
      ))}

      <div className="create-card">
        {/* Step indicator */}
        <div className="step-indicator">
          {[1, 2, 3].map((s) => (
            <div key={s} className="step-item">
              <div className={`step-circle ${step === s ? "active" : step > s ? "done" : ""}`}>
                {step > s ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l3.5 3.5L12 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  s
                )}
              </div>
              {s < 3 && <div className={`step-line ${step > s ? "done" : ""}`} />}
            </div>
          ))}
        </div>
        <p className="step-label">Step 1 of 3 — Who's the lucky one?</p>

        {/* Animated header */}
        <header className="create-header">
          <h1 className="create-title">
            {"Craft your Surprise!".split("").map((char, i) => (
              <span
                key={i}
                className="title-char"
                style={{ animationDelay: `${i * 0.045}s` }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
            <span className="title-emoji">🎈</span>
          </h1>
          <p className="create-subtitle">
            Every great surprise starts with a name and a reason to celebrate.
          </p>
        </header>

        {/* Form */}
        <div className="form-section">
          {/* Recipient name */}
          <div className="field-group">
            <label className="field-label" htmlFor="recipient">
              Who is this surprise for?
            </label>
            <div className="input-wrap">
              <input
                id="recipient"
                type="text"
                maxLength={40}
                placeholder="e.g. Priya, Rohan, Mom…"
                value={recipientName}
                onChange={(e) => {
                  setRecipientName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                className={`text-input ${errors.name ? "input-error" : ""}`}
              />
              <span className={`char-counter ${recipientName.length >= 36 ? "counter-warn" : ""}`}>
                {recipientName.length}/40
              </span>
            </div>
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          {/* Occasion */}
          <div className="field-group">
            <label className="field-label" htmlFor="occasion">
              What's the occasion?
            </label>
            <div className="select-wrap">
              <select
                id="occasion"
                value={occasion}
                onChange={(e) => {
                  setOccasion(e.target.value);
                  if (errors.occasion) setErrors((prev) => ({ ...prev, occasion: undefined }));
                }}
                className={`select-input ${errors.occasion ? "input-error" : ""} ${!occasion ? "placeholder-selected" : ""}`}
              >
                <option value="" disabled>
                  — Pick an occasion —
                </option>
                {OCCASIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <span className="select-arrow">▾</span>
            </div>
            {errors.occasion && <p className="field-error">{errors.occasion}</p>}
          </div>

          {/* Preview pill */}
          {recipientName && occasion && (
            <div className="preview-pill">
              🎉 Crafting a <strong>{occasion}</strong> surprise for <strong>{recipientName}</strong>
            </div>
          )}

          {/* Next button */}
          <button className="next-btn" onClick={handleNext}>
            <span>Next</span>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 9h10M9 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        /* ── Page shell ── */
        .create-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #faf3e0 0%, #e8f4f0 50%, #e8eef6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          position: relative;
          overflow: hidden;
          font-family: 'Georgia', 'Times New Roman', serif;
        }

        /* ── Background blobs ── */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0.35;
          animation: blobDrift 12s ease-in-out infinite alternate;
          pointer-events: none;
        }
        .blob-1 {
          width: 420px; height: 420px;
          background: #87A878;
          top: -120px; left: -100px;
          animation-duration: 14s;
        }
        .blob-2 {
          width: 340px; height: 340px;
          background: #6BA3BE;
          bottom: -80px; right: -80px;
          animation-duration: 11s;
          animation-delay: -4s;
        }
        .blob-3 {
          width: 260px; height: 260px;
          background: #B8A9C9;
          top: 50%; left: 60%;
          animation-duration: 16s;
          animation-delay: -8s;
        }
        @keyframes blobDrift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, -30px) scale(1.08); }
        }

        /* ── Confetti dots ── */
        .confetti-dot {
          position: absolute;
          width: 8px; height: 8px;
          border-radius: 50%;
          pointer-events: none;
          animation: floatDot linear infinite;
          opacity: 0.55;
        }
        ${Array.from({ length: 18 })
          .map((_, i) => {
            const colors = ["#87A878", "#6BA3BE", "#B8A9C9", "#FAD4A0", "#F8B4C8"];
            const color = colors[i % colors.length];
            const left = (i * 5.5 + 2) % 100;
            const size = 5 + (i % 6);
            const duration = 6 + (i % 8);
            const delay = -(i * 0.9);
            return `.dot-${i} {
              left: ${left}%;
              bottom: -10px;
              width: ${size}px;
              height: ${size}px;
              background: ${color};
              animation-duration: ${duration}s;
              animation-delay: ${delay}s;
            }`;
          })
          .join("\n")}
        @keyframes floatDot {
          from { transform: translateY(0) rotate(0deg); opacity: 0.6; }
          80%  { opacity: 0.5; }
          to   { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
        }

        /* ── Card ── */
        .create-card {
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1.5px solid rgba(255, 255, 255, 0.85);
          border-radius: 28px;
          box-shadow:
            0 8px 32px rgba(107, 163, 190, 0.18),
            0 2px 8px rgba(0, 0, 0, 0.06);
          padding: 2.5rem 2.25rem 2.75rem;
          width: 100%;
          max-width: 500px;
          position: relative;
          z-index: 1;
          animation: cardIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Step indicator ── */
        .step-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          margin-bottom: 0.4rem;
        }
        .step-item {
          display: flex;
          align-items: center;
        }
        .step-circle {
          width: 32px; height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          font-family: 'Courier New', monospace;
          border: 2px solid #d0cfc8;
          background: white;
          color: #aaa;
          transition: all 0.3s ease;
        }
        .step-circle.active {
          background: #87A878;
          border-color: #87A878;
          color: white;
          box-shadow: 0 0 0 4px rgba(135, 168, 120, 0.22);
        }
        .step-circle.done {
          background: #6BA3BE;
          border-color: #6BA3BE;
          color: white;
        }
        .step-line {
          width: 48px;
          height: 2px;
          background: #e0ddd5;
          margin: 0 2px;
          transition: background 0.3s ease;
        }
        .step-line.done {
          background: #6BA3BE;
        }
        .step-label {
          text-align: center;
          font-size: 0.75rem;
          color: #9a9a8a;
          letter-spacing: 0.04em;
          margin: 0.35rem 0 1.6rem;
          font-family: 'Courier New', monospace;
          text-transform: uppercase;
        }

        /* ── Header ── */
        .create-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .create-title {
          font-size: 2rem;
          font-weight: 700;
          color: #2D2D2D;
          line-height: 1.15;
          margin: 0 0 0.6rem;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: baseline;
          gap: 0;
        }
        .title-char {
          display: inline-block;
          animation: charBounce 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes charBounce {
          from { opacity: 0; transform: translateY(16px) rotate(-4deg); }
          to   { opacity: 1; transform: translateY(0) rotate(0deg); }
        }
        .title-emoji {
          margin-left: 0.25rem;
          font-size: 1.9rem;
          animation: emojiFloat 3s ease-in-out infinite;
          display: inline-block;
        }
        @keyframes emojiFloat {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50%       { transform: translateY(-6px) rotate(5deg); }
        }
        .create-subtitle {
          font-size: 0.88rem;
          color: #777;
          margin: 0;
          line-height: 1.55;
          font-family: 'Georgia', serif;
          font-style: italic;
        }

        /* ── Form ── */
        .form-section {
          display: flex;
          flex-direction: column;
          gap: 1.4rem;
        }
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }
        .field-label {
          font-size: 0.83rem;
          font-weight: 700;
          color: #2D2D2D;
          letter-spacing: 0.03em;
          font-family: 'Courier New', monospace;
          text-transform: uppercase;
        }
        .input-wrap {
          position: relative;
        }
        .text-input {
          width: 100%;
          padding: 0.75rem 3.5rem 0.75rem 1rem;
          border: 2px solid #e0ddd5;
          border-radius: 12px;
          font-size: 1rem;
          color: #2D2D2D;
          background: rgba(255, 255, 255, 0.8);
          font-family: 'Georgia', serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .text-input::placeholder { color: #bbb; }
        .text-input:focus {
          border-color: #87A878;
          box-shadow: 0 0 0 3px rgba(135, 168, 120, 0.18);
        }
        .text-input.input-error {
          border-color: #e07070;
          box-shadow: 0 0 0 3px rgba(224, 112, 112, 0.14);
        }
        .char-counter {
          position: absolute;
          right: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.72rem;
          color: #aaa;
          font-family: 'Courier New', monospace;
          transition: color 0.2s;
          pointer-events: none;
        }
        .char-counter.counter-warn { color: #e07070; }

        /* Select */
        .select-wrap {
          position: relative;
        }
        .select-input {
          width: 100%;
          padding: 0.75rem 2.5rem 0.75rem 1rem;
          border: 2px solid #e0ddd5;
          border-radius: 12px;
          font-size: 1rem;
          color: #2D2D2D;
          background: rgba(255, 255, 255, 0.8);
          font-family: 'Georgia', serif;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .select-input.placeholder-selected { color: #bbb; }
        .select-input:focus {
          border-color: #6BA3BE;
          box-shadow: 0 0 0 3px rgba(107, 163, 190, 0.18);
        }
        .select-input.input-error {
          border-color: #e07070;
        }
        .select-arrow {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1rem;
          color: #aaa;
          pointer-events: none;
        }

        /* Error text */
        .field-error {
          font-size: 0.78rem;
          color: #e07070;
          margin: 0;
          font-family: 'Courier New', monospace;
          animation: errorIn 0.2s ease;
        }
        @keyframes errorIn {
          from { opacity: 0; transform: translateX(-4px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* Preview pill */
        .preview-pill {
          background: linear-gradient(135deg, rgba(135, 168, 120, 0.14), rgba(184, 169, 201, 0.14));
          border: 1.5px solid rgba(135, 168, 120, 0.3);
          border-radius: 50px;
          padding: 0.55rem 1.1rem;
          font-size: 0.83rem;
          color: #2D2D2D;
          text-align: center;
          font-family: 'Georgia', serif;
          font-style: italic;
          animation: pillIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes pillIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        .preview-pill strong {
          color: #87A878;
          font-style: normal;
        }

        /* Next button */
        .next-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.85rem 1.5rem;
          background: linear-gradient(135deg, #87A878, #6BA3BE);
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 1rem;
          font-weight: 700;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: transform 0.18s, box-shadow 0.18s, opacity 0.18s;
          box-shadow: 0 4px 18px rgba(107, 163, 190, 0.3);
          margin-top: 0.3rem;
        }
        .next-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(107, 163, 190, 0.38);
        }
        .next-btn:active {
          transform: translateY(0);
          opacity: 0.88;
        }

        /* ── Responsive ── */
        @media (max-width: 520px) {
          .create-card {
            padding: 2rem 1.25rem 2.25rem;
            border-radius: 20px;
          }
          .create-title { font-size: 1.55rem; }
          .step-line { width: 32px; }
        }
      `}</style>
    </div>
  );
}