import test from 'node:test'
import assert from 'node:assert/strict'
import { closureResponse, closeAt } from './respond.mjs'
const request = (path, method = 'GET') => new Request('https://www.route66hemp.com' + path, { method })
test('Central midnight boundary and future-tense advance notice', async () => {
 assert.equal(new Intl.DateTimeFormat('en-US', {timeZone:'America/Chicago',dateStyle:'short',timeStyle:'long'}).format(closeAt), '11/12/26, 12:00:00 AM CST')
 for (const path of ['/', '/products/', '/contact/']) {
  const r=closureResponse(request(path),closeAt-1); assert.equal(r.status,200); assert.equal(r.headers.get('x-route66-status'),'closing'); const s=await r.text(); assert(s.includes('Our final day of business will be')); assert(s.includes('We will be closing in response to changes in Missouri hemp regulations.')); assert(s.includes('route66hemp@gmail.com')); assert(!s.includes('Has Closed')); assert(!s.includes('ended retail')); assert(!s.includes('was November')); assert(!s.includes('We closed'))
 }
 for (const path of ['/products/products.json','/assets/main.js','/api/orders']) { const r=closureResponse(request(path),closeAt-1);assert.equal(r.status,410);assert(!(await r.text()).includes('has closed')) }
 assert.equal(closureResponse(request('/api/orders','POST'),closeAt-1).status,405)
})
test('Closure notice changes at boundary, without query/header override', async () => {
 for (const path of ['/', '/products/', '/contact/', '/?now=0']) {
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


test('Former store landing aliases redirect to the preserved closure/contact notice', async () => {
 for (const slug of ['dispensary-st-robert-mo', 'dispensary-near-fort-leonard-wood', 'route-66-dispensary-st-robert-mo']) {
  for (const suffix of ['', '/', '.html', '.html/']) {
   for (const now of [closeAt - 1, closeAt, closeAt + 1]) {
    for (const method of ['GET', 'HEAD']) {
     const r = closureResponse(request('/' + slug + suffix + '?utm_source=old-link', method), now)
     assert.equal(r.status, 308)
     assert.equal(r.headers.get('location'), 'https://www.route66hemp.com/')
     assert.equal(r.headers.get('cache-control'), 'no-store')
     assert.equal(await r.text(), '')
     const target = closureResponse(new Request(r.headers.get('location'), { method }), now)
     assert.equal(target.status, 200)
     const body = await target.text()
     if (method === 'GET') {
      assert(body.includes('route66hemp@gmail.com'))
      assert(body.includes(now < closeAt ? 'Will Be Closing' : 'Has Closed'))
     } else assert.equal(body, '')
    }
   }
  }
 }
})

test('Current and former image sitemap endpoints return the same valid sitemap', async () => {
 for (const now of [closeAt - 1, closeAt]) {
  const current = closureResponse(request('/sitemap.xml'), now)
  const former = closureResponse(request('/image-sitemap.xml'), now)
  assert.equal(former.status, 200)
  assert.equal(former.headers.get('content-type'), 'application/xml')
  assert.equal(await former.text(), await current.text())
 }
})
