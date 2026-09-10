import type { HTMLAttributes, ReactNode } from 'react';

/** The tints the home page bands use: plain white (for a band that only
 *  carries a backdrop), the cards' own pale green, and the haymaking card's
 *  cream for the tariff calculator. */
const TONES = {
  white: '#FFFFFF',
  moss: '#F3F8F4',
  hay: '#FBF7EC',
} as const;

export interface BandProps extends HTMLAttributes<HTMLElement> {
  tone: keyof typeof TONES;
  /** A `Backdrops` scene, painted behind the content. */
  art?: ReactNode;
  /** Extra classes for the content column — e.g. more bottom padding so a
   *  backdrop that rises from the bottom edge stays clear of the text. */
  innerClassName?: string;
  children: ReactNode;
}

/**
 * A full-bleed tinted `<section>` for the home page. `PublicLayout` keeps
 * page content in a `max-w-7xl` column, so the band breaks out with the same
 * `-mx-[50vw] w-screen` trick the hero uses, paints its tint and backdrop
 * edge to edge, then puts the children back into the column. Any other
 * attribute (`aria-labelledby`, a `reveal` class) lands on the section.
 */
export function Band({ tone, art, innerClassName, children, className, style, ...rest }: BandProps) {
  return (
    <section
      {...rest}
      className={`relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden${className ? ` ${className}` : ''}`}
      style={{ background: TONES[tone], ...style }}
    >
      {art && <div className="absolute inset-0 pointer-events-none">{art}</div>}
      <div className={`relative max-w-7xl mx-auto px-6 py-14 sm:py-16${innerClassName ? ` ${innerClassName}` : ''}`}>
        {children}
      </div>
    </section>
  );
}
