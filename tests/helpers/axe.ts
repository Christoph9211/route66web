import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const OUT_DIR = join(process.cwd(), 'tools', 'a11y')
const OUT_JSON = join(OUT_DIR, 'axe-color-contrast.json')

function appendViolationsPayload(payload: any) {
    try {
        if (!existsSync(OUT_DIR)) {
            mkdirSync(OUT_DIR, { recursive: true })
        }
        let current: any[] = []
        if (existsSync(OUT_JSON)) {
            try {
                current = JSON.parse(readFileSync(OUT_JSON, 'utf-8'))
            } catch {
                current = []
            }
        }
        current.push(...payload)
        writeFileSync(OUT_JSON, JSON.stringify(current, null, 2), 'utf-8')
    } catch (e) {
        // non-fatal: continue tests even if writing fails
    }
}

export async function scanPage(page: Page) {
    const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .disableRules([])
        .analyze()

    const violations = results.violations.filter(
        (v) => v.id === 'color-contrast'
    )
    if (violations.length) {
        // Collect detailed info for export (selectors, colors, ratio, url)
        const url = page.url()
        const payload = violations.flatMap((v) =>
            v.nodes.map((n) => {
                // Attempt to extract color/ratio from axe data blocks
                const checks = [
                    ...(n.any || []),
                    ...(n.all || []),
                    ...(n.none || []),
                ]
                const colorData = checks.find((c) =>
                    c?.id?.includes('color')
                ) as any
                const data =
                    (colorData &&
                        (colorData.data ||
                            colorData.relatedNodes?.[0]?.color)) ||
                    colorData?.relatedNodes?.[0] ||
                    {}
                // axe typically exposes fgColor, bgColor, contrastRatio in data
                const fg = colorData?.data?.fgColor ?? data?.fgColor ?? null
                const bg = colorData?.data?.bgColor ?? data?.bgColor ?? null
                const ratio =
                    colorData?.data?.contrastRatio ??
                    data?.contrastRatio ??
                    null
                return {
                    rule: v.id,
                    help: v.help,
                    impact: v.impact,
                    target: n.target,
                    url,
                    fgColor: fg,
                    bgColor: bg,
                    contrastRatio: ratio,
                    html: n.html,
                }
            })
        )
        appendViolationsPayload(payload)

        // Log a concise summary for debugging
        console.error(
            `Axe found ${violations.length} color-contrast violation groups`
        )
        for (const v of violations) {
            console.error(`- ${v.id}: ${v.help} (${v.impact})`)
            v.nodes.slice(0, 10).forEach((n, i) => {
                console.error(`  Node ${i + 1}: ${n.target.join(' ')}`)
            })
        }
        throw new Error('Color contrast violations detected')
    }
}
