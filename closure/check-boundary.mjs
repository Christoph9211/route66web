import test from 'node:test'
import assert from 'node:assert/strict'
import { closureResponse, closeAt } from './respond.mjs'
const request = (path, method = 'GET') => new Request('https://www.route66hemp.com' + path, { method })
test('Central midnight boundary and unchanged pre-close handling', () => {
 assert.equal(new Intl.DateTimeFormat('en-US', {timeZone:'America/Chicago',dateStyle:'short',timeStyle:'long'}).format(closeAt), '11/12/26, 12:00:00 AM CST')
 for (const path of ['/', '/products/', '/products/products.json', '/assets/main.js', '/api/orders']) assert.equal(closureResponse(request(path),closeAt-1),null)
})
test('All old landing pages close at boundary, without query/header override', async () => {
 for (const path of ['/', '/products/', '/contact/', '/dispensary-st-robert-mo/', '/dispensary-near-fort-leonard-wood/', '/route-66-dispensary-st-robert-mo.html','/?now=0']) {
  const r=closureResponse(request(path),closeAt); assert.equal(r.status,200);const s=await r.text();assert(s.includes('November 11, 2026'));assert(s.includes('route66hemp@gmail.com'));assert(s.includes('We closed in response to changes in Missouri hemp regulations.'));assert(!s.includes('<script'))
 }
})
test('Inventory, scripts and orders no longer available; policies and HEAD valid', async () => {
 for(const path of ['/products/products.json','/products/products_old.json','/assets/app.js','/api/orders','/image.json']) assert.equal(closureResponse(request(path),closeAt).status,410)
 assert.equal(closureResponse(request('/api/orders','POST'),closeAt).status,405)
 assert.equal(await closureResponse(request('/','HEAD'),closeAt).text(),'')
 for(const path of ['/privacy-policy/','/terms-of-service.html','/cookie-policy/','/robots.txt','/sitemap.xml']) assert.equal(closureResponse(request(path),closeAt).status,200)
 assert.equal(closureResponse(request('/'),closeAt).headers.get('cache-control'),'no-store')
})
