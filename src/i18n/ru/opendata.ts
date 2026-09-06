/** The public open-data page (`/opendata`): stats, GIS layer catalogue and
 * on-demand per-layer GeoJSON feature explorer, all fed by the anonymous
 * `/api/v1/public/open-data/*` routes. */
export const opendata = {
  'opendata.header.badge': 'Открытые данные',
  'opendata.header.title': 'Портал открытых данных',
  'opendata.header.subtitle':
    'Статистика по разрешениям, ГИС-слои лесного фонда и их исходные данные — в свободном доступе для скачивания.',

  'opendata.error.title': 'Не удалось загрузить данные',
  'opendata.error.connectionFailed':
    'Не удалось подключиться к серверу. Проверьте подключение к интернету и повторите попытку.',
  'opendata.error.rateLimit.before': 'Превышен лимит запросов. Повторите попытку через',
  'opendata.error.rateLimit.after': 'сек.',

  'opendata.stats.totalPermits.label': 'Действующих разрешений',
  'opendata.stats.totalArea.label': 'Общая площадь',
  'opendata.stats.totalArea.unit': 'га',
  'opendata.stats.kAnonymity.before':
    'В целях защиты данных в разрезе показаны только регионы и организации не менее чем с',
  'opendata.stats.kAnonymity.after': 'действующими разрешениями.',
  'opendata.stats.regionUnknown': 'Регион не указан',
  'opendata.stats.byRegion.title': 'В разрезе регионов',
  'opendata.stats.byRegion.columns.region': 'Регион',
  'opendata.stats.byRegion.columns.permits': 'Разрешения',
  'opendata.stats.byRegion.columns.area': 'Площадь, га',
  'opendata.stats.byOrganization.title': 'В разрезе лесных хозяйств',
  'opendata.stats.byOrganization.columns.organization': 'Лесное хозяйство',
  'opendata.stats.byOrganization.columns.region': 'Регион',
  'opendata.stats.byOrganization.columns.permits': 'Разрешения',
  'opendata.stats.byOrganization.columns.area': 'Площадь, га',

  'opendata.api.title': 'Доступ через API',
  'opendata.api.description':
    'Эти адреса можно использовать напрямую в своих программах и скриптах.',
  'opendata.api.layersLabel': 'Список слоёв',
  'opendata.api.statsLabel': 'Статистика',
  'opendata.api.copyButton': 'Копировать',
  'opendata.api.copied': 'Скопировано',

  'opendata.layers.title': 'Открытые ГИС-слои',
  'opendata.layers.empty': 'Открытых слоёв пока нет.',
  'opendata.layers.geometryType.point': 'Точка',
  'opendata.layers.geometryType.linestring': 'Линия',
  'opendata.layers.geometryType.polygon': 'Полигон',
  'opendata.layers.geometryType.multipolygon': 'Мультиполигон',
  'opendata.layers.geometryType.geometry': 'Геометрия',

  'opendata.layer.viewButton': 'Показать объекты',
  'opendata.layer.hideButton': 'Скрыть',
  'opendata.layer.loading': 'Загрузка объектов…',
  'opendata.layer.errorTitle': 'Не удалось загрузить объекты',
  'opendata.layer.featureCount.before': 'Всего найдено',
  'opendata.layer.featureCount.after': 'объектов.',
  'opendata.layer.truncatedNotice':
    'В этом слое более 2000 открытых объектов, показаны только первые 2000.',
  'opendata.layer.downloadButton': 'Скачать GeoJSON',
  'opendata.layer.unnamedFeature': 'Без названия',
  'opendata.layer.table.columns.name': 'Название',
  'opendata.layer.table.columns.validFrom': 'Действует с',
  'opendata.layer.table.columns.validTo': 'Действует по',
  'opendata.layer.table.columns.properties': 'Свойства',
} as const;
