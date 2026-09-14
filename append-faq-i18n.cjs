const fs = require('fs');
const path = require('path');

const i18nPath = path.join(__dirname, 'src', 'i18n');
const langs = ['uz_latn', 'uz_cyrl', 'kaa', 'ru', 'en'];

const keys = {
  uz_latn: {
    'faq.footer.title': 'Yana savollaringiz bormi?',
    'faq.footer.body': 'Agar savolingizga javob topa olmagan boʻlsangiz, qoʻllab-quvvatlash xizmatiga murojaat qiling.',
    'faq.footer.cta': 'Bogʻlanish'
  },
  uz_cyrl: {
    'faq.footer.title': 'Яна саволларингиз борми?',
    'faq.footer.body': 'Агар саволингизга жавоб топа олмаган бўлсангиз, қўллаб-қувватлаш хизматига мурожаат қилинг.',
    'faq.footer.cta': 'Боғланиш'
  },
  kaa: {
    'faq.footer.title': 'Jáne sorawlarıńız bar ma?',
    'faq.footer.body': 'Eger sorawıńızǵa juwap taba almaǵan bolsaańız, qollap-quwatlaw xızmetine múrájat etiń.',
    'faq.footer.cta': 'Baylanıw'
  },
  ru: {
    'faq.footer.title': 'Остались вопросы?',
    'faq.footer.body': 'Если вы не нашли ответ на свой вопрос, свяжитесь с нашей службой поддержки.',
    'faq.footer.cta': 'Связаться'
  },
  en: {
    'faq.footer.title': 'Still have questions?',
    'faq.footer.body': "If you didn't find the answer to your question, contact our support team.",
    'faq.footer.cta': 'Contact support'
  }
};

function insertKeys(filePath, keysToAdd) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('faq.footer.title')) {
    console.log(`Skipping ${filePath}, already added.`);
    return;
  }
  
  let stringToAdd = '\\n';
  for (const [key, value] of Object.entries(keysToAdd)) {
    stringToAdd += `  '${key}': "${value}",\n`;
  }

  content = content.replace(/} as const;/, stringToAdd + '} as const;');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath}`);
}

for (const lang of langs) {
  const faqPath = path.join(i18nPath, lang, 'faq.ts');
  insertKeys(faqPath, keys[lang]);
}

console.log('Done!');
