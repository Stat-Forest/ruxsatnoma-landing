import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { MapPin, TriangleAlert } from 'lucide-react';
import { Alert, Skeleton } from '../../components/ui/Feedback';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/FormControls';
import type { OpenDataFeature, OpenDataFeatureCollection } from '../../components/map/types';
import { api } from '../../api/client';
import { apiError } from '../../api/errors';
import type { ApiError } from '../../api/errors';
import { pickName } from '../../lib/localized';
import { useLanguage } from '../../i18n/useT';
import type { components } from '../../api/schema';

type OpenDataLayer = components['schemas']['OpenDataLayerOut'];

// Module scope, not inside the component body, so switching layers re-renders
// the same lazy component instead of remounting it — and `maplibre-gl`
// (sizeable) stays split into its own chunk rather than the shared bundle
// every page pays for, the same trade-off `OpenDataPage` makes for
// `LayerMapView`.
const LazyContourMap = React.lazy(() => import('../../components/map/ContourMap'));

export interface MapPageProps {
  onNavigate?: (page: string, params?: Record<string, unknown>) => void;
}

function isFeatureCollection(data: unknown): data is OpenDataFeatureCollection {
  if (!data || typeof data !== 'object') return false;
  const candidate = data as { type?: unknown; features?: unknown };
  return candidate.type === 'FeatureCollection' && Array.isArray(candidate.features);
}

/** Same rate-limit (`ERR-SYS-006`) special-case every other page under
 * `/public/*` writes locally rather than sharing — `OpenDataPage` and
 * `AppealCheckPage` both make the same call, per the plan's own note that
 * two lines is not worth a cross-file dependency for. */
function formatApiError(err: ApiError): string {
  if (err.code === 'ERR-SYS-006') {
    const details = err.details as { retry_after_seconds?: unknown } | undefined;
    const seconds = typeof details?.retry_after_seconds === 'number' ? details.retry_after_seconds : null;
    if (seconds !== null) {
      return `Serverga soʻrovlar chegarasiga yetildi. ${seconds} soniyadan keyin qayta urinib koʻring.`;
    }
  }
  return `${err.message} (${err.code})`;
}

/** The public layer/feature contract (`gis/repo.py::features_geojson`)
 * carries no occupancy attribute today — `name`, a free-form `props` bag and
 * a validity window, nothing else. A parallel, unmerged backend track is
 * building real occupancy (a contour is capacity; an unset capacity reads as
 * exclusive; a taken one reports a free-from date) — until that lands and
 * this screen has an endpoint to call, occupancy is always unknown here.
 * Never render "boʻsh" (free) or "band" (taken) — only this. */
const OCCUPANCY_UNKNOWN_LABEL = 'Bandligi: nomaʼlum';

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

function featureLabel(feature: OpenDataFeature, language: string, index: number): string {
  const name = feature.properties.name ? pickName(feature.properties.name, language) : '';
  return name || `Kontur ${index + 1}`;
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
          setLayersState({ status: 'error', message: formatApiError(apiError(error)) });
          return;
        }
        const layers = data ?? [];
        setLayersState({ status: 'ready', layers });
        if (layers.length > 0) setSelectedCode(layers[0].code);
      } catch {
        if (!cancelled) {
          setLayersState({
            status: 'error',
            message: 'Serverga ulanib boʻlmadi. Internet aloqasini tekshirib, qayta urinib koʻring.',
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
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
          setFeaturesState({ status: 'error', message: formatApiError(apiError(error)) });
          return;
        }
        if (!isFeatureCollection(data)) {
          setFeaturesState({ status: 'error', message: 'Qatlam maʼlumotini oʻqib boʻlmadi.' });
          return;
        }
        setFeaturesState({ status: 'ready', collection: data });
        if (data.features.length > 0) setSelectedFeatureId(data.features[0].id);
      } catch {
        if (!cancelled) {
          setFeaturesState({
            status: 'error',
            message: 'Serverga ulanib boʻlmadi. Internet aloqasini tekshirib, qayta urinib koʻring.',
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
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

  return (
    <div data-testid="map-page" className="space-y-6 font-sans">
      <div className="reveal text-center space-y-3 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#23653F] bg-[#F0F7F1] px-3 py-1 rounded-full border border-[#D9EBDC]">
          Interaktiv xarita
        </span>
        <h1 className="text-3xl font-bold text-[#123522]">Konturlarni xaritadan toping</h1>
        <p className="text-sm text-[#5A646D] leading-relaxed">
          Ariza topshirishdan oldin hududni xaritadan koʻring. Bandlik holati bu yerda
          koʻrsatilmaydi — yakuniy javobni ariza koʻrib chiqilganda oʻrmon xoʻjaligi mutaxassisi
          beradi.
        </p>
      </div>

      {layersState.status === 'loading' && (
        <div className="max-w-5xl mx-auto space-y-3">
          <Skeleton height="h-12" width="w-full max-w-md mx-auto" />
          <Skeleton height="h-96" />
        </div>
      )}

      {layersState.status === 'error' && (
        <div className="max-w-3xl mx-auto">
          <Alert variant="danger" title="Maʼlumotni yuklab boʻlmadi">
            {layersState.message}
          </Alert>
        </div>
      )}

      {layersState.status === 'ready' && layersState.layers.length === 0 && (
        <div className="max-w-3xl mx-auto">
          <Alert variant="info" title="Ochiq qatlamlar mavjud emas">
            Hozircha xaritada koʻrsatiladigan ochiq GIS qatlami yoʻq.
          </Alert>
        </div>
      )}

      {layersState.status === 'ready' && layersState.layers.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-3 max-w-5xl mx-auto">
            {layersState.layers.length > 1 && (
              <div className="w-full sm:w-72">
                <Select
                  aria-label="Qatlamni tanlash"
                  value={selectedCode ?? ''}
                  onChange={(event) => setSelectedCode(event.target.value)}
                  options={layersState.layers.map((layer) => ({
                    value: layer.code,
                    label: pickName(layer.name, language, layer.code),
                  }))}
                />
              </div>
            )}
            <div className="flex gap-2 sm:ml-auto" title="Bandlik holati hozircha mavjud emas">
              {['Barchasi', 'Faqat boʻsh', 'Band'].map((label) => (
                <span
                  key={label}
                  aria-disabled="true"
                  className="px-4 py-2.5 rounded-lg border border-[#E4E7EA] text-[#9AA3AB] text-sm font-semibold cursor-not-allowed select-none"
                >
                  {label}
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
                  <Alert variant="danger" title="Xaritani yuklab boʻlmadi">
                    {featuresState.message}
                  </Alert>
                </div>
              )}
            </div>

            <div className="bg-white flex flex-col">
              <div className="px-6 py-5 border-b border-[#E4E7EA]">
                <div className="text-xs font-extrabold text-[#767F87] uppercase tracking-wider">
                  Konturlar roʻyxati
                </div>
                <p className="mt-2 text-sm text-[#5A646D]">
                  Roʻyxatdan tanlang — xaritada belgilanadi
                </p>
              </div>

              <div
                role="listbox"
                aria-label="Konturlar roʻyxati"
                className="p-4 flex flex-col gap-2.5 flex-grow overflow-y-auto max-h-[420px]"
              >
                {collection?.features.length === 0 && (
                  <p className="text-sm text-[#5A646D] p-3">Bu qatlamda obyekt topilmadi.</p>
                )}
                {collection?.features.map((feature, index) => {
                  const isSelected = feature.id === selectedFeatureId;
                  const area = areaLabel(feature);
                  const capacity = capacityLabel(feature);
                  return (
                    <div
                      key={feature.id}
                      data-testid="contour-row"
                      role="option"
                      aria-selected={isSelected}
                      tabIndex={0}
                      onClick={() => setSelectedFeatureId(feature.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setSelectedFeatureId(feature.id);
                        }
                      }}
                      className={`cursor-pointer rounded-xl border px-4 py-3.5 transition-colors ${
                        isSelected ? 'border-[#7FB98A] bg-[#F7FBF8]' : 'border-[#E4E7EA] bg-white hover:border-[#D9EBDC]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 font-extrabold text-[#123522]">
                          <MapPin className="w-4 h-4 text-[#2E7D4F]" />
                          {featureLabel(feature, language, index)}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F1F3F4] text-[#6C757C] text-xs font-bold">
                          {OCCUPANCY_UNKNOWN_LABEL}
                        </span>
                      </div>
                      <div className="mt-2.5 flex items-center gap-4 text-xs text-[#767F87]">
                        <span>
                          Maydon:{' '}
                          <b className="text-[#1A1F24]">{area ?? 'Maʼlum emas'}</b>
                        </span>
                        <span>
                          Sigʻim:{' '}
                          <b className="text-[#1A1F24]">{capacity ?? 'Maʼlum emas'}</b>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="px-6 py-5 border-t border-[#E4E7EA] bg-[#F8F9FA]">
                <div className="text-xs font-extrabold text-[#767F87] uppercase tracking-wider">
                  Tanlangan kontur
                </div>
                {selectedFeature ? (
                  <>
                    <div className="mt-2.5 flex items-baseline gap-2.5">
                      <span className="text-2xl font-black text-[#123522]">
                        {featureLabel(selectedFeature, language, Math.max(selectedIndex, 0))}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[#5A646D] leading-relaxed">
                      Ushbu kontur boʻyicha bandlik holati bu sahifada koʻrsatilmaydi. Ariza
                      topshirilganda oʻrmon xoʻjaligi mutaxassisi hududni koʻrib chiqib yakuniy
                      javob beradi.
                    </p>
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      className="mt-4"
                      onClick={() => onNavigate?.('applicant_wizard')}
                    >
                      Shu kontur boʻyicha ariza berish
                    </Button>
                  </>
                ) : (
                  <p className="mt-2.5 text-sm text-[#5A646D]">Roʻyxatdan konturni tanlang.</p>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto flex items-start gap-3 px-4 py-3.5 rounded-xl bg-[#FEF7ED] border border-[#F5DEB8]">
            <TriangleAlert className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-[#3F4A52]">
              <b className="text-[#1A1F24]">Bandlik maʼlumoti bu sahifada mavjud emas.</b> Yakuniy
              qaror ariza koʻrib chiqilganda oʻrmon xoʻjaligi mutaxassisi tomonidan qabul qilinadi
              — kontur ayni damda boshqa arizada band boʻlishi mumkin.
            </p>
          </div>

          {selectedLayer && (
            <p className="max-w-5xl mx-auto text-xs text-[#9AA3AB] text-center">
              Qatlam: {pickName(selectedLayer.name, language, selectedLayer.code)}
              {featuresState?.status === 'ready' && featuresState.collection.truncated && (
                <> — natijalar qisqartirildi, aniqroq koʻrish uchun xaritani kattalashtiring.</>
              )}
            </p>
          )}
        </>
      )}
    </div>
  );
};
