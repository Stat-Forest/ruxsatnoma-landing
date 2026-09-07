import { describe, expect, it } from 'vitest';
import { pickName, REF_TRANSLATIONS } from './localized';

describe('pickName 5-language localization', () => {
  const sampleGrazing = {
    code: 'grazing',
    name: {
      en: 'Livestock grazing',
      uz_cyrl: 'Чорва молларини боқиш',
      uz_latn: 'Chorva mollarini boqish',
    },
  };

  const sampleLivestock = {
    code: 'cattle_adult',
    name: {
      en: 'Cattle, adult',
      uz_cyrl: 'Қорамол (катта)',
      uz_latn: 'Qoramol (katta)',
    },
  };

  it('translates activity into all 5 languages even without ru/kaa in backend object', () => {
    expect(pickName(sampleGrazing.name, 'uz_latn', sampleGrazing.code)).toBe('Chorva mollarini boqish');
    expect(pickName(sampleGrazing.name, 'uz_cyrl', sampleGrazing.code)).toBe('Чорва молларини боқиш');
    expect(pickName(sampleGrazing.name, 'ru', sampleGrazing.code)).toBe('Выпас скота');
    expect(pickName(sampleGrazing.name, 'kaa', sampleGrazing.code)).toBe('Sharwa malların baǵıw');
    expect(pickName(sampleGrazing.name, 'en', sampleGrazing.code)).toBe('Livestock grazing');
  });

  it('translates livestock into all 5 languages even without ru/kaa in backend object', () => {
    expect(pickName(sampleLivestock.name, 'uz_latn', sampleLivestock.code)).toBe('Qoramol (katta)');
    expect(pickName(sampleLivestock.name, 'uz_cyrl', sampleLivestock.code)).toBe('Қорамол (катта)');
    expect(pickName(sampleLivestock.name, 'ru', sampleLivestock.code)).toBe('Крупный рогатый скот (взрослый)');
    expect(pickName(sampleLivestock.name, 'kaa', sampleLivestock.code)).toBe('Qaramal (úlken)');
    expect(pickName(sampleLivestock.name, 'en', sampleLivestock.code)).toBe('Cattle, adult');
  });

  it('matches by uz_latn/uz_cyrl/en name if code is omitted', () => {
    expect(pickName(sampleLivestock.name, 'ru')).toBe('Крупный рогатый скот (взрослый)');
    expect(pickName(sampleLivestock.name, 'kaa')).toBe('Qaramal (úlken)');
  });

  it('ensures every key in REF_TRANSLATIONS has all 5 languages defined', () => {
    const requiredLanguages = ['uz_latn', 'uz_cyrl', 'ru', 'kaa', 'en'];
    for (const [code, dict] of Object.entries(REF_TRANSLATIONS)) {
      for (const lang of requiredLanguages) {
        expect(dict[lang], `Missing ${lang} for ${code}`).toBeTruthy();
      }
    }
  });
});
