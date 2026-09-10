import { describe, expect, it } from 'vitest';
import { ru } from './ru';
import { uz_latn } from './uz_latn';
import { uz_cyrl } from './uz_cyrl';
import { kaa } from './kaa';
import { en } from './en';

const DICTIONARIES = [
  ['ru', ru],
  ['uz_cyrl', uz_cyrl],
  ['kaa', kaa],
  ['en', en],
  ['uz_latn', uz_latn],
] as const;

describe('i18n dictionaries stay key-for-key symmetric', () => {
  it('ru, uz_cyrl, kaa, en and uz_latn define exactly the same keys', () => {
    const latnKeys = Object.keys(uz_latn).sort();
    expect(Object.keys(ru).sort()).toEqual(latnKeys);
    expect(Object.keys(uz_cyrl).sort()).toEqual(latnKeys);
    expect(Object.keys(kaa).sort()).toEqual(latnKeys);
    expect(Object.keys(en).sort()).toEqual(latnKeys);
  });

  it('neither dictionary has an empty-string value', () => {
    for (const [dictName, dict] of DICTIONARIES) {
      for (const [key, value] of Object.entries(dict)) {
        expect(value, `${dictName}.${key} is empty`).not.toBe('');
      }
    }
  });
});

/**
 * Two whole classes of defect this branch shipped were a figure nobody could
 * source, sitting in the dictionaries where no page test could see it: the
 * header strip announced a season closing "1-oktabrgacha" (the Agency has
 * confirmed there is no seasonal date), and the FAQ fallback promised a
 * three-working-day review and a ten-day renewal window — the same invented
 * term `api/services.ts` records having already been stripped from the
 * service cards.
 *
 * A digit in either namespace is therefore refused outright. Neither is
 * copy that can honestly carry a number: the announcement strip is editorial
 * (only the phone number beside it is live data), and the FAQ fallback
 * describes a process whose real terms are per-activity `processing_days`.
 * If a genuine, sourced figure ever belongs here, it comes from the API —
 * not from this file.
 */
describe('no dictionary states a date or a period the site cannot source', () => {
  it.each(DICTIONARIES)('%s announces no seasonal deadline', (dictName, dict) => {
    for (const [key, value] of Object.entries(dict)) {
      if (!key.startsWith('announcement.')) continue;
      expect(value, `${dictName}.${key} states a figure`).not.toMatch(/\d/);
    }
  });

  it.each(DICTIONARIES)('%s promises no review period or renewal window in the FAQ', (dictName, dict) => {
    for (const [key, value] of Object.entries(dict)) {
      if (!key.startsWith('faq.')) continue;
      expect(value, `${dictName}.${key} states a figure`).not.toMatch(/\d/);
    }
  });
});
