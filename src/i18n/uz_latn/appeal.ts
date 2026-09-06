/** The anonymous appeal-status check page (`/appeal-check`) — reuses
 * `/check`'s layout and error handling, served by the anonymous,
 * rate-limited `GET /api/v1/public/appeals/check`. */
export const appeal = {
  'appeal.file.title': 'Murojaat yuborish',
  'appeal.file.subtitle': 'Murojaatingiz roʻyxatdan oʻtkaziladi va sizga raqam beriladi — shu raqam boʻyicha holatini kuzatasiz.',
  'appeal.file.nameLabel': 'F.I.SH.',
  'appeal.file.phoneLabel': 'Telefon',
  'appeal.file.emailLabel': 'Elektron pochta',
  'appeal.file.subjectLabel': 'Mavzu',
  'appeal.file.bodyLabel': 'Murojaat matni',
  'appeal.file.submit': 'Yuborish',
  'appeal.file.contactRequired': 'Telefon yoki elektron pochtadan kamida bittasini kiriting — keyinchalik holatni shu orqali tekshirasiz.',
  'appeal.file.sentTitle': 'Murojaat qabul qilindi',
  'appeal.file.sentBefore': 'Roʻyxatga olish raqami —',
  'appeal.file.sentAfter': 'Uni saqlab qoʻying: holatni tekshirish uchun shu raqam va kiritgan aloqa maʼlumotingiz kerak boʻladi.',
  'appeal.file.errorTitle': 'Murojaat yuborilmadi',
  'appeal.check.title': 'Murojaat holatini tekshirish',
  'appeal.check.subtitle': 'Roʻyxatga olish raqami va yuborishda kiritgan aloqa maʼlumotingiz boʻyicha.',
  'appeal.header.badge': 'Fuqarolar murojaatlari',
  'appeal.header.title': 'Murojaat yuboring yoki holatini tekshiring',
  'appeal.header.subtitle':
    'Murojaatni shu yerdan yuborasiz va roʻyxatga olish raqamini olasiz; keyin oʻsha raqam va aloqa maʼlumotingiz boʻyicha holatini tekshirasiz.',

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
