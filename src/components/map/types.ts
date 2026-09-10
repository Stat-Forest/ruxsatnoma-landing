/**
 * `GET /open-data/layers/{code}/features` has no declared response schema on
 * the backend (a bare `dict[str, Any]` return type) — the real shape, from
 * `backend/app/modules/gis/repo.py::features_geojson`, is defined locally
 * here rather than imported from the (separately owned, soon-to-be-deleted)
 * open-data page: `name`, a free-form `props` bag, and a validity window.
 *
 * Note what is NOT here: no occupancy attribute of any kind. The public
 * layer/feature contract never carries one today (`repo.py`'s own docstring:
 * "Properties stay to identity and area on purpose"), so this map never
 * claims a feature is free or taken — see `occupancyLabel` in `MapPage.tsx`.
 */
export interface OpenDataFeatureProperties {
  name: Record<string, unknown> | null;
  props: Record<string, unknown>;
  valid_from: string | null;
  valid_to: string | null;
}

export interface OpenDataFeature {
  type: 'Feature';
  id: string;
  geometry: { type: string; coordinates: unknown } | null;
  properties: OpenDataFeatureProperties;
}

export interface OpenDataFeatureCollection {
  type: 'FeatureCollection';
  truncated: boolean;
  features: OpenDataFeature[];
}
