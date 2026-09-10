import { useEffect, useRef, useState } from 'react';
// `maplibre-gl` ships ESM-only with no default export (only named exports —
// `Map`, `NavigationControl`, `LngLatBounds`, …), so this is a namespace
// import, not `import maplibregl from 'maplibre-gl'` — same idiom as
// `src/components/maps/LayerMapView.tsx`.
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { OpenDataFeatureCollection } from './types';

export interface ContourMapProps {
  collection: OpenDataFeatureCollection;
  /** The feature currently picked in the list beside the map, or `null` when
   *  nothing is selected yet — drives the marker overlay below. */
  selectedId: string | null;
}

/** GeoJSON coordinate arrays nest to arbitrary depth ending in a `[lng, lat]`
 * pair. Walks any of them and extends `bounds` with every pair found. */
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

/** The first `[lng, lat]` pair in a geometry — enough to anchor a selection
 *  marker without a full centroid computation (this map never edits
 *  geometry, only points at a row the visitor already picked from a list). */
function firstCoordinate(coordinates: unknown): [number, number] | null {
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

/**
 * The free-contour map (task 13). Same no-basemap idiom as `LayerMapView`
 * (decision #60.1 leaves tile hosting open) — real projection, pan/zoom and
 * a `fitBounds` to the data, drawn on a plain background. What is unique to
 * this screen is the marker overlay: a plain positioned `<div>` kept in sync
 * with `map.project()` rather than a `maplibregl.Marker`, so the selected
 * row is unmistakable even before basemap imagery exists.
 */
export default function ContourMap({ collection, selectedId }: ContourMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [markerPos, setMarkerPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {},
        layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#EAF1EB' } }],
      },
      attributionControl: false,
      center: [69.2, 41.3],
      zoom: 8,
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    map.on('load', () => {
      map.addSource('map-features', {
        type: 'geojson',
        data: collection,
      } as Parameters<typeof map.addSource>[1]);

      map.addLayer({
        id: 'map-features-fill',
        type: 'fill',
        source: 'map-features',
        filter: ['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon']]],
        paint: { 'fill-color': '#2E7D4F', 'fill-opacity': 0.26 },
      });
      map.addLayer({
        id: 'map-features-line',
        type: 'line',
        source: 'map-features',
        paint: { 'line-color': '#2E7D4F', 'line-width': 2 },
      });
      map.addLayer({
        id: 'map-features-circle',
        type: 'circle',
        source: 'map-features',
        filter: ['in', ['geometry-type'], ['literal', ['Point', 'MultiPoint']]],
        paint: { 'circle-radius': 6, 'circle-color': '#2E7D4F' },
      });

      const bounds = new maplibregl.LngLatBounds();
      for (const feature of collection.features) {
        if (!feature.geometry) continue;
        extendBoundsWithCoordinates(bounds, feature.geometry.coordinates);
      }
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 32, maxZoom: 15 });
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // The map is torn down and rebuilt whenever a new collection arrives
    // (switching layers) — simplest correct lifecycle for a handful of
    // re-selections per visit, same trade-off `LayerMapView` makes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) {
      setMarkerPos(null);
      return;
    }
    const feature = collection.features.find((item) => item.id === selectedId);
    const coordinate = feature?.geometry ? firstCoordinate(feature.geometry.coordinates) : null;
    if (!coordinate) {
      setMarkerPos(null);
      return;
    }
    try {
      const point = map.project(coordinate);
      setMarkerPos({ x: point.x, y: point.y });
    } catch {
      // A map that has not finished loading yet can't project — the marker
      // simply waits for the next selection or the map's own `load`.
      setMarkerPos(null);
    }
  }, [selectedId, collection]);

  return (
    <div className="relative w-full h-full min-h-[420px]">
      <div ref={containerRef} className="absolute inset-0" />
      {markerPos && (
        <div
          data-testid="map-marker"
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: markerPos.x, top: markerPos.y }}
        >
          <span className="block w-4 h-4 rounded-full bg-[#1D5B36] ring-[6px] ring-[#1D5B36]/25" />
        </div>
      )}
    </div>
  );
}
