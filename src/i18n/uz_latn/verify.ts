/** The public permit-verification page (`/verify`). */
export const verify = {
  'verify.header.badge': 'Rasmiy Tekshiruv Xizmati',
  'verify.header.title': 'Ruxsatnoma Haqiqiyligini Tekshirish',
  'verify.header.subtitle':
    'Ruxsatnoma seriyasi va raqamini kiriting yoki QR-kod skaneridan foydalaning.',

  'verify.form.seriesLabel': 'Seriya',
  'verify.form.seriesPlaceholder': 'Masalan: А',
  'verify.form.numberLabel': 'Raqam',
  'verify.form.numberPlaceholder': 'Masalan: 000123',
  'verify.form.submit': 'Tekshirish',

  'verify.qrInfo.before': 'Ruxsatnoma qogʻozidagi',
  'verify.qrInfo.bold': 'QR-kodni',
  'verify.qrInfo.after':
    'telefon kamerasi bilan skanerlaganda ushbu sahifa avtomatik ravishda ochiladi va natija darhol koʻrsatiladi.',

  'verify.pii.bold': 'Shaxsiy maʼlumotlar daxlsizligi (PII Masking):',
  'verify.pii.after':
    'Qonunchilikka muvofiq arizachining F.I.SH. va shaxsiy maʼlumotlari ochiq qidiruvda qisqartirilgan shaklda koʻrsatiladi.',

  'verify.status.loading': 'Tekshirilmoqda…',
  'verify.status.errorTitle': 'Xizmat vaqtincha ishlamayapti',
  'verify.status.networkError':
    'Tekshiruv xizmatiga ulanib boʻlmadi. Internet aloqasini tekshirib, qaytadan urinib koʻring.',
  'verify.status.missTitle': 'Ruxsatnoma Topilmadi',
  'verify.status.missMessage':
    'Kiritilgan maʼlumotlar boʻyicha tizimda faol ruxsatnoma mavjud emas. Seriya va raqamni qaytadan tekshiring.',

  'verify.result.registryNote': 'Ushbu ruxsatnoma davlat reyestridan muvaffaqiyatli oʻtdi.',
  'verify.result.holderLabel': 'Arizachi (Maskalangan)',
  'verify.result.activityLabel': 'Faoliyat Turi',
  'verify.result.organizationLabel': 'Oʻrmon Xoʻjaligi',
  'verify.result.validityLabel': 'Amal Qilish Muddati',
  'verify.result.signaturesValid': 'Raqamli imzolar haqiqiy (E-IMZO)',
  'verify.result.signaturesPending': 'Raqamli imzolar hali toʻliq tasdiqlanmagan',

  /* The map panel is mounted ONLY when `GET /public/permits/check` actually
     sent a `contour` — a legend may only name what is drawn. */
  'verify.map.title': 'Kontur xaritasi',
  'verify.map.heading': 'Xaritada',
  'verify.map.legend': 'Ruxsat etilgan kontur',

  /* The two-tab switcher and the whole "application status" arm — added
     as `LOCAL_COPY` in Uzbek Latin only, so a Russian reader met an
     entirely Uzbek tab. */
  'verify.tabs.label': 'Tekshirish turi',
  'verify.tabs.permit': 'Ruxsatnoma',
  'verify.tabs.application': 'Ariza holati',
  'verify.application.numberLabel': 'Ariza raqami',
  'verify.application.numberPlaceholder': 'Masalan: AR-2026-004518',
  'verify.application.phoneLabel': 'Telefon',
  'verify.application.phonePlaceholder': '+998 90 123 45 67',
  'verify.application.validation': 'Ariza raqami va telefon raqamini kiriting',
  'verify.application.missTitle': 'Ariza topilmadi',
  'verify.application.missMessage':
    'Kiritilgan ariza raqami va telefon raqami boʻyicha maʼlumot topilmadi. Maʼlumotlarni qaytadan tekshiring.',
  'verify.application.privacyBold': 'Maxfiylik:',
  'verify.application.privacyAfter':
    'telefon raqami faqat arizaning sizga tegishli ekanini tasdiqlash uchun ishlatiladi.',
  'verify.application.activityLabel': 'Faoliyat turi',
  'verify.application.organizationLabel': 'Oʻrmon xoʻjaligi',
  'verify.application.submittedLabel': 'Topshirilgan sana',
  'verify.application.nextStepLabel': 'Keyingi qadam',
} as const;
