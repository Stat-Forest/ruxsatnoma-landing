const fs = require('fs');
const path = require('path');

const i18nPath = path.join(__dirname, 'src', 'i18n');
const langs = ['uz_latn', 'uz_cyrl', 'kaa', 'ru', 'en'];

const keys = {
  uz_latn: {
    'home.map.satellite': "Sun'iy yo'ldosh (Orbita)",
    'home.map.topo': 'Topografik Relyef',
    'home.map.osm': 'OpenStreetMap',
    'home.map.mode.street': "Ko'cha",
    'home.map.mode.satellite': "Yo'ldosh",
    'home.map.mode.topo': 'Relyef',
    'home.map.openFull': "Xaritani to'liq ochish",
    'home.map.area': 'Maydoni:',
  },
  uz_cyrl: {
    'home.map.satellite': 'Сунъий йўлдош (Орбита)',
    'home.map.topo': 'Топографик Рельеф',
    'home.map.osm': 'OpenStreetMap',
    'home.map.mode.street': 'Кўча',
    'home.map.mode.satellite': 'Йўлдош',
    'home.map.mode.topo': 'Рельеф',
    'home.map.openFull': 'Харитани тўлиқ очиш',
    'home.map.area': 'Майдони:',
  },
  kaa: {
    'home.map.satellite': 'Jasama joldas (Orbita)',
    'home.map.topo': 'Topografiyalıq Relyef',
    'home.map.osm': 'OpenStreetMap',
    'home.map.mode.street': 'Kóshe',
    'home.map.mode.satellite': 'Joldas',
    'home.map.mode.topo': 'Relyef',
    'home.map.openFull': 'Kartanı tolıq ashıw',
    'home.map.area': 'Maydanı:',
  },
  ru: {
    'home.map.satellite': 'Спутник (Орбита)',
    'home.map.topo': 'Топографический Рельеф',
    'home.map.osm': 'OpenStreetMap',
    'home.map.mode.street': 'Улица',
    'home.map.mode.satellite': 'Спутник',
    'home.map.mode.topo': 'Рельеф',
    'home.map.openFull': 'Открыть карту полностью',
    'home.map.area': 'Площадь:',
  },
  en: {
    'home.map.satellite': 'Satellite (Orbit)',
    'home.map.topo': 'Topographic Terrain',
    'home.map.osm': 'OpenStreetMap',
    'home.map.mode.street': 'Street',
    'home.map.mode.satellite': 'Satellite',
    'home.map.mode.topo': 'Terrain',
    'home.map.openFull': 'Open map fully',
    'home.map.area': 'Area:',
  }
};

function insertKeys(filePath, keysToAdd) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // if already added, skip
  if (content.includes(Object.keys(keysToAdd)[0])) {
    console.log(`Skipping ${filePath}, already added.`);
    return;
  }
  
  let stringToAdd = '';
  for (const [key, value] of Object.entries(keysToAdd)) {
    stringToAdd += `  '${key}': '${value.replace(/'/g, "\\'")}',\n`;
  }

  content = content.replace(/} as const;/, stringToAdd + '} as const;');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath}`);
}

for (const lang of langs) {
  const homePath = path.join(i18nPath, lang, 'home.ts');
  insertKeys(homePath, keys[lang]);
}

console.log('Done!');
