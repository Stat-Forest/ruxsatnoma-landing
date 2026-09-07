/** `LocalizedName` from the backend (`app/core/schemas.py`): `uz_cyrl` is the
 * only guaranteed key, but every existing landing page is written in Latin
 * Uzbek, so that is the preferred pick, falling back to `uz_cyrl` (always
 * present) and finally to any key at all. */
export function pickName(name: Record<string, unknown> | null | undefined): string {
  if (!name) return '';
  const uzLatn = name.uz_latn;
  if (typeof uzLatn === 'string' && uzLatn) return uzLatn;
  const uzCyrl = name.uz_cyrl;
  if (typeof uzCyrl === 'string' && uzCyrl) return uzCyrl;
  const first = Object.values(name).find((v) => typeof v === 'string' && v);
  return typeof first === 'string' ? first : '';
}

/** The same map, read in the language the visitor actually picked. `pickName`
 * above always prefers Latin Uzbek because the reference catalogues it reads
 * (activity types, livestock) are written in it; an announcement is editorial
 * text a person typed per language, so the visitor's own choice comes first
 * and the Latin/Cyrillic pair is only the fallback chain behind it. */
export function pickLocalized(
  value: Record<string, unknown> | null | undefined,
  language: string,
): string {
  if (!value) return '';
  for (const key of [language, 'uz_latn', 'uz_cyrl', 'ru']) {
    const candidate = value[key];
    if (typeof candidate === 'string' && candidate) return candidate;
  }
  return pickName(value);
}
