import type { ReactNode } from 'react';

/**
 * The objects two illustrations share: the activity cards (`Scene`) and the
 * home page hero (`HeroPanorama`) scatter the same sheep, hives, bales and
 * logs so they read as one set. Each is drawn in its own local box and placed
 * with `translate`/`scale`; the caller picks the colours.
 */

/** A sheep facing left, feet on y=36 of its local box; `flip` mirrors it. */
export function Sheep({
  x, y, s, fleece, dark, flip = false,
}: { x: number; y: number; s: number; fleece: string; dark: string; flip?: boolean }): ReactNode {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <rect x={10} y={26} width={3.4} height={10} rx={1.5} fill={dark} />
      <rect x={16} y={26} width={3.4} height={10} rx={1.5} fill={dark} />
      <rect x={30} y={26} width={3.4} height={10} rx={1.5} fill={dark} />
      <rect x={36} y={26} width={3.4} height={10} rx={1.5} fill={dark} />
      <path
        d="M8 20 C 4 14, 8 8, 14 9 C 16 4, 24 3, 28 7 C 34 4, 42 8, 40 15 C 45 18, 43 27, 36 28 L 12 28 C 6 28, 5 23, 8 20 Z"
        fill={fleece}
      />
      <path d="M9 16 C 4 17, 1 22, 3 27 C 4 30, 8 31, 10 29 C 12 27, 13 20, 9 16 Z" fill={dark} />
      <path d="M8 17 L 3 15 L 5 20 Z" fill={dark} />
    </g>
  );
}

export function Hive({
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

export function Bale({
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

export function Log({
  x, y, w, h, fill, ring,
}: { x: number; y: number; w: number; h: number; fill: string; ring: string }): ReactNode {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} />
      <circle cx={x + w - h / 2} cy={y + h / 2} r={h / 2 - 1.4} fill="none" stroke={ring} strokeWidth="1.3" />
    </g>
  );
}
