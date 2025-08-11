import { test, selectors } from '@playwright/test'
import { scanPage } from './helpers/axe'

// App uses a single page with in-page anchors plus a couple of static policy pages
const routes = ['/', '/src/privacy-policy.html', '/src/terms-of-service.html']
const themes = ['light', 'dark']

for (const route of routes) {
    for (const theme of themes) {
        test.describe(`${route} – ${theme}`, () => {
            test(`WCAG contrast audit`, async ({ page }) => {
                await page.goto(route)
                // Switch theme: emulate color scheme and toggle the `dark` class used by Tailwind
                if (theme === 'dark') {
                    await page.emulateMedia({ colorScheme: 'dark' })
                    await page.evaluate(() =>
                        document.documentElement.classList.add('dark')
                    )
                } else {
                    await page.emulateMedia({ colorScheme: 'light' })
                    await page.evaluate(() =>
                        document.documentElement.classList.remove('dark')
                    )
                }

                // Force-render interactive states
                await page.addStyleTag({
                    content: `
          *:hover, *:focus, *:visited, *:disabled {
            outline: 1px solid transparent; /* ensures style exists */
          }`,
                })

                // Additional pass: explicitly test hover, focus, disabled, visited states for all components with data-testid
                await selectors.setTestIdAttribute('data-testid')
                const els = await page.$$('[data-testid]')
                for (const el of els) {
                    // Hover state
                    await el.hover()
                    await scanPage(page)

                    // Focus state
                    await el.focus()
                    await scanPage(page)

                    // Disabled state
                    await page.evaluate(
                        (e: HTMLElement | SVGElement) =>
                            e.setAttribute('disabled', ''),
                        el
                    )
                    await scanPage(page)

                    // Visited state (for anchors)
                    await page.evaluate((e: HTMLElement | SVGElement) => {
                        if (e instanceof HTMLAnchorElement) e.click()
                    }, el)
                }

                // Base state scan as well
                await scanPage(page)
            })
        })
    }
}
