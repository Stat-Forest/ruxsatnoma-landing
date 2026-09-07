import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Check, Copy, Download, Loader2, Map as MapIcon, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Alert, Skeleton } from '../../components/ui/Feedback';
import { DataTable } from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import { api, BASE_URL } from '../../api/client';
import { apiError, ApiError } from '../../api/errors';
import { pickName } from '../../lib/localized';
import { useLanguage, useT } from '../../i18n/useT';
import type { components } from '../../api/schema';

type OpenDataLayer = components['schemas']['OpenDataLayerOut'];
type OpenDataStats = components['schemas']['OpenDataStatsOut'];
type RegionStat = components['schemas']['OpenDataRegionStatOut'];
type OrgStat = components['schemas']['OpenDataOrgStatOut'];

// `GET /open-data/layers/{code}/features` has no declared response schema on
// the backend (a bare `dict[str, Any]` return type), so `schema.d.ts` types
// it as `{[key: string]: unknown}`. The real shape, from
// `backend/app/modules/gis/repo.py::features_geojson` (lines 696-776;
// `FEATURE_COLLECTION_LIMIT = 2000` at line 529), is defined locally here.
export interface OpenDataFeature {
  type: 'Feature';
  id: string;
  geometry: { type: string; coordinates: unknown } | null;
  properties: {
    name: Record<string, unknown> | null;
    props: Record<string, unknown>;
    valid_from: string | null;
    valid_to: string | null;
  };
}

// Exported so `LayerMapView` (Task 2, lazy-loaded) can type its props against
// the exact same shape this page already fetched and cached — no separate
// copy of the interface, no second network call to draw the map.
export interface OpenDataFeatureCollection {
  type: 'FeatureCollection';
  truncated: boolean;
  features: OpenDataFeature[];
}

function isFeatureCollection(data: unknown): data is OpenDataFeatureCollection {
  if (!data || typeof data !== 'object') return false;
  const candidate = data as { type?: unknown; features?: unknown };
  return candidate.type === 'FeatureCollection' && Array.isArray(candidate.features);
}

// Module scope, not inside a component body — recreating the lazy component
// on every render would remount MapLibre (and its network-free style/source
// setup) on every re-render instead of once per toggle.
const LazyLayerMapView = React.lazy(() => import('../../components/maps/LayerMapView'));

type TFunction = ReturnType<typeof useT>;

// The load failure is kept as its ingredients, not a rendered string, so a
// language switch while the error is on screen re-renders it correctly
// (mirrors `TariffsPage`'s `RefsState` message/messageKey split).
type LoadError =
  | { kind: 'network' }
  | { kind: 'rateLimit'; seconds: number | null; fallback: string }
  | { kind: 'server'; message: string };

function toLoadError(err: ApiError): LoadError {
  if (err.code === 'ERR-SYS-006') {
    const details = err.details as { retry_after_seconds?: unknown } | undefined;
    const seconds = typeof details?.retry_after_seconds === 'number' ? details.retry_after_seconds : null;
    return { kind: 'rateLimit', seconds, fallback: `${err.message} (${err.code})` };
  }
  return { kind: 'server', message: `${err.message} (${err.code})` };
}

function renderLoadError(t: TFunction, error: LoadError): React.ReactNode {
  if (error.kind === 'network') return t('opendata.error.connectionFailed');
  if (error.kind === 'server') return error.message;
  if (error.seconds === null) return error.fallback;
  return (
    <>
      {t('opendata.error.rateLimit.before')} {error.seconds} {t('opendata.error.rateLimit.after')}
    </>
  );
}

/** Same ingredients as a rate-limit refusal on the initial load, formatted
 * eagerly into a string — used for the per-layer feature fetch, whose cached
 * state (per the brief) stores a plain `message`, not a re-translatable key. */
function formatFetchError(t: TFunction, err: ApiError): string {
  if (err.code === 'ERR-SYS-006') {
    const details = err.details as { retry_after_seconds?: unknown } | undefined;
    const seconds = typeof details?.retry_after_seconds === 'number' ? details.retry_after_seconds : null;
    if (seconds !== null) {
      return `${t('opendata.error.rateLimit.before')} ${seconds} ${t('opendata.error.rateLimit.after')}`;
    }
  }
  return `${err.message} (${err.code})`;
}

function formatArea(value: string): string {
  return Number(value).toLocaleString();
}

const GEOMETRY_TYPE_KEYS: Record<string, string> = {
  point: 'opendata.layers.geometryType.point',
  linestring: 'opendata.layers.geometryType.linestring',
  polygon: 'opendata.layers.geometryType.polygon',
  multipolygon: 'opendata.layers.geometryType.multipolygon',
  geometry: 'opendata.layers.geometryType.geometry',
};

function geometryTypeLabel(t: TFunction, geometryType: string): string {
  const key = GEOMETRY_TYPE_KEYS[geometryType.toLowerCase()];
  return key ? t(key) : geometryType;
}

type PageState =
  | { status: 'loading' }
  | { status: 'error'; error: LoadError }
  | { status: 'ready'; layers: OpenDataLayer[]; stats: OpenDataStats };

export const OpenDataPage: React.FC = () => {
  const t = useT();
  const [state, setState] = useState<PageState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [layersRes, statsRes] = await Promise.all([
          api.GET('/api/v1/public/open-data/layers'),
          api.GET('/api/v1/public/open-data/stats'),
        ]);
        if (cancelled) return;
        const firstError = layersRes.error ?? statsRes.error;
        if (firstError) {
          setState({ status: 'error', error: toLoadError(apiError(firstError)) });
          return;
        }
        setState({
          status: 'ready',
          layers: layersRes.data ?? [],
          stats: statsRes.data as OpenDataStats,
        });
      } catch {
        if (cancelled) return;
        setState({ status: 'error', error: { kind: 'network' } });
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === 'loading') {
    return (
      <div className="max-w-5xl mx-auto space-y-6 font-sans">
        <Skeleton height="h-10" width="w-2/3" className="mx-auto" />
        <Skeleton height="h-48" />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="max-w-3xl mx-auto font-sans">
        <Alert variant="danger" title={t('opendata.error.title')}>
          {renderLoadError(t, state.error)}
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 font-sans">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D4F] bg-[#F0F7F1] px-3 py-1 rounded-full border border-[#D9EBDC]">
          {t('opendata.header.badge')}
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1F24]">{t('opendata.header.title')}</h1>
        <p className="text-sm text-[#5A646D] max-w-xl mx-auto">{t('opendata.header.subtitle')}</p>
      </div>

      <StatsSection stats={state.stats} />
      {/* <ApiAccessPanel /> */}
      <LayerCatalogue layers={state.layers} />
    </div>
  );
};

function StatCard({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="bg-white border border-[#E4E7EA] p-5 rounded-2xl text-center space-y-1">
      <div className="text-2xl font-bold text-[#2E7D4F]">{value}</div>
      <div className="text-xs text-[#5A646D]">{label}</div>
    </div>
  );
}

type RegionRow = RegionStat & { id: string };
type OrgRow = OrgStat & { id: string };

function StatsSection({ stats }: { stats: OpenDataStats }) {
  const t = useT();
  const { language } = useLanguage();

  const regionRows: RegionRow[] = stats.by_region.map((row, index) => ({
    ...row,
    id: row.region_id ?? `no-region-${index}`,
  }));
  const orgRows: OrgRow[] = stats.by_organization.map((row) => ({ ...row, id: row.organization_id }));

  const regionColumns: Column<RegionRow>[] = [
    {
      key: 'region',
      header: t('opendata.stats.byRegion.columns.region'),
      accessor: (row) => (row.region_name ? pickName(row.region_name, language) : t('opendata.stats.regionUnknown')),
    },
    {
      key: 'permits',
      header: t('opendata.stats.byRegion.columns.permits'),
      accessor: (row) => row.active_permits_count.toLocaleString(),
    },
    {
      key: 'area',
      header: t('opendata.stats.byRegion.columns.area'),
      accessor: (row) => formatArea(row.active_area_ha),
    },
  ];

  const orgColumns: Column<OrgRow>[] = [
    {
      key: 'organization',
      header: t('opendata.stats.byOrganization.columns.organization'),
      accessor: (row) => pickName(row.organization_name, language),
    },
    {
      key: 'region',
      header: t('opendata.stats.byOrganization.columns.region'),
      accessor: (row) => (row.region_name ? pickName(row.region_name, language) : t('opendata.stats.regionUnknown')),
    },
    {
      key: 'permits',
      header: t('opendata.stats.byOrganization.columns.permits'),
      accessor: (row) => row.active_permits_count.toLocaleString(),
    },
    {
      key: 'area',
      header: t('opendata.stats.byOrganization.columns.area'),
      accessor: (row) => formatArea(row.active_area_ha),
    },
  ];

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          value={Number(stats.total_active_permits).toLocaleString()}
          label={t('opendata.stats.totalPermits.label')}
        />
        <StatCard
          value={`${Number(stats.total_active_area_ha).toLocaleString()} ${t('opendata.stats.totalArea.unit')}`}
          label={t('opendata.stats.totalArea.label')}
        />
        <div className="bg-white border border-[#E4E7EA] p-5 rounded-2xl flex items-center justify-center text-center">
          <p className="text-xs text-[#5A646D] leading-relaxed">
            {t('opendata.stats.kAnonymity.before')}{' '}
            <b className="text-[#1A1F24]">{stats.k_anonymity_threshold}</b>{' '}
            {t('opendata.stats.kAnonymity.after')}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-[#1A1F24]">{t('opendata.stats.byRegion.title')}</h2>
        <DataTable columns={regionColumns} data={regionRows} />
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-[#1A1F24]">{t('opendata.stats.byOrganization.title')}</h2>
        <DataTable columns={orgColumns} data={orgRows} />
      </div>
    </section>
  );
}

/** `navigator.clipboard.writeText` wrapped for reuse: the API-access panel's
 * two rows and every layer card's "copy URL" button share this exact
 * behavior (shared-context.md's copy-button spec). */
function CopyUrlButton({ url }: { url: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard access can throw/reject in some contexts — not a
      // critical-path feature, the button just skips the confirmation.
      return;
    }
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      onClick={() => void handleCopy()}
    >
      {copied ? t('opendata.api.copied') : t('opendata.api.copyButton')}
    </Button>
  );
}

/*
function ApiUrlRow({ label, url }: { label: string; url: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold text-[#5A646D] uppercase tracking-wider">{label}</div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <code className="flex-1 text-xs font-mono bg-[#F8F9FA] border border-[#E4E7EA] rounded-lg px-3 py-2 overflow-x-auto whitespace-nowrap">
          {url}
        </code>
        <CopyUrlButton url={url} />
      </div>
    </div>
  );
}

function ApiAccessPanel() {
  const t = useT();
  const apiBase = BASE_URL || 'https://dev-api.ruxsatnoma-urmon.uz';
  const layersUrl = `${apiBase}/api/v1/public/open-data/layers`;
  const statsUrl = `${apiBase}/api/v1/public/open-data/stats`;

  return (
    <section className="bg-white border border-[#E4E7EA] rounded-2xl p-6 shadow-xs space-y-4">
      <div>
        <h2 className="text-base font-bold text-[#1A1F24]">{t('opendata.api.title')}</h2>
        <p className="text-xs text-[#5A646D]">{t('opendata.api.description')}</p>
      </div>
      <ApiUrlRow label={t('opendata.api.layersLabel')} url={layersUrl} />
      <ApiUrlRow label={t('opendata.api.statsLabel')} url={statsUrl} />
    </section>
  );
}
*/

type LayerFeatureState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; collection: OpenDataFeatureCollection };

type FeatureRow = { id: string; feature: OpenDataFeature };

const DETAIL_PAGE_SIZE = 25;

function LayerDetailPanel({ code, state }: { code: string; state: LayerFeatureState | undefined }) {
  const t = useT();
  const { language } = useLanguage();
  const [page, setPage] = useState(1);
  const [showMap, setShowMap] = useState(false);

  // A fresh mount (switching layers, or hiding then re-viewing the same one)
  // already starts `page` at 1; this only guards the case a future change
  // keeps the panel mounted while `code` changes underneath it.
  useEffect(() => {
    setPage(1);
  }, [code]);

  if (!state || state.status === 'loading') {
    return (
      <div className="p-6 text-center text-[#767F87] flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-[#2E7D4F]" />
        {t('opendata.layer.loading')}
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="p-6">
        <Alert variant="danger" title={t('opendata.layer.errorTitle')}>
          {state.message}
        </Alert>
      </div>
    );
  }

  const { collection } = state;
  const rows: FeatureRow[] = collection.features.map((feature, index) => ({
    id: feature.id || `f-${index}`,
    feature,
  }));
  const totalPages = Math.max(1, Math.ceil(rows.length / DETAIL_PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * DETAIL_PAGE_SIZE, page * DETAIL_PAGE_SIZE);

  const columns: Column<FeatureRow>[] = [
    {
      key: 'name',
      header: t('opendata.layer.table.columns.name'),
      accessor: (row) =>
        row.feature.properties.name ? pickName(row.feature.properties.name, language) : t('opendata.layer.unnamedFeature'),
    },
    {
      key: 'validFrom',
      header: t('opendata.layer.table.columns.validFrom'),
      accessor: (row) => row.feature.properties.valid_from ?? '—',
    },
    {
      key: 'validTo',
      header: t('opendata.layer.table.columns.validTo'),
      accessor: (row) => row.feature.properties.valid_to ?? '—',
    },
    {
      key: 'props',
      header: t('opendata.layer.table.columns.properties'),
      accessor: (row) => {
        const json = JSON.stringify(row.feature.properties.props);
        return (
          <span className="font-mono text-xs block max-w-xs truncate" title={json}>
            {json}
          </span>
        );
      },
    },
  ];

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(collection)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${code}.geojson`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-[#5A646D]">
          {t('opendata.layer.featureCount.before')}{' '}
          <b className="text-[#1A1F24]">{collection.features.length}</b> {t('opendata.layer.featureCount.after')}
        </p>
        <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={handleDownload}>
          {t('opendata.layer.downloadButton')}
        </Button>
      </div>

      {collection.truncated && <Alert variant="warning">{t('opendata.layer.truncatedNotice')}</Alert>}

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<MapIcon className="w-4 h-4" />}
          onClick={() => setShowMap((prev) => !prev)}
        >
          {showMap ? t('opendata.map.toggleHide') : t('opendata.map.toggleShow')}
        </Button>
      </div>

      {showMap && (
        <Suspense fallback={<Skeleton height="h-80" />}>
          <LazyLayerMapView collection={collection} />
        </Suspense>
      )}

      <DataTable
        columns={columns}
        data={pageRows}
        pagination={{
          currentPage: page,
          totalPages,
          onPageChange: setPage,
          totalRecords: rows.length,
        }}
      />
    </div>
  );
}

function LayerCard({
  layer,
  isExpanded,
  featureState,
  onToggle,
}: {
  layer: OpenDataLayer;
  isExpanded: boolean;
  featureState: LayerFeatureState | undefined;
  onToggle: () => void;
}) {
  const t = useT();
  const { language } = useLanguage();
  const apiBase = BASE_URL || 'https://dev-api.ruxsatnoma-urmon.uz';
  const featuresUrl = `${apiBase}/api/v1/public/open-data/layers/${layer.code}/features`;

  return (
    <div className="bg-white border border-[#E4E7EA] rounded-2xl shadow-xs overflow-hidden">
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#F0F7F1] rounded-xl text-[#2E7D4F] shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1A1F24]">{pickName(layer.name, language, layer.code)}</h3>
            <span className="mt-1 inline-block text-xs font-bold uppercase tracking-wider text-[#2E7D4F] bg-[#F0F7F1] px-2.5 py-0.5 rounded-full border border-[#D9EBDC]">
              {geometryTypeLabel(t, layer.geometry_type)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <CopyUrlButton url={featuresUrl} />
          <Button
            variant="outline"
            size="sm"
            onClick={onToggle}
            rightIcon={isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          >
            {isExpanded ? t('opendata.layer.hideButton') : t('opendata.layer.viewButton')}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-[#E4E7EA] p-5">
          <LayerDetailPanel code={layer.code} state={featureState} />
        </div>
      )}
    </div>
  );
}

function LayerCatalogue({ layers }: { layers: OpenDataLayer[] }) {
  const t = useT();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [featuresByCode, setFeaturesByCode] = useState<Record<string, LayerFeatureState>>({});

  // Fires at most once per distinct layer code per page visit: called only
  // when a layer has no cache entry yet, or its entry is `'error'` (retry).
  // An already-`'ready'` entry is rendered straight from `featuresByCode`.
  const fetchFeatures = useCallback(
    (code: string) => {
      setFeaturesByCode((prev) => ({ ...prev, [code]: { status: 'loading' } }));
      void (async () => {
        try {
          const { data, error } = await api.GET('/api/v1/public/open-data/layers/{code}/features', {
            params: { path: { code } },
          });
          if (error) {
            const message = formatFetchError(t, apiError(error));
            setFeaturesByCode((prev) => ({ ...prev, [code]: { status: 'error', message } }));
            return;
          }
          if (!isFeatureCollection(data)) {
            setFeaturesByCode((prev) => ({
              ...prev,
              [code]: { status: 'error', message: t('opendata.layer.errorTitle') },
            }));
            return;
          }
          setFeaturesByCode((prev) => ({ ...prev, [code]: { status: 'ready', collection: data } }));
        } catch {
          setFeaturesByCode((prev) => ({
            ...prev,
            [code]: { status: 'error', message: t('opendata.error.connectionFailed') },
          }));
        }
      })();
    },
    [t],
  );

  const handleToggle = (code: string) => {
    if (selectedCode === code) {
      setSelectedCode(null);
      return;
    }
    setSelectedCode(code);
    const entry = featuresByCode[code];
    if (!entry || entry.status === 'error') {
      fetchFeatures(code);
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-[#1A1F24]">{t('opendata.layers.title')}</h2>
      {layers.length === 0 ? (
        <div className="bg-white border border-[#E4E7EA] rounded-2xl p-6 text-sm text-[#5A646D] text-center">
          {t('opendata.layers.empty')}
        </div>
      ) : (
        <div className="space-y-3">
          {layers.map((layer) => (
            <LayerCard
              key={layer.code}
              layer={layer}
              isExpanded={selectedCode === layer.code}
              featureState={featuresByCode[layer.code]}
              onToggle={() => handleToggle(layer.code)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
