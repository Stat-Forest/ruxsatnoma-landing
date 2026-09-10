import { useId } from 'react';
import type { CSSProperties, ReactElement } from 'react';

export interface GrowingTreeAnimProps {
  /**
   * Width of the SVG canvas.
   * @default '100%'
   */
  width?: number | string;
  /**
   * Height of the SVG canvas.
   * @default '100%'
   */
  height?: number | string;
  /**
   * Optional additional CSS class name.
   */
  className?: string;
  /**
   * Inline styles for the SVG element.
   */
  style?: CSSProperties;
  /**
   * Whether to display the soft radial sun glow behind the tree canopy.
   * @default true
   */
  showSun?: boolean;
  /**
   * Whether to animate the continuously falling leaves.
   * @default true
   */
  showFallingLeaves?: boolean;
  /**
   * Pass a changed key to replay the growth animation.
   */
  replayKey?: number | string;
  /**
   * Accessible description for assistive technology.
   * @default 'O‘sayotgan daraxt animatsiyasi'
   */
  ariaLabel?: string;
}

/**
 * GrowingTreeAnim (Option A)
 *
 * Stylized SVG/React animation of an organic tree growing upwards:
 * 1. Root & trunk sprout smoothly from the earth mound.
 * 2. Primary & secondary branches extend outward with spring easing.
 * 3. Lush emerald and jade leaf clusters bloom across the crown with staggered reveals.
 * 4. 2-3 leaves continuously detach and float down with gentle swaying and tumbling rotations.
 * 5. A soft luminous radial sun gradient provides a warm atmospheric glow behind the canopy.
 *
 * Fully self-contained SVG animation with prefers-reduced-motion support (WCAG 2.2 AA).
 */
export function GrowingTreeAnim({
  width = '100%',
  height = '100%',
  className = '',
  style,
  showSun = true,
  showFallingLeaves = true,
  replayKey,
  ariaLabel = 'O‘sayotgan daraxt animatsiyasi',
}: GrowingTreeAnimProps): ReactElement {
  const rawId = useId();
  // Sanitize id for SVG url references (remove colons from React 18+ useId)
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  const sunGradId = `gt-sun-${uid}`;
  const sunCoreId = `gt-core-${uid}`;
  const trunkGradId = `gt-trunk-${uid}`;
  const branchGradId = `gt-branch-${uid}`;
  const groundGradId = `gt-ground-${uid}`;
  const leafDarkGradId = `gt-leaf-dark-${uid}`;
  const leafMidGradId = `gt-leaf-mid-${uid}`;
  const leafLightGradId = `gt-leaf-light-${uid}`;

  return (
    <svg
      key={replayKey}
      viewBox="0 0 600 600"
      width={width}
      height={height}
      className={`relative select-none overflow-hidden ${className}`.trim()}
      style={style}
      role="img"
      aria-label={ariaLabel}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Soft radial sun halo */}
        <radialGradient id={sunGradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.88" />
          <stop offset="22%" stopColor="#FEF3C7" stopOpacity="0.65" />
          <stop offset="48%" stopColor="#FDE68A" stopOpacity="0.32" />
          <stop offset="72%" stopColor="#FCD34D" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>

        {/* Luminous inner sun core */}
        <radialGradient id={sunCoreId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#FFFBEB" stopOpacity="0.75" />
          <stop offset="70%" stopColor="#FEF3C7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
        </radialGradient>

        {/* Trunk natural bark gradient */}
        <linearGradient id={trunkGradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22130C" />
          <stop offset="25%" stopColor="#3E2415" />
          <stop offset="55%" stopColor="#55331E" />
          <stop offset="80%" stopColor="#432617" />
          <stop offset="100%" stopColor="#25150D" />
        </linearGradient>

        {/* Branches gradient */}
        <linearGradient id={branchGradId} x1="0%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#432617" />
          <stop offset="60%" stopColor="#5D3A22" />
          <stop offset="100%" stopColor="#6E4428" />
        </linearGradient>

        {/* Rolling ground gradient */}
        <linearGradient id={groundGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1C5335" />
          <stop offset="35%" stopColor="#143E27" />
          <stop offset="100%" stopColor="#0B2517" />
        </linearGradient>

        {/* Deep shade foliage */}
        <linearGradient id={leafDarkGradId} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#064E3B" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Vibrant emerald foliage */}
        <linearGradient id={leafMidGradId} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        {/* Sunlit spring foliage highlights */}
        <linearGradient id={leafLightGradId} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
      </defs>

      {/* Embedded scoped styles for growth, blooming, falling leaves, and breathing sun */}
      <style>{`
        /* --- Sun Ambient Animations --- */
        .gta-sun-halo {
          transform-origin: 300px 240px;
          animation: gtaSunPulse 7.5s ease-in-out infinite alternate;
        }
        .gta-sun-core {
          transform-origin: 300px 240px;
          animation: gtaSunCore 5s ease-in-out infinite alternate;
        }
        .gta-mote-1 {
          animation: gtaMoteDrift 8s ease-in-out infinite alternate;
        }
        .gta-mote-2 {
          animation: gtaMoteDrift 6.5s ease-in-out 1.2s infinite alternate-reverse;
        }
        .gta-mote-3 {
          animation: gtaMoteDrift 9s ease-in-out 2.5s infinite alternate;
        }

        @keyframes gtaSunPulse {
          0% { transform: scale(0.96); opacity: 0.85; }
          100% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes gtaSunCore {
          0% { transform: scale(0.92); opacity: 0.9; }
          100% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes gtaMoteDrift {
          0% { transform: translate(0, 0); opacity: 0.35; }
          50% { opacity: 0.85; }
          100% { transform: translate(6px, -12px); opacity: 0.4; }
        }

        /* --- Trunk & Roots Growth --- */
        .gta-trunk-grow {
          transform-origin: 300px 525px;
          animation: gtaTrunkEmerge 1.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .gta-roots-grow {
          transform-origin: 300px 520px;
          animation: gtaRootsEmerge 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
        }

        @keyframes gtaTrunkEmerge {
          0% { transform: scaleY(0.02) scaleX(0.5); opacity: 0; }
          25% { opacity: 1; }
          100% { transform: scaleY(1) scaleX(1); opacity: 1; }
        }
        @keyframes gtaRootsEmerge {
          0% { transform: scale(0.1); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        /* --- Branch Extensions --- */
        .gta-branch-left {
          transform-origin: 288px 365px;
          animation: gtaBranchExtend 1.25s cubic-bezier(0.34, 1.3, 0.64, 1) 0.65s both;
        }
        .gta-branch-right {
          transform-origin: 312px 365px;
          animation: gtaBranchExtend 1.25s cubic-bezier(0.34, 1.3, 0.64, 1) 0.78s both;
        }
        .gta-branch-center {
          transform-origin: 300px 275px;
          animation: gtaBranchExtend 1.15s cubic-bezier(0.34, 1.3, 0.64, 1) 0.9s both;
        }
        .gta-twig-sub {
          animation: gtaTwigPop 0.9s cubic-bezier(0.34, 1.4, 0.64, 1) both;
        }

        @keyframes gtaBranchExtend {
          0% { transform: scale(0); opacity: 0; }
          30% { opacity: 1; }
          80% { transform: scale(1.04); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes gtaTwigPop {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        /* --- Leaves Blooming --- */
        .gta-bloom-group {
          animation: gtaBloomScale 1.05s cubic-bezier(0.34, 1.45, 0.64, 1) both;
        }

        @keyframes gtaBloomScale {
          0% { transform: scale(0); opacity: 0; }
          50% { opacity: 0.95; }
          78% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }

        /* --- Canopy Gentle Wind Sway --- */
        .gta-canopy-sway {
          transform-origin: 300px 340px;
          animation: gtaBreeze 8s ease-in-out 2.8s infinite;
        }

        @keyframes gtaBreeze {
          0%, 100% { transform: rotate(0deg); }
          35% { transform: rotate(1.2deg); }
          75% { transform: rotate(-1deg); }
        }

        /* --- Continuously Falling Leaves --- */
        .gta-falling-leaf-1 {
          animation: gtaFallLeaf1 6.8s cubic-bezier(0.42, 0, 0.58, 1) 1.6s infinite;
        }
        .gta-falling-leaf-2 {
          animation: gtaFallLeaf2 7.6s cubic-bezier(0.42, 0, 0.58, 1) 4.0s infinite;
        }
        .gta-falling-leaf-3 {
          animation: gtaFallLeaf3 8.4s cubic-bezier(0.42, 0, 0.58, 1) 6.4s infinite;
        }

        @keyframes gtaFallLeaf1 {
          0% {
            transform: translate(175px, 220px) rotate(15deg) scale(0.95);
            opacity: 0;
          }
          6% {
            opacity: 0.95;
          }
          24% {
            transform: translate(140px, 290px) rotate(75deg) scale(0.9);
          }
          48% {
            transform: translate(210px, 370px) rotate(155deg) scale(0.85);
          }
          72% {
            transform: translate(150px, 450px) rotate(240deg) scale(0.8);
            opacity: 0.9;
          }
          92% {
            transform: translate(190px, 520px) rotate(315deg) scale(0.75);
            opacity: 0.5;
          }
          100% {
            transform: translate(195px, 532px) rotate(340deg) scale(0.7);
            opacity: 0;
          }
        }

        @keyframes gtaFallLeaf2 {
          0% {
            transform: translate(415px, 205px) rotate(-20deg) scale(0.95);
            opacity: 0;
          }
          6% {
            opacity: 0.95;
          }
          26% {
            transform: translate(455px, 280px) rotate(60deg) scale(0.9);
          }
          50% {
            transform: translate(385px, 360px) rotate(145deg) scale(0.85);
          }
          74% {
            transform: translate(445px, 445px) rotate(225deg) scale(0.8);
            opacity: 0.9;
          }
          92% {
            transform: translate(405px, 520px) rotate(305deg) scale(0.75);
            opacity: 0.5;
          }
          100% {
            transform: translate(410px, 532px) rotate(330deg) scale(0.7);
            opacity: 0;
          }
        }

        @keyframes gtaFallLeaf3 {
          0% {
            transform: translate(295px, 165px) rotate(10deg) scale(0.92);
            opacity: 0;
          }
          6% {
            opacity: 0.95;
          }
          28% {
            transform: translate(255px, 250px) rotate(-65deg) scale(0.88);
          }
          52% {
            transform: translate(335px, 335px) rotate(55deg) scale(0.84);
          }
          76% {
            transform: translate(265px, 425px) rotate(175deg) scale(0.8);
            opacity: 0.9;
          }
          92% {
            transform: translate(315px, 515px) rotate(265deg) scale(0.75);
            opacity: 0.5;
          }
          100% {
            transform: translate(310px, 530px) rotate(290deg) scale(0.7);
            opacity: 0;
          }
        }

        /* --- Reduced Motion Compliance (WCAG 2.2 AA) --- */
        @media (prefers-reduced-motion: reduce) {
          .gta-sun-halo,
          .gta-sun-core,
          .gta-mote-1,
          .gta-mote-2,
          .gta-mote-3,
          .gta-trunk-grow,
          .gta-roots-grow,
          .gta-branch-left,
          .gta-branch-right,
          .gta-branch-center,
          .gta-twig-sub,
          .gta-bloom-group,
          .gta-canopy-sway {
            animation: none !important;
            transform: none !important;
            opacity: 1 !important;
          }
          .gta-falling-leaf-1,
          .gta-falling-leaf-2,
          .gta-falling-leaf-3 {
            display: none !important;
          }
        }
      `}</style>

      {/* ================================================================= */}
      {/* 1. SOFT RADIAL SUN GRADIENT & ATMOSPHERE                           */}
      {/* ================================================================= */}
      {showSun && (
        <g id="sun-layer">
          {/* Broad warm atmospheric halo */}
          <circle
            cx={300}
            cy={240}
            r={235}
            fill={`url(#${sunGradId})`}
            className="gta-sun-halo"
          />

          {/* Concentric sun ring detail */}
          <circle
            cx={300}
            cy={240}
            r={165}
            fill="none"
            stroke="#FDE68A"
            strokeWidth="1.2"
            strokeDasharray="6 14"
            opacity="0.32"
          />
          <circle
            cx={300}
            cy={240}
            r={110}
            fill="none"
            stroke="#FEF3C7"
            strokeWidth="1"
            strokeDasharray="4 10"
            opacity="0.28"
          />

          {/* Luminous inner sun center */}
          <circle
            cx={300}
            cy={240}
            r={78}
            fill={`url(#${sunCoreId})`}
            className="gta-sun-core"
          />

          {/* Subtle floating light dust motes */}
          <circle cx={235} cy={195} r={2.2} fill="#FFFBEB" className="gta-mote-1" />
          <circle cx={365} cy={175} r={2.6} fill="#FEF3C7" className="gta-mote-2" />
          <circle cx={280} cy={135} r={2.0} fill="#FFFBEB" className="gta-mote-3" />
          <circle cx={335} cy={275} r={2.3} fill="#FEF3C7" className="gta-mote-1" />
          <circle cx={195} cy={260} r={1.8} fill="#FFFBEB" className="gta-mote-2" />
          <circle cx={405} cy={250} r={2.0} fill="#FEF3C7" className="gta-mote-3" />
        </g>
      )}

      {/* ================================================================= */}
      {/* 2. GROUND HORIZON & BASE MOUND                                    */}
      {/* ================================================================= */}
      <g id="ground-layer">
        {/* Soft rounded grassy mound */}
        <path
          d="M 30 545 Q 160 512 300 515 Q 440 512 570 545 L 570 600 L 30 600 Z"
          fill={`url(#${groundGradId})`}
        />

        {/* Highlight contour ridge on grass mound */}
        <path
          d="M 60 543 Q 180 514 300 517 Q 420 514 540 543"
          fill="none"
          stroke="#2ECC71"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.55"
        />

        {/* Small stylized grass blades */}
        <g fill="#2ECC71" opacity="0.85">
          {/* Left grass cluster */}
          <path d="M 185 517 L 180 503 L 187 516 L 193 506 L 192 517 Z" />
          <path d="M 230 518 L 227 508 L 233 518 Z" />
          {/* Right grass cluster */}
          <path d="M 410 517 L 415 503 L 408 516 L 402 506 L 403 517 Z" />
          <path d="M 370 518 L 373 508 L 367 518 Z" />
        </g>

        {/* Two small fallen leaves resting peacefully on the lawn */}
        <g transform="translate(225, 521) rotate(-35) scale(0.65)" opacity="0.8">
          <path
            d="M 0 0 C -6 -8 -7 -16 0 -22 C 7 -16 6 -8 0 0 Z"
            fill={`url(#${leafMidGradId})`}
          />
          <path d="M 0 0 L 0 -18" stroke="#34D399" strokeWidth="1" />
        </g>
        <g transform="translate(385, 523) rotate(28) scale(0.6)" opacity="0.75">
          <path
            d="M 0 0 C -6 -8 -7 -16 0 -22 C 7 -16 6 -8 0 0 Z"
            fill={`url(#${leafLightGradId})`}
          />
          <path d="M 0 0 L 0 -18" stroke="#86EFAC" strokeWidth="1" />
        </g>
      </g>

      {/* ================================================================= */}
      {/* 3. ROOTS & ANCHORS                                                */}
      {/* ================================================================= */}
      <g id="roots-layer" className="gta-roots-grow">
        {/* Left spreading roots */}
        <path
          d="M 276 502 C 255 512 230 519 205 526 C 228 522 255 516 278 509 Z"
          fill="#3E2415"
        />
        <path
          d="M 284 508 C 270 516 250 523 235 528 C 252 524 270 518 286 512 Z"
          fill="#2A170D"
        />

        {/* Right spreading roots */}
        <path
          d="M 324 502 C 345 512 370 519 395 526 C 372 522 345 516 322 509 Z"
          fill="#3E2415"
        />
        <path
          d="M 316 508 C 330 516 350 523 365 528 C 348 524 330 518 314 512 Z"
          fill="#2A170D"
        />
      </g>

      {/* ================================================================= */}
      {/* 4. MAIN TRUNK                                                     */}
      {/* ================================================================= */}
      <g id="trunk-layer" className="gta-trunk-grow">
        {/* Main trunk solid body */}
        <path
          d="M 268 518 C 274 468 282 412 286 365 C 288 330 290 298 293 275 L 307 275 C 310 298 312 330 314 365 C 318 412 326 468 332 518 Z"
          fill={`url(#${trunkGradId})`}
        />

        {/* Vertical bark contour line highlights (give wood rounded depth) */}
        <path
          d="M 295 512 C 298 460 297 400 298 355 C 299 320 299 290 300 275"
          stroke="#795548"
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity="0.45"
        />
        <path
          d="M 303 510 C 306 462 305 408 304 362"
          stroke="#8D6E63"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.35"
        />
        {/* Shadow strip along left edge */}
        <path
          d="M 271 515 C 278 465 284 410 287 365"
          stroke="#1A0D07"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.6"
        />
      </g>

      {/* ================================================================= */}
      {/* 5. BRANCHES EXTENDING OUTWARD                                     */}
      {/* ================================================================= */}
      <g id="branches-layer">
        {/* --- LEFT PRIMARY BOUGH --- */}
        <g className="gta-branch-left">
          {/* Main left sweeping branch */}
          <path
            d="M 288 368 C 265 348 230 334 195 308 C 168 286 148 258 132 228 C 138 228 160 252 184 274 C 215 298 250 314 286 336 Z"
            fill={`url(#${branchGradId})`}
          />

          {/* Lower left branch offshoot */}
          <path
            d="M 175 285 C 155 282 135 282 114 286 C 113 282 130 276 150 274 C 162 273 172 276 182 280 Z"
            fill="#5D3A22"
            className="gta-twig-sub"
            style={{
              transformOrigin: '175px 285px',
              animationDelay: '1.2s',
            }}
          />

          {/* Upper left branch offshoot */}
          <path
            d="M 205 315 C 210 285 218 255 224 218 C 228 219 224 246 216 276 C 212 292 208 308 206 318 Z"
            fill="#5D3A22"
            className="gta-twig-sub"
            style={{
              transformOrigin: '205px 315px',
              animationDelay: '1.1s',
            }}
          />
        </g>

        {/* --- RIGHT PRIMARY BOUGH --- */}
        <g className="gta-branch-right">
          {/* Main right sweeping branch */}
          <path
            d="M 312 368 C 335 348 370 334 405 308 C 432 286 452 258 468 228 C 462 228 440 252 416 274 C 385 298 350 314 314 336 Z"
            fill={`url(#${branchGradId})`}
          />

          {/* Lower right branch offshoot */}
          <path
            d="M 425 285 C 445 282 465 282 486 286 C 487 282 470 276 450 274 C 438 273 428 276 418 280 Z"
            fill="#5D3A22"
            className="gta-twig-sub"
            style={{
              transformOrigin: '425px 285px',
              animationDelay: '1.3s',
            }}
          />

          {/* Upper right branch offshoot */}
          <path
            d="M 395 315 C 390 285 382 255 376 218 C 372 219 376 246 384 276 C 388 292 392 308 394 318 Z"
            fill="#5D3A22"
            className="gta-twig-sub"
            style={{
              transformOrigin: '395px 315px',
              animationDelay: '1.2s',
            }}
          />
        </g>

        {/* --- CENTER TOP CROWN BOUGH --- */}
        <g className="gta-branch-center">
          {/* Left fork from center trunk */}
          <path
            d="M 293 275 C 285 244 268 214 250 178 C 256 177 272 205 284 234 C 291 254 296 268 299 278 Z"
            fill="#5D3A22"
          />
          {/* Right fork from center trunk */}
          <path
            d="M 307 275 C 315 244 332 214 350 178 C 344 177 328 205 316 234 C 309 254 304 268 301 278 Z"
            fill="#5D3A22"
          />
          {/* Central pinnacle twig */}
          <path
            d="M 298 260 C 299 225 299 195 300 158 C 301 158 301 195 302 225 C 302 245 301 260 300 260 Z"
            fill="#6E4428"
          />
        </g>
      </g>

      {/* ================================================================= */}
      {/* 6. LEAVES BLOOMING & CANOPY SWAY                                  */}
      {/* ================================================================= */}
      <g id="canopy-layer" className="gta-canopy-sway">
        {/* Helper function / template for a blooming leaf cluster */}
        {/* Cluster 1: Crown Pinnacle Top */}
        <g
          className="gta-bloom-group"
          style={{
            transformOrigin: '300px 145px',
            animationDelay: '1.85s',
          }}
        >
          {/* Backdrop leaf mass */}
          <ellipse cx={300} cy={145} rx={32} ry={24} fill={`url(#${leafDarkGradId})`} opacity="0.9" />
          {/* Individual fanned leaves */}
          <g transform="translate(300, 150)">
            <path d="M 0 0 C -8 -15 -10 -30 0 -42 C 10 -30 8 -15 0 0 Z" fill={`url(#${leafLightGradId})`} />
            <path d="M 0 0 L 0 -36" stroke="#FEF08A" strokeWidth="1.2" opacity="0.8" />
          </g>
          <g transform="translate(290, 148) rotate(-32)">
            <path d="M 0 0 C -7 -14 -8 -26 0 -36 C 8 -26 7 -14 0 0 Z" fill={`url(#${leafMidGradId})`} />
            <path d="M 0 0 L 0 -30" stroke="#A7F3D0" strokeWidth="1" opacity="0.8" />
          </g>
          <g transform="translate(310, 148) rotate(32)">
            <path d="M 0 0 C -7 -14 -8 -26 0 -36 C 8 -26 7 -14 0 0 Z" fill={`url(#${leafMidGradId})`} />
            <path d="M 0 0 L 0 -30" stroke="#A7F3D0" strokeWidth="1" opacity="0.8" />
          </g>
        </g>

        {/* Cluster 2: Crown Upper-Left */}
        <g
          className="gta-bloom-group"
          style={{
            transformOrigin: '245px 172px',
            animationDelay: '1.95s',
          }}
        >
          <ellipse cx={245} cy={172} rx={36} ry={26} fill={`url(#${leafDarkGradId})`} opacity="0.9" />
          <g transform="translate(245, 178) rotate(-25)">
            <path d="M 0 0 C -9 -16 -10 -32 0 -42 C 10 -32 9 -16 0 0 Z" fill={`url(#${leafLightGradId})`} />
            <path d="M 0 0 L 0 -35" stroke="#FEF08A" strokeWidth="1.2" opacity="0.8" />
          </g>
          <g transform="translate(235, 175) rotate(-55)">
            <path d="M 0 0 C -8 -13 -9 -25 0 -35 C 9 -25 8 -13 0 0 Z" fill={`url(#${leafMidGradId})`} />
            <path d="M 0 0 L 0 -30" stroke="#A7F3D0" strokeWidth="1" opacity="0.8" />
          </g>
          <g transform="translate(255, 174) rotate(12)">
            <path d="M 0 0 C -7 -14 -8 -26 0 -35 C 8 -26 7 -14 0 0 Z" fill={`url(#${leafMidGradId})`} />
            <path d="M 0 0 L 0 -30" stroke="#A7F3D0" strokeWidth="1" opacity="0.8" />
          </g>
        </g>

        {/* Cluster 3: Crown Upper-Right */}
        <g
          className="gta-bloom-group"
          style={{
            transformOrigin: '355px 172px',
            animationDelay: '2.05s',
          }}
        >
          <ellipse cx={355} cy={172} rx={36} ry={26} fill={`url(#${leafDarkGradId})`} opacity="0.9" />
          <g transform="translate(355, 178) rotate(25)">
            <path d="M 0 0 C -9 -16 -10 -32 0 -42 C 10 -32 9 -16 0 0 Z" fill={`url(#${leafLightGradId})`} />
            <path d="M 0 0 L 0 -35" stroke="#FEF08A" strokeWidth="1.2" opacity="0.8" />
          </g>
          <g transform="translate(365, 175) rotate(55)">
            <path d="M 0 0 C -8 -13 -9 -25 0 -35 C 9 -25 8 -13 0 0 Z" fill={`url(#${leafMidGradId})`} />
            <path d="M 0 0 L 0 -30" stroke="#A7F3D0" strokeWidth="1" opacity="0.8" />
          </g>
          <g transform="translate(345, 174) rotate(-12)">
            <path d="M 0 0 C -7 -14 -8 -26 0 -35 C 8 -26 7 -14 0 0 Z" fill={`url(#${leafMidGradId})`} />
            <path d="M 0 0 L 0 -30" stroke="#A7F3D0" strokeWidth="1" opacity="0.8" />
          </g>
        </g>

        {/* Cluster 4: Outer Left High */}
        <g
          className="gta-bloom-group"
          style={{
            transformOrigin: '215px 210px',
            animationDelay: '1.75s',
          }}
        >
          <ellipse cx={215} cy={210} rx={40} ry={28} fill={`url(#${leafDarkGradId})`} opacity="0.9" />
          <g transform="translate(215, 215) rotate(-35)">
            <path d="M 0 0 C -9 -16 -10 -32 0 -44 C 10 -32 9 -16 0 0 Z" fill={`url(#${leafMidGradId})`} />
            <path d="M 0 0 L 0 -36" stroke="#A7F3D0" strokeWidth="1" opacity="0.8" />
          </g>
          <g transform="translate(200, 210) rotate(-65)">
            <path d="M 0 0 C -8 -14 -9 -27 0 -38 C 9 -27 8 -14 0 0 Z" fill={`url(#${leafLightGradId})`} />
            <path d="M 0 0 L 0 -32" stroke="#FEF08A" strokeWidth="1" opacity="0.8" />
          </g>
          <g transform="translate(228, 208) rotate(5)">
            <path d="M 0 0 C -8 -14 -9 -27 0 -36 C 9 -27 8 -14 0 0 Z" fill={`url(#${leafDarkGradId})`} />
          </g>
        </g>

        {/* Cluster 5: Outer Right High */}
        <g
          className="gta-bloom-group"
          style={{
            transformOrigin: '385px 210px',
            animationDelay: '1.8s',
          }}
        >
          <ellipse cx={385} cy={210} rx={40} ry={28} fill={`url(#${leafDarkGradId})`} opacity="0.9" />
          <g transform="translate(385, 215) rotate(35)">
            <path d="M 0 0 C -9 -16 -10 -32 0 -44 C 10 -32 9 -16 0 0 Z" fill={`url(#${leafMidGradId})`} />
            <path d="M 0 0 L 0 -36" stroke="#A7F3D0" strokeWidth="1" opacity="0.8" />
          </g>
          <g transform="translate(400, 210) rotate(65)">
            <path d="M 0 0 C -8 -14 -9 -27 0 -38 C 9 -27 8 -14 0 0 Z" fill={`url(#${leafLightGradId})`} />
            <path d="M 0 0 L 0 -32" stroke="#FEF08A" strokeWidth="1" opacity="0.8" />
          </g>
          <g transform="translate(372, 208) rotate(-5)">
            <path d="M 0 0 C -8 -14 -9 -27 0 -36 C 9 -27 8 -14 0 0 Z" fill={`url(#${leafDarkGradId})`} />
          </g>
        </g>

        {/* Cluster 6: Far Left Mid-Bough */}
        <g
          className="gta-bloom-group"
          style={{
            transformOrigin: '135px 225px',
            animationDelay: '2.15s',
          }}
        >
          <ellipse cx={135} cy={225} rx={38} ry={25} fill={`url(#${leafDarkGradId})`} opacity="0.9" />
          <g transform="translate(135, 230) rotate(-48)">
            <path d="M 0 0 C -8 -14 -9 -28 0 -38 C 9 -28 8 -14 0 0 Z" fill={`url(#${leafLightGradId})`} />
            <path d="M 0 0 L 0 -32" stroke="#FEF08A" strokeWidth="1.1" opacity="0.8" />
          </g>
          <g transform="translate(120, 222) rotate(-85)">
            <path d="M 0 0 C -7 -13 -8 -25 0 -34 C 8 -25 7 -13 0 0 Z" fill={`url(#${leafMidGradId})`} />
            <path d="M 0 0 L 0 -28" stroke="#A7F3D0" strokeWidth="1" opacity="0.8" />
          </g>
          <g transform="translate(148, 224) rotate(-15)">
            <path d="M 0 0 C -7 -13 -8 -25 0 -34 C 8 -25 7 -13 0 0 Z" fill={`url(#${leafMidGradId})`} />
          </g>
        </g>

        {/* Cluster 7: Far Right Mid-Bough */}
        <g
          className="gta-bloom-group"
          style={{
            transformOrigin: '465px 225px',
            animationDelay: '2.25s',
          }}
        >
          <ellipse cx={465} cy={225} rx={38} ry={25} fill={`url(#${leafDarkGradId})`} opacity="0.9" />
          <g transform="translate(465, 230) rotate(48)">
            <path d="M 0 0 C -8 -14 -9 -28 0 -38 C 9 -28 8 -14 0 0 Z" fill={`url(#${leafLightGradId})`} />
            <path d="M 0 0 L 0 -32" stroke="#FEF08A" strokeWidth="1.1" opacity="0.8" />
          </g>
          <g transform="translate(480, 222) rotate(85)">
            <path d="M 0 0 C -7 -13 -8 -25 0 -34 C 8 -25 7 -13 0 0 Z" fill={`url(#${leafMidGradId})`} />
            <path d="M 0 0 L 0 -28" stroke="#A7F3D0" strokeWidth="1" opacity="0.8" />
          </g>
          <g transform="translate(452, 224) rotate(15)">
            <path d="M 0 0 C -7 -13 -8 -25 0 -34 C 8 -25 7 -13 0 0 Z" fill={`url(#${leafMidGradId})`} />
          </g>
        </g>

        {/* Cluster 8: Lower Outer Left */}
        <g
          className="gta-bloom-group"
          style={{
            transformOrigin: '110px 280px',
            animationDelay: '2.35s',
          }}
        >
          <ellipse cx={110} cy={280} rx={34} ry={22} fill={`url(#${leafDarkGradId})`} opacity="0.9" />
          <g transform="translate(110, 283) rotate(-78)">
            <path d="M 0 0 C -8 -13 -9 -26 0 -36 C 9 -26 8 -13 0 0 Z" fill={`url(#${leafLightGradId})`} />
            <path d="M 0 0 L 0 -30" stroke="#FEF08A" strokeWidth="1" opacity="0.8" />
          </g>
          <g transform="translate(100, 276) rotate(-110)">
            <path d="M 0 0 C -6 -11 -7 -22 0 -30 C 7 -22 6 -11 0 0 Z" fill={`url(#${leafMidGradId})`} />
          </g>
        </g>

        {/* Cluster 9: Lower Outer Right */}
        <g
          className="gta-bloom-group"
          style={{
            transformOrigin: '490px 280px',
            animationDelay: '2.45s',
          }}
        >
          <ellipse cx={490} cy={280} rx={34} ry={22} fill={`url(#${leafDarkGradId})`} opacity="0.9" />
          <g transform="translate(490, 283) rotate(78)">
            <path d="M 0 0 C -8 -13 -9 -26 0 -36 C 9 -26 8 -13 0 0 Z" fill={`url(#${leafLightGradId})`} />
            <path d="M 0 0 L 0 -30" stroke="#FEF08A" strokeWidth="1" opacity="0.8" />
          </g>
          <g transform="translate(500, 276) rotate(110)">
            <path d="M 0 0 C -6 -11 -7 -22 0 -30 C 7 -22 6 -11 0 0 Z" fill={`url(#${leafMidGradId})`} />
          </g>
        </g>

        {/* Cluster 10: Center Canopy Heart */}
        <g
          className="gta-bloom-group"
          style={{
            transformOrigin: '300px 215px',
            animationDelay: '1.65s',
          }}
        >
          <ellipse cx={300} cy={215} rx={44} ry={32} fill={`url(#${leafDarkGradId})`} opacity="0.85" />
          <g transform="translate(300, 222)">
            <path d="M 0 0 C -9 -15 -10 -30 0 -42 C 10 -30 9 -15 0 0 Z" fill={`url(#${leafMidGradId})`} />
            <path d="M 0 0 L 0 -35" stroke="#A7F3D0" strokeWidth="1" opacity="0.8" />
          </g>
          <g transform="translate(285, 218) rotate(-28)">
            <path d="M 0 0 C -8 -13 -9 -26 0 -36 C 9 -26 8 -13 0 0 Z" fill={`url(#${leafLightGradId})`} />
            <path d="M 0 0 L 0 -30" stroke="#FEF08A" strokeWidth="1" opacity="0.8" />
          </g>
          <g transform="translate(315, 218) rotate(28)">
            <path d="M 0 0 C -8 -13 -9 -26 0 -36 C 9 -26 8 -13 0 0 Z" fill={`url(#${leafLightGradId})`} />
            <path d="M 0 0 L 0 -30" stroke="#FEF08A" strokeWidth="1" opacity="0.8" />
          </g>
        </g>
      </g>

      {/* ================================================================= */}
      {/* 7. CONTINUOUSLY FALLING LEAVES (2-3 LEAVES)                       */}
      {/* ================================================================= */}
      {showFallingLeaves && (
        <g id="falling-leaves-layer">
          {/* Falling Leaf 1 (Left Canopy Descent) */}
          <g className="gta-falling-leaf-1">
            <g transform="scale(1.1)">
              <path
                d="M 0 0 C -6 -9 -7 -18 0 -26 C 7 -18 6 -9 0 0 Z"
                fill={`url(#${leafLightGradId})`}
              />
              <path d="M 0 0 L 0 -22" stroke="#FEF08A" strokeWidth="1" opacity="0.85" />
              <path d="M 0 0 L 0 4" stroke="#059669" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          </g>

          {/* Falling Leaf 2 (Right Canopy Descent) */}
          <g className="gta-falling-leaf-2">
            <g transform="scale(1.05)">
              <path
                d="M 0 0 C -6 -9 -7 -18 0 -25 C 7 -18 6 -9 0 0 Z"
                fill={`url(#${leafMidGradId})`}
              />
              <path d="M 0 0 L 0 -20" stroke="#A7F3D0" strokeWidth="1" opacity="0.85" />
              <path d="M 0 0 L 0 3.5" stroke="#047857" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          </g>

          {/* Falling Leaf 3 (Center Drift Descent) */}
          <g className="gta-falling-leaf-3">
            <g transform="scale(0.98)">
              <path
                d="M 0 0 C -5 -8 -6 -16 0 -23 C 6 -16 5 -8 0 0 Z"
                fill={`url(#${leafLightGradId})`}
              />
              <path d="M 0 0 L 0 -19" stroke="#FEF08A" strokeWidth="1" opacity="0.85" />
              <path d="M 0 0 L 0 3" stroke="#059669" strokeWidth="1.1" strokeLinecap="round" />
            </g>
          </g>
        </g>
      )}
    </svg>
  );
}

export default GrowingTreeAnim;
