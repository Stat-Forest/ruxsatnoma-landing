import { describe, expect, it } from 'vitest';
import { ru } from './ru';
import { uz_latn } from './uz_latn';

describe('i18n dictionaries stay key-for-key symmetric', () => {
  it('ru and uz_latn define exactly the same keys', () => {
    expect(Object.keys(ru).sort()).toEqual(Object.keys(uz_latn).sort());
  });

  it('neither dictionary has an empty-string value', () => {
    for (const [dictName, dict] of [['ru', ru], ['uz_latn', uz_latn]] as const) {
      for (const [key, value] of Object.entries(dict)) {
        expect(value, `${dictName}.${key} is empty`).not.toBe('');
      }
    }
  });
});
