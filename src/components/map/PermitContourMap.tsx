import { useEffect, useRef } from 'react';
// `maplibre-gl` ships ESM-only with no default export (only named exports —
// `Map`, `NavigationControl`, `ScaleControl`, `LngLatBounds`, …), so this is
// a namespace import, not `import maplibregl from 'maplibre-gl'` — same
// idiom as `ContourMap.tsx` beside it.
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useT } from '../../i18n/useT';
import { extendBounds } from './geometry';
import type { MapGeometry } from './types';

/**
 * The result card's map panel on the `/check` page's "Ruxsatnoma" arm
 * (decision #60.1, MapLibre GL JS).
 *
 * `contour` is REQUIRED, and `VerifyPage` mounts this only once the API has
 * actually sent one. It used to accept `contour: null` and draw the base map
 * anyway, with a legend swatch labelled with the leshoz's name — but the map
 * style is empty and no public endpoint returns a leshoz's administrative
 * boundary, so what a visitor saw was a blank green rectangle with zoom
 * buttons and a legend for something invisible. `GET /public/permits/check`
 * withholds `contour` until the Agency's disclosure setting is on (off in
 * production today), which means that was the ONLY thing production ever
 * rendered here. A legend may only name what is drawn; the organisation is
 * text on the result card, not a boundary on a map.
 *
 * IMPORT IT LAZILY. This module is the sole reason `maplibre-gl` and its
 * 83 KB stylesheet exist in this build; a static import from `VerifyPage`
 * put roughly 1 MB of it into `index-*.js`, which every visitor to every
 * page downloads — on a rural mobile connection, for a screen most of them
 * never open.
 */

export interface PermitContourMapProps {
  /** The permit's own contour, as `PublicCheckCard.contour` sent it. */
  contour: MapGeometry;
}

const CONTOUR_SOURCE_ID = 'permit-contour-source';

export default function PermitContourMap({ contour }: PermitContourMapProps) {
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
      extendBounds(bounds, contour.coordinates);
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
  }, [contour]);

  return (
    <div className="relative w-full h-72 sm:h-96 rounded-xl overflow-hidden border border-[#E4E7EA]">
      <div ref={containerRef} className="absolute inset-0" />

      <div className="absolute left-3 top-3 max-w-[220px] space-y-2 rounded-xl bg-white/95 px-3.5 py-3 shadow-md">
        <div className="text-[11px] font-bold uppercase tracking-wide text-[#123522]">
          {t('verify.map.heading')}
        </div>
        <div data-testid="permit-contour" className="flex items-center gap-2 text-xs text-[#1A1F24]">
          <span
            className="h-3 w-3 shrink-0 rounded-sm"
            style={{ background: 'rgba(46,125,79,.35)', border: '2px solid #1D5B36' }}
          />
          <span>{t('verify.map.legend')}</span>
        </div>
      </div>
    </div>
  );
}
