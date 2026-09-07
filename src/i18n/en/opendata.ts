/** The public open-data page (`/opendata`) — English copy. */
export const opendata = {
  'opendata.header.badge': 'Open Data',
  'opendata.header.title': 'Open Data Portal',
  'opendata.header.subtitle':
    'Explore permit statistics across the Republic, browse GIS layers, and freely download raw data.',

  'opendata.error.title': 'Failed to load data',
  'opendata.error.connectionFailed':
    'Could not connect to server. Check your internet connection and try again.',
  'opendata.error.rateLimit.before': 'Rate limit reached. Please try again in',
  'opendata.error.rateLimit.after': 'seconds.',

  'opendata.stats.totalPermits.label': 'Active Permits',
  'opendata.stats.totalArea.label': 'Total Area',
  'opendata.stats.totalArea.unit': 'hectares',
  'opendata.stats.kAnonymity.before': 'To preserve privacy, only regions or organizations with at least',
  'opendata.stats.kAnonymity.after': 'active permits are shown in the list.',
  'opendata.stats.regionUnknown': 'Region unspecified',
  'opendata.stats.byRegion.title': 'By Region',
  'opendata.stats.byRegion.columns.region': 'Region',
  'opendata.stats.byRegion.columns.permits': 'Permits',
  'opendata.stats.byRegion.columns.area': 'Area, ha',
  'opendata.stats.byOrganization.title': 'By Forestry Enterprise',
  'opendata.stats.byOrganization.columns.organization': 'Forestry Enterprise',
  'opendata.stats.byOrganization.columns.region': 'Region',
  'opendata.stats.byOrganization.columns.permits': 'Permits',
  'opendata.stats.byOrganization.columns.area': 'Area, ha',

  'opendata.api.title': 'Access via API',
  'opendata.api.description':
    'Directly integrate this data into your applications or scripts using the endpoints below.',
  'opendata.api.layersLabel': 'Layers list',
  'opendata.api.statsLabel': 'Statistics',
  'opendata.api.copyButton': 'Copy',
  'opendata.api.copied': 'Copied',

  'opendata.layers.title': 'Open GIS Layers',
  'opendata.layers.empty': 'No open layers available at the moment.',
  'opendata.layers.geometryType.point': 'Point',
  'opendata.layers.geometryType.linestring': 'Line',
  'opendata.layers.geometryType.polygon': 'Polygon',
  'opendata.layers.geometryType.multipolygon': 'Multi-polygon',
  'opendata.layers.geometryType.geometry': 'Geometry',

  'opendata.layer.viewButton': 'View Objects',
  'opendata.layer.hideButton': 'Hide',
  'opendata.layer.loading': 'Loading objects…',
  'opendata.layer.errorTitle': 'Failed to load objects',
  'opendata.layer.featureCount.before': 'Total of',
  'opendata.layer.featureCount.after': 'objects found.',
  'opendata.layer.truncatedNotice':
    'This layer contains over 2,000 open objects; only the first 2,000 are displayed.',
  'opendata.layer.downloadButton': 'Download GeoJSON',
  'opendata.layer.unnamedFeature': 'Unnamed feature',
  'opendata.layer.table.columns.name': 'Name',
  'opendata.layer.table.columns.validFrom': 'Valid From',
  'opendata.layer.table.columns.validTo': 'Valid To',
  'opendata.layer.table.columns.properties': 'Properties',
  'opendata.map.toggleShow': 'View on Map',
  'opendata.map.toggleHide': 'Hide Map',
  'opendata.map.disclaimer':
    'Map is currently shown without a base layer — only features of the selected layer are drawn.',
} as const;
