/**
 * The geometry types both maps on this site share. They were declared twice
 * — `PermitContourGeometry` in the (now merged) `src/components/maps/`
 * directory and an inline `{ type; coordinates }` here — for want of one
 * place to put them.
 *
 * `GET /open-data/layers/{code}/features` has no declared response schema on
 * the backend (a bare `dict[str, Any]` return type), so the real shape, from
 * `backend/app/modules/gis/repo.py::features_geojson`, is defined here:
 * `name`, a free-form `props` bag, and a validity window.
 *
 * Note what is NOT here: no occupancy attribute of any kind. The public
 * layer/feature contract never carries one today (`repo.py`'s own docstring:
 * "Properties stay to identity and area on purpose"), so this map never
 * claims a feature is free or taken — see `MapPage.tsx`'s own occupancy copy.
 */

/**
 * One GeoJSON geometry, typed loosely on purpose: `@types/geojson` isn't
 * pulled into this project's `tsconfig` (`types: ["vite/client"]`), and the
 * only thing either map does with `coordinates` is hand it to
 * `extendBounds`/`firstCoordinate` in `./geometry`, which walk `unknown`.
 */
export interface MapGeometry {
  type: string;
  coordinates: unknown;
}

export interface OpenDataFeatureProperties {
  name: Record<string, unknown> | null;
  props: Record<string, unknown>;
  valid_from: string | null;
  valid_to: string | null;
}

export interface OpenDataFeature {
  type: 'Feature';
  id: string;
  geometry: MapGeometry | null;
  properties: OpenDataFeatureProperties;
}

export interface OpenDataFeatureCollection {
  type: 'FeatureCollection';
  truncated: boolean;
  features: OpenDataFeature[];
}
