/**
 * "Yangiliklar va eʼlonlar" — the anonymous half of the announcements module
 * (`core` `0037`). Everything here is reachable without a session by
 * construction: a row appears only because an editor ticked `public_on_landing`
 * on an announcement with no audience.
 *
 * Kept as its own module rather than inlined in the pages: the home page shows
 * the three newest, `/news` lists them all, `/news/:id` reads one, and all
 * three must agree on what a news item IS.
 */
import { api, BASE_URL } from './client';
import type { components } from './schema';

export type NewsItem = components['schemas']['AnnouncementLandingOut'];
export type NewsPage = components['schemas']['Page_AnnouncementLandingOut_'];

/** How many the home page's own section shows. The list page asks for more. */
export const HOME_NEWS_COUNT = 3;
export const NEWS_PAGE_SIZE = 10;

export async function fetchNews(params: { page: number; pageSize: number }): Promise<NewsPage> {
  const { data, error } = await api.GET('/api/v1/public/announcements', {
    params: { query: { page: params.page, page_size: params.pageSize } },
  });
  if (error || !data) throw new Error('news_unavailable');
  return data;
}

export async function fetchNewsItem(id: string): Promise<NewsItem> {
  const { data, error } = await api.GET('/api/v1/public/announcements/{announcement_id}', {
    params: { path: { announcement_id: id } },
  });
  if (error || !data) throw new Error('news_item_unavailable');
  return data;
}

/**
 * An attachment is addressed THROUGH its announcement — `GET /files/{id}` needs
 * a session, and the anonymous route deliberately does not take a bare file id.
 * Built as a plain URL rather than fetched: the browser downloads it directly,
 * so a 30 MB decree never passes through this app's memory.
 */
export function newsFileUrl(announcementId: string, fileId: string): string {
  return `${BASE_URL}/api/v1/public/announcements/${announcementId}/files/${fileId}`;
}

/**
 * `publish_from` is an ISO instant; the page shows a date, as `dd.mm.yyyy` —
 * the same spelling the adminka uses everywhere. Deliberately not
 * `toLocaleDateString` with a locale: `uz-UZ` renders September as "M09" in
 * the browsers this site actually meets, and a portal cannot print that.
 * Anything unparseable renders as nothing rather than as "Invalid Date".
 */
export function formatNewsDate(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getFullYear()}`;
}
