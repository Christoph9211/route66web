import { pages } from './pages.mjs'

export const closeAt = Date.parse('2026-11-12T06:00:00.000Z')
export function closureResponse(request, now = Date.now()) {
    if (now < closeAt) return null
    const headers = { 'Cache-Control': 'no-store', 'CDN-Cache-Control': 'no-store', 'Vercel-CDN-Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Route66-Status': 'closed' }
    if (!['GET', 'HEAD'].includes(request.method)) return new Response('The store is closed. New orders are not accepted.', { status: 405, headers: { ...headers, Allow: 'GET, HEAD' } })
    const path = new URL(request.url).pathname.replace(/\/+$/, '') || '/'
    const respond = (body, type, status = 200) => new Response(request.method === 'HEAD' ? null : body, { status, headers: { ...headers, 'Content-Type': type } })
    if (path === '/robots.txt') return respond('User-agent: *\nAllow: /\nSitemap: https://www.route66hemp.com/sitemap.xml\n', 'text/plain; charset=utf-8')
    if (path === '/sitemap.xml') return respond('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://www.route66hemp.com/</loc></url></urlset>', 'application/xml')
    const policy = path.replace(/^\//, '').replace(/\.html$/, '')
    if (['privacy-policy', 'terms-of-service', 'cookie-policy'].includes(policy)) return respond(pages[policy], 'text/html; charset=utf-8')
    if (/^\/(api|assets|products)(\/|$)/.test(path) && path !== '/products') return respond('This content is no longer available. Route 66 Hemp has closed.', 'text/plain; charset=utf-8', 410)
    if (/\.(json|js|css|map|jpg|jpeg|png|webp|avif|ico|webmanifest)$/i.test(path)) return respond('This content is no longer available.', 'text/plain; charset=utf-8', 410)
    return respond(pages.index, 'text/html; charset=utf-8')
}
