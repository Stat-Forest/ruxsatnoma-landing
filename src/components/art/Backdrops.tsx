import type { ReactNode } from 'react';
import { Bale, Isolines } from './shapes';

/**
 * Faint scenery behind the home page's sections, so the page below the hero
 * is not one white sheet. Each is an absolutely positioned `<svg>` meant to
 * fill a `relative overflow-hidden` band (see `Band`), drawn from the same
 * `shapes` as the cards and the hero and kept at single-digit opacities so
 * text and cards above it stay exactly as legible as on white.
 *
 * Decorative only — every backdrop is `aria-hidden`.
 */

/** Map isolines drifting in from the right, with one small dashed contour and
 *  its corner markers — the permit-as-a-polygon motif from the hero. */
export function IsolinesBackdrop(): ReactNode {
  return (
    <svg
      className="absolute inset-y-0 right-0 h-full w-[70%]"
      viewBox="0 0 900 420"
      preserveAspectRatio="xMaxYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <Isolines cx={640} cy={200} n={10} r0={36} dr={36} stroke="#2E7D4F" opacity={0.085} />
      <g opacity=".22">
        <path
          d="M640 320 L730 296 L820 308 L840 350 L750 376 L660 362 Z"
          fill="#2E7D4F"
          fillOpacity=".18"
          stroke="#2E7D4F"
          strokeWidth="1.6"
          strokeDasharray="7 5"
          strokeLinejoin="round"
        />
        {[[640, 320], [730, 296], [820, 308], [840, 350], [750, 376], [660, 362]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={3.5} fill="#FFFFFF" stroke="#2E7D4F" strokeWidth="1.6" />
        ))}
      </g>
    </svg>
  );
}

/** Mown hills along the bottom edge with three bales — the haymaking card's
 *  palette, for the tariff calculator. */
export function HayfieldBackdrop(): ReactNode {
  return (
    <svg
      className="absolute inset-x-0 bottom-0 w-full h-[62%]"
      viewBox="0 0 1440 320"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M0 210 C 240 160, 480 236, 720 196 S 1200 150, 1440 206 L1440 320 L0 320 Z" fill="#D9C286" opacity=".22" />
      <path d="M0 262 C 260 232, 520 282, 780 254 S 1240 228, 1440 258 L1440 320 L0 320 Z" fill="#C9AE6B" opacity=".22" />
      <g opacity=".3">
        <Bale x={190} y={252} r={22} fill="#B08F4E" ring="#8E7139" />
        <Bale x={1180} y={236} r={18} fill="#BD9B57" ring="#96793E" />
        <Bale x={1290} y={258} r={14} fill="#C7A662" ring="#9C7F42" />
      </g>
    </svg>
  );
}

/** A far treeline and two soft hills along the bottom edge, for the steps. */
export function HillsBackdrop(): ReactNode {
  const trees: ReactNode[] = [];
  for (let x = 20; x < 1460; x += 34) {
    const h = 26 + ((x * 7) % 5) * 5;
    const w = h * 0.42;
    trees.push(
      <path key={x} d={`M${x} ${186 - h} L${x + w} 186 L${x - w} 186 Z`} />,
    );
  }
  return (
    <svg
      className="absolute inset-x-0 bottom-0 w-full h-[34%]"
      viewBox="0 0 1440 240"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="#2E7D4F" opacity=".07">{trees}</g>
      <path d="M0 190 C 240 160, 480 214, 720 186 S 1200 156, 1440 190 L1440 240 L0 240 Z" fill="#2E7D4F" opacity=".08" />
      <path d="M0 220 C 260 202, 520 234, 780 218 S 1240 204, 1440 222 L1440 240 L0 240 Z" fill="#2E7D4F" opacity=".1" />
    </svg>
  );
}
