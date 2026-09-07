/** TariffsPage — rates and the public estimate calculator. */
export const tariffs = {
  'tariffs.error.connectionFailed': 'Не удалось подключиться к сервису данных.',
  'tariffs.error.title': 'Калькулятор временно не работает',
  'tariffs.error.loadFailedPrefix': 'Не удалось загрузить перечень видов деятельности:',

  'tariffs.header.badge': 'Официальные тарифы и ставки',
  'tariffs.header.title': 'Ставки оплаты и калькулятор',
  'tariffs.header.subtitle':
    'Коэффициенты пользования землями лесного фонда, установленные постановлениями Кабинета Министров.',

  'tariffs.calculator.heading': 'Онлайн-калькулятор стоимости',
  'tariffs.calculator.description':
    'Укажите вид деятельности, объём и срок — предварительная сумма рассчитывается автоматически',
  'tariffs.calculator.activityLabel': 'Вид деятельности',
  'tariffs.calculator.quantityLabel': 'Количество',
  'tariffs.calculator.durationLabel': 'Срок пользования (мес.)',
  'tariffs.calculator.duration.months3': '3 месяца (сезонно)',
  'tariffs.calculator.duration.months6': '6 месяцев (полугодие)',
  'tariffs.calculator.duration.months12': '12 месяцев (год)',
  'tariffs.calculator.privilegeNote':
    'Льгота (не учитывается в анонимном расчёте — льгота применяется только при заполнении заявки)',
  'tariffs.calculator.idle.grazing': 'Для расчёта укажите поголовье хотя бы одного вида скота.',
  'tariffs.calculator.idle.default': 'Для расчёта укажите количество.',
  'tariffs.calculator.loading': 'Идёт расчёт…',
  'tariffs.calculator.resultLabel': 'Предварительная сумма:',
  'tariffs.calculator.submitCta': 'Подать заявку по этому виду',
  'tariffs.calculator.estimateFailed': 'Не удалось подключиться к сервису расчёта.',
  'tariffs.calculator.disclaimer':
    'Приблизительный расчёт — не является окончательным счётом к оплате. Поскольку конкретный лесной участок не выбран, сезонные нормы, пожарные ограничения и льготы не учитывались. Итоговая сумма определяется при оформлении заявки.',
} as const;
