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
} as const;
