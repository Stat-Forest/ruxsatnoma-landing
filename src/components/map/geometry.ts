/**
 * The coordinate walks both maps on this site need. They were written twice,
 * under two names (`extendBoundsWithCoordinates` in `ContourMap`,
 * `extendBoundsWithGeometry` in `PermitContourMap`), by two tracks that never
 * saw each other's directory — one `src/components/map/`, one
 * `src/components/maps/`. One copy, here, for both.
 *
 * `maplibre-gl` is imported FOR ITS TYPES ONLY (`import type`), so this
 * module carries no runtime dependency on it: a caller that is itself lazily
 * loaded keeps the library out of the main bundle, which is the whole point
 * of `React.lazy`-ing a map component.
 */
import type { LngLatBounds } from 'maplibre-gl';

/**
 * GeoJSON coordinate arrays nest to arbitrary depth ending in a `[lng, lat]`
 * pair — a `Polygon`'s nest three deep, a `MultiPolygon`'s four. This does
 * not care which: it recurses until it finds numbers, extending `bounds`
 * with every pair it reaches.
 */
export function extendBounds(bounds: LngLatBounds, coordinates: unknown): void {
  if (!Array.isArray(coordinates)) return;
  if (
    coordinates.length >= 2 &&
    typeof coordinates[0] === 'number' &&
    typeof coordinates[1] === 'number'
  ) {
    bounds.extend([coordinates[0], coordinates[1]]);
    return;
  }
  for (const item of coordinates) {
    extendBounds(bounds, item);
  }
}

/**
 * The first `[lng, lat]` pair in a geometry — enough to anchor a selection
 * marker without a full centroid computation. Neither map on this site edits
 * geometry; both only point at something the visitor already picked.
 */
export function firstCoordinate(coordinates: unknown): [number, number] | null {
  if (!Array.isArray(coordinates)) return null;
  if (
    coordinates.length >= 2 &&
    typeof coordinates[0] === 'number' &&
    typeof coordinates[1] === 'number'
  ) {
    return [coordinates[0], coordinates[1]];
  }
  for (const item of coordinates) {
    const found = firstCoordinate(item);
    if (found) return found;
  }
  return null;
}
