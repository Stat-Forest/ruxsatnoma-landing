/**
 * Multilingual name resolver for backend objects.
 * Supports all 5 portal languages: uz_latn, uz_cyrl, ru, kaa, en.
 */

export const REF_TRANSLATIONS: Record<string, Record<string, string>> = {
  // Activity Types
  grazing: {
    uz_latn: 'Chorva mollarini boqish',
    uz_cyrl: 'Чорва молларини боқиш',
    ru: 'Выпас скота',
    kaa: 'Sharwa malların baǵıw',
    en: 'Livestock grazing',
  },
  haymaking: {
    uz_latn: 'Pichan tayyorlash',
    uz_cyrl: 'Пичан тайёрлаш',
    ru: 'Заготовка сена',
    kaa: 'Pıshen tayarlaw',
    en: 'Haymaking',
  },
  apiary: {
    uz_latn: 'Asalarichilik',
    uz_cyrl: 'Асаларичилик',
    ru: 'Пчеловодство',
    kaa: 'Pal hárreshilik',
    en: 'Apiary',
  },
  recreation: {
    uz_latn: 'Dam olish va turizm',
    uz_cyrl: 'Дам олиш ва туризм',
    ru: 'Отдых и туризм',
    kaa: 'Dem alıw hám turizm',
    en: 'Recreation and tourism',
  },
  deadwood: {
    uz_latn: 'Quruq shox-shabba yigʻish',
    uz_cyrl: 'Қуруқ шох-шабба йиғиш',
    ru: 'Сбор валежника и хвороста',
    kaa: 'Qurı shaq-shabba jıynaw',
    en: 'Deadwood collection',
  },
  science: {
    uz_latn: 'Ilmiy tadqiqot',
    uz_cyrl: 'Илмий тадқиқот',
    ru: 'Научные исследования',
    kaa: 'Ilimiy izertlew',
    en: 'Scientific research',
  },

  // Livestock Types
  cattle_adult: {
    uz_latn: 'Qoramol (katta)',
    uz_cyrl: 'Қорамол (катта)',
    ru: 'Крупный рогатый скот (взрослый)',
    kaa: 'Qaramal (úlken)',
    en: 'Cattle, adult',
  },
  cattle_young: {
    uz_latn: 'Qoramol (2 yoshgacha)',
    uz_cyrl: 'Қорамол (2 ёшгача)',
    ru: 'Крупный рогатый скот (до 2 лет)',
    kaa: 'Qaramal (2 jasqa shekem)',
    en: 'Cattle, under 2 years',
  },
  horse_adult: {
    uz_latn: 'Ot (katta)',
    uz_cyrl: 'От (катта)',
    ru: 'Лошади (взрослые)',
    kaa: 'At (úlken)',
    en: 'Horse, adult',
  },
  horse_young: {
    uz_latn: 'Ot (2 yoshgacha)',
    uz_cyrl: 'От (2 ёшгача)',
    ru: 'Лошади (до 2 лет)',
    kaa: 'At (2 jasqa shekem)',
    en: 'Horse, under 2 years',
  },
  camel_adult: {
    uz_latn: 'Tuya (katta)',
    uz_cyrl: 'Туя (катта)',
    ru: 'Верблюды (взрослые)',
    kaa: 'Túye (úlken)',
    en: 'Camel, adult',
  },
  camel_young: {
    uz_latn: 'Tuya (2 yoshgacha)',
    uz_cyrl: 'Туя (2 ёшгача)',
    ru: 'Верблюды (до 2 лет)',
    kaa: 'Túye (2 jasqa shekem)',
    en: 'Camel, under 2 years',
  },
  donkey_adult: {
    uz_latn: 'Eshak (katta)',
    uz_cyrl: 'Эшак (катта)',
    ru: 'Ослы (взрослые)',
    kaa: 'Eshek (úlken)',
    en: 'Donkey, adult',
  },
  donkey_young: {
    uz_latn: 'Eshak (2 yoshgacha)',
    uz_cyrl: 'Эшак (2 ёшгача)',
    ru: 'Ослы (до 2 лет)',
    kaa: 'Eshek (2 jasqa shekem)',
    en: 'Donkey, under 2 years',
  },
  sheep_goat_6m: {
    uz_latn: 'Qoʻy va echki (6 oydan katta)',
    uz_cyrl: 'Қўй ва эчки (6 ойдан катта)',
    ru: 'Овцы и козы (старше 6 месяцев)',
    kaa: 'Qoy hám eshki (6 aydan úlken)',
    en: 'Sheep and goats, 6 months and older',
  },
  lamb_kid_under_6m: {
    uz_latn: 'Qoʻzi va uloq (6 oygacha)',
    uz_cyrl: 'Қўзи ва улоқ (6 ойгача)',
    ru: 'Ягнята и козлята (до 6 месяцев)',
    kaa: 'Qozı hám ılaq (6 ayǵa shekem)',
    en: 'Lambs and kids, under 6 months',
  },

  // GIS Layers
  fire_bans: {
    uz_latn: 'Yongʻin taqiqlari',
    uz_cyrl: 'Ёнғин тақиқлари',
    ru: 'Пожарные запреты',
    kaa: 'Órt qadaǵanları',
    en: 'Fire bans',
  },
  forest_fund: {
    uz_latn: 'Oʻrmon fondi chegaralari',
    uz_cyrl: 'Ўрмон фонди чегаралари',
    ru: 'Границы лесного фонда',
    kaa: 'Orman fondı shegaraları',
    en: 'Forest fund boundaries',
  },
  org_boundaries: {
    uz_latn: 'Tashkilot chegaralari',
    uz_cyrl: 'Ташкилот чегаралари',
    ru: 'Границы организаций',
    kaa: 'Shólkem shegaraları',
    en: 'Organization boundaries',
  },
  special_areas: {
    uz_latn: 'Maxsus ajratilgan maydonlar',
    uz_cyrl: 'Махсус ажратилган майдонлар',
    ru: 'Специально отведённые площадки',
    kaa: 'Arnawlı ajıratılǵan maydanlar',
    en: 'Specially designated areas',
  },
};

function getActiveLanguage(lang?: string): string {
  if (lang) return lang;
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem('lang');
      if (stored) return stored;
    } catch {
      // ignore
    }
  }
  return 'uz_latn';
}

function findKnownTranslation(code?: string, name?: Record<string, unknown> | null): Record<string, string> | null {
  if (code && REF_TRANSLATIONS[code]) return REF_TRANSLATIONS[code];
  if (name) {
    const latn = typeof name.uz_latn === 'string' ? name.uz_latn : null;
    const cyrl = typeof name.uz_cyrl === 'string' ? name.uz_cyrl : null;
    const en = typeof name.en === 'string' ? name.en : null;
    for (const translations of Object.values(REF_TRANSLATIONS)) {
      if (
        (latn && translations.uz_latn.toLowerCase() === latn.toLowerCase()) ||
        (cyrl && translations.uz_cyrl.toLowerCase() === cyrl.toLowerCase()) ||
        (en && translations.en.toLowerCase() === en.toLowerCase())
      ) {
        return translations;
      }
    }
  }
  return null;
}

export function pickName(
  name: Record<string, unknown> | null | undefined,
  lang?: string,
  code?: string
): string {
  if (!name && !code) return '';
  const currentLang = getActiveLanguage(lang);

  // Check known translations dictionary first (especially for missing ru/kaa in backend DB)
  const known = findKnownTranslation(code, name);
  if (known && known[currentLang]) {
    return known[currentLang];
  }

  // If name object has exact language
  if (name) {
    const directVal = name[currentLang];
    if (typeof directVal === 'string' && directVal) return directVal;

    // Fallbacks
    if (currentLang === 'ru') {
      const ruVal = name.ru;
      if (typeof ruVal === 'string' && ruVal) return ruVal;
    } else if (currentLang === 'kaa') {
      const kaaVal = name.kaa;
      if (typeof kaaVal === 'string' && kaaVal) return kaaVal;
    } else if (currentLang === 'en') {
      const enVal = name.en;
      if (typeof enVal === 'string' && enVal) return enVal;
    } else if (currentLang === 'uz_cyrl') {
      const cyrlVal = name.uz_cyrl;
      if (typeof cyrlVal === 'string' && cyrlVal) return cyrlVal;
    }

    const uzLatn = name.uz_latn;
    if (typeof uzLatn === 'string' && uzLatn) return uzLatn;
    const uzCyrl = name.uz_cyrl;
    if (typeof uzCyrl === 'string' && uzCyrl) return uzCyrl;
    const first = Object.values(name).find((v) => typeof v === 'string' && v);
    if (typeof first === 'string') return first;
  }

  if (known) {
    return known.uz_latn ?? known.uz_cyrl ?? '';
  }

  return '';
}
