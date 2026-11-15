import { defineConfig, devices } from '@playwright/test';

/**
 * Tests de bout en bout sur la VERSION DE PRODUCTION (build + vite preview),
 * servie sous /nova-academy/ comme sur GitHub Pages, avec service worker actif.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 180_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173/nova-academy/',
    trace: 'retain-on-failure',
    locale: 'fr-FR',
    serviceWorkers: 'allow',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 860 } } }],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173/nova-academy/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
