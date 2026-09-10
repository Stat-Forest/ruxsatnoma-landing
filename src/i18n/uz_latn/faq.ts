/** FAQ fallback copy — rendered by `AboutPage`'s accordion only when
 *  `GET /help/faq` returns nothing.
 *
 *  Carries NO review period and NO renewal window: "3 working days" and
 *  "10 days before expiry" were invented figures (the same class of defect
 *  `api/services.ts` records for the service cards' own "up to 3 working
 *  days"). The real review term is per-activity `processing_days`, and no
 *  renewal window has been fixed at all.
 */
export const faq = {
  'faq.badge': 'Savollar va Javoblar',
  'faq.title': 'Koʻp Beriladigan Savollar (FAQ)',
  'faq.subtitle':
    'Ruxsatnoma olish, toʻlov qilish va QR-kod tekshirish boʻyicha eng koʻp uchraydigan savollarga javoblar.',
  'faq.search.placeholder': 'Savolni qidirish...',

  'faq.item1.question': 'Oʻrmon xoʻjaligida chorva mollarini boqish uchun ruxsatnoma qanday olinadi?',
  'faq.item1.answer':
    'Ariza topshirish uchun OneID yoki E-IMZO orqali portalga kirasiz, oʻrmon xoʻjaligi konturini va chorva sonini tanlab arizani yuborasiz.',

  'faq.item2.question': 'Toʻlov summasi qanday hisoblanadi?',
  'faq.item2.answer':
    'Toʻlov summasi chorva turining koeffitsienti, chorva soni, foydalanish oylari hamda amaldagi BHM (Bazaviy Hisoblash Miqdori) miqdoriga koʻra avtomatik formulalar asosida hisoblanadi.',

  'faq.item3.question': 'Ruxsatnoma haqiqiyligini qanday tekshirsa boʻladi?',
  'faq.item3.answer':
    'Portalning bosh sahifasidagi "Ruxsatnomani tekshirish" boʻlimida ruxsatnoma seriyasi va raqamini kiritib yoki PDF hujjatdagi QR-kodni skanerlab haqiqiyligini tezkor tekshirishingiz mumkin.',

  'faq.item4.question': 'Ruxsatnoma muddati tugaganda uni uzaytirish mumkinmi?',
  'faq.item4.answer':
    'Ha, ruxsatnoma muddati tugashidan oldin shaxsiy kabinet orqali ruxsatnomani onlayn uzaytirish arizasini topshirishingiz mumkin.',
} as const;
