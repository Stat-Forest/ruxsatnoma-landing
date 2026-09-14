const fs = require('fs');
const path = require('path');

const i18nPath = path.join(__dirname, 'src', 'i18n');
const langs = ['uz_latn', 'uz_cyrl', 'kaa', 'ru', 'en'];

const homeKeys = {
  uz_latn: {
    'home.news.badge': 'Soʻnggi xabarlar',
    'home.news.urgent': 'Dolzarb',
    'home.news.readMore': 'Batafsil oʻqish',
    'home.news.view': 'Koʻrish',
    'home.news.official': 'Rasmiy',
    'home.news.officialNews': 'Rasmiy xabar',
    'home.steps.stepPrefix': 'Qadam',
    'home.steps.01.tag': 'OneID / E-IMZO',
    'home.steps.02.tag': 'GIS Maydon',
    'home.steps.03.tag': 'Avto Toʻlov',
    'home.steps.04.tag': 'Rasmiy QR PDF',
  },
  uz_cyrl: {
    'home.news.badge': 'Сўнгги хабарлар',
    'home.news.urgent': 'Долзарб',
    'home.news.readMore': 'Батафсил ўқиш',
    'home.news.view': 'Кўриш',
    'home.news.official': 'Расмий',
    'home.news.officialNews': 'Расмий хабар',
    'home.steps.stepPrefix': 'Қадам',
    'home.steps.01.tag': 'OneID / E-IMZO',
    'home.steps.02.tag': 'GIS Майдон',
    'home.steps.03.tag': 'Авто Тўлов',
    'home.steps.04.tag': 'Расмий QR PDF',
  },
  kaa: {
    'home.news.badge': 'Sońǵı xabarlar',
    'home.news.urgent': 'Zárúr',
    'home.news.readMore': 'Tolıq oqıw',
    'home.news.view': 'Kóriw',
    'home.news.official': 'Rásmiy',
    'home.news.officialNews': 'Rásmiy xabar',
    'home.steps.stepPrefix': 'Qádem',
    'home.steps.01.tag': 'OneID / E-IMZO',
    'home.steps.02.tag': 'GIS Maydan',
    'home.steps.03.tag': 'Avto Tólew',
    'home.steps.04.tag': 'Rásmiy QR PDF',
  },
  ru: {
    'home.news.badge': 'Последние новости',
    'home.news.urgent': 'Актуально',
    'home.news.readMore': 'Читать подробнее',
    'home.news.view': 'Посмотреть',
    'home.news.official': 'Официально',
    'home.news.officialNews': 'Официальная новость',
    'home.steps.stepPrefix': 'Шаг',
    'home.steps.01.tag': 'OneID / E-IMZO',
    'home.steps.02.tag': 'GIS Территория',
    'home.steps.03.tag': 'Авто Оплата',
    'home.steps.04.tag': 'Официальный QR PDF',
  },
  en: {
    'home.news.badge': 'Latest news',
    'home.news.urgent': 'Urgent',
    'home.news.readMore': 'Read more',
    'home.news.view': 'View',
    'home.news.official': 'Official',
    'home.news.officialNews': 'Official news',
    'home.steps.stepPrefix': 'Step',
    'home.steps.01.tag': 'OneID / E-IMZO',
    'home.steps.02.tag': 'GIS Area',
    'home.steps.03.tag': 'Auto Payment',
    'home.steps.04.tag': 'Official QR PDF',
  }
};

const tariffsKeys = {
  uz_latn: {
    'tariffs.calculator.badge.automated': 'Avtomatlashtirilgan hisob',
    'tariffs.calculator.badge.vmq': 'VMQ 689 normalari asosida',
    'tariffs.calculator.disclaimer.note': 'Eslatma:',
    'tariffs.calculator.secure': 'Yagona Id.egov.uz orqali xavfsiz ariza topshirish',
  },
  uz_cyrl: {
    'tariffs.calculator.badge.automated': 'Автоматлаштирилган ҳисоб',
    'tariffs.calculator.badge.vmq': 'ВМҚ 689 нормалари асосида',
    'tariffs.calculator.disclaimer.note': 'Эслатма:',
    'tariffs.calculator.secure': 'Ягона Id.egov.uz орқали хавфсиз ариза топшириш',
  },
  kaa: {
    'tariffs.calculator.badge.automated': 'Avtomatlastırılǵan esap',
    'tariffs.calculator.badge.vmq': 'VMQ 689 normaları tiykarında',
    'tariffs.calculator.disclaimer.note': 'Esletpe:',
    'tariffs.calculator.secure': 'Yagona Id.egov.uz arqalı qáwipsiz arıza tapsırıw',
  },
  ru: {
    'tariffs.calculator.badge.automated': 'Автоматизированный расчет',
    'tariffs.calculator.badge.vmq': 'На основе норм ПКМ 689',
    'tariffs.calculator.disclaimer.note': 'Примечание:',
    'tariffs.calculator.secure': 'Безопасная подача заявки через Yagona Id.egov.uz',
  },
  en: {
    'tariffs.calculator.badge.automated': 'Automated calculation',
    'tariffs.calculator.badge.vmq': 'Based on PCM 689 norms',
    'tariffs.calculator.disclaimer.note': 'Note:',
    'tariffs.calculator.secure': 'Secure application submission via Yagona Id.egov.uz',
  }
};

function insertKeys(filePath, keysToAdd, insertBeforeString) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  let stringToAdd = '';
  for (const [key, value] of Object.entries(keysToAdd)) {
    stringToAdd += `  '${key}': '${value}',\n`;
  }

  content = content.replace(insertBeforeString, stringToAdd + insertBeforeString);
  fs.writeFileSync(filePath, content, 'utf8');
}

for (const lang of langs) {
  const homePath = path.join(i18nPath, lang, 'home.ts');
  insertKeys(homePath, homeKeys[lang], '};\n');
  
  const tariffsPath = path.join(i18nPath, lang, 'tariffs.ts');
  insertKeys(tariffsPath, tariffsKeys[lang], '};\n');
}

console.log('Done!');
