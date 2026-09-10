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

  /* The map panel is mounted ONLY when `GET /public/permits/check` actually
     sent a `contour` — a legend may only name what is drawn. */
  'verify.map.title': 'Контур харитаси',
  'verify.map.heading': 'Харитада',
  'verify.map.legend': 'Рухсат этилган контур',

  /* The two-tab switcher and the whole "application status" arm — added
     as `LOCAL_COPY` in Uzbek Latin only, so a Russian reader met an
     entirely Uzbek tab. */
  'verify.tabs.label': 'Текшириш тури',
  'verify.tabs.permit': 'Рухсатнома',
  'verify.tabs.application': 'Ариза ҳолати',
  'verify.application.numberLabel': 'Ариза рақами',
  'verify.application.numberPlaceholder': 'Масалан: AR-2026-004518',
  'verify.application.phoneLabel': 'Телефон',
  'verify.application.phonePlaceholder': '+998 90 123 45 67',
  'verify.application.validation': 'Ариза рақами ва телефон рақамини киритинг',
  'verify.application.missTitle': 'Ариза топилмади',
  'verify.application.missMessage':
    'Киритилган ариза рақами ва телефон рақами бўйича маълумот топилмади. Маълумотларни қайтадан текширинг.',
  'verify.application.privacyBold': 'Махфийлик:',
  'verify.application.privacyAfter':
    'телефон рақами фақат аризанинг сизга тегишли эканини тасдиқлаш учун ишлатилади.',
  'verify.application.activityLabel': 'Фаолият тури',
  'verify.application.organizationLabel': 'Ўрмон хўжалиги',
  'verify.application.submittedLabel': 'Топширилган сана',
  'verify.application.nextStepLabel': 'Кейинги қадам',
} as const;
