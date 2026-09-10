/** TariffsPage — Cyrillic Uzbek. */
export const tariffs = {
  'tariffs.error.connectionFailed': 'Маълумотлар хизматига уланиб бўлмади.',
  'tariffs.error.title': 'Калькулятор вақтинча ишламаяпти',
  'tariffs.error.loadFailedPrefix': 'Фаолият турлари рўйхатини юклаб бўлмади:',

  'tariffs.header.badge': 'Расмий Тарифлар ва Ставкалар',
  'tariffs.header.title': 'Тўлов Ставкалари ва Калькулятор',
  'tariffs.header.subtitle':
    'Вазирлар Маҳкамаси қарорларига мувофиқ белгиланган ўрмон фондидан фойдаланиш коэффициентлари.',

  'tariffs.calculator.heading': 'Онлайн Нарх Калькулятори',
  'tariffs.calculator.description':
    'Фаолият тури, миқдор ва муддатни киритинг — тахминий сумма тизимнинг ўзида ҳисобланади',
  'tariffs.calculator.activityLabel': 'Фаолият тури',
  'tariffs.calculator.quantityLabel': 'Миқдор',
  'tariffs.calculator.durationLabel': 'Фойдаланиш муддати (Ой)',
  'tariffs.calculator.duration.months3': '3 ой (Мавсумий)',
  'tariffs.calculator.duration.months6': '6 ой (Ярим йиллик)',
  'tariffs.calculator.duration.months12': '12 ой (Бир йиллик)',
  'tariffs.calculator.privilegeNote':
    'Имтиёз (аноним тахминда ҳисобга олинмайди — имтиёз фақат ариза тўлдириш жараёнида қўлланади)',
  'tariffs.calculator.idle.grazing': 'Ҳисоблаш учун камида битта чорва тури сонини киритинг.',
  'tariffs.calculator.idle.default': 'Ҳисоблаш учун миқдорни киритинг.',
  'tariffs.calculator.loading': 'Ҳисобланмоқда…',
  'tariffs.calculator.resultLabel': 'Тахминий сумма:',
  'tariffs.calculator.submitCta': 'Шу бўйича ариза топшириш',
  'tariffs.calculator.estimateFailed': 'Ҳисоблаш хизматига уланиб бўлмади.',
  'tariffs.calculator.disclaimer':
    'Фақат тахминий ҳисоб-китоб — мажбурий тўлов эмас. Ҳақиқий ер участкаси танланмаганлиги сабабли норма, мавсумийлик ва ёнғин хавфсизлиги текширувлари ўтказилмади ҳамда имтиёз қўлланилмади. Якуний сумма ариза бериш жараёнида аниқланади.',

  /* `PriceCalculator`'s own copy, which lived in the component as local
     constants in Uzbek Latin only. The default quantity field keeps using
     `tariffs.calculator.quantityLabel` above. */
  'tariffs.calculator.badge': 'Онлайн калкулятор',
  'tariffs.calculator.bullet.norms': 'ВМҚ 689 нормалари асосида',
  'tariffs.calculator.bullet.anonymous': 'Рўйхатдан ўтмасдан фойдаланиш мумкин',
  'tariffs.calculator.bullet.finalSum': 'Якуний сумма ариза кўриб чиқилгач тасдиқланади',
  'tariffs.calculator.field.haymaking': 'Ўрим майдони (га)',
  'tariffs.calculator.field.apiary': 'Уялар сони',
  'tariffs.calculator.field.recreation': 'Майдон (га)',
  'tariffs.calculator.field.deadwood': 'Ҳажм (м³)',
  'tariffs.calculator.headCountSuffix': 'бош сони',
  'tariffs.calculator.science.sumLabel': 'Имтиёзли',
  'tariffs.calculator.science.sumUnit': 'ариза асосида',
  'tariffs.calculator.science.note':
    'Илмий тадқиқот учун тўлов миқдори белгиланмаган — ҳар бир ариза алоҳида кўриб чиқилади.',
  'tariffs.calculator.tariffNotPublished':
    'Ушбу фаолият тури учун ставка ҳали эълон қилинмаган (ВМҚ 689-сон қарор 5-иловаси кутилмоқда). Суммани ҳозирча кўрсатиб бўлмайди.',
} as const;
