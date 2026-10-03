import type { Metadata, Viewport } from 'next';
import type { CSSProperties } from 'react';
import './globals.css';
import AppProviders from '@/components/AppProviders';
import SiteShell from '@/components/SiteShell';
import { APP_CONFIG } from '@/lib/config';
import { catalogProvider } from '@/lib/providers';
export const metadata: Metadata = {
  title: {
    default: `${APP_CONFIG.brand.name} — Stay curious.`,
    template: `%s · ${APP_CONFIG.brand.name}`,
  },
  description: APP_CONFIG.brand.description,
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#101110',
};
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [videos, categories, creators] = await Promise.all([
    catalogProvider.getVideos(),
    catalogProvider.getCategories(),
    catalogProvider.getCreators(),
  ]);
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      style={{ '--accent': APP_CONFIG.brand.accent } as CSSProperties}
    >
      <body>
        <AppProviders catalog={{ videos, categories, creators }}>
          <SiteShell>{children}</SiteShell>
        </AppProviders>
      </body>
    </html>
  );
}
