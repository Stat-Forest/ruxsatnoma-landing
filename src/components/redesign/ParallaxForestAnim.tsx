import React, { useEffect, useRef, useState, useMemo, useCallback, useId } from 'react';

export interface ParallaxForestAnimProps {
  /** Optional custom CSS classes for the container */
  className?: string;
  /** Whether mouse/touch movement creates interactive parallax depth */
  interactive?: boolean;
  /** Whether idle ambient swaying motion is active */
  ambientMotion?: boolean;
  /** Whether falling and swirling leaves are rendered */
  showLeaves?: boolean;
  /** Number of floating leaves in the scene */
  leafCount?: number;
  /** Whether drifting mist bands are shown */
  showMist?: boolean;
  /** Whether gentle sun rays & celestial glow are visible */
  showSunRays?: boolean;
  /** Whether ambient glowing spores/fireflies are shown */
  showFireflies?: boolean;
  /** Color theme palette */
  theme?: 'emerald' | 'morning' | 'dusk' | 'night';
  /** Child elements to overlay on top of the animation (e.g. hero copy, search bar) */
  children?: React.ReactNode;
  /** Accessible label for the graphic */
  ariaLabel?: string;
  /** Optional click handler or navigation trigger */
  onClick?: () => void;
}

interface LeafParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  phase: number;
  opacity: number;
  type: 0 | 1 | 2; // 0 = birch/beech, 1 = lobed oak, 2 = willow needle
  color: string;
  depth: 'back' | 'mid' | 'front';
}

interface FireflyParticle {
  id: number;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  pulseSpeed: number;
  driftSpeed: number;
  phase: number;
}

// Deterministic pseudo-random generator for reproducible initial layout
function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * Option C: Multi-layer Parallax Forest SVG & React Animation
 *
 * Visual layers:
 * 1. Sky, atmosphere, sun rays & topographic isolines
 * 2. Distant mountains with facet shading and mountain-ridge conifers
 * 3. Mid-ground rolling forest hills, dense conifer treeline and ranger tower
 * 4. Foreground majestic pines, ancient oak canopy, meadow ferns and grasses
 * 5. Top framing canopy overhang branches
 * 6. Floating particle leaves drifting and swirling in wind currents
 *
 * Interactive capabilities:
 * - Pointer-tracking parallax depth with smooth spring/lerp dampening
 * - Interactive wind disturbance: cursor velocity blows floating leaves
 * - Subtle ambient breathing sway when idle
 * - Automatic pause via IntersectionObserver and Page Visibility API
 * - Full prefers-reduced-motion accessibility support
 */
export function ParallaxForestAnim({
  className = '',
  interactive = true,
  ambientMotion = true,
  showLeaves = true,
  leafCount = 28,
  showMist = true,
  showSunRays = true,
  showFireflies = true,
  theme = 'emerald',
  children,
  ariaLabel = 'Parallax forest illustration with mountains, trees and floating leaves',
  onClick,
}: ParallaxForestAnimProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const uid = useId().replace(/:/g, '');

  // Gradient element unique IDs
  const gradIds = useMemo(
    () => ({
      sky: `pfa-sky-${uid}`,
      sunGlow: `pfa-sun-glow-${uid}`,
      mountFar: `pfa-mount-far-${uid}`,
      mountMid: `pfa-mount-mid-${uid}`,
      midForest: `pfa-mid-forest-${uid}`,
      frontForest: `pfa-front-forest-${uid}`,
      mist: `pfa-mist-${uid}`,
      bark: `pfa-bark-${uid}`,
    }),
    [uid]
  );

  // Parallax offsets (normalized: -1 to 1)
  const targetOffsetRef = useRef({ x: 0, y: 0 });
  const currentOffsetRef = useRef({ x: 0, y: 0 });

  // Mouse wind disturbance for leaves
  const pointerVelRef = useRef({ x: 0, y: 0 });
  const lastPointerPos = useRef<{ x: number; y: number; time: number } | null>(null);

  // Visible state for low-overhead component updates
  const [motionOffset, setMotionOffset] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  // Intersection observer to stop animation when not in viewport
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !containerRef.current ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Document visibility change listener
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleVisChange = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisChange);
    return () => document.removeEventListener('visibilitychange', handleVisChange);
  }, []);

  // Initialize leaf particles
  const leavesRef = useRef<LeafParticle[]>([]);
  if (leavesRef.current.length === 0 && showLeaves) {
    const rng = createRng(42819);
    const leafColors =
      theme === 'dusk'
        ? ['#F59E0B', '#D97706', '#B45309', '#FBBF24', '#78350F']
        : theme === 'night'
        ? ['#34D399', '#10B981', '#059669', '#6EE7B7', '#A7F3D0']
        : ['#4ADE80', '#22C55E', '#16A34A', '#86EFAC', '#FBBF24', '#34D399', '#84CC16'];

    const depths: ('back' | 'mid' | 'front')[] = ['back', 'mid', 'front'];

    leavesRef.current = Array.from({ length: leafCount }, (_, i) => {
      const type = (Math.floor(rng() * 3) % 3) as 0 | 1 | 2;
      const depth = depths[i % 3];
      const scaleByDepth = depth === 'front' ? 1.3 : depth === 'mid' ? 1.0 : 0.7;

      return {
        id: i,
        x: rng() * 1440,
        y: rng() * 680,
        vx: 0.6 + rng() * 1.4,
        vy: 0.5 + rng() * 1.2,
        size: (12 + rng() * 14) * scaleByDepth,
        rotation: rng() * 360,
        rotSpeed: (rng() - 0.5) * 2.4,
        wobbleSpeed: 1.2 + rng() * 1.8,
        wobbleAmp: 18 + rng() * 26,
        phase: rng() * Math.PI * 2,
        opacity: (0.45 + rng() * 0.5) * (depth === 'front' ? 1 : 0.8),
        type,
        color: leafColors[Math.floor(rng() * leafColors.length)],
        depth,
      };
    });
  }

  // Initialize firefly / spore particles
  const firefliesRef = useRef<FireflyParticle[]>([]);
  if (firefliesRef.current.length === 0 && showFireflies) {
    const rng = createRng(99123);
    firefliesRef.current = Array.from({ length: 18 }, (_, i) => {
      const baseX = 80 + rng() * 1280;
      const baseY = 240 + rng() * 400;
      return {
        id: i,
        x: baseX,
        y: baseY,
        baseX,
        baseY,
        radius: 1.8 + rng() * 2.4,
        pulseSpeed: 1.5 + rng() * 2.5,
        driftSpeed: 0.6 + rng() * 1.2,
        phase: rng() * Math.PI * 2,
      };
    });
  }

  // Animation frame loop for continuous leaf motion & smooth parallax dampening
  const [, setRenderTick] = useState(0);

  useEffect(() => {
    if (reducedMotion || !isVisible) return;

    let animTime = 0;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      animTime += dt;

      // Ambient idle oscillation if no interactive input or smoothly blended
      if (ambientMotion) {
        const ambientX = Math.sin(animTime * 0.4) * 0.18 + Math.cos(animTime * 0.25) * 0.08;
        const ambientY = Math.cos(animTime * 0.35) * 0.12;

        // Blend ambient with target
        const combinedTargetX = targetOffsetRef.current.x * 0.85 + ambientX;
        const combinedTargetY = targetOffsetRef.current.y * 0.85 + ambientY;

        // Lerp current offset toward target
        currentOffsetRef.current.x += (combinedTargetX - currentOffsetRef.current.x) * 0.06;
        currentOffsetRef.current.y += (combinedTargetY - currentOffsetRef.current.y) * 0.06;
      } else {
        currentOffsetRef.current.x += (targetOffsetRef.current.x - currentOffsetRef.current.x) * 0.08;
        currentOffsetRef.current.y += (targetOffsetRef.current.y - currentOffsetRef.current.y) * 0.08;
      }

      // Decay wind disturbance velocity
      pointerVelRef.current.x *= 0.92;
      pointerVelRef.current.y *= 0.92;

      // Update leaves
      if (showLeaves) {
        const windX = pointerVelRef.current.x * 0.4;
        const windY = pointerVelRef.current.y * 0.3;

        for (const leaf of leavesRef.current) {
          // Horizontal sway with sinusoidal wobble
          const wobble = Math.sin(animTime * leaf.wobbleSpeed + leaf.phase) * leaf.wobbleAmp;
          leaf.x += (leaf.vx + windX + wobble * 0.03) * (dt * 60);
          leaf.y += (leaf.vy + windY) * (dt * 60);
          leaf.rotation += leaf.rotSpeed * (dt * 60);

          // Wrap boundaries (viewBox 1440 x 680)
          if (leaf.x > 1490) {
            leaf.x = -40;
            leaf.y = Math.random() * 640;
          } else if (leaf.x < -50) {
            leaf.x = 1480;
          }

          if (leaf.y > 700) {
            leaf.y = -30;
            leaf.x = Math.random() * 1440;
          }
        }
      }

      // Update fireflies
      if (showFireflies) {
        for (const f of firefliesRef.current) {
          f.x = f.baseX + Math.sin(animTime * f.driftSpeed + f.phase) * 32;
          f.y = f.baseY + Math.cos(animTime * (f.driftSpeed * 0.8) + f.phase * 1.3) * 24;
        }
      }

      // Sync state for render
      setMotionOffset({
        x: currentOffsetRef.current.x,
        y: currentOffsetRef.current.y,
      });
      setRenderTick((prev) => (prev + 1) % 100000);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion, isVisible, ambientMotion, showLeaves, showFireflies]);

  // Pointer event handlers for interactive parallax
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive || reducedMotion || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      // Normalized coordinates from -1 to 1 centered at container middle
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      targetOffsetRef.current = {
        x: Math.max(-1, Math.min(1, normX)),
        y: Math.max(-1, Math.min(1, normY)),
      };

      // Measure pointer velocity to create wind gust
      const now = performance.now();
      if (lastPointerPos.current) {
        const dt = (now - lastPointerPos.current.time) / 1000;
        if (dt > 0.008 && dt < 0.2) {
          const dx = (e.clientX - lastPointerPos.current.x) / rect.width;
          const dy = (e.clientY - lastPointerPos.current.y) / rect.height;
          pointerVelRef.current = {
            x: Math.max(-4, Math.min(4, (dx / dt) * 1.5)),
            y: Math.max(-3, Math.min(3, (dy / dt) * 1.5)),
          };
        }
      }
      lastPointerPos.current = { x: e.clientX, y: e.clientY, time: now };
    },
    [interactive, reducedMotion]
  );

  const handlePointerLeave = useCallback(() => {
    if (!interactive) return;
    targetOffsetRef.current = { x: 0, y: 0 };
    lastPointerPos.current = null;
  }, [interactive]);

  // Theme palettes and gradients
  const themeStyles = useMemo(() => {
    switch (theme) {
      case 'morning':
        return {
          skyTop: '#0F2C24',
          skyMid: '#1D4D3D',
          skyBottom: '#3F7A62',
          sunColor: '#FDE68A',
          sunGlow: 'rgba(254, 240, 138, 0.35)',
          mountainFar: '#1E3A2F',
          mountainMid: '#163327',
          forestMid: '#194A33',
          forestFront: '#0F2D1F',
          groundFront: '#0A2016',
          mistOpacity: 0.38,
        };
      case 'dusk':
        return {
          skyTop: '#1E1B4B',
          skyMid: '#312E81',
          skyBottom: '#78350F',
          sunColor: '#F59E0B',
          sunGlow: 'rgba(245, 158, 11, 0.4)',
          mountainFar: '#2E294E',
          mountainMid: '#1E293B',
          forestMid: '#1B3B2B',
          forestFront: '#0F241A',
          groundFront: '#091811',
          mistOpacity: 0.32,
        };
      case 'night':
        return {
          skyTop: '#030D08',
          skyMid: '#061911',
          skyBottom: '#0D2D20',
          sunColor: '#E2E8F0',
          sunGlow: 'rgba(226, 232, 240, 0.25)',
          mountainFar: '#0A1B14',
          mountainMid: '#0E241B',
          forestMid: '#112E22',
          forestFront: '#081711',
          groundFront: '#040D09',
          mistOpacity: 0.2,
        };
      case 'emerald':
      default:
        return {
          skyTop: '#081C15',
          skyMid: '#123829',
          skyBottom: '#1F513B',
          sunColor: '#A7F3D0',
          sunGlow: 'rgba(167, 243, 208, 0.28)',
          mountainFar: '#163B2B',
          mountainMid: '#144330',
          forestMid: '#1B543B',
          forestFront: '#0E3321',
          groundFront: '#082115',
          mistOpacity: 0.35,
        };
    }
  }, [theme]);

  // Parallax layer transforms computed from normalized offset (-1..1)
  const layerTransforms = useMemo(() => {
    const { x, y } = motionOffset;
    return {
      sky: `translate(${x * -6}px, ${y * -3}px)`,
      sun: `translate(${x * -10}px, ${y * -5}px)`,
      distantMountains: `translate(${x * -24}px, ${y * -10}px)`,
      midForest: `translate(${x * -48}px, ${y * -18}px)`,
      midTrees: `translate(${x * -64}px, ${y * -24}px)`,
      foregroundForest: `translate(${x * -110}px, ${y * -40}px)`,
      canopyOverhang: `translate(${x * -140}px, ${y * -50}px)`,
    };
  }, [motionOffset]);

  // Leaf SVG path renderer based on type
  const renderLeafShape = (type: 0 | 1 | 2) => {
    switch (type) {
      case 0: // Birch / Beech leaf
        return (
          <path
            d="M0 -14 C5 -10 9 -2 6 8 C3 14 0 16 0 16 C0 16 -3 14 -6 8 C-9 -2 -5 -10 0 -14 Z"
            fill="currentColor"
          />
        );
      case 1: // Lobed Oak leaf
        return (
          <path
            d="M0 -15 C4 -13 7 -8 5 -4 C8 -2 8 4 5 7 C8 11 4 15 0 16 C-4 15 -8 11 -5 7 C-8 4 -8 -2 -5 -4 C-7 -8 -4 -13 0 -15 Z"
            fill="currentColor"
          />
        );
      case 2: // Willow / Needle cluster
        return (
          <path
            d="M0 -16 C3 -10 4 2 0 16 C-4 2 -3 -10 0 -16 M-1 -8 L3 -4 M1 0 L-3 4 M-1 8 L3 12"
            stroke="currentColor"
            strokeWidth="0.8"
            fill="currentColor"
          />
        );
    }
  };

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={ariaLabel}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
      style={{ touchAction: 'pan-y' }}
    >
      <svg
        viewBox="0 0 1440 680"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          {/* Sky Gradient */}
          <linearGradient id={gradIds.sky} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={themeStyles.skyTop} />
            <stop offset="45%" stopColor={themeStyles.skyMid} />
            <stop offset="100%" stopColor={themeStyles.skyBottom} />
          </linearGradient>

          {/* Sun Radial Glow */}
          <radialGradient id={gradIds.sunGlow} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={themeStyles.sunColor} stopOpacity="0.85" />
            <stop offset="35%" stopColor={themeStyles.sunColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={themeStyles.sunColor} stopOpacity="0.0" />
          </radialGradient>

          {/* Distant Mountain Gradients */}
          <linearGradient id={gradIds.mountFar} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={themeStyles.mountainFar} stopOpacity="0.95" />
            <stop offset="100%" stopColor={themeStyles.skyBottom} stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id={gradIds.mountMid} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={themeStyles.mountainMid} />
            <stop offset="100%" stopColor={themeStyles.mountainFar} stopOpacity="0.75" />
          </linearGradient>

          {/* Mid-ground Forest Gradient */}
          <linearGradient id={gradIds.midForest} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={themeStyles.forestMid} />
            <stop offset="100%" stopColor={themeStyles.forestFront} />
          </linearGradient>

          {/* Foreground Forest Gradient */}
          <linearGradient id={gradIds.frontForest} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={themeStyles.forestFront} />
            <stop offset="100%" stopColor={themeStyles.groundFront} />
          </linearGradient>

          {/* Mist Gradient */}
          <linearGradient id={gradIds.mist} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="25%" stopColor="#A7F3D0" stopOpacity={themeStyles.mistOpacity * 0.8} />
            <stop offset="50%" stopColor="#E2E8F0" stopOpacity={themeStyles.mistOpacity} />
            <stop offset="75%" stopColor="#A7F3D0" stopOpacity={themeStyles.mistOpacity * 0.7} />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Soft Tree Trunk Texture Gradient */}
          <linearGradient id={gradIds.bark} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0B1D14" />
            <stop offset="50%" stopColor="#1C3D2E" />
            <stop offset="100%" stopColor="#08170F" />
          </linearGradient>
        </defs>

        {/* ══════════════════════════════════════════════════════════════
            LAYER 0: SKY, ATMOSPHERE & TOPOGRAPHIC ISOLINES
            ══════════════════════════════════════════════════════════════ */}
        <g style={{ transform: layerTransforms.sky, transition: reducedMotion ? 'none' : 'transform 0.08s ease-out' }}>
          <rect x="-100" y="-80" width="1640" height="840" fill={`url(#${gradIds.sky})`} />

          {/* Topographic Isolines (Forestry GIS motif) */}
          <g opacity="0.14" stroke="#7FB98A" strokeWidth="1" fill="none">
            <path d="M-80 160 C 220 120, 540 180, 880 130 C 1140 90, 1380 170, 1560 140" />
            <path d="M-80 210 C 240 165, 560 230, 900 185 C 1160 145, 1400 220, 1560 195" />
            <path d="M-80 265 C 260 215, 580 280, 920 240 C 1180 205, 1420 270, 1560 250" />
            <path d="M-80 320 C 280 270, 600 330, 940 295 C 1200 265, 1440 320, 1560 305" />
            <ellipse cx="1060" cy="180" rx="90" ry="32" />
            <ellipse cx="1060" cy="180" rx="140" ry="50" />
            <ellipse cx="1060" cy="180" rx="200" ry="70" />
          </g>

          {/* Celestial / Morning Sun Glow */}
          {showSunRays && (
            <g style={{ transform: layerTransforms.sun }}>
              <circle cx="1080" cy="160" r="220" fill={`url(#${gradIds.sunGlow})`} />
              <circle cx="1080" cy="160" r="32" fill={themeStyles.sunColor} opacity="0.8" />
              {/* Soft light shafts radiating through the canopy */}
              <g opacity="0.12" fill={themeStyles.sunColor}>
                <polygon points="1080,160 -100,580 120,680" />
                <polygon points="1080,160 320,680 580,680" />
                <polygon points="1080,160 760,680 1020,680" />
                <polygon points="1080,160 1240,680 1560,680" />
              </g>
            </g>
          )}
        </g>

        {/* ══════════════════════════════════════════════════════════════
            LAYER 1: DISTANT MOUNTAINS (SLOWEST PARALLAX)
            ══════════════════════════════════════════════════════════════ */}
        <g
          style={{
            transform: layerTransforms.distantMountains,
            transition: reducedMotion ? 'none' : 'transform 0.08s ease-out',
          }}
        >
          {/* Deep background peaks (Chimgan / Tian Shan inspired ridges) */}
          <path
            d="M-80 440 L -80 340 L 90 260 L 240 315 L 410 210 L 520 270 L 670 195 L 810 280 L 940 215 L 1090 305 L 1260 220 L 1410 290 L 1560 230 L 1560 520 L -80 520 Z"
            fill={`url(#${gradIds.mountFar})`}
          />

          {/* Facet shading for 3D mountain relief */}
          <g opacity="0.22" fill="#0A1811">
            <polygon points="410,210 320,290 410,360 460,280" />
            <polygon points="670,195 590,265 670,350 720,270" />
            <polygon points="940,215 880,275 940,360 995,295" />
            <polygon points="1260,220 1190,285 1260,370 1320,290" />
          </g>

          {/* Secondary closer mountain ridge */}
          <path
            d="M-80 480 L -80 370 L 140 290 L 320 360 L 490 275 L 630 330 L 780 255 L 960 345 L 1130 265 L 1320 350 L 1470 295 L 1560 340 L 1560 560 L -80 560 Z"
            fill={`url(#${gradIds.mountMid})`}
          />

          {/* Distant mountain ridge pines silhouette */}
          <g fill={themeStyles.mountainMid} opacity="0.6">
            {[120, 180, 290, 460, 510, 610, 750, 800, 930, 1100, 1150, 1290, 1440].map((x, i) => (
              <polygon
                key={`far-pine-${i}`}
                points={`${x},${310 + (i % 4) * 12} ${x + 9},${340 + (i % 4) * 12} ${x - 9},${340 + (i % 4) * 12}`}
              />
            ))}
          </g>
        </g>

        {/* High Altitude Mist Band */}
        {showMist && (
          <g style={{ transform: layerTransforms.distantMountains }}>
            <path
              d="M-100 360 Q 280 330, 720 370 T 1560 350 L 1560 410 Q 1120 430, 680 390 T -100 420 Z"
              fill={`url(#${gradIds.mist})`}
            />
          </g>
        )}

        {/* Background Layer Leaves */}
        {showLeaves && (
          <g>
            {leavesRef.current
              .filter((l) => l.depth === 'back')
              .map((leaf) => (
                <g
                  key={`leaf-back-${leaf.id}`}
                  transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.rotation}) scale(${leaf.size / 14})`}
                  style={{ color: leaf.color }}
                  opacity={leaf.opacity}
                >
                  {renderLeafShape(leaf.type)}
                </g>
              ))}
          </g>
        )}

        {/* ══════════════════════════════════════════════════════════════
            LAYER 2: MID-GROUND FOREST, HILLS & CONIFER ROWS
            ══════════════════════════════════════════════════════════════ */}
        <g
          style={{
            transform: layerTransforms.midForest,
            transition: reducedMotion ? 'none' : 'transform 0.08s ease-out',
          }}
        >
          {/* Rolling Mid-ground Hills */}
          <path
            d="M-80 520 Q 200 410, 520 460 T 1160 430 Q 1380 440, 1560 480 L 1560 620 L -80 620 Z"
            fill={`url(#${gradIds.midForest})`}
          />

          {/* Dense Conifer Treeline Band on Mid-ground Ridge */}
          <g fill="#17442F">
            {/* Generated Conifer Pine silhouettes */}
            {Array.from({ length: 42 }, (_, i) => {
              const x = -40 + i * 38;
              const h = 42 + (Math.sin(i * 1.7) * 16 + 14);
              const y = 470 - (Math.cos(i * 0.3) * 22);
              const w = h * 0.35;
              return (
                <g key={`mid-tree-${i}`}>
                  {/* Conifer 3-tier pine silhouette */}
                  <polygon points={`${x},${y - h} ${x + w * 0.6},${y - h * 0.55} ${x - w * 0.6},${y - h * 0.55}`} />
                  <polygon points={`${x},${y - h * 0.65} ${x + w * 0.85},${y - h * 0.25} ${x - w * 0.85},${y - h * 0.25}`} />
                  <polygon points={`${x},${y - h * 0.35} ${x + w * 1.15},${y} ${x - w * 1.15},${y}`} />
                  <rect x={x - 1.5} y={y} width="3" height={h * 0.14} fill="#0C2419" />
                </g>
              );
            })}
          </g>

          {/* Forestry Lookout Tower on distant ridge */}
          <g transform="translate(980, 415) scale(0.65)" fill="#0D271B">
            <polygon points="-8,0 -3,-44 3,-44 8,0" opacity="0.9" />
            <line x1="-7" y1="-10" x2="7" y2="-20" stroke="#0D271B" strokeWidth="1.5" />
            <line x1="-6" y1="-22" x2="6" y2="-32" stroke="#0D271B" strokeWidth="1.5" />
            <rect x="-11" y="-56" width="22" height="13" rx="1" />
            <polygon points="-14,-56 14,-56 0,-68" />
            <rect x="-8" y="-53" width="16" height="6" fill="#A7F3D0" opacity="0.6" />
          </g>
        </g>

        {/* Mid-altitude Forest Mist */}
        {showMist && (
          <g style={{ transform: layerTransforms.midTrees }}>
            <path
              d="M-80 470 Q 360 440, 820 490 T 1560 460 L 1560 530 Q 1040 550, 580 500 T -80 535 Z"
              fill={`url(#${gradIds.mist})`}
              opacity="0.85"
            />
          </g>
        )}

        {/* Mid-layer Floating Leaves */}
        {showLeaves && (
          <g>
            {leavesRef.current
              .filter((l) => l.depth === 'mid')
              .map((leaf) => (
                <g
                  key={`leaf-mid-${leaf.id}`}
                  transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.rotation}) scale(${leaf.size / 14})`}
                  style={{ color: leaf.color }}
                  opacity={leaf.opacity}
                >
                  {renderLeafShape(leaf.type)}
                </g>
              ))}
          </g>
        )}

        {/* Fireflies / Ambient Forest Spores */}
        {showFireflies && (
          <g>
            {firefliesRef.current.map((f) => (
              <g key={`firefly-${f.id}`} transform={`translate(${f.x}, ${f.y})`}>
                <circle
                  cx="0"
                  cy="0"
                  r={f.radius * 2.8}
                  fill={themeStyles.sunColor}
                  opacity={0.25 + Math.sin(f.phase) * 0.18}
                />
                <circle
                  cx="0"
                  cy="0"
                  r={f.radius}
                  fill="#FFFFFF"
                  opacity={0.75 + Math.sin(f.phase) * 0.25}
                />
              </g>
            ))}
          </g>
        )}

        {/* ══════════════════════════════════════════════════════════════
            LAYER 3: FOREGROUND TREES, ROLLING KNOLL & DETAILED BOTANICALS
            (STRONGEST PARALLAX RESPONSE)
            ══════════════════════════════════════════════════════════════ */}
        <g
          style={{
            transform: layerTransforms.foregroundForest,
            transition: reducedMotion ? 'none' : 'transform 0.08s ease-out',
          }}
        >
          {/* Foreground Forest Floor Knoll */}
          <path
            d="M-80 570 Q 240 520, 560 560 T 1120 540 Q 1340 530, 1560 580 L 1560 760 L -80 760 Z"
            fill={`url(#${gradIds.frontForest})`}
          />

          {/* Left Foreground Majestic Conifer (Tall Pine) */}
          <g transform="translate(140, 590)">
            {/* Trunk */}
            <path d="M-8 0 L -5 -280 L 5 -280 L 8 0 Z" fill={`url(#${gradIds.bark})`} />

            {/* Tiered Needle Branches */}
            <g fill="#0D2E1F">
              <polygon points="0,-290 34,-240 -34,-240" />
              <polygon points="0,-255 46,-200 -46,-200" />
              <polygon points="0,-215 62,-150 -62,-150" />
              <polygon points="0,-165 78,-90 -78,-90" />
              <polygon points="0,-105 96,-25 -96,-25" />
            </g>

            {/* Highlights on branches */}
            <g fill="#1F513B" opacity="0.75">
              <polygon points="0,-290 28,-240 0,-248" />
              <polygon points="0,-255 38,-200 0,-208" />
              <polygon points="0,-215 52,-150 0,-158" />
              <polygon points="0,-165 65,-90 0,-98" />
              <polygon points="0,-105 80,-25 0,-33" />
            </g>
          </g>

          {/* Second Smaller Left Conifer */}
          <g transform="translate(50, 610) scale(0.72)">
            <path d="M-7 0 L -4 -250 L 4 -250 L 7 0 Z" fill={`url(#${gradIds.bark})`} />
            <g fill="#0A2418">
              <polygon points="0,-260 30,-210 -30,-210" />
              <polygon points="0,-225 42,-170 -42,-170" />
              <polygon points="0,-185 55,-120 -55,-120" />
              <polygon points="0,-135 70,-65 -70,-65" />
              <polygon points="0,-80 84,-10 -84,-10" />
            </g>
          </g>

          {/* Right Foreground Broadleaf Oak / Beech Cluster */}
          <g transform="translate(1320, 600)">
            {/* Massive ancient trunk */}
            <path
              d="M-22 0 Q -18 -120, -12 -240 Q -8 -290, 0 -340 Q 8 -290, 16 -240 Q 22 -120, 26 0 Z"
              fill={`url(#${gradIds.bark})`}
            />
            {/* Trunk roots */}
            <path d="M-22 0 C -34 15, -46 25, -60 30 L 30 30 C 44 25, 56 15, 66 0 Z" fill="#06160E" />

            {/* Foliage Clouds / Canopy Clumps */}
            <g fill="#0B2B1B">
              <ellipse cx="-45" cy="-280" rx="75" ry="60" />
              <ellipse cx="35" cy="-300" rx="85" ry="65" />
              <ellipse cx="-80" cy="-220" rx="65" ry="50" />
              <ellipse cx="70" cy="-230" rx="75" ry="55" />
              <ellipse cx="-15" cy="-360" rx="90" ry="70" />
            </g>
            <g fill="#16462E" opacity="0.7">
              <ellipse cx="-40" cy="-290" rx="60" ry="46" />
              <ellipse cx="40" cy="-310" rx="68" ry="50" />
              <ellipse cx="-10" cy="-375" rx="72" ry="54" />
            </g>
          </g>

          {/* Right Pine companion */}
          <g transform="translate(1410, 610) scale(0.85)">
            <path d="M-6 0 L -3 -260 L 3 -260 L 6 0 Z" fill={`url(#${gradIds.bark})`} />
            <g fill="#092217">
              <polygon points="0,-270 32,-220 -32,-220" />
              <polygon points="0,-235 44,-175 -44,-175" />
              <polygon points="0,-190 58,-125 -58,-125" />
              <polygon points="0,-140 72,-70 -72,-70" />
              <polygon points="0,-85 86,-15 -86,-15" />
            </g>
          </g>

          {/* Foreground Meadow Ferns & Grasses along bottom slope */}
          <g fill="#0E3321">
            {[180, 240, 310, 390, 480, 570, 660, 750, 840, 930, 1020, 1110, 1190, 1260].map((gx, idx) => (
              <g key={`fern-${idx}`} transform={`translate(${gx}, ${570 + (idx % 3) * 14})`}>
                <path d="M0 0 C 8 -24, 22 -38, 38 -45 C 24 -36, 14 -20, 0 0 Z" />
                <path d="M0 0 C -8 -24, -22 -38, -38 -45 C -24 -36, -14 -20, 0 0 Z" />
                <path d="M0 0 C 2 -28, 6 -48, 12 -58 C 4 -46, 0 -26, 0 0 Z" />
                <path d="M0 0 C -4 -26, -10 -44, -18 -52 C -10 -40, -4 -22, 0 0 Z" />
              </g>
            ))}
          </g>
        </g>

        {/* ══════════════════════════════════════════════════════════════
            LAYER 4: TOP CANOPY OVERHANG (FRAMING VIGNETTE)
            ══════════════════════════════════════════════════════════════ */}
        <g
          style={{
            transform: layerTransforms.canopyOverhang,
            transition: reducedMotion ? 'none' : 'transform 0.08s ease-out',
          }}
        >
          {/* Top-Right Overhanging Branch */}
          <g transform="translate(1440, 0) scale(-1, 1)">
            <path
              d="M-30 -10 C 140 20, 280 80, 440 120 C 340 125, 220 70, -30 25 Z"
              fill={`url(#${gradIds.bark})`}
            />
            {/* Hanging foliage clusters */}
            <g fill="#0A2619">
              <ellipse cx="280" cy="110" rx="55" ry="35" />
              <ellipse cx="380" cy="130" rx="65" ry="40" />
              <ellipse cx="460" cy="140" rx="50" ry="30" />
              <ellipse cx="180" cy="70" rx="60" ry="35" />
            </g>
            <g fill="#16432D" opacity="0.6">
              <ellipse cx="290" cy="115" rx="42" ry="26" />
              <ellipse cx="390" cy="135" rx="50" ry="30" />
            </g>
          </g>

          {/* Top-Left Subtle Pine Overhang */}
          <g transform="translate(0, 0)">
            <path d="M-20 -10 C 80 15, 180 50, 280 85 C 200 88, 120 48, -20 18 Z" fill={`url(#${gradIds.bark})`} />
            <g fill="#0A2619">
              <ellipse cx="160" cy="65" rx="50" ry="30" />
              <ellipse cx="250" cy="90" rx="45" ry="28" />
            </g>
          </g>
        </g>

        {/* ══════════════════════════════════════════════════════════════
            LAYER 5: FOREGROUND FLOATING PARTICLE LEAVES
            ══════════════════════════════════════════════════════════════ */}
        {showLeaves && (
          <g>
            {leavesRef.current
              .filter((l) => l.depth === 'front')
              .map((leaf) => (
                <g
                  key={`leaf-front-${leaf.id}`}
                  transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.rotation}) scale(${leaf.size / 14})`}
                  style={{ color: leaf.color }}
                  opacity={leaf.opacity}
                >
                  {renderLeafShape(leaf.type)}
                </g>
              ))}
          </g>
        )}
      </svg>

      {/* Optional Children Overlay (e.g. Hero Text, Search Controls) */}
      {children && <div className="relative z-10 w-full h-full">{children}</div>}
    </div>
  );
}

export default ParallaxForestAnim;
