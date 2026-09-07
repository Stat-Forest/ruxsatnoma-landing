import { createContext } from 'react';

/**
 * The five languages the backend accepts (`LanguageIn` in `ruxsatnoma-core`)
 * and decision #18 requires the switcher to offer from V1. `landing` has no
 * account to store a choice on, so the pick lives in `localStorage` — but the
 * list must stay identical to the adminka's, because the same person meets
 * both halves of the system.
 */
export type Language = 'uz_cyrl' | 'uz_latn' | 'ru' | 'kaa' | 'en';

/** The languages a string map actually exists for. The rest fall back. */
export type UiLanguage = 'uz_latn' | 'uz_cyrl' | 'ru' | 'kaa' | 'en';

export const LANGUAGES: { code: Language; label: string; title: string }[] = [
  { code: 'uz_cyrl', label: 'ЎЗ', title: 'Ўзбекча (кирилл)' },
  { code: 'uz_latn', label: 'UZ', title: 'Oʻzbekcha (lotin)' },
  { code: 'ru', label: 'RU', title: 'Русский' },
  { code: 'kaa', label: 'KK', title: 'Qaraqalpaqsha' },
  { code: 'en', label: 'EN', title: 'English' },
];

const LANGUAGE_MAP: Record<Language, UiLanguage> = {
  uz_cyrl: 'uz_cyrl',
  uz_latn: 'uz_latn',
  ru: 'ru',
  kaa: 'kaa',
  en: 'en',
};

/**
 * `uz_cyrl`, `kaa` and `en` render the Latin Uzbek copy until a map of their
 * own exists — the fallback decision #18 specifies, not a missing translation.
 * Adding one is a directory beside `uz_latn/` and one row here.
 */
export function resolveLanguage(code: Language): UiLanguage {
  return LANGUAGE_MAP[code] ?? 'uz_latn';
}

/** A stored value from an older build (or a hand-edited one) must not become
 *  a language nothing can render. */
export function normalizeLanguage(code: string | null): Language {
  return LANGUAGES.some((language) => language.code === code) ? (code as Language) : 'uz_latn';
}

export interface I18nContextValue {
  /** The user's own pick — what the switcher shows as selected. */
  language: Language;
  /** The dictionary it resolves to. */
  uiLanguage: UiLanguage;
  t: (key: string) => string;
  setLanguage: (code: Language) => void;
}

export const I18nContext = createContext<I18nContextValue | null>(null);
