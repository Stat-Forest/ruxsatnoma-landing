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

  /* `PriceCalculator`'s own copy, which lived in the component as local
     constants in Uzbek Latin only. The default quantity field keeps using
     `tariffs.calculator.quantityLabel` above. */
  'tariffs.calculator.badge': 'Онлайн-калькулятор',
  'tariffs.calculator.bullet.norms': 'По нормативам ПКМ 689',
  'tariffs.calculator.bullet.anonymous': 'Доступен без регистрации',
  'tariffs.calculator.bullet.finalSum':
    'Окончательная сумма подтверждается после рассмотрения заявки',
  'tariffs.calculator.field.haymaking': 'Площадь сенокоса (га)',
  'tariffs.calculator.field.apiary': 'Количество ульев',
  'tariffs.calculator.field.recreation': 'Площадь (га)',
  'tariffs.calculator.field.deadwood': 'Объём (м³)',
  'tariffs.calculator.headCountSuffix': 'поголовье',
  'tariffs.calculator.science.sumLabel': 'Льготно',
  'tariffs.calculator.science.sumUnit': 'по заявке',
  'tariffs.calculator.science.note':
    'Размер платы за научные исследования не установлен — каждая заявка рассматривается отдельно.',
  'tariffs.calculator.tariffNotPublished':
    'Ставка для этого вида деятельности пока не опубликована (ожидается приложение 5 к ПКМ № 689). Сумму показать пока невозможно.',
} as const;
