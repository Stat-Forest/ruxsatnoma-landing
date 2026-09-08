/**
 * "Normativ-huquqiy hujjatlar" — the anonymous legal-documents register
 * (`core` `0043`). Everything here is reachable without a session by
 * construction: a row appears only because an editor published it, and the
 * backend refuses to publish one that has neither a file nor a link.
 *
 * Its own module rather than part of `news.ts`: the two registers share a
 * shape but not a meaning, and a document carries a number and a date of
 * adoption that an announcement has no column for.
 */
import { api, BASE_URL } from './client';
import type { components } from './schema';

export type LegalDocument = components['schemas']['LegalDocumentOut'];
export type LegalDocumentPage = components['schemas']['Page_LegalDocumentOut_'];

/** The register is a few dozen rows in total, so one page holds all of it. */
export const DOCUMENTS_PAGE_SIZE = 50;

export async function fetchDocuments(): Promise<LegalDocumentPage> {
  const { data, error } = await api.GET('/api/v1/public/legal-documents', {
    params: { query: { page: 1, page_size: DOCUMENTS_PAGE_SIZE } },
  });
  if (error || !data) throw new Error('documents_unavailable');
  return data;
}

/**
 * The PDF is addressed through its DOCUMENT, not by file id — `GET /files/{id}`
 * needs a session, and the anonymous route deliberately does not take a bare
 * file id. Built as a plain URL rather than fetched: the browser downloads it
 * directly, so a 30 MB decree never passes through this app's memory.
 */
export function documentFileUrl(docId: string): string {
  return `${BASE_URL}/api/v1/public/legal-documents/${docId}/file`;
}

/**
 * `adopted_on` is a plain date (`YYYY-MM-DD`), printed as `dd.mm.yyyy` — the
 * spelling the whole system uses. Deliberately not `toLocaleDateString` with a
 * locale: `uz-UZ` renders September as "M09" in the browsers this site meets,
 * and a portal cannot print that. Anything unparseable renders as nothing
 * rather than as "Invalid Date".
 */
export function formatAdoptedOn(value: string | null | undefined): string {
  if (!value) return '';
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!parts) return '';
  return `${parts[3]}.${parts[2]}.${parts[1]}`;
}
