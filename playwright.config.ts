import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: [
    'route66-accessibility/**/*.spec.*',
    'tests/**/*.spec.*',
  ],
  workers: 2,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'a11y-report.json' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run serve',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
});

