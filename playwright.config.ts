import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './scripts',
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
  use: {
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
  },
})
