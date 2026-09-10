/**
 * Season windows arrive as `{from: "MM-DD", to: "MM-DD"}` — the shape the
 * backend's own `_season_check` reads, served by `GET /public/activity-seasons`
 * through the same resolver (ruling #180). The strip draws months, so this is
 * the one place the translation happens. Nothing here invents a window: an
 * activity the backend reports as unconfigured stays absent from the map,
 * which the strip renders as UNKNOWN rather than as "closed all year".
 */

export interface SeasonWindow {
  from: string;
  to: string;
}

export interface ActivitySeason {
  activity_type_code: string;
  windows: SeasonWindow[];
  /** `"none"` is the backend saying nothing is configured for this activity. */
  season_source: string;
  is_default: boolean;
}

function monthOf(monthDay: string): number {
  const month = Number(monthDay.slice(0, 2));
  return Number.isInteger(month) && month >= 1 && month <= 12 ? month : NaN;
}

/**
 * Every month at least one day of which falls inside any of the windows,
 * ascending, without duplicates. A window whose `to` month precedes its
 * `from` month crosses the new year and wraps.
 */
export function windowsToMonths(windows: SeasonWindow[]): number[] {
  const open = new Set<number>();
  for (const window of windows) {
    const start = monthOf(window.from);
    const end = monthOf(window.to);
    if (Number.isNaN(start) || Number.isNaN(end)) continue;
    let month = start;
    for (let guard = 0; guard < 12; guard += 1) {
      open.add(month);
      if (month === end) break;
      month = month === 12 ? 1 : month + 1;
    }
  }
  return [...open].sort((a, b) => a - b);
}

/**
 * Activity code → open months. An activity with `season_source: "none"` (or
 * no windows at all) is left OUT of the map, so `map[code]` is `undefined`:
 * the strip's "unknown" state. An empty array would be a lie — twelve grey
 * cells read as "closed".
 */
export function seasonsToMonthMap(seasons: ActivitySeason[]): Record<string, number[]> {
  const map: Record<string, number[]> = {};
  for (const season of seasons) {
    if (season.season_source === 'none' || season.windows.length === 0) continue;
    map[season.activity_type_code] = windowsToMonths(season.windows);
  }
  return map;
}
