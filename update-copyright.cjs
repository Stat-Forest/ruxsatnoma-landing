const fs = require('fs');
const path = require('path');

const updates = {
  'uz_latn': '© 2026 “Oʻrmon xoʻjaligini raqamlashtirish markazi”. Barcha huquqlar himoyalangan.',
  'uz_cyrl': '© 2026 “Ўрмон хўжалигини рақамлаштириш маркази”. Барча ҳуқуқлар ҳимояланган.',
  'ru': '© 2026 Центр цифровизации лесного хозяйства. Все права защищены.',
  'en': '© 2026 Forestry Digitalization Center. All rights reserved.',
  'kaa': '© 2026 “Orman xojalıǵın sanlastırıw orayı”. Barlıq huqıqlar qorǵalǵan.',
};

for (const [lang, text] of Object.entries(updates)) {
  const file = path.join(__dirname, 'src', 'i18n', lang, 'common.ts');
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/'footer\.copyright':\s*'.*?'/g, `'footer.copyright': '${text}'`);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}

// Update FooterRedesign.tsx
const footerFile = path.join(__dirname, 'src', 'components', 'redesign', 'FooterRedesign.tsx');
if (fs.existsSync(footerFile)) {
  let content = fs.readFileSync(footerFile, 'utf8');
  content = content.replace(/'footer\.copyright':\s*'.*?'/g, `'footer.copyright': '${updates['uz_latn']}'`);
  fs.writeFileSync(footerFile, content, 'utf8');
  console.log(`Updated ${footerFile}`);
}

console.log('Done!');
