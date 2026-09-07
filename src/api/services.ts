/**
 * The six forest-use services (`core` `norms` module, ruling #138). They used
 * to be constants in the translation files, each promising a fixed
 * processing term ("up to 3 working days") that had nothing to do with the
 * system's real deadline (`applications.service.SLA_DAYS`, decision #13).
 * They now come from `GET /public/refs/activity-types`, reachable without a
 * session; `ServicesPage` and the home page's activities section both read
 * this module so neither can drift from what the catalog actually holds.
 *
 * `description` may be `null` — two of the six rows (`deadwood`, `science`)
 * have no seeded copy (migration `0038`'s own docstring) and nothing here or
 * downstream may invent one.
 */
import { api } from './client';
import type { components } from './schema';

export type Service = components['schemas']['PublicActivityTypeOut'];

export async function fetchServices(): Promise<Service[]> {
  const { data, error } = await api.GET('/api/v1/public/refs/activity-types');
  if (error || !data) throw new Error('services_unavailable');
  return data;
}
