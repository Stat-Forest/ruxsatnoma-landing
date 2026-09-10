import type { ReactNode } from 'react';
import { Bale, Hive, Log, Sheep } from './shapes';

/**
 * The home page hero's three backgrounds: one layered mountain-and-forest
 * panorama, drawn once, with a different focal group on the meadow for each
 * slide — the permitted plot, the QR checkpoint, the six activities. Same
 * silhouette language and the same `shapes` as the activity cards (`Scene`),
 * so the hero and the cards read as one illustration set.
 *
 * Drawn on a fixed 1440×620 canvas and cropped by `xMidYMid slice`. Two
 * things eat the canvas: the quick-check strip overlaps the hero's bottom
 * ~110px, and the active slide is zoomed 7% about its centre — together they
 * hide everything below y≈497. So the meadow and every focal object live in
 * y 440–496; the near forest and the ferns below only ever show their tops.
 * On a phone the hero is 460px tall and ~375 wide, which shows only
 * x≈480–960 — mountains, forest, the lake, the first sheep at the edge — and
 * none of the cards. That is deliberate: the copy covers the whole width
 * there. Keep every focal object right of x≈880 so it never sits under the
 * text at any width.
 *
 * Light shafts, mist and the birds are NOT here — `HeroSlider`'s `Atmosphere`
 * overlay animates those once for all three slides.
 */
const W = 1440;
const H = 620;

/** Deterministic LCG so the forest is the same on every render (and in
 *  every snapshot): the tree rows are placed by it, never by `Math.random`. */
function lcg(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/* ── landscape pieces ───────────────────────────────────────────────────── */

function Conifer({ x, y, h, fill }: { x: number; y: number; h: number; fill: string }): ReactNode {
  const w = h * 0.36;
  return (
    <g fill={fill}>
      <path
        d={`M${x} ${y - h} L${x + w} ${y - h * 0.45} L${x + w * 0.55} ${y - h * 0.45} L${x + w * 1.25} ${y - h * 0.1} L${x + w * 0.8} ${y - h * 0.1} L${x + w * 1.5} ${y} L${x - w * 1.5} ${y} L${x - w * 0.8} ${y - h * 0.1} L${x - w * 1.25} ${y - h * 0.1} L${x - w * 0.55} ${y - h * 0.45} L${x - w} ${y - h * 0.45} Z`}
      />
      <rect x={x - h * 0.04} y={y - 2} width={h * 0.08} height={h * 0.12} />
    </g>
  );
}

/** A row of conifers along baseline `y` from `x0` to `x1`, heights between
 *  `hMin` and `hMax`, spacing jittered around `step`. */
function ForestBand({
  y, x0, x1, step, hMin, hMax, fill, opacity = 1, seed,
}: {
  y: number; x0: number; x1: number; step: number; hMin: number; hMax: number;
  fill: string; opacity?: number; seed: number;
}): ReactNode {
  const rnd = lcg(seed);
  const trees: ReactNode[] = [];
  for (let x = x0; x < x1; x += step * (0.7 + rnd() * 0.6)) {
    const h = hMin + rnd() * (hMax - hMin);
    trees.push(<Conifer key={trees.length} x={x} y={y + rnd() * 6} h={h} fill={fill} />);
  }
  return <g opacity={opacity}>{trees}</g>;
}

/** Topographic isolines — `n` wobbly rings around (cx, cy), the map motif the
 *  permit system is built on, kept faint enough to read as sky texture. */
function Isolines({
  cx, cy, n, r0, dr, stroke, opacity,
}: { cx: number; cy: number; n: number; r0: number; dr: number; stroke: string; opacity: number }): ReactNode {
  const rings: ReactNode[] = [];
  for (let k = 0; k < n; k++) {
    const r = r0 + k * dr;
    let d = '';
    for (let i = 0; i <= 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      const w = 1 + 0.1 * Math.sin(a * 3 + k * 0.7) + 0.06 * Math.sin(a * 5 + k * 1.3) + 0.04 * Math.cos(a * 7 + k);
      const x = cx + Math.cos(a) * r * w * 1.35;
      const y = cy + Math.sin(a) * r * w;
      d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)} `;
    }
    rings.push(<path key={k} d={`${d}Z`} stroke={stroke} strokeWidth="1" fill="none" opacity={opacity} />);
  }
  return <>{rings}</>;
}

/** A ranger's lookout tower on the ridge; base centred at (x, y). */
function Tower({ x, y, s, fill }: { x: number; y: number; s: number; fill: string }): ReactNode {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
      <path d="M-10 0 L -4 -46 L 4 -46 L 10 0 Z" opacity=".95" />
      <path d="M-9 -8 L 9 -18 M-8 -20 L 8 -30 M-6 -32 L 6 -40" stroke={fill} strokeWidth="1.6" />
      <rect x={-14} y={-62} width={28} height={16} rx={1.5} />
      <path d="M-18 -62 h36 l-18 -12 Z" />
      <rect x={-11} y={-58} width={22} height={7} fill="#7FB98A" opacity=".55" />
    </g>
  );
}

/** A stag, facing left, hooves on y=0 (local). */
function Deer({ x, y, s, fill, flip = false }: { x: number; y: number; s: number; fill: string; flip?: boolean }): ReactNode {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} fill={fill}>
      <path d="M-30 -30 C -34 -22, -34 -8, -28 -4 L -24 -4 L -22 0 L -18 0 L -16 -12 L 4 -12 L 6 0 L 10 0 L 12 -4 L 18 -4 C 24 -10, 22 -24, 14 -30 Z" />
      <path d="M-28 -32 C -20 -40, 0 -40, 14 -32 L 16 -20 L -30 -20 Z" />
      <path d="M12 -32 L 22 -52 L 30 -52 L 28 -40 L 22 -30 Z" />
      <path d="M27 -42 L 34 -46 L 31 -40 Z" />
      <path d="M24 -52 L 18 -66 L 24 -60 L 26 -72 L 29 -60 L 36 -66 L 32 -52 Z" />
      <path d="M26 -54 L 16 -62 L 12 -70 L 18 -64 Z" />
      <rect x={-22} y={-6} width={4} height={10} rx={1.5} />
      <rect x={-6} y={-6} width={4} height={10} rx={1.5} />
      <rect x={8} y={-6} width={4} height={10} rx={1.5} />
      <rect x={18} y={-8} width={4} height={12} rx={1.5} />
    </g>
  );
}

/** A fern frond fan in the foreground corner; root at (x, y). */
function Fern({ x, y, s, fill, flip = false }: { x: number; y: number; s: number; fill: string; flip?: boolean }): ReactNode {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} fill={fill}>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`rotate(${-80 + i * 22})`}>
          <path d="M0 0 C 10 -30, 20 -60, 30 -100 C 34 -88, 36 -70, 32 -50 C 36 -60, 44 -76, 48 -84 C 44 -60, 40 -40, 30 -20 C 36 -28, 44 -34, 50 -36 C 40 -20, 22 -6, 0 0 Z" />
        </g>
      ))}
    </g>
  );
}

const SNOW_CAPS = [
  'M262 232 L238 262 L252 258 L266 270 L282 256 L296 262 Z',
  'M590 250 L568 278 L584 274 L596 286 L612 272 L624 280 Z',
  'M960 230 L936 262 L952 256 L964 272 L982 258 L998 266 Z',
  'M1310 270 L1290 296 L1304 292 L1316 302 L1330 290 L1342 296 Z',
  'M410 262 L394 282 L406 278 L416 288 L428 276 Z',
  'M1120 262 L1104 282 L1116 278 L1126 288 L1138 276 Z',
];

const INK = '#0E2C18';

/**
 * The shared panorama. `children` is the slide's focal group, painted on the
 * meadow between the middle and the near forest so the foreground trees and
 * ferns still frame it. Gradient ids carry `uid` because all three slides are
 * in the DOM at once (the slider cross-fades them) and `url(#…)` resolves
 * document-wide.
 */
function Landscape({ uid, children }: { uid: string; children: ReactNode }): ReactNode {
  const id = (name: string) => `hero-${uid}-${name}`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className="block w-full h-full"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={id('sky')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0B2619" />
          <stop offset=".45" stopColor="#1B4A2E" />
          <stop offset=".72" stopColor="#3E7A52" />
          <stop offset=".9" stopColor="#C9A86A" />
          <stop offset="1" stopColor="#E8C48C" />
        </linearGradient>
        <radialGradient
          id={id('glow')}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(1120 190) scale(360)"
        >
          <stop offset="0" stopColor="#FFE9B8" stopOpacity=".55" />
          <stop offset=".4" stopColor="#FFE9B8" stopOpacity=".14" />
          <stop offset="1" stopColor="#FFE9B8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('lake')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B9D7B0" stopOpacity=".6" />
          <stop offset="1" stopColor="#2F7A5A" stopOpacity=".35" />
        </linearGradient>
      </defs>

      <rect width={W} height={H} fill={`url(#${id('sky')})`} />
      <Isolines cx={1180} cy={120} n={7} r0={60} dr={42} stroke="#9CCBA4" opacity={0.13} />
      <Isolines cx={420} cy={40} n={5} r0={50} dr={40} stroke="#9CCBA4" opacity={0.09} />
      <rect width={W} height={H} fill={`url(#${id('glow')})`} />
      <circle cx={1120} cy={190} r={54} fill="#FFF1CF" opacity=".95" />

      {/* far range with snow, then the nearer ridge */}
      <path
        d="M0 372 L90 300 L170 336 L262 232 L330 292 L410 262 L500 330 L590 250 L680 320 L760 276 L860 338 L960 230 L1040 300 L1120 262 L1220 340 L1310 270 L1440 330 L1440 620 L0 620 Z"
        fill="#4E7F6A"
        opacity=".75"
      />
      <g fill="#F3E9DA" opacity=".7">
        {SNOW_CAPS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <path
        d="M0 420 L120 372 L230 410 L360 342 L470 400 L600 360 L720 420 L850 366 L980 424 L1100 372 L1220 420 L1330 380 L1440 418 L1440 620 L0 620 Z"
        fill="#2B5E40"
        opacity=".92"
      />

      {/* far forest and the lake */}
      <ForestBand y={402} x0={-20} x1={1470} step={26} hMin={36} hMax={58} fill="#1E4C2F" opacity={0.85} seed={7} />
      <rect x={0} y={404} width={W} height={H - 404} fill="#1B4527" />
      <path
        d="M620 448 C 720 432, 900 430, 1010 442 C 1060 448, 1070 462, 1040 472 C 940 486, 700 488, 640 476 C 600 468, 590 456, 620 448 Z"
        fill={`url(#${id('lake')})`}
      />
      <path
        d="M700 462 h60 M800 470 h90 M940 460 h50 M660 470 h30 M960 474 h30"
        stroke="#DDEFD8"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity=".5"
      />
      <Tower x={1338} y={402} s={1.2} fill={INK} />

      {/* middle forest and the meadow */}
      <ForestBand y={462} x0={-20} x1={600} step={30} hMin={50} hMax={84} fill="#143A20" seed={3} />
      <ForestBand y={468} x0={1300} x1={1470} step={28} hMin={46} hMax={78} fill="#143A20" seed={5} />
      <path
        d="M0 462 C 200 448, 420 474, 620 462 S 900 448, 1100 468 S 1340 476, 1440 466 L1440 620 L0 620 Z"
        fill="#12361E"
      />

      {children}

      {/* near forest, the ground, ferns framing the corners */}
      <ForestBand y={548} x0={-20} x1={520} step={34} hMin={60} hMax={110} fill={INK} seed={11} />
      <ForestBand y={556} x0={1310} x1={1470} step={34} hMin={56} hMax={100} fill={INK} seed={13} />
      <path d="M0 550 C 240 534, 480 562, 720 550 S 1120 562, 1440 548 L1440 620 L0 620 Z" fill="#08200F" />
      <Fern x={60} y={600} s={1} fill="#061A0C" />
      <Fern x={1400} y={600} s={1.15} fill="#061A0C" flip />
      <Fern x={1290} y={608} s={0.7} fill="#061A0C" />
    </svg>
  );
}

/* ── focal groups ───────────────────────────────────────────────────────── */

const ACCENT = '#8FE0A6';
const FLEECE = '#EDE6D2';

/** A permit as a map pop-up: QR, two text lines, a status pill, a check badge. */
function PermitCard({ x, y }: { x: number; y: number }): ReactNode {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={150} height={92} rx={12} fill="#FFFFFF" opacity=".96" />
      <rect x={14} y={14} width={44} height={44} rx={6} fill="#0F3A26" />
      <g fill={ACCENT}>
        <rect x={19} y={19} width={10} height={10} />
        <rect x={43} y={19} width={10} height={10} />
        <rect x={19} y={43} width={10} height={10} />
        <rect x={33} y={33} width={6} height={6} />
        <rect x={43} y={43} width={4} height={4} />
        <rect x={49} y={49} width={4} height={4} />
        <rect x={33} y={19} width={4} height={4} />
        <rect x={19} y={33} width={4} height={4} />
      </g>
      <rect x={70} y={18} width={62} height={9} rx={4.5} fill="#1A1F24" opacity=".85" />
      <rect x={70} y={33} width={44} height={7} rx={3.5} fill="#6B7280" opacity=".55" />
      <rect x={70} y={46} width={52} height={7} rx={3.5} fill="#6B7280" opacity=".55" />
      <rect x={14} y={68} width={70} height={14} rx={7} fill="#E4F5EA" />
      <circle cx={24} cy={75} r={3.2} fill="#1E8A4C" />
      <rect x={31} y={72} width={44} height={6} rx={3} fill="#1E8A4C" opacity=".75" />
      <circle cx={150} cy={0} r={14} fill="#1E8A4C" />
      <path d="M143 0 l5 5 l9 -10" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

const PLOT_CORNERS: [number, number][] = [[920, 470], [1040, 450], [1230, 458], [1290, 486], [1160, 496], [960, 492]];

/** Slide 1 — the permitted plot: a dashed contour on the meadow with its
 *  corner markers, the flock inside it, the permit pinned above. */
function PermitPlot({ uid }: { uid: string }): ReactNode {
  const fillId = `hero-${uid}-plot`;
  return (
    <>
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={ACCENT} stopOpacity=".28" />
          <stop offset="1" stopColor={ACCENT} stopOpacity=".08" />
        </linearGradient>
      </defs>
      <path
        d={`M${PLOT_CORNERS.map(([x, y]) => `${x} ${y}`).join(' L')} Z`}
        fill={`url(#${fillId})`}
        stroke={ACCENT}
        strokeWidth="2.2"
        strokeDasharray="10 7"
        strokeLinejoin="round"
      />
      {PLOT_CORNERS.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={5} fill="#0F3A26" stroke={ACCENT} strokeWidth="2" />
      ))}
      <Sheep x={990} y={442} s={1} fleece={FLEECE} dark={INK} />
      <Sheep x={1060} y={452} s={0.9} fleece={FLEECE} dark={INK} />
      <Sheep x={1140} y={446} s={0.75} fleece="#E9E1CB" dark={INK} />
      <Sheep x={1190} y={460} s={0.65} fleece="#E9E1CB" dark={INK} />
      <Deer x={1250} y={444} s={0.75} fill={INK} flip />
      <path d="M1095 432 L1095 396" stroke={ACCENT} strokeWidth="1.6" opacity=".8" />
      <circle cx={1095} cy={432} r={4} fill={ACCENT} />
      <PermitCard x={1020} y={304} />
    </>
  );
}

/** A wooden signboard carrying a QR plate; post base at (x, y). */
function Signpost({ x, y }: { x: number; y: number }): ReactNode {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-5} y={-96} width={10} height={96} rx={2} fill="#3E2E1C" />
      <rect x={-38} y={-100} width={76} height={54} rx={4} fill="#6E4F2E" />
      <path d="M-44 -100 h88 l-6 -9 h-76 Z" fill="#4A361F" />
      <rect x={-31} y={-93} width={40} height={40} rx={3} fill="#FFFFFF" />
      <g fill="#0F3A26">
        <rect x={-27} y={-89} width={9} height={9} />
        <rect x={-5} y={-89} width={9} height={9} />
        <rect x={-27} y={-67} width={9} height={9} />
        <rect x={-14} y={-76} width={5} height={5} />
        <rect x={-5} y={-67} width={4} height={4} />
        <rect x={0} y={-62} width={4} height={4} />
        <rect x={-14} y={-89} width={4} height={4} />
        <rect x={-27} y={-76} width={4} height={4} />
      </g>
      <rect x={14} y={-90} width={18} height={5} rx={2.5} fill="#D9C39A" opacity=".8" />
      <rect x={14} y={-80} width={18} height={4} rx={2} fill="#D9C39A" opacity=".55" />
      <rect x={14} y={-72} width={12} height={4} rx={2} fill="#D9C39A" opacity=".55" />
    </g>
  );
}

/** A phone mid-scan: viewfinder corners, the result check; bottom-centre at (x, y). */
function Phone({ x, y, tilt }: { x: number; y: number; tilt: number }): ReactNode {
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
      <rect x={-34} y={-136} width={68} height={136} rx={12} fill="#0F2A1A" stroke={ACCENT} strokeWidth="1.5" strokeOpacity=".55" />
      <rect x={-28} y={-126} width={56} height={116} rx={7} fill="#F4F7F4" />
      <rect x={-10} y={-131} width={20} height={3} rx={1.5} fill="#2C3E33" />
      <g stroke="#1E8A4C" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M-20 -108 v-8 h8 M12 -116 h8 v8 M-20 -60 v8 h8 M20 -60 v8 h-8" />
      </g>
      <circle cx={0} cy={-84} r={16} fill="#1E8A4C" />
      <path d="M-8 -84 l6 6 l10 -12" stroke="#fff" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x={-18} y={-40} width={36} height={6} rx={3} fill="#1A1F24" opacity=".75" />
      <rect x={-12} y={-29} width={24} height={5} rx={2.5} fill="#6B7280" opacity=".5" />
    </g>
  );
}

/** Slide 2 — the QR checkpoint: a signboard at the forest road, the phone
 *  that just read it, the beam between them. */
function QrCheckpoint(): ReactNode {
  return (
    <>
      <path
        d="M700 560 C 780 532, 880 514, 980 508 C 1080 502, 1160 504, 1240 512"
        stroke="#5F8F6C"
        strokeWidth="22"
        fill="none"
        strokeLinecap="round"
        opacity=".5"
      />
      <Sheep x={900} y={452} s={0.75} fleece={FLEECE} dark={INK} />
      <Sheep x={950} y={460} s={0.65} fleece="#E9E1CB" dark={INK} />
      <Deer x={1290} y={472} s={0.7} fill={INK} />
      <Signpost x={1200} y={498} />
      <path d="M1102 408 L1168 420" stroke={ACCENT} strokeWidth="2" strokeDasharray="6 5" opacity=".85" />
      <Phone x={1060} y={496} tilt={-8} />
    </>
  );
}

/** A map pin, tip at (x, y). */
function Pin({ x, y }: { x: number; y: number }): ReactNode {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0 C-7 -8 -9 -14 -9 -18 A9 9 0 1 1 9 -18 C9 -14 7 -8 0 0Z" fill={ACCENT} />
      <circle cx={0} cy={-18} r={3.5} fill="#0F3A26" />
    </g>
  );
}

function Tent({ x, y, s }: { x: number; y: number; s: number }): ReactNode {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-24 0 L0 -38 L24 0 Z" fill="#C4574A" />
      <path d="M0 -38 L8 0 L-8 0 Z" fill="#A8443A" />
      <path d="M0 -38 v-6" stroke="#8E3A31" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

/** A measuring stake with a red cap; base at (x, y). */
function Stake({ x, y, s }: { x: number; y: number; s: number }): ReactNode {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-2.5} y={-58} width={5} height={58} rx={2} fill="#D8DEE9" />
      <path d="M-2.5 -46 h5 M-2.5 -34 h5 M-2.5 -22 h5" stroke="#7C89A6" strokeWidth="1.8" />
      <path d="M-10.5 -58 h21 l-6 -9 h-9 Z" fill="#C4574A" />
    </g>
  );
}

/** Slide 3 — every activity the portal issues a permit for, pinned across
 *  one meadow: hives, bales, a tent, a woodpile, the flock, a survey stake. */
function SixActivities(): ReactNode {
  return (
    <>
      <Hive x={900} y={488} s={1.2} body="#C08C42" roof="#8E6224" />
      <Hive x={944} y={494} s={1.05} body="#B98338" roof="#8E6224" />
      <Pin x={922} y={432} />
      <Bale x={1014} y={478} r={18} fill="#C7A662" ring="#8E7139" />
      <Bale x={1052} y={488} r={14} fill="#BD9B57" ring="#8E7139" />
      <Pin x={1030} y={444} />
      <Sheep x={1076} y={454} s={0.85} fleece={FLEECE} dark={INK} />
      <Sheep x={1128} y={464} s={0.7} fleece="#E9E1CB" dark={INK} />
      <Pin x={1104} y={436} />
      <Tent x={1186} y={490} s={1} />
      <Pin x={1186} y={440} />
      <Log x={1220} y={478} w={58} h={12} fill="#A08F70" ring="#6E6249" />
      <Log x={1228} y={467} w={44} h={11} fill="#96876A" ring="#6E6249" />
      <Pin x={1252} y={452} />
      <Stake x={1300} y={490} s={0.8} />
      <Pin x={1300} y={426} />
      <Deer x={1362} y={472} s={0.65} fill={INK} />
    </>
  );
}

/* ── the three slides — in `HeroSlider`'s order: apply, verify, services ── */

export function PermitSlideArt(): ReactNode {
  return (
    <Landscape uid="permit">
      <PermitPlot uid="permit" />
    </Landscape>
  );
}

export function VerifySlideArt(): ReactNode {
  return (
    <Landscape uid="verify">
      <QrCheckpoint />
    </Landscape>
  );
}

export function ServicesSlideArt(): ReactNode {
  return (
    <Landscape uid="services">
      <SixActivities />
    </Landscape>
  );
}

