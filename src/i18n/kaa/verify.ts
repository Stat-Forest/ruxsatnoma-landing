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

  /* The two-tab switcher and the whole "application status" arm — added
     as `LOCAL_COPY` in Uzbek Latin only, so a Russian reader met an
     entirely Uzbek tab. */
  'verify.tabs.label': 'Tekseriw túri',
  'verify.tabs.permit': 'Ruxsatnama',
  'verify.tabs.application': 'Arza jaǵdayı',
  'verify.application.numberLabel': 'Arza nomeri',
  'verify.application.numberPlaceholder': 'Mısalı: AR-2026-004518',
  'verify.application.phoneLabel': 'Telefon',
  'verify.application.phonePlaceholder': '+998 90 123 45 67',
  'verify.application.validation': 'Arza nomerin hám telefon nomerin kiritiń',
  'verify.application.missTitle': 'Arza tabılmadı',
  'verify.application.missMessage':
    'Kiritilgen arza nomeri hám telefon nomeri boyınsha maǵlıwmat tabılmadı. Maǵlıwmatlardı qaytadan tekseriń.',
  'verify.application.privacyBold': 'Maxfiylik:',
  'verify.application.privacyAfter':
    'telefon nomeri tek arzanıń sizge tiyisli ekenin tastıyıqlaw ushın paydalanıladı.',
  'verify.application.activityLabel': 'Xızmet túri',
  'verify.application.organizationLabel': 'Orman xojalıǵı',
  'verify.application.submittedLabel': 'Tapsırılǵan sáne',
  'verify.application.nextStepLabel': 'Keyingi qádem',
} as const;
