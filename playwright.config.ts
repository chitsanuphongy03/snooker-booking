import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    video: 'retain-on-failure',  // Only save video when test fails
    screenshot: 'only-on-failure', // Only save screenshot when test fails
    headless: false,
    launchOptions: {
      slowMo: 500, // Slow down actions so you can see what's happening
    },
  },

  projects: [
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['iPhone 12 Pro'],
        // Override to use Chrome instead of Safari
        browserName: 'chromium',
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
})
