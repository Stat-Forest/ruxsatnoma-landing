import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { MapPin, TriangleAlert } from 'lucide-react';
import { Alert, Skeleton } from '../../components/ui/Feedback';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/FormControls';
import type { OpenDataFeature, OpenDataFeatureCollection } from '../../components/map/types';
import { api } from '../../api/client';
import { apiError, formatApiError } from '../../api/errors';
import { pickName } from '../../lib/localized';
import { DASH } from '../../lib/format';
import { useLanguage, useT } from '../../i18n/useT';
import type { components } from '../../api/schema';

type OpenDataLayer = components['schemas']['OpenDataLayerOut'];

// Module scope, not inside the component body, so switching layers re-renders
// the same lazy component instead of remounting it — and `maplibre-gl`
// (sizeable) stays split into its own chunk rather than the shared bundle
// every page pays for. `/check`'s own map is lazy for the same reason.
const LazyContourMap = React.lazy(() => import('../../components/map/ContourMap'));

export interface MapPageProps {
  onNavigate?: (page: string, params?: Record<string, unknown>) => void;
}

function isFeatureCollection(data: unknown): data is OpenDataFeatureCollection {
  if (!data || typeof data !== 'object') return false;
  const candidate = data as { type?: unknown; features?: unknown };
  return candidate.type === 'FeatureCollection' && Array.isArray(candidate.features);
}

/** The public layer/feature contract (`gis/repo.py::features_geojson`)
 * carries no occupancy attribute today — `name`, a free-form `props` bag and
 * a validity window, nothing else. A parallel, unmerged backend track is
 * building real occupancy (a contour is capacity; an unset capacity reads as
 * exclusive; a taken one reports a free-from date) — until that lands and
 * this screen has an endpoint to call, occupancy is always unknown here.
 * Never render "boʻsh" (free) or "band" (taken) — only
 * `map.contour.occupancyUnknown`.
 *
 * Note that this is the ONE place on the page that says "unknown" in words
 * rather than with `DASH`: it is a state, not a missing value (see
 * `src/lib/format.ts`). */

function areaLabel(feature: OpenDataFeature): string | null {
  const value = feature.properties.props?.area_ha;
  if (typeof value === 'string' || typeof value === 'number') {
    return `${value} ga`;
  }
  return null;
}

function capacityLabel(feature: OpenDataFeature): string | null {
  const value = feature.properties.props?.capacity;
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  return null;
}

function featureLabel(
  feature: OpenDataFeature,
  language: string,
  index: number,
  fallback: string,
): string {
  const name = feature.properties.name ? pickName(feature.properties.name, language) : '';
  return name || `${fallback} ${index + 1}`;
}


/** `aria-activedescendant` needs a DOM id per option, and a raw feature id
 *  is not guaranteed to be a valid one on its own. */
function optionId(featureId: string): string {
  return `contour-option-${featureId}`;
}

type LayersState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; layers: OpenDataLayer[] };

type FeaturesState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; collection: OpenDataFeatureCollection };

/**
 * Task 13 — the free-contour map (`/map`, `footer.link.map`). Reads whatever
 * GIS layers the leshoz/admin has actually marked `is_public` (there is no
 * guarantee any of them is a "contours" layer specifically — the fixture
 * default has `contours.is_public = False`, `tests/modules/public/
 * test_open_data.py`) and renders their features on a map and in a list.
 *
 * Deliberately does NOT reproduce the design canvas's leshoz/activity-type
 * filter dropdowns: the public feature payload carries no organization or
 * activity attribute to filter by (only `name`, a free-form `props` bag and
 * a validity window) — inventing one would be exactly the kind of number
 * this project has decided never to fabricate. A layer picker stands in
 * where the mock had those two selects, since which public layer to browse
 * is the one real choice this data supports.
 */
export const MapPage: React.FC<MapPageProps> = ({ onNavigate }) => {
  const t = useT();
  const { language } = useLanguage();
  const [layersState, setLayersState] = useState<LayersState>({ status: 'loading' });
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [featuresState, setFeaturesState] = useState<FeaturesState | null>(null);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { data, error } = await api.GET('/api/v1/public/open-data/layers');
        if (cancelled) return;
        if (error) {
          setLayersState({ status: 'error', message: formatApiError(t, apiError(error)) });
          return;
        }
        const layers = data ?? [];
        setLayersState({ status: 'ready', layers });
        if (layers.length > 0) setSelectedCode(layers[0].code);
      } catch {
        if (!cancelled) {
          setLayersState({
            status: 'error',
            message: t('map.error.network'),
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // `t` is stable for a given language, and refetching the layer list on a
    // language switch would buy nothing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedCode) return;
    let cancelled = false;
    setFeaturesState({ status: 'loading' });
    setSelectedFeatureId(null);
    void (async () => {
      try {
        const { data, error } = await api.GET('/api/v1/public/open-data/layers/{code}/features', {
          params: { path: { code: selectedCode } },
        });
        if (cancelled) return;
        if (error) {
          setFeaturesState({ status: 'error', message: formatApiError(t, apiError(error)) });
          return;
        }
        if (!isFeatureCollection(data)) {
          setFeaturesState({ status: 'error', message: t('map.error.layerUnreadable') });
          return;
        }
        setFeaturesState({ status: 'ready', collection: data });
        if (data.features.length > 0) setSelectedFeatureId(data.features[0].id);
      } catch {
        if (!cancelled) {
          setFeaturesState({
            status: 'error',
            message: t('map.error.network'),
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCode]);

  const selectedLayer = useMemo(() => {
    if (layersState.status !== 'ready') return null;
    return layersState.layers.find((layer) => layer.code === selectedCode) ?? null;
  }, [layersState, selectedCode]);

  const collection = featuresState?.status === 'ready' ? featuresState.collection : null;
  const selectedFeature =
    collection?.features.find((feature) => feature.id === selectedFeatureId) ?? null;
  const selectedIndex = collection
    ? collection.features.findIndex((feature) => feature.id === selectedFeatureId)
    : -1;

  /** Arrow / Home / End move the selection inside the single tab stop, which
   *  is what makes `role="listbox"` a listbox rather than a list of buttons
   *  wearing one. */
  const onListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const features = collection?.features ?? [];
    if (features.length === 0) return;
    const current = selectedIndex >= 0 ? selectedIndex : 0;
    let next: number | null = null;
    if (event.key === 'ArrowDown') next = Math.min(current + 1, features.length - 1);
    else if (event.key === 'ArrowUp') next = Math.max(current - 1, 0);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = features.length - 1;
    if (next === null) return;
    event.preventDefault();
    setSelectedFeatureId(features[next].id);
  };

  return (
    <div data-testid="map-page" className="space-y-6 font-sans">
      <div className="reveal text-center space-y-3 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#23653F] bg-[#F0F7F1] px-3 py-1 rounded-full border border-[#D9EBDC]">
          {t('map.header.badge')}
        </span>
        <h1 className="text-3xl font-bold text-[#123522]">{t('map.header.title')}</h1>
        <p className="text-sm text-[#5A646D] leading-relaxed">{t('map.header.subtitle')}</p>
      </div>

      {layersState.status === 'loading' && (
        <div className="max-w-5xl mx-auto space-y-3">
          <Skeleton height="h-12" width="w-full max-w-md mx-auto" />
          <Skeleton height="h-96" />
        </div>
      )}

      {layersState.status === 'error' && (
        <div className="max-w-3xl mx-auto">
          <Alert variant="danger" title={t('map.error.loadTitle')}>
            {layersState.message}
          </Alert>
        </div>
      )}

      {layersState.status === 'ready' && layersState.layers.length === 0 && (
        <div className="max-w-3xl mx-auto">
          <Alert variant="info" title={t('map.empty.title')}>
            {t('map.empty.body')}
          </Alert>
        </div>
      )}

      {layersState.status === 'ready' && layersState.layers.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-3 max-w-5xl mx-auto">
            {layersState.layers.length > 1 && (
              <div className="w-full sm:w-72">
                <Select
                  aria-label={t('map.layer.selectLabel')}
                  value={selectedCode ?? ''}
                  onChange={(event) => setSelectedCode(event.target.value)}
                  options={layersState.layers.map((layer) => ({
                    value: layer.code,
                    label: pickName(layer.name, language, layer.code),
                  }))}
                />
              </div>
            )}
            {/* Present but inert: the public feature payload carries no
                occupancy attribute at all, so these can never do anything
                until an endpoint exists to filter against. */}
            <div className="flex gap-2 sm:ml-auto" title={t('map.filter.disabledHint')}>
              {['all', 'free', 'taken'].map((filter) => (
                <span
                  key={filter}
                  aria-disabled="true"
                  className="px-4 py-2.5 rounded-lg border border-[#E4E7EA] text-[#9AA3AB] text-sm font-semibold cursor-not-allowed select-none"
                >
                  {t(`map.filter.${filter}`)}
                </span>
              ))}
            </div>
          </div>

          <div className="max-w-5xl mx-auto border border-[#E4E7EA] rounded-[20px] overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_360px]">
            <div className="min-h-[420px] border-b lg:border-b-0 lg:border-r border-[#E4E7EA]">
              {featuresState?.status === 'ready' && (
                <Suspense fallback={<Skeleton height="h-full" width="w-full" />}>
                  <LazyContourMap collection={featuresState.collection} selectedId={selectedFeatureId} />
                </Suspense>
              )}
              {featuresState?.status === 'loading' && (
                <div className="w-full h-full min-h-[420px] flex items-center justify-center">
                  <Skeleton height="h-full" width="w-full" />
                </div>
              )}
              {featuresState?.status === 'error' && (
                <div className="p-6">
                  <Alert variant="danger" title={t('map.error.mapTitle')}>
                    {featuresState.message}
                  </Alert>
                </div>
              )}
            </div>

            <div className="bg-white flex flex-col">
              <div className="px-6 py-5 border-b border-[#E4E7EA]">
                <div className="text-xs font-extrabold text-[#767F87] uppercase tracking-wider">
                  {t('map.list.title')}
                </div>
                <p className="mt-2 text-sm text-[#5A646D]">{t('map.list.hint')}</p>
              </div>

              {/* A real listbox: ONE tab stop on the container, arrow keys
                  moving the selection, and `aria-activedescendant` naming the
                  current option. Every row used to carry `tabIndex={0}`,
                  which is the pattern's one forbidden shape — a keyboard
                  user tabbed through every contour one at a time, and a
                  screen reader announced a composite widget whose options
                  were all separately focusable. */}
              <div
                role="listbox"
                aria-label={t('map.list.title')}
                tabIndex={0}
                aria-activedescendant={selectedFeatureId ? optionId(selectedFeatureId) : undefined}
                onKeyDown={onListKeyDown}
                className="p-4 flex flex-col gap-2.5 flex-grow overflow-y-auto max-h-[420px]"
              >
                {collection?.features.length === 0 && (
                  <p className="text-sm text-[#5A646D] p-3">{t('map.list.empty')}</p>
                )}
                {collection?.features.map((feature, index) => {
                  const isSelected = feature.id === selectedFeatureId;
                  const area = areaLabel(feature);
                  const capacity = capacityLabel(feature);
                  return (
                    <div
                      key={feature.id}
                      id={optionId(feature.id)}
                      data-testid="contour-row"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => setSelectedFeatureId(feature.id)}
                      className={`cursor-pointer rounded-xl border px-4 py-3.5 transition-colors ${
                        isSelected ? 'border-[#7FB98A] bg-[#F7FBF8]' : 'border-[#E4E7EA] bg-white hover:border-[#D9EBDC]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 font-extrabold text-[#123522]">
                          <MapPin className="w-4 h-4 text-[#2E7D4F]" />
                          {featureLabel(feature, language, index, t('map.contour.fallbackName'))}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F1F3F4] text-[#6C757C] text-xs font-bold">
                          {t('map.contour.occupancyUnknown')}
                        </span>
                      </div>
                      <div className="mt-2.5 flex items-center gap-4 text-xs text-[#767F87]">
                        <span>
                          {t('map.contour.areaLabel')}{' '}
                          <b className="text-[#1A1F24]">{area ?? DASH}</b>
                        </span>
                        <span>
                          {t('map.contour.capacityLabel')}{' '}
                          <b className="text-[#1A1F24]">{capacity ?? DASH}</b>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="px-6 py-5 border-t border-[#E4E7EA] bg-[#F8F9FA]">
                <div className="text-xs font-extrabold text-[#767F87] uppercase tracking-wider">
                  {t('map.selected.title')}
                </div>
                {selectedFeature ? (
                  <>
                    <div className="mt-2.5 flex items-baseline gap-2.5">
                      <span className="text-2xl font-black text-[#123522]">
                        {featureLabel(
                          selectedFeature,
                          language,
                          Math.max(selectedIndex, 0),
                          t('map.contour.fallbackName'),
                        )}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[#5A646D] leading-relaxed">
                      {t('map.selected.note')}
                    </p>
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      className="mt-4"
                      onClick={() => onNavigate?.('applicant_wizard')}
                    >
                      {t('map.selected.apply')}
                    </Button>
                  </>
                ) : (
                  <p className="mt-2.5 text-sm text-[#5A646D]">{t('map.selected.empty')}</p>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto flex items-start gap-3 px-4 py-3.5 rounded-xl bg-[#FEF7ED] border border-[#F5DEB8]">
            <TriangleAlert className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-[#3F4A52]">
              <b className="text-[#1A1F24]">{t('map.warning.bold')}</b> {t('map.warning.rest')}
            </p>
          </div>

          {selectedLayer && (
            <p className="max-w-5xl mx-auto text-xs text-[#9AA3AB] text-center">
              {t('map.layer.label')} {pickName(selectedLayer.name, language, selectedLayer.code)}
              {featuresState?.status === 'ready' && featuresState.collection.truncated && (
                <> — {t('map.layer.truncated')}</>
              )}
            </p>
          )}
        </>
      )}
    </div>
  );
};
