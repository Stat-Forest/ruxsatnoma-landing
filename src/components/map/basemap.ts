import type { StyleSpecification } from 'maplibre-gl';

/**
 * The ground both maps draw on. Decision #60.1 left tile hosting open, so
 * until 2026-09-10 each map drew its polygons on a plain colour — honest, and
 * unreadable to a first-time visitor ("the map does not work"). The basemap
 * is a build-time setting: `VITE_MAP_STYLE_URL` names a MapLibre style
 * (the dev stand points at OpenFreeMap's `bright`, decision #187); an empty
 * value keeps the plain ground, so a build with no provider configured still
 * shows the contours rather than a blank tile grid.
 *
 * With a real basemap the tiles carry their own attribution (OpenStreetMap
 * contributors, OpenMapTiles), which MapLibre's control displays — hiding it
 * would breach the data licence, so the control is on exactly when the
 * basemap is.
 */
export const BASEMAP_STYLE_URL: string = import.meta.env.VITE_MAP_STYLE_URL || '';

export function plainStyle(background: string): StyleSpecification {
  return {
    version: 8,
    sources: {},
    layers: [{ id: 'bg', type: 'background', paint: { 'background-color': background } }],
  };
}

/** The `style` option for `new maplibregl.Map(...)`. */
export function mapStyle(background: string): string | StyleSpecification {
  return BASEMAP_STYLE_URL || plainStyle(background);
}

/** The `attributionControl` option: shown compact with a basemap, absent without one. */
export function attributionOption(): { compact: boolean } | false {
  return BASEMAP_STYLE_URL ? { compact: true } : false;
}
