/** FAQ fallback copy — rendered by `AboutPage`'s accordion only when
 *  `GET /help/faq` returns nothing.
 *
 *  Carries NO review period and NO renewal window: "3 working days" and
 *  "10 days before expiry" were invented figures (the same class of defect
 *  `api/services.ts` records for the service cards' own "up to 3 working
 *  days"). The real review term is per-activity `processing_days`, and no
 *  renewal window has been fixed at all.
 *  Karakalpak copy.
 */
export const faq = {
  'faq.badge': 'Sorawlar hám Juwaplar',
  'faq.title': 'Kóp Beriletuǵın Sorawlar (FAQ)',
  'faq.subtitle':
    'Ruxsatnama alıw, tólem qılıw hám QR-kod tekseriw boyınsha eń kóp ushırasatuǵın sorawlarǵa juwaplar.',
  'faq.search.placeholder': 'Sorawdı izlew...',

  'faq.item1.question': 'Orman xojalıǵında sharwa malların baǵıw ushın ruxsatnama qalay alınadı?',
  'faq.item1.answer':
    'Arza tapsırıw ushın OneID yamasa E-IMZO arqalı portalǵa kiresiz, orman xojalıǵı konturın hám sharwa sanın tańlap arzanı jiberesiz.',

  'faq.item2.question': 'Tólem summası qalay esaplanadı?',
  'faq.item2.answer':
    'Tólem summası sharwa túriniń koeffitsienti, sharwa sanı, paydalanıw ayları hám ámeldegi BEM (Bazalıq Esaplaw Muǵdarı) muǵdarına qarap avtomatikalıq formulalar tiykarında esaplanadı.',

  'faq.item3.question': 'Ruxsatnama haqıyqıylıǵın qalay tekserse boladı?',
  'faq.item3.answer':
    'Portal bas betindegi "Ruxsatnamanı tekseriw" bóliminde ruxsatnama seriyası hám nomerin kiritip yamasa PDF hújjettegi QR-kodtı skanerlep haqıyqıylıǵın tezkor tekseriwińiz múmkin.',

  'faq.item4.question': 'Ruxsatnama múddeti pitkende onı sozıw múmkin be?',
  'faq.item4.answer':
    'Awa, ruxsatnama múddeti pitiwinen aldın jeke kabinet arqalı ruxsatnamanı onlayn sozıw arzasın tapsırıwıńız múmkin.',
} as const;
