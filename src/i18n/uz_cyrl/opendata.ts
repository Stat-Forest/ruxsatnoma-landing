/** The public open-data page (`/opendata`) — Cyrillic Uzbek. */
export const opendata = {
  'opendata.header.badge': 'Очиқ маълумотлар',
  'opendata.header.title': 'Очиқ маълумотлар портали',
  'opendata.header.subtitle':
    'Республика бўйича рухсатномалар статистикаси, GIS қатламлари ва уларнинг хом маълумотларини эркин юклаб олинг.',

  'opendata.error.title': 'Маълумотларни юклаб бўлмади',
  'opendata.error.connectionFailed':
    'Серверга уланиб бўлмади. Интернет алоқасини текшириб, қайта уриниб кўринг.',
  'opendata.error.rateLimit.before': 'Сўровлар сони чегарасига етдингиз. Қайта уриниб кўринг —',
  'opendata.error.rateLimit.after': 'сониядан кейин.',

  'opendata.stats.totalPermits.label': 'Амалдаги рухсатномалар',
  'opendata.stats.totalArea.label': 'Умумий майдон',
  'opendata.stats.totalArea.unit': 'гектар',
  'opendata.stats.kAnonymity.before': 'Махфийликни сақлаш учун камида',
  'opendata.stats.kAnonymity.after':
    'та амалдаги рухсатномаси бўлган ҳудуд ёки ташкилотларгина рўйхатда кўрсатилади.',
  'opendata.stats.regionUnknown': 'Ҳудуд кўрсатилмаган',
  'opendata.stats.byRegion.title': 'Ҳудудлар кесимида',
  'opendata.stats.byRegion.columns.region': 'Ҳудуд',
  'opendata.stats.byRegion.columns.permits': 'Рухсатномалар',
  'opendata.stats.byRegion.columns.area': 'Майдон, га',
  'opendata.stats.byOrganization.title': 'Ўрмон хўжаликлари кесимида',
  'opendata.stats.byOrganization.columns.organization': 'Ўрмон хўжалиги',
  'opendata.stats.byOrganization.columns.region': 'Ҳудуд',
  'opendata.stats.byOrganization.columns.permits': 'Рухсатномалар',
  'opendata.stats.byOrganization.columns.area': 'Майдон, га',

  'opendata.api.title': 'API орқали мурожаат',
  'opendata.api.description':
    'Қуйидаги манзиллар орқали ушбу маълумотларни ўз дастурингиз ёки скриптингизга тўғридан-тўғри улашингиз мумкин.',
  'opendata.api.layersLabel': 'Қатламлар рўйхати',
  'opendata.api.statsLabel': 'Статистика',
  'opendata.api.copyButton': 'Нусхалаш',
  'opendata.api.copied': 'Нусхаланди',

  'opendata.layers.title': 'Очиқ GIS қатламлари',
  'opendata.layers.empty': 'Ҳозирча очиқ қатламлар мавжуд эмас.',
  'opendata.layers.geometryType.point': 'Нуқта',
  'opendata.layers.geometryType.linestring': 'Чизиқ',
  'opendata.layers.geometryType.polygon': 'Полигон',
  'opendata.layers.geometryType.multipolygon': 'Кўп полигон',
  'opendata.layers.geometryType.geometry': 'Геометрия',

  'opendata.layer.viewButton': 'Объектларни кўриш',
  'opendata.layer.hideButton': 'Яшириш',
  'opendata.layer.loading': 'Объектлар юкланмоқда…',
  'opendata.layer.errorTitle': 'Объектларни юклаб бўлмади',
  'opendata.layer.featureCount.before': 'Жами',
  'opendata.layer.featureCount.after': 'та объект топилди.',
  'opendata.layer.truncatedNotice':
    'Бу қатламда 2000 тадан ортиқ очиқ объект мавжуд, шу сабабли фақат биринчи 2000 таси кўрсатилмоқда.',
  'opendata.layer.downloadButton': 'GeoJSON юклаб олиш',
  'opendata.layer.unnamedFeature': 'Номи кўрсатилмаган',
  'opendata.layer.table.columns.name': 'Номи',
  'opendata.layer.table.columns.validFrom': 'Бошланиш санаси',
  'opendata.layer.table.columns.validTo': 'Тугаш санаси',
  'opendata.layer.table.columns.properties': 'Хусусиятлар',
  'opendata.map.toggleShow': 'Харитада кўриш',
  'opendata.map.toggleHide': 'Харитани яшириш',
  'opendata.map.disclaimer':
    'Харита ҳозирча асосий (базавий) қатламсиз кўрсатилмоқда — фақат танланган қатлам объектлари чизилади.',
} as const;
