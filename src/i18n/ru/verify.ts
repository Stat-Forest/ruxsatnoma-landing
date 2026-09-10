/** The public permit-verification page (`/verify`). */
export const verify = {
  'verify.header.badge': 'Официальная служба проверки',
  'verify.header.title': 'Проверка действительности разрешения',
  'verify.header.subtitle':
    'Введите серию и номер разрешения или воспользуйтесь сканированием QR-кода.',

  'verify.form.seriesLabel': 'Серия',
  'verify.form.seriesPlaceholder': 'Например: А',
  'verify.form.numberLabel': 'Номер',
  'verify.form.numberPlaceholder': 'Например: 000123',
  'verify.form.submit': 'Проверить',

  'verify.qrInfo.before': 'При сканировании камерой телефона',
  'verify.qrInfo.bold': 'QR-кода',
  'verify.qrInfo.after':
    'на бланке разрешения эта страница откроется автоматически, и результат будет показан сразу.',

  'verify.pii.bold': 'Защита персональных данных (маскирование PII):',
  'verify.pii.after':
    'В соответствии с законодательством Ф.И.О. заявителя и его персональные данные отображаются в открытом поиске в сокращённом виде.',

  'verify.status.loading': 'Идёт проверка…',
  'verify.status.errorTitle': 'Служба временно недоступна',
  'verify.status.networkError':
    'Не удалось подключиться к службе проверки. Проверьте подключение к интернету и повторите попытку.',
  'verify.status.missTitle': 'Разрешение не найдено',
  'verify.status.missMessage':
    'По указанным данным действующее разрешение в системе не найдено. Проверьте правильность серии и номера.',

  'verify.result.registryNote': 'Данное разрешение успешно прошло проверку по государственному реестру.',
  'verify.result.holderLabel': 'Заявитель (маскировано)',
  'verify.result.activityLabel': 'Вид деятельности',
  'verify.result.organizationLabel': 'Лесное хозяйство',
  'verify.result.validityLabel': 'Срок действия',
  'verify.result.signaturesValid': 'Электронные подписи действительны (E-IMZO)',
  'verify.result.signaturesPending': 'Электронные подписи ещё не полностью подтверждены',

  /* The map panel is mounted ONLY when `GET /public/permits/check` actually
     sent a `contour` — a legend may only name what is drawn. */
  'verify.map.title': 'Карта контура',
  'verify.map.heading': 'На карте',
  'verify.map.legend': 'Разрешённый контур',
} as const;
