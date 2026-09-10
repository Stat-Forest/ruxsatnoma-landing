import { expect, it } from 'vitest';
import { seasonsToMonthMap, windowsToMonths } from './seasons';

/**
 * `GET /public/activity-seasons` speaks in `{from: "MM-DD", to: "MM-DD"}`
 * windows — the shape `norms.checks._in_window` reads — not in month
 * numbers. The strip draws months. This is the one place that translates,
 * and the cross-year window is the case that bites.
 */

it('turns a single window into the months it touches, inclusive', () => {
  expect(windowsToMonths([{ from: '04-01', to: '11-30' }])).toEqual([4, 5, 6, 7, 8, 9, 10, 11]);
});

it('counts a month as open if any day of it is inside the window', () => {
  expect(windowsToMonths([{ from: '06-15', to: '08-10' }])).toEqual([6, 7, 8]);
});

it('wraps a window that crosses the new year', () => {
  expect(windowsToMonths([{ from: '10-01', to: '03-31' }])).toEqual([1, 2, 3, 10, 11, 12]);
});

it('unions several windows without duplicating a month', () => {
  expect(
    windowsToMonths([
      { from: '04-01', to: '05-31' },
      { from: '05-15', to: '07-31' },
    ]),
  ).toEqual([4, 5, 6, 7]);
});

it('maps activities to months, and leaves an unconfigured season UNDEFINED, never empty', () => {
  const map = seasonsToMonthMap([
    { activity_type_code: 'grazing', windows: [{ from: '04-01', to: '11-30' }], season_source: 'default', is_default: true },
    { activity_type_code: 'science', windows: [], season_source: 'none', is_default: true },
  ]);
  expect(map.grazing).toEqual([4, 5, 6, 7, 8, 9, 10, 11]);
  // `season_source: "none"` means "nothing is configured" — the strip must
  // read that as UNKNOWN, not as "closed all year". An empty array would
  // draw twelve grey cells and a "closed" badge.
  expect(map.science).toBeUndefined();
  expect('science' in map).toBe(false);
});

it('never throws on the shape the backend actually sends today — every activity unconfigured', () => {
  const live = ['grazing', 'haymaking', 'apiary', 'recreation', 'deadwood', 'science'].map((code) => ({
    activity_type_code: code,
    windows: [],
    season_source: 'none' as const,
    is_default: true,
  }));
  expect(seasonsToMonthMap(live)).toEqual({});
});
