import type { ComponentType } from 'react';
import { Trees, FileCheck2, ShieldCheck, MapPin, Axe, FlaskConical, Leaf } from 'lucide-react';

/**
 * Decoration only, keyed by `activity_types.code` — six today: `grazing`,
 * `haymaking`, `apiary`, `recreation`, `deadwood`, `science` (migration
 * `0038`). `PublicActivityTypeOut` carries no icon field and must not grow
 * one (ruling #138): a code the map has never seen — a new service the
 * catalog gains before this file is updated — falls back to a neutral icon
 * rather than breaking the page.
 */
const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  grazing: Trees,
  haymaking: FileCheck2,
  apiary: ShieldCheck,
  recreation: MapPin,
  deadwood: Axe,
  science: FlaskConical,
};

export function serviceIcon(code: string): ComponentType<{ className?: string }> {
  return ICONS[code] ?? Leaf;
}
