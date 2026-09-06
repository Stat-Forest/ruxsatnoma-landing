/** The public open-data page (`/opendata`): stats, GIS layer catalogue and
 * on-demand per-layer GeoJSON feature explorer, all fed by the anonymous
 * `/api/v1/public/open-data/*` routes. */
export const opendata = {
  'opendata.header.badge': 'Ochiq maʼlumotlar',
  'opendata.header.title': 'Ochiq maʼlumotlar portali',
  'opendata.header.subtitle':
    'Respublika boʻyicha ruxsatnomalar statistikasi, GIS qatlamlari va ularning xom maʼlumotlarini erkin yuklab oling.',

  'opendata.error.title': 'Maʼlumotlarni yuklab boʻlmadi',
  'opendata.error.connectionFailed':
    'Serverga ulanib boʻlmadi. Internet aloqasini tekshirib, qayta urinib koʻring.',
  'opendata.error.rateLimit.before': 'Soʻrovlar soni chegarasiga yetdingiz. Qayta urinib koʻring —',
  'opendata.error.rateLimit.after': 'soniyadan keyin.',

  'opendata.stats.totalPermits.label': 'Amaldagi ruxsatnomalar',
  'opendata.stats.totalArea.label': 'Umumiy maydon',
  'opendata.stats.totalArea.unit': 'ga',
  'opendata.stats.kAnonymity.before': 'Maxfiylikni saqlash uchun kamida',
  'opendata.stats.kAnonymity.after':
    'ta amaldagi ruxsatnomasi boʻlgan hudud yoki tashkilotlargina roʻyxatda koʻrsatiladi.',
  'opendata.stats.regionUnknown': 'Hudud koʻrsatilmagan',
  'opendata.stats.byRegion.title': 'Hududlar kesimida',
  'opendata.stats.byRegion.columns.region': 'Hudud',
  'opendata.stats.byRegion.columns.permits': 'Ruxsatnomalar',
  'opendata.stats.byRegion.columns.area': 'Maydon, ga',
  'opendata.stats.byOrganization.title': 'Oʻrmon xoʻjaliklari kesimida',
  'opendata.stats.byOrganization.columns.organization': 'Oʻrmon xoʻjaligi',
  'opendata.stats.byOrganization.columns.region': 'Hudud',
  'opendata.stats.byOrganization.columns.permits': 'Ruxsatnomalar',
  'opendata.stats.byOrganization.columns.area': 'Maydon, ga',

  'opendata.api.title': 'API orqali murojaat',
  'opendata.api.description':
    'Quyidagi manzillar orqali ushbu maʼlumotlarni oʻz dasturingiz yoki skriptingizga toʻgʻridan-toʻgʻri ulashingiz mumkin.',
  'opendata.api.layersLabel': 'Qatlamlar roʻyxati',
  'opendata.api.statsLabel': 'Statistika',
  'opendata.api.copyButton': 'Nusxalash',
  'opendata.api.copied': 'Nusxalandi',

  'opendata.layers.title': 'Ochiq GIS qatlamlari',
  'opendata.layers.empty': 'Hozircha ochiq qatlamlar mavjud emas.',
  'opendata.layers.geometryType.point': 'Nuqta',
  'opendata.layers.geometryType.linestring': 'Chiziq',
  'opendata.layers.geometryType.polygon': 'Poligon',
  'opendata.layers.geometryType.multipolygon': 'Koʻp poligon',
  'opendata.layers.geometryType.geometry': 'Geometriya',

  'opendata.layer.viewButton': 'Obʼyektlarni koʻrish',
  'opendata.layer.hideButton': 'Yashirish',
  'opendata.layer.loading': 'Obʼyektlar yuklanmoqda…',
  'opendata.layer.errorTitle': 'Obʼyektlarni yuklab boʻlmadi',
  'opendata.layer.featureCount.before': 'Jami',
  'opendata.layer.featureCount.after': 'ta obʼyekt topildi.',
  'opendata.layer.truncatedNotice':
    'Bu qatlamda 2000 tadan ortiq ochiq obʼyekt mavjud, shu sababli faqat birinchi 2000 tasi koʻrsatilmoqda.',
  'opendata.layer.downloadButton': 'GeoJSON yuklab olish',
  'opendata.layer.unnamedFeature': 'Nomi koʻrsatilmagan',
  'opendata.layer.table.columns.name': 'Nomi',
  'opendata.layer.table.columns.validFrom': 'Boshlanish sanasi',
  'opendata.layer.table.columns.validTo': 'Tugash sanasi',
  'opendata.layer.table.columns.properties': 'Xususiyatlar',
} as const;
