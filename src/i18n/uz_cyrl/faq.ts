/** FAQ fallback copy — rendered by `AboutPage`'s accordion only when
 *  `GET /help/faq` returns nothing.
 *
 *  Carries NO review period and NO renewal window: "3 working days" and
 *  "10 days before expiry" were invented figures (the same class of defect
 *  `api/services.ts` records for the service cards' own "up to 3 working
 *  days"). The real review term is per-activity `processing_days`, and no
 *  renewal window has been fixed at all.
 *  Cyrillic Uzbek.
 */
export const faq = {
  'faq.badge': 'Саволлар ва Жавоблар',
  'faq.title': 'Кўп Бериладиган Саволлар (FAQ)',
  'faq.subtitle':
    'Рухсатнома олиш, тўлов қилиш ва QR-код текшириш бўйича энг кўп учрайдиган саволларга жавоблар.',
  'faq.search.placeholder': 'Саволни қидириш...',

  'faq.item1.question': 'Ўрмон хўжалигида чорва молларини боқиш учун рухсатнома қандай олинади?',
  'faq.item1.answer':
    'Ариза топшириш учун OneID ёки E-IMZO орқали порталга кирасиз, ўрмон хўжалиги контурини ва чорва сонини танлаб аризани юборасиз.',

  'faq.item2.question': 'Тўлов суммаси қандай ҳисобланади?',
  'faq.item2.answer':
    'Тўлов суммаси чорва турининг коэффициенти, чорва сони, фойдаланиш ойлари ҳамда амалдаги БҲМ (Базавий Ҳисоблаш Миқдори) миқдорига кўра автоматик формулалар асосида ҳисобланади.',

  'faq.item3.question': 'Рухсатнома ҳақиқийлигини қандай текширса бўлади?',
  'faq.item3.answer':
    'Порталнинг бош саҳифасидаги "Рухсатномани текшириш" бўлимида рухсатнома серияси ва рақамини киритиб ёки PDF ҳужжатдаги QR-кодни сканерлаб ҳақиқийлигини тезкор текширишингиз мумкин.',

  'faq.item4.question': 'Рухсатнома муддати тугаганда уни узайтириш мумкинми?',
  'faq.item4.answer':
    'Ҳа, рухсатнома муддати тугашидан олдин шахсий кабинет орқали рухсатномани онлайн узайтириш аризасини топширишингиз мумкин.',
} as const;
