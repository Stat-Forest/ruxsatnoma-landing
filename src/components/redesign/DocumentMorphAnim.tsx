import React, { useState, useEffect, useRef, useId } from 'react';
import { ShieldCheck, Trees, RefreshCw } from 'lucide-react';

export interface DocumentMorphAnimProps {
  /** Optional custom CSS classes for the container */
  className?: string;
  /** Whether mouse tilt parallax is enabled (default: true) */
  interactive?: boolean;
  /** Optional badge text or subtitle */
  badgeText?: string;
  /** Width in pixels or CSS string (default: 100%) */
  width?: string | number;
}

/**
 * Option B — "Document Transforms Into Nature" Animation
 *
 * A floating, semi-transparent government permit document with an authentic QR code
 * that slowly rotates in 3D space with gentle parallax. Its geometric boundaries
 * organically morph and branch into leaf contours and tree silhouettes, visually
 * symbolizing the synthesis between digital governance and ecological conservation.
 */
export function DocumentMorphAnim({
  className = '',
  interactive = true,
  badgeText = "O'zbekiston Respublikasi O'rmon Fondi",
  width = '100%',
}: DocumentMorphAnimProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Mouse tilt / parallax state (normalized -1 to 1)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [morphMode, setMorphMode] = useState<'bloom' | 'subtle'>('bloom');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const filterId = useId();

  // Accessibility: detect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Smooth lerp interpolation for 3D mouse parallax
  useEffect(() => {
    if (prefersReducedMotion) return;

    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const updatePosition = () => {
      setMousePos((prev) => ({
        x: lerp(prev.x, targetPos.x, 0.08),
        y: lerp(prev.y, targetPos.y, 0.08),
      }));
      animFrameRef.current = requestAnimationFrame(updatePosition);
    };

    animFrameRef.current = requestAnimationFrame(updatePosition);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [targetPos, prefersReducedMotion]);

  // Handle pointer movements
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || prefersReducedMotion) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    setTargetPos({
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTargetPos({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Calculated 3D rotation angles
  const rotateX = prefersReducedMotion ? 0 : -mousePos.y * 14;
  const rotateY = prefersReducedMotion ? 0 : mousePos.x * 18;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ width }}
      className={`relative select-none flex items-center justify-center p-4 md:p-8 ${className}`}
      aria-label="Animatsiyalangan Ruxsatnoma - Raqamli hujjat tabiat bilan uyg'unlashuvi"
    >
      {/* Perspective Container */}
      <div
        className="relative w-full max-w-[540px] aspect-[4/5] sm:aspect-[4.2/5] flex items-center justify-center"
        style={{ perspective: '1200px' }}
      >
        {/* Ambient Back Glow & Particle Field */}
        <div
          className="absolute inset-0 -z-10 rounded-full blur-3xl opacity-40 transition-opacity duration-700 pointer-events-none"
          style={{
            background: isHovered
              ? 'radial-gradient(circle, rgba(46, 204, 113, 0.45) 0%, rgba(15, 61, 46, 0.35) 45%, transparent 75%)'
              : 'radial-gradient(circle, rgba(46, 204, 113, 0.28) 0%, rgba(15, 61, 46, 0.2) 45%, transparent 75%)',
            transform: `translate3d(${mousePos.x * 20}px, ${mousePos.y * 20}px, -40px)`,
          }}
        />

        {/* 3D Floating Master Document Frame */}
        <div
          className="relative w-full h-full will-change-transform transition-transform ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: prefersReducedMotion
              ? 'none'
              : `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0px)`,
            transitionDuration: isHovered ? '120ms' : '600ms',
          }}
        >
          {/* Subtle Idle Hover Floating Animation */}
          <div
            className={`w-full h-full relative ${
              prefersReducedMotion ? '' : 'animate-[floatingDoc_6s_ease-in-out_infinite]'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* SVG Master Illustration: Morphing Permit Document & Edge Nature Silhouettes */}
            <svg
              viewBox="0 0 540 680"
              className="w-full h-full overflow-visible drop-shadow-[0_24px_48px_rgba(5,28,18,0.45)]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Emerald Gradient for Document Edge */}
                <linearGradient id={`${filterId}-docBorder`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3CCB7F" stopOpacity="0.9" />
                  <stop offset="40%" stopColor="#2ECC71" stopOpacity="0.65" />
                  <stop offset="75%" stopColor="#1B4A2E" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#7FB98A" stopOpacity="0.95" />
                </linearGradient>

                {/* Translucent Glass Fill */}
                <linearGradient id={`${filterId}-docGlass`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0F3D2E" stopOpacity="0.88" />
                  <stop offset="50%" stopColor="#143A26" stopOpacity="0.82" />
                  <stop offset="100%" stopColor="#0B2619" stopOpacity="0.92" />
                </linearGradient>

                {/* Holographic Seal Shimmer */}
                <linearGradient id={`${filterId}-hologram`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.8">
                    <animate
                      attributeName="stop-color"
                      values="#6EE7B7;#93C5FD;#FDE68A;#86EFAC;#6EE7B7"
                      dur="8s"
                      repeatCount="indefinite"
                    />
                  </stop>
                  <stop offset="50%" stopColor="#34D399" stopOpacity="0.6">
                    <animate
                      attributeName="stop-color"
                      values="#34D399;#60A5FA;#FBBF24;#4ADE80;#34D399"
                      dur="8s"
                      repeatCount="indefinite"
                    />
                  </stop>
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.9" />
                </linearGradient>

                {/* Laser scan line gradient */}
                <linearGradient id={`${filterId}-scanBeam`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2ECC71" stopOpacity="0" />
                  <stop offset="50%" stopColor="#3CCB7F" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#2ECC71" stopOpacity="0" />
                </linearGradient>

                {/* Blur filter for glowing lights */}
                <filter id={`${filterId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* ─────────────────────────────────────────────────────────────
                  LAYER 0: Edge Morphing Leaf Shapes & Sprouting Tree Silhouettes
                  (Right & Top-Right Margins where the Document converts to Nature)
                  ───────────────────────────────────────────────────────────── */}
              <g
                id="morphing-foliage-background"
                className="transition-all duration-700"
                opacity={morphMode === 'bloom' ? 0.95 : 0.6}
              >
                {/* Sprouting Oak & Beech Leaves emerging directly from Right Edge */}
                <g className="animate-[gentleSway_5s_ease-in-out_infinite]" transform-origin="430 200">
                  {/* Leaf 1 (Top-Right High Canopy) */}
                  <path
                    d="M 430 140 C 470 120, 505 135, 520 165 C 500 185, 470 180, 430 170 Z"
                    fill="#1F613F"
                    stroke="#3CCB7F"
                    strokeWidth="1.6"
                    opacity="0.9"
                  />
                  <path d="M 430 155 Q 475 150 520 165" stroke="#7FB98A" strokeWidth="1.2" fill="none" />
                  <path d="M 460 152 Q 470 142 485 140" stroke="#7FB98A" strokeWidth="1" fill="none" opacity="0.7" />
                  <path d="M 470 156 Q 480 168 495 170" stroke="#7FB98A" strokeWidth="1" fill="none" opacity="0.7" />
                </g>

                {/* Leaf 2 (Mid-Right Lush Leaf Cluster) */}
                <g className="animate-[gentleSway_6s_ease-in-out_infinite_1s]" transform-origin="435 290">
                  <path
                    d="M 435 240 C 485 220, 530 250, 535 295 C 490 310, 455 295, 435 270 Z"
                    fill="#164A2F"
                    stroke="#2ECC71"
                    strokeWidth="1.8"
                    opacity="0.95"
                  />
                  {/* Leaf Veins */}
                  <path d="M 435 255 C 470 265, 500 280, 535 295" stroke="#8FE0A6" strokeWidth="1.2" fill="none" />
                  <path d="M 460 262 Q 480 250 500 248" stroke="#8FE0A6" strokeWidth="0.9" fill="none" opacity="0.8" />
                  <path d="M 480 273 Q 495 290 515 292" stroke="#8FE0A6" strokeWidth="0.9" fill="none" opacity="0.8" />
                </g>

                {/* Leaf 3 (Lower-Right Curling Sprout) */}
                <g className="animate-[gentleSway_7s_ease-in-out_infinite_2s]" transform-origin="430 420">
                  <path
                    d="M 430 380 C 470 375, 505 405, 510 440 C 475 450, 445 430, 430 410 Z"
                    fill="#1B5436"
                    stroke="#3CCB7F"
                    strokeWidth="1.5"
                    opacity="0.85"
                  />
                  <path d="M 430 395 Q 465 410 510 440" stroke="#7FB98A" strokeWidth="1" fill="none" />
                </g>

                {/* Conifer / Pine Tree Silhouettes emerging from Edge (Right Margin) */}
                <g id="conifer-silhouettes" opacity="0.85">
                  {/* Conifer 1: Slender Mountain Pine */}
                  <g transform="translate(432, 190) scale(0.65)" fill="#0B2B19" stroke="#2ECC71" strokeWidth="1.2">
                    <path d="M 30 -65 L 42 -40 L 36 -40 L 48 -15 L 40 -15 L 56 15 L 4 15 L 20 -15 L 12 -15 L 24 -40 L 18 -40 Z" />
                    <rect x="28" y="15" width="4" height="12" fill="#3E2E1C" stroke="none" />
                  </g>

                  {/* Conifer 2: Grand Cypress / Fir at Bottom Right */}
                  <g transform="translate(426, 460) scale(0.85)" fill="#092415" stroke="#3CCB7F" strokeWidth="1.4">
                    <path d="M 32 -80 L 46 -50 L 39 -50 L 54 -20 L 44 -20 L 62 18 L 2 18 L 20 -20 L 10 -20 L 25 -50 L 18 -50 Z" />
                    <rect x="29" y="18" width="6" height="15" fill="#3E2E1C" stroke="none" />
                  </g>

                  {/* Conifer 3: Top-Edge Horizon Silhouette */}
                  <g transform="translate(350, 60) scale(0.45)" fill="#0E331E" stroke="#2ECC71" strokeWidth="1">
                    <path d="M 30 -70 L 45 -45 L 38 -45 L 50 -18 L 42 -18 L 58 14 L 2 14 L 18 -18 L 10 -18 L 22 -45 L 15 -45 Z" />
                  </g>
                </g>

                {/* Floating Spores & Nature Sparks floating off the edge */}
                <g id="drifting-particles">
                  <circle cx="480" cy="180" r="3" fill="#8FE0A6" opacity="0.8" className="animate-ping" />
                  <circle cx="510" cy="260" r="2.2" fill="#FDE68A" opacity="0.7" />
                  <circle cx="490" cy="340" r="3.5" fill="#3CCB7F" opacity="0.75" />
                  <circle cx="465" cy="460" r="2" fill="#8FE0A6" opacity="0.6" />
                  <circle cx="420" cy="50" r="2.5" fill="#2ECC71" opacity="0.8" />
                </g>
              </g>

              {/* ─────────────────────────────────────────────────────────────
                  LAYER 1: The Morphing Base Document Path
                  Morphs between a crisp rectangular card and an organic living contour
                  ───────────────────────────────────────────────────────────── */}
              <g id="document-base-card" filter="url(#glow)">
                {/* SVG SMIL Morphing Main Path */}
                <path
                  fill={`url(#${filterId}-docGlass)`}
                  stroke={`url(#${filterId}-docBorder)`}
                  strokeWidth="2.5"
                  className="transition-all duration-700"
                  d={
                    morphMode === 'bloom'
                      ? /* Organic Morph State: Right border curves and branches into leaf lobes & forest silhouette nodes */
                        `M 70 80 
                         C 180 75, 290 85, 360 76
                         C 390 72, 415 64, 430 84
                         C 436 110, 442 140, 435 170
                         C 455 185, 475 195, 450 220
                         C 432 235, 436 260, 448 285
                         C 470 305, 480 325, 445 350
                         C 430 365, 435 395, 455 425
                         C 470 445, 450 470, 430 490
                         C 432 525, 430 555, 420 580
                         C 410 598, 395 600, 360 600
                         L 70 600
                         C 52 600, 40 588, 40 570
                         L 40 110
                         C 40 92, 52 80, 70 80 Z`
                      : /* Clean Rectangular State with Smooth Rounded Corners */
                        `M 70 80 
                         L 410 80
                         C 426 80, 435 92, 435 110
                         L 435 570
                         C 435 588, 426 600, 410 600
                         L 70 600
                         C 52 600, 40 588, 40 570
                         L 40 110
                         C 40 92, 52 80, 70 80 Z`
                  }
                >
                  {/* Continuous ambient morph animation for browsers supporting SMIL */}
                  {!prefersReducedMotion && (
                    <animate
                      attributeName="d"
                      dur="10s"
                      repeatCount="indefinite"
                      values="
                        M 70 80 C 180 75, 290 85, 360 76 C 390 72, 415 64, 430 84 C 436 110, 442 140, 435 170 C 455 185, 475 195, 450 220 C 432 235, 436 260, 448 285 C 470 305, 480 325, 445 350 C 430 365, 435 395, 455 425 C 470 445, 450 470, 430 490 C 432 525, 430 555, 420 580 C 410 598, 395 600, 360 600 L 70 600 C 52 600, 40 588, 40 570 L 40 110 C 40 92, 52 80, 70 80 Z;
                        M 70 80 C 180 82, 290 78, 360 80 C 395 82, 420 72, 432 92 C 438 118, 448 145, 438 178 C 462 195, 482 205, 456 228 C 435 242, 440 268, 454 292 C 478 312, 486 332, 450 358 C 434 372, 438 402, 460 432 C 476 452, 454 476, 432 496 C 435 530, 432 558, 422 582 C 412 599, 396 600, 360 600 L 70 600 C 52 600, 40 588, 40 570 L 40 110 C 40 92, 52 80, 70 80 Z;
                        M 70 80 C 180 75, 290 85, 360 76 C 390 72, 415 64, 430 84 C 436 110, 442 140, 435 170 C 455 185, 475 195, 450 220 C 432 235, 436 260, 448 285 C 470 305, 480 325, 445 350 C 430 365, 435 395, 455 425 C 470 445, 450 470, 430 490 C 432 525, 430 555, 420 580 C 410 598, 395 600, 360 600 L 70 600 C 52 600, 40 588, 40 570 L 40 110 C 40 92, 52 80, 70 80 Z
                      "
                    />
                  )}
                </path>
              </g>

              {/* ─────────────────────────────────────────────────────────────
                  LAYER 2: Internal Security Watermark, Guilloché Curves & Seals
                  ───────────────────────────────────────────────────────────── */}
              <g id="document-security-elements">
                {/* Guilloché waves (faint topographic curves) */}
                <g stroke="#3CCB7F" strokeWidth="0.8" fill="none" opacity="0.18">
                  <path d="M 60 180 C 120 160, 180 200, 240 170 S 340 150, 410 180" />
                  <path d="M 60 200 C 130 180, 190 220, 250 190 S 350 170, 410 200" />
                  <path d="M 60 220 C 140 200, 200 240, 260 210 S 360 190, 410 220" />
                  <path d="M 60 480 C 140 460, 220 510, 300 480 S 380 470, 410 490" />
                  <path d="M 60 500 C 130 480, 210 530, 290 500 S 370 490, 410 510" />
                </g>

                {/* Center Forest Tree Silhouette Watermark */}
                <g transform="translate(180, 320) scale(1.6)" opacity="0.08" fill="#FFFFFF">
                  <path d="M 30 -60 L 45 -35 L 38 -35 L 52 -10 L 42 -10 L 60 25 L 0 25 L 18 -10 L 8 -10 L 22 -35 L 15 -35 Z" />
                </g>

                {/* Left Security Hologram Strip */}
                <rect
                  x="56"
                  y="96"
                  width="10"
                  height="488"
                  rx="4"
                  fill={`url(#${filterId}-hologram)`}
                  opacity="0.85"
                />
                {/* Hologram micro-etch patterns */}
                <g stroke="#FFFFFF" strokeWidth="1" opacity="0.6">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <line key={i} x1="56" y1={120 + i * 26} x2="66" y2={114 + i * 26} />
                  ))}
                </g>
              </g>

              {/* ─────────────────────────────────────────────────────────────
                  LAYER 3: Official Header & Typography (Permit Metadata)
                  ───────────────────────────────────────────────────────────── */}
              <g id="document-header" transform="translate(80, 115)">
                {/* Emblem Badge Shield */}
                <g transform="translate(0, 0)">
                  <circle cx="22" cy="22" r="22" fill="#143A26" stroke="#3CCB7F" strokeWidth="1.8" />
                  {/* Stylized Tree & Crescent */}
                  <path
                    d="M 22 8 L 28 17 L 25 17 L 31 26 L 26 26 L 33 34 L 11 34 L 18 26 L 13 26 L 19 17 L 16 17 Z"
                    fill="#3CCB7F"
                  />
                  <rect x="20.5" y="34" width="3" height="4" fill="#8FE0A6" />
                </g>

                {/* State Agency Title */}
                <text x="56" y="15" fill="#8FE0A6" fontSize="9" fontWeight="700" letterSpacing="1.2">
                  {badgeText.toUpperCase()}
                </text>
                <text x="56" y="27" fill="#E4F5EA" fontSize="10.5" fontWeight="800" letterSpacing="0.4">
                  DAVLAT O'RMON XO'JALIGI PORTALI
                </text>
                <text x="56" y="38" fill="#9CCBA4" fontSize="8" fontWeight="500">
                  Elektron Ruxsatnoma Tizimi • Yagona Reyestr
                </text>

                {/* Divider Line */}
                <line x1="0" y1="52" x2="320" y2="52" stroke="#2ECC71" strokeWidth="1.2" opacity="0.4" />
              </g>

              {/* Document Certificate Category Title */}
              <g id="document-title" transform="translate(80, 192)">
                <rect x="0" y="0" width="168" height="22" rx="11" fill="#1B4D35" opacity="0.9" />
                <circle cx="11" cy="11" r="4.5" fill="#2ECC71" />
                <text x="22" y="14" fill="#E4F5EA" fontSize="9" fontWeight="700" letterSpacing="0.6">
                  MAXSUS FOYDALANISH
                </text>

                <text x="0" y="44" fill="#FFFFFF" fontSize="17" fontWeight="800" letterSpacing="-0.3">
                  Elektron Ruxsatnoma
                </text>
                <text x="0" y="60" fill="#8FE0A6" fontSize="11" fontWeight="600" letterSpacing="0.8">
                  № UZ-2026-8941-ORM
                </text>
              </g>

              {/* ─────────────────────────────────────────────────────────────
                  LAYER 4: The Authentic Interactive QR Code & Scanner Beam
                  ───────────────────────────────────────────────────────────── */}
              <g id="qr-code-section" transform="translate(80, 275)">
                {/* QR Code Container Glass Card */}
                <rect
                  x="0"
                  y="0"
                  width="132"
                  height="132"
                  rx="14"
                  fill="#FFFFFF"
                  stroke="#3CCB7F"
                  strokeWidth="2.5"
                  className="shadow-lg"
                />

                {/* The QR Matrix (Detailed Vector SVG) */}
                <g fill="#0F3D2E" transform="translate(10, 10)">
                  {/* Top-Left Finder Square (7x7 module) */}
                  <rect x="0" y="0" width="32" height="32" rx="4" />
                  <rect x="4" y="4" width="24" height="24" rx="2" fill="#FFFFFF" />
                  <rect x="8" y="8" width="16" height="16" rx="2" fill="#0F3D2E" />

                  {/* Top-Right Finder Square */}
                  <rect x="80" y="0" width="32" height="32" rx="4" />
                  <rect x="84" y="4" width="24" height="24" rx="2" fill="#FFFFFF" />
                  <rect x="88" y="8" width="16" height="16" rx="2" fill="#0F3D2E" />

                  {/* Bottom-Left Finder Square */}
                  <rect x="0" y="80" width="32" height="32" rx="4" />
                  <rect x="4" y="84" width="24" height="24" rx="2" fill="#FFFFFF" />
                  <rect x="8" y="88" width="16" height="16" rx="2" fill="#0F3D2E" />

                  {/* Timing Patterns */}
                  <rect x="36" y="12" width="6" height="6" />
                  <rect x="48" y="12" width="6" height="6" />
                  <rect x="60" y="12" width="6" height="6" />
                  <rect x="70" y="12" width="6" height="6" />
                  <rect x="12" y="36" width="6" height="6" />
                  <rect x="12" y="48" width="6" height="6" />
                  <rect x="12" y="60" width="6" height="6" />
                  <rect x="12" y="70" width="6" height="6" />

                  {/* Internal Data Dots Matrix */}
                  <rect x="38" y="38" width="8" height="8" rx="1.5" fill="#1E8A4C" />
                  <rect x="52" y="38" width="8" height="8" rx="1.5" />
                  <rect x="66" y="38" width="8" height="8" rx="1.5" fill="#1E8A4C" />
                  <rect x="38" y="52" width="8" height="8" rx="1.5" />
                  <rect x="66" y="52" width="8" height="8" rx="1.5" />
                  <rect x="38" y="66" width="8" height="8" rx="1.5" fill="#1E8A4C" />
                  <rect x="52" y="66" width="8" height="8" rx="1.5" />
                  <rect x="66" y="66" width="8" height="8" rx="1.5" fill="#1E8A4C" />

                  <rect x="84" y="40" width="6" height="6" />
                  <rect x="94" y="40" width="6" height="6" />
                  <rect x="84" y="52" width="6" height="6" fill="#1E8A4C" />
                  <rect x="100" y="52" width="6" height="6" />
                  <rect x="90" y="64" width="6" height="6" fill="#1E8A4C" />
                  <rect x="102" y="64" width="6" height="6" />
                  <rect x="84" y="74" width="6" height="6" />
                  <rect x="96" y="74" width="6" height="6" />

                  <rect x="40" y="84" width="6" height="6" fill="#1E8A4C" />
                  <rect x="52" y="84" width="6" height="6" />
                  <rect x="64" y="84" width="6" height="6" fill="#1E8A4C" />
                  <rect x="40" y="96" width="6" height="6" />
                  <rect x="52" y="96" width="6" height="6" fill="#1E8A4C" />
                  <rect x="64" y="96" width="6" height="6" />
                  <rect x="74" y="96" width="6" height="6" />

                  {/* Center Brand Badge (Emerald Tree in QR) */}
                  <rect x="48" y="48" width="16" height="16" rx="3" fill="#0F3D2E" stroke="#2ECC71" strokeWidth="1.5" />
                  <path d="M 56 51 L 60 57 L 57.5 57 L 62 62 L 50 62 L 54.5 57 L 52 57 Z" fill="#2ECC71" />
                </g>

                {/* Laser Scanning Line Animation */}
                {!prefersReducedMotion && (
                  <g className="pointer-events-none">
                    <line
                      x1="6"
                      y1="0"
                      x2="126"
                      y2="0"
                      stroke="#2ECC71"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity="0.9"
                    >
                      <animate
                        attributeName="y1"
                        values="10;122;10"
                        dur="3.5s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="y2"
                        values="10;122;10"
                        dur="3.5s"
                        repeatCount="indefinite"
                      />
                    </line>
                    {/* Beam Glow */}
                    <rect
                      x="6"
                      y="0"
                      width="120"
                      height="12"
                      fill={`url(#${filterId}-scanBeam)`}
                    >
                      <animate
                        attributeName="y"
                        values="4;116;4"
                        dur="3.5s"
                        repeatCount="indefinite"
                      />
                    </rect>
                  </g>
                )}
              </g>

              {/* ─────────────────────────────────────────────────────────────
                  LAYER 5: Document Metadata Columns & Verification Pills
                  ───────────────────────────────────────────────────────────── */}
              <g id="metadata-fields" transform="translate(228, 280)">
                {/* Field 1: Area / Plot */}
                <text x="0" y="10" fill="#8FE0A6" fontSize="8.5" fontWeight="600" letterSpacing="0.8">
                  HUDUD VA MAYDON
                </text>
                <text x="0" y="25" fill="#FFFFFF" fontSize="12" fontWeight="700">
                  Zomin O'rmon xo'jaligi
                </text>
                <text x="0" y="38" fill="#C9D6CE" fontSize="9.5" fontWeight="400">
                  14-kvartal, 2.4 gektar yer
                </text>

                {/* Field 2: Expiry & Validity */}
                <text x="0" y="64" fill="#8FE0A6" fontSize="8.5" fontWeight="600" letterSpacing="0.8">
                  AMAL QILISH MUDDATI
                </text>
                <text x="0" y="79" fill="#FFFFFF" fontSize="12" fontWeight="700">
                  2026.11.01 gacha
                </text>
                <text x="0" y="92" fill="#C9D6CE" fontSize="9.5" fontWeight="400">
                  Mavsumiy ruxsat berilgan
                </text>

                {/* Status Verified Pill */}
                <g transform="translate(0, 108)">
                  <rect x="0" y="0" width="128" height="26" rx="13" fill="#14462B" stroke="#2ECC71" strokeWidth="1.2" />
                  <circle cx="13" cy="13" r="4.5" fill="#2ECC71" />
                  <text x="24" y="16.5" fill="#E4F5EA" fontSize="9.5" fontWeight="800" letterSpacing="0.5">
                    TASDIQLANGAN
                  </text>
                </g>
              </g>

              {/* ─────────────────────────────────────────────────────────────
                  LAYER 6: Document Bottom Footer & Security Hash
                  ───────────────────────────────────────────────────────────── */}
              <g id="document-footer" transform="translate(80, 442)">
                <line x1="0" y1="0" x2="320" y2="0" stroke="#2ECC71" strokeWidth="1" opacity="0.3" />

                {/* Microtext & Cryptographic Hash */}
                <text x="0" y="16" fill="#7FB98A" fontSize="8" fontFamily="monospace" letterSpacing="0.5">
                  HASH: 8f4c29d10e6a37b42c99a0e1f3d45c82
                </text>

                {/* Service Icons Row in Permit Footer */}
                <g transform="translate(0, 32)">
                  {/* Grazing / Livestock indicator */}
                  <g transform="translate(0, 0)">
                    <rect width="28" height="28" rx="8" fill="#143A26" stroke="#3CCB7F" strokeWidth="1" opacity="0.85" />
                    <circle cx="14" cy="14" r="5" fill="#8FE0A6" />
                  </g>
                  {/* Haymaking / Harvest indicator */}
                  <g transform="translate(36, 0)">
                    <rect width="28" height="28" rx="8" fill="#143A26" stroke="#3CCB7F" strokeWidth="1" opacity="0.85" />
                    <path d="M 9 19 L 14 9 L 19 19 Z" fill="#FDE68A" />
                  </g>
                  {/* Beekeeping indicator */}
                  <g transform="translate(72, 0)">
                    <rect width="28" height="28" rx="8" fill="#143A26" stroke="#3CCB7F" strokeWidth="1" opacity="0.85" />
                    <polygon points="14,9 19,12 19,17 14,20 9,17 9,12" fill="#E8C48C" />
                  </g>
                  {/* Eco-tourism indicator */}
                  <g transform="translate(108, 0)">
                    <rect width="28" height="28" rx="8" fill="#143A26" stroke="#3CCB7F" strokeWidth="1" opacity="0.85" />
                    <path d="M 9 20 L 14 10 L 19 20 Z" fill="#3CCB7F" />
                  </g>
                </g>

                {/* Official Electronic Signature Seal Stamp */}
                <g transform="translate(230, 20)">
                  <circle cx="34" cy="34" r="32" fill="none" stroke="#2ECC71" strokeWidth="1.8" strokeDasharray="5 3" opacity="0.7" />
                  <circle cx="34" cy="34" r="26" fill="#0F3D2E" stroke="#3CCB7F" strokeWidth="1.4" opacity="0.9" />
                  <text x="34" y="30" textAnchor="middle" fill="#8FE0A6" fontSize="6.5" fontWeight="700">
                    O'RMON PORTALI
                  </text>
                  <text x="34" y="39" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="800">
                    E-IMZO
                  </text>
                  <text x="34" y="47" textAnchor="middle" fill="#2ECC71" fontSize="5.5" fontWeight="600">
                    VERIFIED 2026
                  </text>
                </g>
              </g>
            </svg>

            {/* Floating 3D Badge Overlay (High translateZ for pop-out depth) */}
            <div
              className="absolute -bottom-4 left-6 sm:left-10 bg-[#0F3D2E]/90 backdrop-blur-md border border-[#2ECC71]/40 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-3 transition-transform duration-300"
              style={{
                transform: 'translateZ(42px)',
              }}
            >
              <div className="w-8 h-8 rounded-xl bg-[#2ECC71]/20 border border-[#2ECC71]/40 flex items-center justify-center text-[#2ECC71]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-[#8FE0A6] font-semibold uppercase tracking-wider">
                  Raqamli Muhofaza
                </div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  Tabiat va Qonun uyg'unligi
                  <span className="inline-block w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
                </div>
              </div>
            </div>

            {/* Quick Interactive Morph Trigger Button (Top Right Floating Pill) */}
            <button
              type="button"
              onClick={() => setMorphMode((prev) => (prev === 'bloom' ? 'subtle' : 'bloom'))}
              className="absolute -top-3 right-6 sm:right-8 bg-[#0F3D2E]/90 hover:bg-[#144D3A] text-white backdrop-blur-md border border-[#3CCB7F]/40 rounded-full px-3 py-1.5 text-xs font-medium shadow-xl flex items-center gap-1.5 transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
              style={{ transform: 'translateZ(36px)' }}
              title="Hujjat va tabiat morfizm holatini o'zgartirish"
            >
              <Trees className="w-3.5 h-3.5 text-[#2ECC71]" />
              <span className="text-[11px] text-[#E4F5EA]">
                {morphMode === 'bloom' ? "O'rmon shakli: Faol" : 'Klassik chegara'}
              </span>
              <RefreshCw className="w-3 h-3 text-[#8FE0A6] ml-0.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>

      {/* Keyframe styles for gentle floating, sways and morph effects */}
      <style>{`
        @keyframes floatingDoc {
          0%, 100% {
            transform: translateY(0px) rotateZ(0deg);
          }
          50% {
            transform: translateY(-10px) rotateZ(-0.8deg);
          }
        }

        @keyframes gentleSway {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(4deg);
          }
        }
      `}</style>
    </div>
  );
}

export default DocumentMorphAnim;
