/** The public open-data page (`/opendata`) — Karakalpak copy. */
export const opendata = {
  'opendata.header.badge': 'Ashıq maǵlıwmatlar',
  'opendata.header.title': 'Ashıq maǵlıwmatlar portali',
  'opendata.header.subtitle':
    'Respublika boyınsha ruxsatnamalar statistikası, GIS qatlamları hám olardıń xam maǵlıwmatların erkin júklep alıń.',

  'opendata.error.title': 'Maǵlıwmatlardı júklew múmkin bolmadı',
  'opendata.error.connectionFailed':
    'Serverge jalǵanıw múmkin bolmadı. Internet baylanısın tekserip, qaytadan háreket etiń.',
  'opendata.error.rateLimit.before': 'Sorawlar sanı shegarasına jettıńiz. Qaytadan háreket etiń —',
  'opendata.error.rateLimit.after': 'sekunttan keyin.',

  'opendata.stats.totalPermits.label': 'Ámeldegi ruxsatnamalar',
  'opendata.stats.totalArea.label': 'Ulıwma maydan',
  'opendata.stats.totalArea.unit': 'gektar',
  'opendata.stats.kAnonymity.before': 'Jasırınlıqtı saqlaw ushın keminde',
  'opendata.stats.kAnonymity.after':
    'ta ámeldegi ruxsatnaması bolǵan aymaq yamasa shólkemler ǵana dizimde kórsetiledi.',
  'opendata.stats.regionUnknown': 'Aymaq kórsetilmegen',
  'opendata.stats.byRegion.title': 'Aymaqlar kesiminde',
  'opendata.stats.byRegion.columns.region': 'Aymaq',
  'opendata.stats.byRegion.columns.permits': 'Ruxsatnamalar',
  'opendata.stats.byRegion.columns.area': 'Maydan, ga',
  'opendata.stats.byOrganization.title': 'Orman xojalıqları kesiminde',
  'opendata.stats.byOrganization.columns.organization': 'Orman xojalıǵı',
  'opendata.stats.byOrganization.columns.region': 'Aymaq',
  'opendata.stats.byOrganization.columns.permits': 'Ruxsatnamalar',
  'opendata.stats.byOrganization.columns.area': 'Maydan, ga',

  'opendata.api.title': 'API arqalı múrájat',
  'opendata.api.description':
    'Tómendegi mánziller arqalı bul maǵlıwmatlardı óz baǵdarlamańız yamasa skriptińizge tuwrıdan-tuwrı jalǵawıńız múmkin.',
  'opendata.api.layersLabel': 'Qatlamlar dizimi',
  'opendata.api.statsLabel': 'Statistika',
  'opendata.api.copyButton': 'Kóshirip alıw',
  'opendata.api.copied': 'Kóshirip alındı',

  'opendata.layers.title': 'Ashıq GIS qatlamları',
  'opendata.layers.empty': 'Házirshe ashıq qatlamlar joq.',
  'opendata.layers.geometryType.point': 'Nogʻat',
  'opendata.layers.geometryType.linestring': 'Sızıq',
  'opendata.layers.geometryType.polygon': 'Poligon',
  'opendata.layers.geometryType.multipolygon': 'Kóp poligon',
  'opendata.layers.geometryType.geometry': 'Geometriya',

  'opendata.layer.viewButton': 'Obyektlerdi kóriw',
  'opendata.layer.hideButton': 'Jasırıw',
  'opendata.layer.loading': 'Obyektler júklenbekte…',
  'opendata.layer.errorTitle': 'Obyektlerdi júklew múmkin bolmadı',
  'opendata.layer.featureCount.before': 'Jámi',
  'opendata.layer.featureCount.after': 'ta obyekt tabıldı.',
  'opendata.layer.truncatedNotice':
    'Bul qatlamda 2000 nan artıq ashıq obyekt bar, sol sebepli tek dáslepki 2000 ı kórsetilmekte.',
  'opendata.layer.downloadButton': 'GeoJSON júklep alıw',
  'opendata.layer.unnamedFeature': 'Atı kórsetilmegen',
  'opendata.layer.table.columns.name': 'Atı',
  'opendata.layer.table.columns.validFrom': 'Baslanıw sánesi',
  'opendata.layer.table.columns.validTo': 'Tawısılıw sánesi',
  'opendata.layer.table.columns.properties': 'Ózgeshelikler',
  'opendata.map.toggleShow': 'Kartada kóriw',
  'opendata.map.toggleHide': 'Kartanı jasırıw',
  'opendata.map.disclaimer':
    'Karta házirshe tiykarǵı (bazalıq) qatlamsız kórsetilmekte — tek tańlanǵan qatlam obyektleri sızıladi.',
} as const;
