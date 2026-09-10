/** The public permit-verification page (`/verify`) — Karakalpak copy. */
export const verify = {
  'verify.header.badge': 'Rásmiy Tekseriw Xızmeti',
  'verify.header.title': 'Ruxsatnama Haqıyqıylıǵın Tekseriw',
  'verify.header.subtitle':
    'Ruxsatnama seriyası hám nomerin kiritiń yamasa QR-kod skanerinen paydalanıń.',

  'verify.form.seriesLabel': 'Seriya',
  'verify.form.seriesPlaceholder': 'Mısalı: А',
  'verify.form.numberLabel': 'Nomer',
  'verify.form.numberPlaceholder': 'Mısalı: 000123',
  'verify.form.submit': 'Tekseriw',

  'verify.qrInfo.before': 'Ruxsatnama qaǵazındaǵı',
  'verify.qrInfo.bold': 'QR-kodtı',
  'verify.qrInfo.after':
    'telefon kamerası menen skanerlegende bul bet avtomatikalıq túrde ashıladı hám nátiyje dárhal kórsetiledi.',

  'verify.pii.bold': 'Jeke maǵlıwmatlar qol qatılmaslıǵı (PII Masking):',
  'verify.pii.after':
    'Nızamshılıqqa muwapıq arza beriwshiniń F.A.Á. hám jeke maǵlıwmatları ashıq izlewde qısqartılǵan formada kórsetiledi.',

  'verify.status.loading': 'Tekserilmekte…',
  'verify.status.errorTitle': 'Xızmet waqtınsha islemey atır',
  'verify.status.networkError':
    'Tekseriw xızmetine jalǵanıw múmkin bolmadı. Internet baylanısın tekserip, qaytadan háreket etiń.',
  'verify.status.missTitle': 'Ruxsatnama Tabılmadı',
  'verify.status.missMessage':
    'Kiritilgen maǵlıwmatlar boyınsha sistemada belsendi ruxsatnama joq. Seriya hám nomerdi qaytadan tekseriń.',

  'verify.result.registryNote': 'Bul ruxsatnama mámleketlik reestrden tabıslı ótti.',
  'verify.result.holderLabel': 'Arza beriwshi (Maskalanǵan)',
  'verify.result.activityLabel': 'Xızmet Túri',
  'verify.result.organizationLabel': 'Orman Xojalıǵı',
  'verify.result.validityLabel': 'Ámel Qılıw Múddeti',
  'verify.result.signaturesValid': 'Sanlı qol tańbalar haqıyqıy (E-IMZO)',
  'verify.result.signaturesPending': 'Sanlı qol tańbalar ele tolıq tastıyıqlanbaǵan',

  /* The map panel is mounted ONLY when `GET /public/permits/check` actually
     sent a `contour` — a legend may only name what is drawn. */
  'verify.map.title': 'Kontur kartası',
  'verify.map.heading': 'Kartada',
  'verify.map.legend': 'Ruxsat etilgen kontur',
} as const;
