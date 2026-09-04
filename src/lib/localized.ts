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
