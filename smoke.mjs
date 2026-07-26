import puppeteer from 'puppeteer'

const BASE = 'http://localhost:5173'
const errors = []
const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
await page.setViewport({ width: 1100, height: 900 })
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))

const step = async (name, fn) => {
  try { await fn(); console.log('✓', name) }
  catch (e) { console.log('✗', name, '—', e.message); errors.push(name + ': ' + e.message) }
}
const text = () => page.evaluate(() => document.body.innerText)
const clickText = async (t) => {
  const ok = await page.evaluate((t) => {
    const els = [...document.querySelectorAll('button,a')]
    const el = els.find((e) => e.innerText.trim().includes(t))
    if (el) { el.click(); return true }
    return false
  }, t)
  if (!ok) throw new Error(`no clickable "${t}"`)
  await new Promise((r) => setTimeout(r, 350))
}

await step('reset to fresh seed', async () => {
  await page.goto(BASE, { waitUntil: 'networkidle0' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle0' })
})

await step('landing loads', async () => {
  await page.goto(BASE, { waitUntil: 'networkidle0' })
  if (!(await text()).includes('co-sign it')) throw new Error('no hero')
})

await step('open app → library shows seeded works', async () => {
  await page.goto(BASE + '/app', { waitUntil: 'networkidle0' })
  const t = await text()
  if (!t.includes('Velvet Static')) throw new Error('sample missing')
  if (!t.includes('Library')) throw new Error('no library heading')
})

await step('search resolves AKA (rhodesloop → Velvet Static)', async () => {
  await page.type('input[placeholder="Search any title or AKA…"]', 'rhodesloop')
  await new Promise((r) => setTimeout(r, 250))
  const t = await text()
  if (!t.includes('Velvet Static')) throw new Error('AKA search failed')
})

await step('open sample work → roster shows 3 @ 33%', async () => {
  await page.goto(BASE + '/app', { waitUntil: 'networkidle0' })
  await clickText('Velvet Static')
  const t = await text()
  if (!t.includes('33.34%') && !t.includes('33.33%')) throw new Error('even splits missing: ' + t.slice(0, 200))
})

await step('lineage tab shows used-by beat', async () => {
  await clickText('Lineage')
  const t = await text()
  if (!t.includes('Used by')) throw new Error('no used-by section')
})

await step('share credit pack → create link', async () => {
  await clickText('Roster & splits')
  await clickText('Share credit pack')
  await new Promise((r) => setTimeout(r, 300))
  await clickText('Create share link')
  await new Promise((r) => setTimeout(r, 300))
  const url = await page.evaluate(() => [...document.querySelectorAll('input')].map((i) => i.value).find((v) => v.includes('/p/')) || '')
  if (!url.includes('/p/')) throw new Error('no share url shown')
})

await step('public credit pack page renders', async () => {
  const token = await page.evaluate(() => {
    const raw = localStorage.getItem('cosign.db.v1')
    if (!raw) return null
    const db = JSON.parse(raw)
    const link = db.shareLinks.find((s) => !s.revoked_at)
    return link ? link.token : null
  })
  if (!token) throw new Error('no share link persisted')
  await page.goto(`${BASE}/p/${token}`, { waitUntil: 'networkidle0' })
  const t = await text()
  if (!t.includes('Read-only credit pack')) throw new Error('public page missing header')
  if (!t.includes('IPI')) throw new Error('PRO info not shown')
})

await step('co-sign flow: switch to Nova, approve No Ceilings proposal', async () => {
  await page.goto(BASE + '/app', { waitUntil: 'networkidle0' })
  await clickText('No Ceilings')
  let t = await text()
  if (!t.includes('waiting on co-signs')) throw new Error('no pending banner')
  // Nova is current user and is affected → should see Co-sign button
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('cosign.db.v1')).proposals.map(p=>({id:p.id,work:p.work_id,status:p.status})))
  console.log('   proposals before:', JSON.stringify(before))
  const cur = await page.evaluate(() => JSON.parse(localStorage.getItem('cosign.db.v1')).current_user_id)
  console.log('   current user:', cur)
  await clickText('Co-sign this')
  await new Promise((r) => setTimeout(r, 400))
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('cosign.db.v1')).proposals.map(p=>({id:p.id,work:p.work_id,status:p.status})))
  console.log('   proposals after:', JSON.stringify(after))
  t = await text()
  if (t.includes('waiting on co-signs')) throw new Error('proposal did not resolve after full approval')
})

await browser.close()
console.log('\n' + (errors.length ? `FAILURES (${errors.length}):\n` + errors.join('\n') : 'ALL GREEN — no console/page errors'))
process.exit(errors.length ? 1 : 0)
