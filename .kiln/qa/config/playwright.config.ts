import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '../tests',
  outputDir: '../test-results',
  fullyParallel: true,
  timeout: 30000,
  retries: 1,
  reporter: [
    ['html', { outputFolder: '../reports' }],
    ['json', { outputFile: '../reports/results.json' }],
    ['list']
  ],
  use: {
    baseURL: process.env.DEV_URL || 'http://localhost:8081',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    screenshot: 'on',
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: { browserName: 'chromium' },
    },
    {
      name: 'tablet',
      use: {
        browserName: 'chromium',
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        browserName: 'chromium',
        viewport: { width: 375, height: 667 },
        isMobile: true,
      },
    },
  ],
});
