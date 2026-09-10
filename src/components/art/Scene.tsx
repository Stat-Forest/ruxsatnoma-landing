import type { ReactNode } from 'react';

export const SCENE_KINDS = [
  'grazing', 'haymaking', 'apiary', 'recreation', 'deadwood', 'science',
] as const;

export type SceneKind = (typeof SCENE_KINDS)[number];

export interface SceneProps {
  kind: SceneKind;
  height: number;
  className?: string;
}

/** Every scene is drawn on this fixed canvas, then scaled to fit `height` by
 *  the `<svg>`'s own `viewBox`/`preserveAspectRatio` — the same convention
 *  `design-canvas/scenes.py` uses. */
const W = 400;
const H = 200;

function range(start: number, stop: number, step: number): number[] {
  const out: number[] = [];
  for (let x = start; x < stop; x += step) out.push(x);
  return out;
}

/**
 * The graded sky + haze every scene starts from. Gradient ids are suffixed by
 * `uid` (the scene's own `kind`) so two `Scene`s on one page never resolve
 * `url(#sky-...)` to the wrong instance's stops.
 */
function Sky({ uid, top, bottom }: { uid: string; top: string; bottom: string }): ReactNode {
  return (
    <>
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
        <linearGradient id={`haze-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity=".34" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#sky-${uid})`} />
    </>
  );
}

function Sun({
  cx, cy, r, fill = '#FFF6E0', opacity = '.55',
}: { cx: number; cy: number; r: number; fill?: string; opacity?: string }): ReactNode {
  return <circle cx={cx} cy={cy} r={r} fill={fill} opacity={opacity} />;
}

/** A row of fir silhouettes sitting on baseline `y`. */
function Conifers({
  y, xs, scale, fill, opacity = '1',
}: { y: number; xs: number[]; scale: number; fill: string; opacity?: string }): ReactNode {
  return (
    <>
      {xs.map((x) => {
        const h = 34 * scale;
        const w = 15 * scale;
        return (
          <g key={x}>
            <path d={`M${x} ${y - h} L${x + w} ${y} L${x - w} ${y} Z`} fill={fill} opacity={opacity} />
            <path
              d={`M${x} ${y - h * 1.42} L${x + w * 0.78} ${y - h * 0.48} L${x - w * 0.78} ${y - h * 0.48} Z`}
              fill={fill}
              opacity={opacity}
            />
          </g>
        );
      })}
    </>
  );
}

/* ── grazing: pasture with cattle on open hills ─────────────────────────── */

function Cow({ x, y, s, fill }: { x: number; y: number; s: number; fill: string }): ReactNode {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
      <path d="M0 0 h30 a4 4 0 0 1 4 4 v9 a3 3 0 0 1-3 3 h-2 l-1 7 h-3 l-1-7 h-15 l-1 7 h-3 l-1-7 h-2 a4 4 0 0 1-4-4 v-8 a4 4 0 0 1 2-4 Z" />
      <path d="M31 2 l7-3 a3 3 0 0 1 4 3 v5 a3 3 0 0 1-3 3 h-8 Z" />
      <path d="M38 -1 l3-4 M42 0 l4-3" stroke={fill} strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Grazing({ uid }: { uid: string }): ReactNode {
  return (
    <>
      <Sky uid={uid} top="#DFF0E3" bottom="#B7DCC0" />
      <Sun cx={322} cy={42} r={26} />
      <path d="M0 112 C 70 84, 140 116, 210 100 S 330 74, 400 104 L400 200 L0 200 Z" fill="#8FC29B" opacity=".55" />
      <Conifers y={118} xs={[26, 52, 78, 356, 380]} scale={0.62} fill="#5E9E72" opacity=".7" />
      <path d="M0 134 C 90 118, 180 144, 268 130 S 360 112, 400 128 L400 200 L0 200 Z" fill="#6FAE81" />
      <path d="M0 160 C 110 148, 220 172, 320 158 S 388 150, 400 156 L400 200 L0 200 Z" fill="#4E8C62" />
      <Cow x={112} y={138} s={1.05} fill="#2C4A36" />
      <Cow x={214} y={150} s={0.82} fill="#33553D" />
      <Cow x={286} y={132} s={0.66} fill="#3A5F45" />
      <rect width={W} height={92} fill={`url(#haze-${uid})`} />
    </>
  );
}

/* ── haymaking: mown field with round bales ─────────────────────────────── */

function Bale({
  x, y, r, fill, ring,
}: { x: number; y: number; r: number; fill: string; ring: string }): ReactNode {
  return (
    <g>
      <ellipse cx={x} cy={y} rx={r} ry={r * 0.86} fill={fill} />
      <ellipse cx={x} cy={y} rx={r * 0.42} ry={r * 0.38} fill="none" stroke={ring} strokeWidth="1.6" />
      <path d={`M${x - r} ${y + r * 0.5} h${2 * r}`} stroke={ring} strokeWidth="1.2" opacity=".5" />
    </g>
  );
}

function Haymaking({ uid }: { uid: string }): ReactNode {
  const stubbleXs = range(6, 400, 13);
  return (
    <>
      <Sky uid={uid} top="#F6EEDA" bottom="#E4D3A8" />
      <Sun cx={74} cy={46} r={22} fill="#FFF3D2" opacity=".8" />
      <Conifers y={104} xs={[300, 326, 352, 378]} scale={0.55} fill="#A9995F" opacity=".45" />
      <path d="M0 108 C 90 96, 180 116, 270 104 S 360 92, 400 102 L400 200 L0 200 Z" fill="#D9C286" />
      <path d="M0 132 C 110 122, 210 142, 310 130 S 380 122, 400 128 L400 200 L0 200 Z" fill="#C9AE6B" />
      <Bale x={96} y={146} r={22} fill="#B08F4E" ring="#8E7139" />
      <Bale x={196} y={158} r={17} fill="#BD9B57" ring="#96793E" />
      <Bale x={286} y={140} r={13} fill="#C7A662" ring="#9C7F42" />
      <path d="M0 172 C 120 164, 240 182, 340 172 S 392 168, 400 170 L400 200 L0 200 Z" fill="#A98A4A" />
      {stubbleXs.map((x) => (
        <path key={x} d={`M${x} 200 v-${6 + (x % 7)}`} stroke="#B79A5C" strokeWidth="1.1" opacity=".5" />
      ))}
      <rect width={W} height={88} fill={`url(#haze-${uid})`} />
    </>
  );
}

/* ── apiary: hives at the edge of a flowering meadow, bees in the air ───── */

function Hive({
  x, y, s, body, roof,
}: { x: number; y: number; s: number; body: string; roof: string }): ReactNode {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-16} y={-30} width={32} height={30} rx={2} fill={body} />
      <rect x={-16} y={-22} width={32} height={2.4} fill={roof} opacity=".55" />
      <rect x={-16} y={-13} width={32} height={2.4} fill={roof} opacity=".55" />
      <path d="M-20 -30 h40 l-4 -7 h-32 Z" fill={roof} />
      <rect x={-5} y={-7} width={10} height={4} rx={1} fill={roof} opacity=".8" />
    </g>
  );
}

const BEE_POSITIONS: [x: number, y: number][] = [[150, 74], [232, 58], [300, 88]];

function Apiary({ uid }: { uid: string }): ReactNode {
  const flowerXs = range(10, 400, 17);
  return (
    <>
      <Sky uid={uid} top="#FBF1DA" bottom="#EBD7A6" />
      <Sun cx={330} cy={40} r={24} fill="#FFF7DE" opacity=".75" />
      <Conifers y={100} xs={[24, 48, 72, 96]} scale={0.6} fill="#9A8547" opacity=".45" />
      <path d="M0 104 C 100 92, 190 112, 280 100 S 366 90, 400 98 L400 200 L0 200 Z" fill="#DCC68C" />
      <path d="M0 138 C 120 128, 230 148, 330 136 S 388 130, 400 134 L400 200 L0 200 Z" fill="#C9AE6B" />
      <Hive x={78} y={152} s={1.05} body="#A9762F" roof="#84591F" />
      <Hive x={140} y={158} s={0.95} body="#B98338" roof="#8E6224" />
      <Hive x={198} y={150} s={0.8} body="#C08C42" roof="#96682A" />
      {BEE_POSITIONS.map(([x, y], i) => (
        // eslint-disable-next-line react/no-array-index-key -- fixed, never reordered
        <g key={i} className="bee" style={{ animationDelay: `${i * 0.7}s` }}>
          <circle cx={x} cy={y} r={2.6} fill="#8A6A22" />
          <ellipse cx={x - 1} cy={y - 2.6} rx={3} ry={1.5} fill="#FFFFFF" opacity=".7" />
        </g>
      ))}
      {flowerXs.map((x) => (
        <circle key={x} cx={x} cy={176 - (x % 11)} r={2.4} fill={x % 3 ? '#F2D07A' : '#E8B4C8'} opacity=".85" />
      ))}
      <rect width={W} height={86} fill={`url(#haze-${uid})`} />
    </>
  );
}

/* ── recreation: a tent and a footpath in a pine clearing ───────────────── */

function Recreation({ uid }: { uid: string }): ReactNode {
  return (
    <>
      <Sky uid={uid} top="#DCEAF0" bottom="#B4D2DE" />
      <Sun cx={88} cy={40} r={20} fill="#FFFFFF" opacity=".5" />
      <path
        d="M0 96 L58 52 L112 96 L166 46 L228 100 L292 58 L352 102 L400 74 L400 200 L0 200 Z"
        fill="#8FB2BF"
        opacity=".55"
      />
      <Conifers y={126} xs={[30, 58, 86, 330, 358, 386]} scale={0.78} fill="#4E7F72" />
      <Conifers y={122} xs={[116, 300]} scale={0.58} fill="#5C8E80" opacity=".8" />
      <path d="M0 132 C 110 122, 210 142, 310 130 S 384 124, 400 128 L400 200 L0 200 Z" fill="#5F8F76" />
      <path
        d="M186 200 C 196 172, 206 156, 214 142 C 220 132, 228 128, 236 126"
        stroke="#D9CDA8"
        strokeWidth="16"
        fill="none"
        strokeLinecap="round"
        opacity=".85"
      />
      <path
        d="M186 200 C 196 172, 206 156, 214 142"
        stroke="#EDE3C6"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
        opacity=".7"
      />
      <g>
        <path d="M128 168 L152 130 L176 168 Z" fill="#C4574A" />
        <path d="M152 130 L160 168 L144 168 Z" fill="#A8443A" />
        <path d="M152 130 v-6" stroke="#8E3A31" strokeWidth="2" strokeLinecap="round" />
      </g>
      <path d="M0 176 C 120 168, 250 186, 340 176 S 392 172, 400 174 L400 200 L0 200 Z" fill="#4E7A64" />
      <rect width={W} height={84} fill={`url(#haze-${uid})`} />
    </>
  );
}

/* ── deadwood: fallen branches and a stacked woodpile ───────────────────── */

function Log({
  x, y, w, h, fill, ring,
}: { x: number; y: number; w: number; h: number; fill: string; ring: string }): ReactNode {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} />
      <circle cx={x + w - h / 2} cy={y + h / 2} r={h / 2 - 1.4} fill="none" stroke={ring} strokeWidth="1.3" />
    </g>
  );
}

function Deadwood({ uid }: { uid: string }): ReactNode {
  return (
    <>
      <Sky uid={uid} top="#EFEADF" bottom="#D8D0BF" />
      <Conifers y={112} xs={[22, 46, 70, 94, 306, 330, 354, 378]} scale={0.72} fill="#7E7A63" opacity=".55" />
      <Conifers y={108} xs={[140, 268]} scale={0.5} fill="#8C8770" opacity=".4" />
      <path d="M0 116 C 100 106, 200 126, 300 114 S 380 106, 400 112 L400 200 L0 200 Z" fill="#BDB49E" />
      <path d="M0 146 C 110 138, 220 158, 320 146 S 390 140, 400 144 L400 200 L0 200 Z" fill="#A79D85" />
      <Log x={66} y={150} w={76} h={13} fill="#8A7C60" ring="#6E6249" />
      <Log x={78} y={138} w={60} h={12} fill="#96876A" ring="#786A50" />
      <Log x={90} y={127} w={42} h={11} fill="#A08F70" ring="#7F7154" />
      <path
        d="M206 172 l40 -22 M212 160 l34 12 M250 168 l30 -18 M258 154 l26 16"
        stroke="#7E7157"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path d="M300 176 l26 -14 M306 164 l22 12" stroke="#8B7D61" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M0 180 C 130 174, 260 190, 350 180 S 394 178, 400 179 L400 200 L0 200 Z" fill="#8F8570" />
      <rect width={W} height={80} fill={`url(#haze-${uid})`} />
    </>
  );
}

/* ── science: a surveyed tree, measuring stake, sample plot markers ─────── */

function Science({ uid }: { uid: string }): ReactNode {
  return (
    <>
      <Sky uid={uid} top="#E4E9F2" bottom="#C3CCE0" />
      <Sun cx={320} cy={44} r={22} fill="#FFFFFF" opacity=".45" />
      <path
        d="M0 100 L64 62 L124 104 L188 58 L252 106 L316 66 L376 104 L400 88 L400 200 L0 200 Z"
        fill="#9AA6C0"
        opacity=".5"
      />
      <Conifers y={128} xs={[30, 56, 82, 344, 370]} scale={0.74} fill="#5C6B8C" opacity=".85" />
      <path d="M0 136 C 110 126, 220 146, 320 134 S 386 128, 400 132 L400 200 L0 200 Z" fill="#6C7A99" />
      <g>
        <rect x={176} y={112} width={15} height={76} rx={3} fill="#4F5B78" />
        <path d="M183 116 C 150 100, 140 74, 150 56 C 168 62, 184 84, 183 116 Z" fill="#41597A" />
        <path d="M183 118 C 216 100, 228 76, 220 58 C 200 64, 184 86, 183 118 Z" fill="#4A6486" />
        <rect x={170} y={134} width={27} height={15} rx={3} fill="#F2C879" />
        <path d="M175 141 h17" stroke="#8A6A22" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g>
        <rect x={252} y={130} width={5} height={58} rx={2} fill="#D8DEE9" />
        <path d="M252 142 h5 M252 154 h5 M252 166 h5" stroke="#7C89A6" strokeWidth="1.8" />
        <path d="M244 130 h21 l-6 -9 h-9 Z" fill="#C4574A" />
      </g>
      <g stroke="#5A6885" strokeWidth="1.6" strokeDasharray="5 4" fill="none">
        <path d="M96 176 h230" />
      </g>
      <circle cx={96} cy={176} r={4} fill="#4F5B78" />
      <circle cx={326} cy={176} r={4} fill="#4F5B78" />
      <path d="M0 182 C 120 176, 250 192, 350 182 S 394 180, 400 181 L400 200 L0 200 Z" fill="#5C6A88" />
      <rect width={W} height={82} fill={`url(#haze-${uid})`} />
    </>
  );
}

const SCENE_RENDERERS: Record<SceneKind, (uid: string) => ReactNode> = {
  grazing: (uid) => <Grazing uid={uid} />,
  haymaking: (uid) => <Haymaking uid={uid} />,
  apiary: (uid) => <Apiary uid={uid} />,
  recreation: (uid) => <Recreation uid={uid} />,
  deadwood: (uid) => <Deadwood uid={uid} />,
  science: (uid) => <Science uid={uid} />,
};

/**
 * The six activity illustrations (#173, ruling R1). Drawn rather than
 * photographed: ~4 KB each, they recolour with the palette and read as one
 * series. Decorative only — always aria-hidden.
 *
 * Ported from `design-canvas/scenes.py` — same layered-silhouette markup,
 * translated from the Python string-building functions into JSX. Gradient
 * ids are suffixed by `kind` (`sky-grazing`, `haze-grazing`, …) so two
 * `Scene`s on one page never collide over a `<linearGradient>` id.
 */
export function Scene({ kind, height, className }: SceneProps) {
  return (
    <svg
      className={className}
      width="100%"
      height={height}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {SCENE_RENDERERS[kind](kind)}
    </svg>
  );
}
