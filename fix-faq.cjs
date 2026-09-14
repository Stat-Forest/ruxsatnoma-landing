const fs = require('fs');
const path = require('path');
const files = ['uz_latn', 'uz_cyrl', 'kaa', 'ru', 'en'].map(l => path.join('src', 'i18n', l, 'faq.ts'));
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  // Replace literal '\n' string with actual newline
  c = c.replace(/\\n\s*'faq\.footer/g, "\n  'faq.footer");
  fs.writeFileSync(f, c);
  console.log(f + ' fixed');
});
