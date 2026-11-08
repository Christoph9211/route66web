import { next } from '@vercel/functions'
import { closureResponse } from './closure/respond.mjs'

export const config = { matcher: '/:path*', runtime: 'nodejs' }

export default function middleware(request) {
    // Preserve Vercel platform authentication and diagnostics routes.
    const path = new URL(request.url).pathname
    if (path === '/sso-api' || path.startsWith('/_vercel/')) return next()
    return closureResponse(request) ?? next({ headers: { 'Cache-Control': 'no-store' } })
}
