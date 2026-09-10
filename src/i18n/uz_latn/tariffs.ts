/** TariffsPage — rates and the public estimate calculator. */
export const tariffs = {
  'tariffs.error.connectionFailed': 'Maʼlumotlar xizmatiga ulanib boʻlmadi.',
  'tariffs.error.title': 'Kalkulyator vaqtincha ishlamayapti',
  'tariffs.error.loadFailedPrefix': 'Faoliyat turlari roʻyxatini yuklab boʻlmadi:',

  'tariffs.header.badge': 'Rasmiy Tariflar va Stavkalar',
  'tariffs.header.title': 'Toʻlov Stavkalari va Kalkulyator',
  'tariffs.header.subtitle':
    'Vazirlar Mahkamasi qarorlariga muvofiq belgilangan oʻrmon fondidan foydalanish koeffitsientlari.',

  'tariffs.calculator.heading': 'Onlayn Narx Kalkulyatori',
  'tariffs.calculator.description':
    'Faoliyat turi, miqdor va muddatni kiriting — taxminiy summa tizimning oʻzida hisoblanadi',
  'tariffs.calculator.activityLabel': 'Faoliyat turi',
  'tariffs.calculator.quantityLabel': 'Miqdor',
  'tariffs.calculator.durationLabel': 'Foydalanish muddati (Oy)',
  'tariffs.calculator.duration.months3': '3 oy (Mavsumiy)',
  'tariffs.calculator.duration.months6': '6 oy (Yarim yillik)',
  'tariffs.calculator.duration.months12': '12 oy (Bir yillik)',
  'tariffs.calculator.privilegeNote':
    'Imtiyoz (anonim taxminda hisobga olinmaydi — imtiyoz faqat ariza toʻldirish jarayonida qoʻllanadi)',
  'tariffs.calculator.idle.grazing': 'Hisoblash uchun kamida bitta chorva turi sonini kiriting.',
  'tariffs.calculator.idle.default': 'Hisoblash uchun miqdorni kiriting.',
  'tariffs.calculator.loading': 'Hisoblanmoqda…',
  'tariffs.calculator.resultLabel': 'Taxminiy summa:',
  'tariffs.calculator.submitCta': 'Shu boʻyicha ariza topshirish',
  'tariffs.calculator.estimateFailed': 'Hisoblash xizmatiga ulanib boʻlmadi.',
  'tariffs.calculator.disclaimer':
    'Faqat taxminiy hisob-kitob — majburiy toʻlov emas. Haqiqiy yer uchastkasi tanlanmaganligi sababli norma, mavsumiylik va yongʻin xavfsizligi tekshiruvlari oʻtkazilmadi hamda imtiyoz qoʻllanilmadi. Yakuniy summa ariza berish jarayonida aniqlanadi.',

  /* `PriceCalculator`'s own copy, which lived in the component as local
     constants in Uzbek Latin only. The default quantity field keeps using
     `tariffs.calculator.quantityLabel` above. */
  'tariffs.calculator.badge': 'Onlayn kalkulyator',
  'tariffs.calculator.bullet.norms': 'VMQ 689 normalari asosida',
  'tariffs.calculator.bullet.anonymous': 'Roʻyxatdan oʻtmasdan foydalanish mumkin',
  'tariffs.calculator.bullet.finalSum': 'Yakuniy summa ariza koʻrib chiqilgach tasdiqlanadi',
  'tariffs.calculator.field.haymaking': 'Oʻrim maydoni (ga)',
  'tariffs.calculator.field.apiary': 'Uyalar soni',
  'tariffs.calculator.field.recreation': 'Maydon (ga)',
  'tariffs.calculator.field.deadwood': 'Hajm (m³)',
  'tariffs.calculator.headCountSuffix': 'bosh soni',
  'tariffs.calculator.science.sumLabel': 'Imtiyozli',
  'tariffs.calculator.science.sumUnit': 'ariza asosida',
  'tariffs.calculator.science.note':
    'Ilmiy tadqiqot uchun toʻlov miqdori belgilanmagan — har bir ariza alohida koʻrib chiqiladi.',
  'tariffs.calculator.tariffNotPublished':
    'Ushbu faoliyat turi uchun stavka hali eʼlon qilinmagan (VMQ 689-son qaror 5-ilovasi kutilmoqda). Summani hozircha koʻrsatib boʻlmaydi.',
} as const;
