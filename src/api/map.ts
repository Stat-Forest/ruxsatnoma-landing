
import type { OpenDataFeature } from '../components/map/types';

export interface SearchMapResponse {
  feature: OpenDataFeature | null;
}

export async function searchMapFeature(id: string): Promise<SearchMapResponse> {
  // TODO: Replace with real endpoint when backend implements it.
  // GET /api/v1/public/gis/search?id=...
  
  // For now, return null or simulate a fetch
  return new Promise((resolve) => {
    setTimeout(() => {
      // simulate using id to silence TS warning
      if (id) {
        resolve({ feature: null }); // Mock empty response for now
      } else {
        resolve({ feature: null });
      }
    }, 500);
  });
}
