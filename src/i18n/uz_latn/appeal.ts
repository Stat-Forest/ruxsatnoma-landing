/** The anonymous appeal-status check page (`/appeal-check`) — reuses
 * `/check`'s layout and error handling, served by the anonymous,
 * rate-limited `GET /api/v1/public/appeals/check`. */
export const appeal = {
  'appeal.header.badge': 'Murojaat holatini tekshirish',
  'appeal.header.title': 'Murojaatingiz holatini tekshiring',
  'appeal.header.subtitle':
    'Murojaat raqamini va telefon yoki elektron pochtangizni kiriting — holatini shu yerda koʻrasiz.',

  'appeal.form.numberLabel': 'Murojaat raqami',
  'appeal.form.numberPlaceholder': 'Masalan: MR-2026-000123',
  'appeal.form.phoneLabel': 'Telefon',
  'appeal.form.emailLabel': 'Elektron pochta',
  'appeal.form.contactRequired':
    'Raqamni kiriting va telefon yoki elektron pochtadan kamida bittasini koʻrsating.',
  'appeal.form.submit': 'Tekshirish',

  'appeal.privacy.bold': 'Maxfiylik:',
  'appeal.privacy.after':
    'Telefon yoki elektron pochta faqat murojaatning aslida sizga tegishli ekanini tasdiqlash uchun ishlatiladi va hech qayerda saqlanmaydi.',

  'appeal.status.loading': 'Tekshirilmoqda…',
  'appeal.status.errorTitle': 'Xizmat vaqtincha ishlamayapti',
  'appeal.status.networkError':
    'Tekshirish xizmatiga ulanib boʻlmadi. Internet aloqasini tekshirib, qayta urinib koʻring.',
  'appeal.status.missTitle': 'Murojaat topilmadi',
  'appeal.status.missMessage':
    'Koʻrsatilgan maʼlumotlar boʻyicha murojaat topilmadi. Raqam va aloqa maʼlumotlarini tekshiring.',
  'appeal.status.new': 'Qabul qilindi',
  'appeal.status.inProgress': 'Koʻrib chiqilmoqda',
  'appeal.status.answered': 'Javob berildi',
  'appeal.status.closed': 'Yopilgan',

  'appeal.error.rateLimited.before': 'Soʻrovlar soni chegarasiga yetildi. Iltimos,',
  'appeal.error.rateLimited.after': 'soniyadan keyin qayta urinib koʻring.',

  'appeal.result.numberLabel': 'Murojaat raqami',
  'appeal.result.subjectLabel': 'Mavzu',
  'appeal.result.answerHeading': 'Javob',
  'appeal.result.answeredAtLabel': 'Javob berilgan sana:',
  'appeal.result.noAnswerYet': 'Murojaatingiz hozircha koʻrib chiqilmoqda, javob berilmagan.',
} as const;
