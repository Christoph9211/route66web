import { next } from '@vercel/functions'
import { closureResponse } from './closure/respond.mjs'

export const config = { matcher: '/:path*' }

export default function middleware(request) {
    return closureResponse(request) ?? next({ headers: { 'Cache-Control': 'no-store' } })
}
