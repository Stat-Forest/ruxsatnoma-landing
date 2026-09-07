import { describe, expect, it } from 'vitest';
import { ru } from './ru';
import { uz_latn } from './uz_latn';
import { uz_cyrl } from './uz_cyrl';
import { kaa } from './kaa';
import { en } from './en';

describe('i18n dictionaries stay key-for-key symmetric', () => {
  it('ru, uz_cyrl, kaa, en and uz_latn define exactly the same keys', () => {
    const latnKeys = Object.keys(uz_latn).sort();
    expect(Object.keys(ru).sort()).toEqual(latnKeys);
    expect(Object.keys(uz_cyrl).sort()).toEqual(latnKeys);
    expect(Object.keys(kaa).sort()).toEqual(latnKeys);
    expect(Object.keys(en).sort()).toEqual(latnKeys);
  });

  it('neither dictionary has an empty-string value', () => {
    for (const [dictName, dict] of [
      ['ru', ru],
      ['uz_cyrl', uz_cyrl],
      ['kaa', kaa],
      ['en', en],
      ['uz_latn', uz_latn],
    ] as const) {
      for (const [key, value] of Object.entries(dict)) {
        expect(value, `${dictName}.${key} is empty`).not.toBe('');
      }
    }
  });
});
