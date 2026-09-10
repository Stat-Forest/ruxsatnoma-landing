/**
 * The site's one vocabulary for "we do not have this".
 *
 * Five different ones were in use — an em dash, "Maʼlum emas", "Bandligi:
 * nomaʼlum", an omitted row, and nothing at all — often on the same screen,
 * so a reader had no way to tell "unknown" from "zero" from "not applicable".
 * The rule now:
 *
 * - a VALUE in a label:value pair that the API did not send renders `DASH`;
 * - a whole ROW or panel with nothing to say is omitted entirely (the
 *   application card's `next_step`, the footer's contact rows);
 * - a STATE that is genuinely unknown says so in words, in its own badge
 *   (`map.contour.occupancyUnknown`, the season strip's unknown row) — never
 *   an em dash, which reads as "empty" rather than "not established".
 */
export const DASH = '—';
