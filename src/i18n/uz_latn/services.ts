/** ServicesPage — the public service catalogue. The six cards themselves come
 *  from `GET /public/refs/activity-types` (`api/services.ts`); only the
 *  page's own chrome is here. */
export const services = {
  'services.badge': 'Davlat Xizmatlari Reyestri',
  'services.title': 'Oʻrmon Fondidan Foydalanish Xizmatlari',
  'services.subtitle': 'Yagona interaktiv portal orqali barcha turdagi ruxsatnomalarga ariza topshirishingiz mumkin.',

  'services.card.termLabel': 'Koʻrib chiqish muddati:',
  'services.card.daysUnit': 'kun',
  'services.card.apply': 'Ariza berish',

  'services.empty': 'Hozircha mavjud xizmat yoʻq.',
  'services.error.title': 'Xizmatlarni yuklab boʻlmadi',
  'services.error.text': 'Sahifani keyinroq yangilashga urinib koʻring.',
} as const;
