/** MapPage (`/map`) — the public GIS layer browser — Russian copy. */
export const map = {
  'map.header.badge': 'Интерактивная карта',
  'map.header.title': 'Найдите контуры на карте',
  'map.header.subtitle':
    'Посмотрите участок на карте перед подачей заявки. Сведения о занятости здесь не отображаются — окончательный ответ даёт специалист лесхоза при рассмотрении заявки.',
  'map.layer.selectLabel': 'Выбор слоя',
  'map.layer.label': 'Слой:',
  'map.layer.truncated': 'результаты сокращены, увеличьте карту для более точного просмотра.',
  'map.filter.all': 'Все',
  'map.filter.free': 'Только свободные',
  'map.filter.taken': 'Занятые',
  'map.filter.disabledHint': 'Сведения о занятости пока недоступны',
  'map.error.loadTitle': 'Не удалось загрузить данные',
  'map.error.mapTitle': 'Не удалось загрузить карту',
  'map.error.layerUnreadable': 'Не удалось прочитать данные слоя.',
  'map.error.network':
    'Не удалось подключиться к серверу. Проверьте интернет-соединение и попробуйте снова.',
  'map.empty.title': 'Открытых слоёв нет',
  'map.empty.body': 'Пока нет открытых ГИС-слоёв для отображения на карте.',
  'map.list.title': 'Список контуров',
  'map.list.hint': 'Выберите из списка — контур отметится на карте',
  'map.list.empty': 'В этом слое объектов не найдено.',
  'map.contour.fallbackName': 'Контур',
  'map.contour.occupancyUnknown': 'Занятость: неизвестно',
  'map.contour.areaLabel': 'Площадь:',
  'map.contour.capacityLabel': 'Ёмкость:',
  'map.selected.title': 'Выбранный контур',
  'map.selected.note':
    'Занятость этого контура на данной странице не отображается. После подачи заявки специалист лесхоза рассмотрит участок и даст окончательный ответ.',
  'map.selected.apply': 'Подать заявку по этому контуру',
  'map.selected.empty': 'Выберите контур из списка.',
  'map.warning.bold': 'Сведений о занятости на этой странице нет.',
  'map.warning.rest':
    'Окончательное решение принимает специалист лесхоза при рассмотрении заявки — контур может быть уже занят другой заявкой.',
} as const;
