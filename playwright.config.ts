import { defineConfig } from '@playwright/test';
const baseURL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  fullyParallel: true,
  workers: 2,
  use: {
    baseURL,
    viewport: { width: 1440, height: 960 },
    headless: true,
    trace: 'retain-on-failure',
  },
  reporter: [['list'], ['json', { outputFile: '.arena/test-report.json' }]],
  ...(process.env.TEST_BASE_URL
    ? {}
    : {
        webServer: {
          command: 'npm run dev -- --port 3000',
          url: baseURL,
          reuseExistingServer: true,
          timeout: 120_000,
        },
      }),
});
