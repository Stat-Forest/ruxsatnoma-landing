import { useId } from 'react';
import type { CSSProperties, ReactElement, SVGProps } from 'react';

export type WaveVariant = 'gentle' | 'layered' | 'curve' | 'peaks' | 'fluid';

export interface BaseWaveDividerProps extends SVGProps<SVGSVGElement> {
  /**
   * Starting gradient color.
   * @default '#0F3D2E'
   */
  fromColor?: string;
  /**
   * Ending gradient color.
   * @default '#2ECC71'
   */
  toColor?: string;
  /**
   * Placement relative to the section:
   * - 'bottom': wave is anchored to the bottom edge.
   * - 'top': wave is flipped vertically to anchor to the top edge.
   * @default 'bottom'
   */
  position?: 'top' | 'bottom';
  /**
   * Horizontally mirror the wave.
   * @default false
   */
  flipHorizontal?: boolean;
  /**
   * Explicit height in pixels or CSS units (e.g. 64, '4rem', '100%').
   */
  height?: number | string;
  /**
   * Additional CSS classes.
   */
  className?: string;
}

export interface WaveDividerProps extends BaseWaveDividerProps {
  /**
   * Organic wave style variant.
   * @default 'layered'
   */
  variant?: WaveVariant;
}

function resolveTransformStyle(
  position: 'top' | 'bottom',
  flipHorizontal: boolean,
  userStyle?: CSSProperties
): CSSProperties {
  const transforms: string[] = [];

  if (position === 'top') {
    transforms.push('scaleY(-1)');
  }
  if (flipHorizontal) {
    transforms.push('scaleX(-1)');
  }

  if (transforms.length === 0) {
    return userStyle ?? {};
  }

  return {
    transform: transforms.join(' '),
    transformOrigin: 'center',
    ...userStyle,
  };
}

/**
 * Gentle organic wave divider with a subtle luminous secondary contour.
 */
export function WaveDividerGentle({
  fromColor = '#0F3D2E',
  toColor = '#2ECC71',
  position = 'bottom',
  flipHorizontal = false,
  height,
  className = '',
  style,
  id,
  ...restProps
}: BaseWaveDividerProps): ReactElement {
  const uid = useId().replace(/:/g, '');
  const gradId = id || `wave-gentle-${uid}`;
  const combinedStyle = resolveTransformStyle(position, flipHorizontal, style);

  return (
    <svg
      viewBox="0 0 1440 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      height={height}
      className={`block w-full overflow-hidden ${className}`.trim()}
      style={combinedStyle}
      {...restProps}
    >
      <defs>
        <linearGradient id={`${gradId}-main`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={fromColor} />
          <stop offset="100%" stopColor={toColor} />
        </linearGradient>
        <linearGradient id={`${gradId}-accent`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={fromColor} stopOpacity="0.4" />
          <stop offset="100%" stopColor={toColor} stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* Ambient background crest */}
      <path
        d="M0,56 C280,20 560,84 840,40 C1120,-4 1320,68 1440,48 L1440,120 L0,120 Z"
        fill={`url(#${gradId}-accent)`}
      />

      {/* Main smooth foreground wave */}
      <path
        d="M0,36 C240,76 480,12 720,44 C960,76 1200,20 1440,52 L1440,120 L0,120 Z"
        fill={`url(#${gradId}-main)`}
      />
    </svg>
  );
}

/**
 * Three-tier layered organic wave divider creating depth with translucent gradient green contours.
 */
export function WaveDividerLayered({
  fromColor = '#0F3D2E',
  toColor = '#2ECC71',
  position = 'bottom',
  flipHorizontal = false,
  height,
  className = '',
  style,
  id,
  ...restProps
}: BaseWaveDividerProps): ReactElement {
  const uid = useId().replace(/:/g, '');
  const gradId = id || `wave-layered-${uid}`;
  const combinedStyle = resolveTransformStyle(position, flipHorizontal, style);

  return (
    <svg
      viewBox="0 0 1440 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      height={height}
      className={`block w-full overflow-hidden ${className}`.trim()}
      style={combinedStyle}
      {...restProps}
    >
      <defs>
        <linearGradient id={`${gradId}-front`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={fromColor} />
          <stop offset="100%" stopColor={toColor} />
        </linearGradient>
        <linearGradient id={`${gradId}-mid`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={fromColor} stopOpacity="0.55" />
          <stop offset="100%" stopColor={toColor} stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={`${gradId}-back`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={fromColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={toColor} stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Deep back wave */}
      <path
        d="M0,24 C240,70 520,4 760,42 C1000,80 1240,16 1440,50 L1440,120 L0,120 Z"
        fill={`url(#${gradId}-back)`}
      />

      {/* Mid-tier wave */}
      <path
        d="M0,46 C300,90 580,18 860,62 C1120,102 1300,34 1440,58 L1440,120 L0,120 Z"
        fill={`url(#${gradId}-mid)`}
      />

      {/* Prominent foreground wave */}
      <path
        d="M0,70 C220,34 500,94 780,50 C1060,6 1280,74 1440,66 L1440,120 L0,120 Z"
        fill={`url(#${gradId}-front)`}
      />
    </svg>
  );
}

/**
 * Sweeping asymmetric curve wave divider ideal for energetic section handoffs.
 */
export function WaveDividerCurve({
  fromColor = '#0F3D2E',
  toColor = '#2ECC71',
  position = 'bottom',
  flipHorizontal = false,
  height,
  className = '',
  style,
  id,
  ...restProps
}: BaseWaveDividerProps): ReactElement {
  const uid = useId().replace(/:/g, '');
  const gradId = id || `wave-curve-${uid}`;
  const combinedStyle = resolveTransformStyle(position, flipHorizontal, style);

  return (
    <svg
      viewBox="0 0 1440 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      height={height}
      className={`block w-full overflow-hidden ${className}`.trim()}
      style={combinedStyle}
      {...restProps}
    >
      <defs>
        <linearGradient id={`${gradId}-main`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={fromColor} />
          <stop offset="100%" stopColor={toColor} />
        </linearGradient>
        <linearGradient id={`${gradId}-accent`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={fromColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={toColor} stopOpacity="0.45" />
        </linearGradient>
      </defs>

      {/* Secondary diagonal drift */}
      <path
        d="M0,18 C360,74 720,14 1080,78 C1260,110 1360,62 1440,30 L1440,120 L0,120 Z"
        fill={`url(#${gradId}-accent)`}
      />

      {/* Main diagonal swoop */}
      <path
        d="M0,50 C420,110 840,26 1440,86 L1440,120 L0,120 Z"
        fill={`url(#${gradId}-main)`}
      />
    </svg>
  );
}

/**
 * Rhythmic rolling peak wave divider with multiple organic undulations.
 */
export function WaveDividerPeaks({
  fromColor = '#0F3D2E',
  toColor = '#2ECC71',
  position = 'bottom',
  flipHorizontal = false,
  height,
  className = '',
  style,
  id,
  ...restProps
}: BaseWaveDividerProps): ReactElement {
  const uid = useId().replace(/:/g, '');
  const gradId = id || `wave-peaks-${uid}`;
  const combinedStyle = resolveTransformStyle(position, flipHorizontal, style);

  return (
    <svg
      viewBox="0 0 1440 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      height={height}
      className={`block w-full overflow-hidden ${className}`.trim()}
      style={combinedStyle}
      {...restProps}
    >
      <defs>
        <linearGradient id={`${gradId}-main`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={fromColor} />
          <stop offset="100%" stopColor={toColor} />
        </linearGradient>
        <linearGradient id={`${gradId}-depth`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={fromColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={toColor} stopOpacity="0.45" />
        </linearGradient>
      </defs>

      {/* Rolling background crests */}
      <path
        d="M0,38 C180,86 360,14 540,62 C720,110 900,26 1080,70 C1260,114 1360,42 1440,66 L1440,120 L0,120 Z"
        fill={`url(#${gradId}-depth)`}
      />

      {/* Prominent foreground peaks */}
      <path
        d="M0,66 C200,22 380,90 560,46 C740,2 920,82 1100,38 C1280,-6 1380,70 1440,54 L1440,120 L0,120 Z"
        fill={`url(#${gradId}-main)`}
      />
    </svg>
  );
}

/**
 * Liquid multi-layered fluid wave divider featuring organic watery crests.
 */
export function WaveDividerFluid({
  fromColor = '#0F3D2E',
  toColor = '#2ECC71',
  position = 'bottom',
  flipHorizontal = false,
  height,
  className = '',
  style,
  id,
  ...restProps
}: BaseWaveDividerProps): ReactElement {
  const uid = useId().replace(/:/g, '');
  const gradId = id || `wave-fluid-${uid}`;
  const combinedStyle = resolveTransformStyle(position, flipHorizontal, style);

  return (
    <svg
      viewBox="0 0 1440 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      height={height}
      className={`block w-full overflow-hidden ${className}`.trim()}
      style={combinedStyle}
      {...restProps}
    >
      <defs>
        <linearGradient id={`${gradId}-main`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={fromColor} />
          <stop offset="100%" stopColor={toColor} />
        </linearGradient>
        <linearGradient id={`${gradId}-mid`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={fromColor} stopOpacity="0.45" />
          <stop offset="100%" stopColor={toColor} stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`${gradId}-back`} x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={fromColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={toColor} stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {/* Back swell */}
      <path
        d="M0,26 C200,78 440,6 660,54 C880,102 1140,22 1440,70 L1440,120 L0,120 Z"
        fill={`url(#${gradId}-back)`}
      />

      {/* Middle fluid contour */}
      <path
        d="M0,50 C240,14 480,86 740,38 C1000,-10 1220,78 1440,42 L1440,120 L0,120 Z"
        fill={`url(#${gradId}-mid)`}
      />

      {/* Primary front flow */}
      <path
        d="M0,78 C280,42 520,102 780,58 C1040,14 1260,82 1440,62 L1440,120 L0,120 Z"
        fill={`url(#${gradId}-main)`}
      />
    </svg>
  );
}

/**
 * Universal wave section divider supporting multiple organic styles:
 * - 'layered' (default)
 * - 'gentle'
 * - 'curve'
 * - 'peaks'
 * - 'fluid'
 */
export function WaveDivider({
  variant = 'layered',
  ...props
}: WaveDividerProps): ReactElement {
  switch (variant) {
    case 'gentle':
      return <WaveDividerGentle {...props} />;
    case 'curve':
      return <WaveDividerCurve {...props} />;
    case 'peaks':
      return <WaveDividerPeaks {...props} />;
    case 'fluid':
      return <WaveDividerFluid {...props} />;
    case 'layered':
    default:
      return <WaveDividerLayered {...props} />;
  }
}

export default WaveDivider;
