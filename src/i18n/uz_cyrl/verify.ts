/** The public permit-verification page (`/verify`) — Cyrillic Uzbek. */
export const verify = {
  'verify.header.badge': 'Расмий Текширув Хизмати',
  'verify.header.title': 'Рухсатнома Ҳақиқийлигини Текшириш',
  'verify.header.subtitle':
    'Рухсатнома серияси ва рақамини киритинг ёки QR-код сканеридан фойдаланинг.',

  'verify.form.seriesLabel': 'Серия',
  'verify.form.seriesPlaceholder': 'Масалан: А',
  'verify.form.numberLabel': 'Рақам',
  'verify.form.numberPlaceholder': 'Масалан: 000123',
  'verify.form.submit': 'Текшириш',

  'verify.qrInfo.before': 'Рухсатнома қоғозидаги',
  'verify.qrInfo.bold': 'QR-кодни',
  'verify.qrInfo.after':
    'телефон камераси билан сканерлаганда ушбу саҳифа автоматик равишда очилади ва натижа дарҳол кўрсатилади.',

  'verify.pii.bold': 'Шахсий маълумотлар дахлсизлиги (PII Masking):',
  'verify.pii.after':
    'Қонунчиликка мувофиқ аризачининг Ф.И.Ш. ва шахсий маълумотлари очиқ қидирувда қисқартирилган шаклда кўрсатилади.',

  'verify.status.loading': 'Текширилмоқда…',
  'verify.status.errorTitle': 'Хизмат вақтинча ишламаяпти',
  'verify.status.networkError':
    'Текширув хизматига уланиб бўлмади. Интернет алоқасини текшириб, қайтадан уриниб кўринг.',
  'verify.status.missTitle': 'Рухсатнома Топилмади',
  'verify.status.missMessage':
    'Киритилган маълумотлар бўйича тизимда фаол рухсатнома мавжуд эмас. Серия ва рақамни қайтадан текширинг.',

  'verify.result.registryNote': 'Ушбу рухсатнома давлат реестридан муваффақиятли ўтди.',
  'verify.result.holderLabel': 'Аризачи (Маскаланган)',
  'verify.result.activityLabel': 'Фаолият Тури',
  'verify.result.organizationLabel': 'Ўрмон Хўжалиги',
  'verify.result.validityLabel': 'Амал Қилиш Муддати',
  'verify.result.signaturesValid': 'Рақамли имзолар ҳақиқий (E-IMZO)',
  'verify.result.signaturesPending': 'Рақамли имзолар ҳали тўлиқ тасдиқланмаган',
} as const;
