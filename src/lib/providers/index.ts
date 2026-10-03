import { APP_CONFIG } from '@/lib/config';
import { MockCatalogProvider, MockSourceProvider } from './mock';
import type { VideoCatalogProvider } from './catalog';
import type { VideoSourceProvider } from './source';
const catalogs: Record<string, () => VideoCatalogProvider> = {
  mock: () => new MockCatalogProvider(),
};
const sources: Record<string, () => VideoSourceProvider> = { mock: () => new MockSourceProvider() };
/** Add an API adapter to the registry, then select it in lib/config.ts. */
export function createCatalogProvider(
  id: string = APP_CONFIG.providers.catalog,
): VideoCatalogProvider {
  if (!catalogs[id]) throw new Error(`Register a catalog provider named "${id}" first.`);
  return catalogs[id]();
}
export function createSourceProvider(
  id: string = APP_CONFIG.providers.source,
): VideoSourceProvider {
  if (!sources[id]) throw new Error(`Register a source provider named "${id}" first.`);
  return sources[id]();
}
export const catalogProvider = createCatalogProvider();
export const sourceProvider = createSourceProvider();
export const providerConfiguration = APP_CONFIG.providers;
