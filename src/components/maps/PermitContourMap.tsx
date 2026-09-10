import { useEffect, useRef } from 'react';
// `maplibre-gl` ships ESM-only with no default export (only named exports —
// `Map`, `NavigationControl`, `ScaleControl`, `LngLatBounds`, …), so this is
// a namespace import, not `import maplibregl from 'maplibre-gl'` — same
// idiom as `LayerMapView`.
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

/**
 * The result card's map panel on the `/check` page's "Ruxsatnoma" arm
 * (decision #60.1, MapLibre GL JS).
 *
 * `GET /public/permits/check` sends a `contour` field only once the Agency's
 * contour-disclosure setting is on — **off in production today**, so this
 * component must render a complete, correct map with `contour` absent: the
 * base map draws, nothing more. There is also no public endpoint yet that
 * returns a leshoz's own administrative-boundary geometry, so without a
 * contour the only honest "leshoz boundary" this map can show is the base
 * layer plus the organization's own reference name — never a fabricated
 * polygon neither field can back.
 */

/** Typed loosely on purpose: `@types/geojson` isn't pulled into this
 *  project's `tsconfig` (`types: ["vite/client"]`) — same tradeoff
 *  `LayerMapView` documents on its own GeoJSON source spec. */
export interface PermitContourGeometry {
  type: string;
  coordinates: unknown;
}

export interface PermitContourMapProps {
  /** The leshoz's own reference name, exactly as the permit already prints
   *  it (`PublicCheckCard.organization`). */
  organization: string;
  /** The permit's own contour. Present only when the backend's disclosure
   *  setting is on; `null`/`undefined` must draw no contour layer at all. */
  contour?: PermitContourGeometry | null;
}

const CONTOUR_SOURCE_ID = 'permit-contour-source';

/** Walks a GeoJSON geometry's (arbitrarily nested) coordinate array and
 *  extends `bounds` with every `[lng, lat]` pair found — a `Polygon`'s
 *  coordinates nest three deep, a `MultiPolygon`'s four; this doesn't care
 *  which, it just recurses until it finds numbers. */
function extendBoundsWithGeometry(bounds: maplibregl.LngLatBounds, coordinates: unknown): void {
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
    extendBoundsWithGeometry(bounds, item);
  }
}

export default function PermitContourMap({ organization, contour }: PermitContourMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {},
        layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#E7F0E8' } }],
      },
      attributionControl: false,
      center: [64.5, 41.3],
      zoom: 4.5,
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    map.on('load', () => {
      if (!contour) return;

      map.addSource(CONTOUR_SOURCE_ID, {
        type: 'geojson',
        data: { type: 'Feature', geometry: contour, properties: {} },
      } as Parameters<typeof map.addSource>[1]);

      map.addLayer({
        id: 'permit-contour-fill',
        type: 'fill',
        source: CONTOUR_SOURCE_ID,
        paint: { 'fill-color': '#2E7D4F', 'fill-opacity': 0.35 },
      });
      map.addLayer({
        id: 'permit-contour-line',
        type: 'line',
        source: CONTOUR_SOURCE_ID,
        paint: { 'line-color': '#1D5B36', 'line-width': 2.5 },
      });

      const bounds = new maplibregl.LngLatBounds();
      extendBoundsWithGeometry(bounds, contour.coordinates);
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 32, maxZoom: 15 });
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // A fresh search re-fetches `/permits/check` without unmounting this
    // component, so rebuilding the whole map on `contour`'s identity keeps
    // the drawn layer truthful to the very last response instead of
    // stacking a new source on top of a stale one.
  }, [contour, organization]);

  return (
    <div className="space-y-2">
      <div className="relative w-full h-72 sm:h-96 rounded-xl overflow-hidden border border-[#E4E7EA]">
        <div ref={containerRef} className="absolute inset-0" />

        <div className="absolute left-3 top-3 max-w-[220px] space-y-2 rounded-xl bg-white/95 px-3.5 py-3 shadow-md">
          <div className="text-[11px] font-bold uppercase tracking-wide text-[#123522]">
            Xaritada
          </div>
          {contour && (
            <div data-testid="permit-contour" className="flex items-center gap-2 text-xs text-[#1A1F24]">
              <span
                className="h-3 w-3 shrink-0 rounded-sm"
                style={{ background: 'rgba(46,125,79,.35)', border: '2px solid #1D5B36' }}
              />
              <span>Ruxsat etilgan kontur</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-[#1A1F24]">
            <span
              className="h-3 w-3 shrink-0 rounded-sm border border-[#7FB98A]"
              style={{ background: 'rgba(169,205,176,.55)' }}
            />
            <span>{organization}</span>
          </div>
        </div>
      </div>

      {!contour && (
        <p className="text-xs text-[#767F87]">
          Kontur chegarasi ushbu ruxsatnoma uchun hozircha ochiq emas — xaritada faqat oʻrmon
          xoʻjaligi nomi koʻrsatiladi.
        </p>
      )}
    </div>
  );
}
