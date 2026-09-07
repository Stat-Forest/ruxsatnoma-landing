/** ServicesPage — the public service catalogue. The six cards themselves come
 *  from `GET /public/refs/activity-types` (`api/services.ts`); only the
 *  page's own chrome is here. */
export const services = {
  'services.badge': 'Реестр государственных услуг',
  'services.title': 'Услуги по пользованию землями лесного фонда',
  'services.subtitle': 'На едином интерактивном портале вы можете подать заявку на разрешение любого вида.',

  'services.card.termLabel': 'Срок рассмотрения:',
  'services.card.daysUnit': 'дней',
  'services.card.apply': 'Подать заявку',

  'services.empty': 'Пока нет доступных услуг.',
  'services.error.title': 'Не удалось загрузить услуги',
  'services.error.text': 'Попробуйте обновить страницу позже.',
} as const;
