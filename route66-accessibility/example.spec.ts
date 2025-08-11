import { test, expect } from '@playwright/test'

// Simple smoke test to verify the site loads
// You can expand this with accessibility checks using @axe-core/playwright later

test('homepage loads', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Route 66|Route66|Route 66 Web|Route66 Web/i)
})
