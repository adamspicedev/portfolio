import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: { args: ['--enable-unsafe-swiftshader'] },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'webkit-mobile',
      testMatch: ['edge-hydration.spec.ts', 'contact-antispam.spec.ts'],
      use: { ...devices['iPhone 13'], launchOptions: {} },
    },
  ],
  webServer: [
    {
      command:
        'bunx vite e2e/fixtures/contact --config e2e/fixtures/contact/vite.config.ts --port 4176',
      url: 'http://127.0.0.1:4176',
      reuseExistingServer: false,
    },
    {
      command: 'bun run start',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: false,
      timeout: 30_000,
      env: {
        PORT: '4173',
        HOST: '127.0.0.1',
        RESEND_API_KEY: '',
        RESEND_WEBHOOK_SECRET: '',
        WRITE_IT_UP_URL: '',
        CLERK_SECRET_KEY: '',
        VITE_CLERK_PUBLISHABLE_KEY: '',
        CMS_ADMIN_USER_IDS: '',
        DATABASE_PATH: '.output/test-stories.sqlite',
      },
    },
    {
      command:
        'bunx vite e2e/fixtures/upload --config e2e/fixtures/upload/vite.config.ts --port 4174',
      url: 'http://127.0.0.1:4174',
      reuseExistingServer: false,
    },
  ],
})
