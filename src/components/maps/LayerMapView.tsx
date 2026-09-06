import { useEffect, useRef } from 'react';
// `maplibre-gl` ships ESM-only with no default export (only named exports —
// `Map`, `NavigationControl`, `ScaleControl`, `LngLatBounds`, …), so this is
// a namespace import, not `import maplibregl from 'maplibre-gl'`.
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useT } from '../../i18n/useT';
import type { OpenDataFeatureCollection } from '../../pages/web/OpenDataPage';

/**
 * MapLibre GL JS is the project's chosen map library (decision #60.1,
 * already used in `adminka`). This view renders the already-fetched, already
 * cached `OpenDataFeatureCollection` from `OpenDataPage`'s per-layer cache —
 * zero extra network calls. Decision #60.1 leaves basemap tile
 * hosting/licensing as its own open question, so no tile source is wired in
 * here: the map draws on a plain background color with real projection,
 * pan/zoom/scale controls and a `fitBounds` to the data, just no imagery
 * yet — `opendata.map.disclaimer` says so to the viewer.
 */
export interface LayerMapViewProps {
  collection: OpenDataFeatureCollection;
}

/** GeoJSON coordinate arrays nest to arbitrary depth ending in a `[lng, lat]`
 * pair (a `Point`'s is one pair; a `MultiPolygon`'s nests four deep). This
 * walks any of them and extends `bounds` with every pair found. */
function extendBoundsWithCoordinates(bounds: maplibregl.LngLatBounds, coordinates: unknown): void {
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
    extendBoundsWithCoordinates(bounds, item);
  }
}

export default function LayerMapView({ collection }: LayerMapViewProps) {
  const t = useT();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {},
        layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#DCEEF5' } }],
      },
      attributionControl: false,
      center: [64.5, 41.3],
      zoom: 4.5,
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    map.on('load', () => {
      // `collection` is already validated as a `FeatureCollection` shape by
      // `OpenDataPage` before it is ever cached — `@types/geojson`'s ambient
      // `GeoJSON` namespace isn't pulled in by this project's `tsconfig`
      // (`types: ["vite/client"]`), so the source spec is typed loosely here
      // rather than adding an unrelated global-types dependency for one line.
      map.addSource('layer-features', {
        type: 'geojson',
        data: collection,
      } as Parameters<typeof map.addSource>[1]);

      map.addLayer({
        id: 'layer-features-fill',
        type: 'fill',
        source: 'layer-features',
        filter: ['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon']]],
        paint: { 'fill-color': '#2E7D4F', 'fill-opacity': 0.35 },
      });
      map.addLayer({
        id: 'layer-features-line',
        type: 'line',
        source: 'layer-features',
        paint: { 'line-color': '#23653F', 'line-width': 1.75 },
      });
      map.addLayer({
        id: 'layer-features-circle',
        type: 'circle',
        source: 'layer-features',
        filter: ['in', ['geometry-type'], ['literal', ['Point', 'MultiPoint']]],
        paint: { 'circle-radius': 5, 'circle-color': '#2E7D4F' },
      });

      const bounds = new maplibregl.LngLatBounds();
      for (const feature of collection.features) {
        if (!feature.geometry) continue;
        extendBoundsWithCoordinates(bounds, feature.geometry.coordinates);
      }
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 24, maxZoom: 14 });
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [collection]);

  return (
    <div className="space-y-2">
      <p className="text-xs text-[#767F87]">{t('opendata.map.disclaimer')}</p>
      <div ref={containerRef} className="w-full h-80 rounded-xl overflow-hidden border border-[#E4E7EA]" />
    </div>
  );
}
