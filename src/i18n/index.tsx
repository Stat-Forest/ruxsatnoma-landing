import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { I18nContext, normalizeLanguage, resolveLanguage } from './context';
import type { Language, UiLanguage } from './context';
import { ru } from './ru';
import { uz_latn } from './uz_latn';
import { uz_cyrl } from './uz_cyrl';
import { kaa } from './kaa';
import { en } from './en';

// A key present in one map but missing from the other is a compile error here,
// not a silent runtime fallback on a live page.
const DICTIONARIES: Record<UiLanguage, Record<keyof typeof uz_latn, string>> = { uz_latn, uz_cyrl, ru, kaa, en };

const STORAGE_KEY = 'lang';

/**
 * The public site has no account to hang a language on, so the pick lives in
 * `localStorage` — read once on mount, written on every change. A private
 * window or a browser that blocks storage must still render, so both accesses
 * are guarded and simply fall back to Latin Uzbek.
 */
function readStoredLanguage(): Language {
  try {
    return normalizeLanguage(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return 'uz_latn';
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage);
  const uiLanguage = resolveLanguage(language);
  const dict = DICTIONARIES[uiLanguage];

  const setLanguage = useCallback((code: Language) => {
    setLanguageState(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // A viewer who blocks storage still gets the language for this visit.
    }
  }, []);

  // `?? key` is the last resort: a key missing from BOTH maps renders as
  // itself, which is visible in review rather than blank on the page.
  const t = useCallback((key: string) => (dict as Record<string, string>)[key] ?? key, [dict]);

  const value = useMemo(
    () => ({ language, uiLanguage, t, setLanguage }),
    [language, uiLanguage, t, setLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
