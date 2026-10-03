import { test, expect } from '@playwright/test';
const routes = [
  '/',
  '/search',
  '/categories',
  '/video/v01',
  '/watch/v01',
  '/library',
  '/profile?tab=preferences',
  '/creators/atlas',
];
for (const width of [375, 390, 430, 768, 1024, 1440, 1920]) {
  test(`all pages are usable without horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 960 });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    for (const route of routes) {
      const response = await page.goto(route, { waitUntil: 'networkidle' });
      expect(response?.status()).toBe(200);
      const dimensions = await page.evaluate(() => ({
        viewport: innerWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scroll, `${route} at ${width}px`).toBeLessThanOrEqual(dimensions.viewport);
      await expect(page.locator('h1').first()).toBeVisible();
      if (width < 1024)
        await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
      else await expect(page.locator('.sidebar')).toBeVisible();
      if (route.startsWith('/watch')) {
        await expect
          .poll(() => page.locator('video').evaluate((v) => (v as HTMLVideoElement).readyState))
          .toBeGreaterThanOrEqual(2);
        const box = await page.locator('.video-player').boundingBox();
        expect(box?.width).toBeGreaterThan(250);
      }
    }
    expect(errors).toEqual([]);
  });
}

test('search, categories, sorting, empty state and layout are URL driven', async ({ page }) => {
  await page.goto('/search');
  await page.getByRole('searchbox', { name: 'Search the collection' }).fill('Coffee');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page).toHaveURL(/q=Coffee/);
  await expect(page.locator('.result-count')).toContainText('3 videos');
  await page.getByRole('button', { name: 'Nature', exact: true }).click();
  await expect(page).toHaveURL(/category=nature/);
  await expect(page.getByText('No stories found. Yet.')).toBeVisible();
  await page.getByRole('button', { name: 'Explore all videos' }).click();
  await expect(page.locator('.result-count')).toContainText('32 videos');
  await page.getByRole('button', { name: 'Food', exact: true }).click();
  await expect(page.locator('.result-count')).toContainText('5 videos');
  await page.getByLabel('Sort search results').selectOption('latest');
  await expect(page).toHaveURL(/sort=latest/);
  await expect(page.locator('.video-card .video-title').first()).toContainText('One bowl');
  await page.getByRole('button', { name: 'List view', exact: true }).click();
  await expect(page).toHaveURL(/view=list/);
  await expect(page.locator('.video-row')).toHaveCount(5);
  await page.reload();
  await expect(page.locator('.video-row')).toHaveCount(5);
  await page.getByRole('button', { name: 'Grid view', exact: true }).click();
  await expect(page.locator('.video-card')).toHaveCount(5);
});

test('saving, liking, creating playlists and playlist membership persist', async ({ page }) => {
  await page.goto('/video/v04');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Saved', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Like video', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Unlike video' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Add to playlist', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /Make something/ })
    .click();
  await expect(page.getByRole('dialog').locator('.check-box.checked')).toHaveCount(2);
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await page.goto('/library?tab=saved');
  await expect(page.locator('.video-grid .video-title')).toHaveCount(4);
  await expect(page.locator('.video-grid')).toContainText('Chasing silence in the dunes');
  await page.getByRole('button', { name: 'New playlist', exact: true }).click();
  await page.getByLabel('Playlist name', { exact: true }).fill('A slower Sunday');
  await page.getByLabel('Description').fill('A collection made in the browser test.');
  await page.getByRole('button', { name: 'Create playlist', exact: true }).click();
  await page.getByRole('button', { name: /^Playlists/ }).click();
  await expect(page.locator('.playlist-card')).toHaveCount(3);
  await page.getByRole('button', { name: /A slower Sunday A collection/ }).click();
  await expect(page.getByRole('dialog').getByText('It’s a good place to start')).toBeVisible();
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click();
  await page.reload();
  await expect(page.locator('.playlist-card')).toHaveCount(3);
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('veyra:demo:v1') || '{}'),
  );
  expect(stored.savedIds).toContain('v04');
  expect(stored.likedIds).toContain('v04');
  expect(stored.playlists.find((p: { id: string }) => p.id === 'p02').videoIds).toContain('v04');
});

test('the real local demo player supports play, seek, speed, quality, volume and fullscreen', async ({
  page,
}) => {
  await page.goto('/watch/v01', { waitUntil: 'networkidle' });
  await expect
    .poll(() => page.locator('video').evaluate((v) => (v as HTMLVideoElement).readyState))
    .toBeGreaterThanOrEqual(2);
  await expect
    .poll(() => page.locator('video').evaluate((v) => (v as HTMLVideoElement).currentTime))
    .toBeGreaterThan(8);
  await page.getByRole('button', { name: 'Play preview', exact: true }).click();
  await expect
    .poll(() => page.locator('video').evaluate((v) => (v as HTMLVideoElement).currentTime))
    .toBeGreaterThan(9.5);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  expect(await page.locator('video').evaluate((v) => (v as HTMLVideoElement).paused)).toBe(true);
  await page.locator('.video-player').focus();
  await page.keyboard.press('ArrowLeft');
  await expect
    .poll(() => page.locator('video').evaluate((v) => (v as HTMLVideoElement).currentTime))
    .toBeLessThan(6);
  await page.getByRole('button', { name: 'Player settings', exact: true }).click();
  await page.getByRole('button', { name: /Playback speed Normal/ }).click();
  await page.getByRole('button', { name: '1.5×', exact: true }).click();
  await expect
    .poll(() => page.locator('video').evaluate((v) => (v as HTMLVideoElement).playbackRate))
    .toBe(1.5);
  await page.getByRole('button', { name: 'Player settings', exact: true }).click();
  await page.getByRole('button', { name: /Quality Auto/ }).click();
  await page.getByRole('button', { name: '720p · Demo preview', exact: true }).click();
  await page.getByRole('button', { name: 'Mute', exact: true }).click();
  expect(await page.locator('video').evaluate((v) => (v as HTMLVideoElement).muted)).toBe(true);
  await page.getByRole('button', { name: 'Unmute', exact: true }).click();
  const volume = page.getByRole('slider', { name: 'Volume', exact: true });
  await volume.focus();
  await volume.press('ArrowLeft');
  expect(await page.locator('video').evaluate((v) => (v as HTMLVideoElement).volume)).toBeLessThan(
    0.8,
  );
  await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () => !!document.fullscreenElement || !!document.querySelector('.fallback-fullscreen'),
      ),
    )
    .toBe(true);
  await page.getByRole('button', { name: 'Exit fullscreen', exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () => !!document.fullscreenElement || !!document.querySelector('.fallback-fullscreen'),
      ),
    )
    .toBe(false);
  await page.getByRole('button', { name: 'Picture in picture', exact: true }).click();
  await page.goto('/library?tab=continue');
  await expect(page.locator('.continue-grid')).toContainText('Off the beaten path');
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('veyra:demo:v1') || '{}'),
  );
  expect(stored.preferences.playbackRate).toBe(1.5);
  expect(stored.preferences.quality).toBe('720p');
  expect(
    stored.history.find((h: { videoId: string }) => h.videoId === 'v01').progress,
  ).toBeGreaterThan(3);
});

test('profile editing and appearance/playback preferences persist', async ({ page }) => {
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Edit profile', exact: true }).click();
  await page.getByLabel('Display name', { exact: true }).fill('Jordan Vale');
  await page.getByLabel(/Username/).fill('jvale');
  await page.getByLabel('A little about you', { exact: true }).fill('Finding new perspectives.');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.locator('.profile-identity')).toContainText('Jordan Vale');
  await page.getByRole('button', { name: 'Preferences', exact: true }).click();
  await page.getByRole('button', { name: 'Light', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('switch', { name: 'Autoplay the next video', exact: true }).click();
  await page.getByLabel('Default playback speed', { exact: true }).selectOption('2');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('switch', { name: 'Autoplay the next video' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await expect(page.getByLabel('Default playback speed', { exact: true })).toHaveValue('2');
  await expect(page.locator('.profile-identity')).toContainText('Jordan Vale');
  await page.getByRole('button', { name: 'Reset demo data', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Reset demo', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.profile-identity')).toContainText('Alex Morgan');
});

test('mobile navigation, search modal, hero carousel and touch player work', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:3000');
  await page.getByRole('button', { name: 'Next featured film', exact: true }).tap();
  await expect(page.locator('.hero-content h2')).toContainText('Life after');
  await page.getByRole('button', { name: 'Open search', exact: true }).tap();
  await page
    .getByRole('dialog')
    .getByRole('searchbox', { name: 'Search the collection' })
    .fill('Space');
  await page.getByRole('dialog').getByRole('button', { name: 'Search', exact: true }).tap();
  await expect(page).toHaveURL(/q=Space/);
  await expect(page.locator('.video-card').first()).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Mobile navigation' })
    .getByRole('link', { name: 'Library', exact: true })
    .tap();
  await expect(page).toHaveURL(/\/library$/);
  await page.goto('http://127.0.0.1:3000/watch/v03', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Play preview', exact: true }).tap();
  await expect
    .poll(() => page.locator('video').evaluate((v) => (v as HTMLVideoElement).currentTime))
    .toBeGreaterThan(1);
  await page.getByRole('button', { name: 'Pause', exact: true }).tap();
  await page.setViewportSize({ width: 844, height: 390 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});

test('keyboard access, focus restoration, reduced motion, no remote resources and useful 404', async ({
  page,
}) => {
  const hosts: string[] = [];
  page.on('request', (r) => {
    if (r.url().startsWith('http')) hosts.push(new URL(r.url()).hostname);
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.keyboard.press('/');
  await expect(page.getByRole('searchbox', { name: 'Search videos', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Notifications, 3 new', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Notifications, 3 new', exact: true }),
  ).toBeFocused();
  const animation = await page
    .locator('.page-container')
    .evaluate((el) => getComputedStyle(el).animationDuration);
  expect(parseFloat(animation)).toBeLessThan(0.01);
  // A streamed Next.js notFound response can be HTTP 200; the noindex directive is essential.
  await page.goto('/video/does-not-exist');
  await expect(page.getByText('A little off the beaten path.')).toBeVisible();
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/);
  const response = await page.goto('/not-a-real-page');
  expect(response?.status()).toBe(404);
  await expect(page.getByText('A little off the beaten path.')).toBeVisible();
  expect(Array.from(new Set(hosts))).toEqual(['127.0.0.1']);
});
