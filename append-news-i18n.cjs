const fs = require('fs');
const path = require('path');

const i18nPath = path.join(__dirname, 'src', 'i18n');
const langs = ['uz_latn', 'uz_cyrl', 'kaa', 'ru', 'en'];

const keys = {
  uz_latn: {
    'news.totalSuffix': "ta e'lon mavjud",
  },
  uz_cyrl: {
    'news.totalSuffix': "та эълон мавжуд",
  },
  kaa: {
    'news.totalSuffix': "daǵaza bar",
  },
  ru: {
    'news.totalSuffix': "объявлений",
  },
  en: {
    'news.totalSuffix': "announcements available",
  }
};

function insertKeys(filePath, keysToAdd) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('news.totalSuffix')) {
    console.log(`Skipping ${filePath}, already added.`);
    return;
  }
  
  let stringToAdd = '\n';
  for (const [key, value] of Object.entries(keysToAdd)) {
    stringToAdd += `  '${key}': "${value}",\n`;
  }

  content = content.replace(/};\s*$/, stringToAdd + '};\n');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath}`);
}

for (const lang of langs) {
  const newsPath = path.join(i18nPath, lang, 'news.ts');
  insertKeys(newsPath, keys[lang]);
}

console.log('Done!');
