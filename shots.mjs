import puppeteer from 'puppeteer'
const BASE = 'http://localhost:5173'
const b = await puppeteer.launch({ headless: true })
const p = await b.newPage()
await p.setCacheEnabled(false)
await p.setViewport({ width: 1180, height: 940, deviceScaleFactor: 2 })
await p.goto(BASE, { waitUntil: 'networkidle0' })
await p.evaluate(() => localStorage.clear())
// first-launch tour
await p.goto(BASE + '/app', { waitUntil: 'networkidle0' }); await new Promise(r=>setTimeout(r,400))
await p.screenshot({ path: '/tmp/v4-tour.png' }); console.log('tour')
// step through to the "how it works" bullets step
await p.evaluate(() => { const b=[...document.querySelectorAll('button')].find(e=>/Next/.test(e.innerText)); b&&b.click() })
await new Promise(r=>setTimeout(r,200))
await p.evaluate(() => { const b=[...document.querySelectorAll('button')].find(e=>/Next/.test(e.innerText)); b&&b.click() })
await new Promise(r=>setTimeout(r,250))
await p.screenshot({ path: '/tmp/v4-tour-steps.png' }); console.log('tour-steps')
// dismiss tour + strip, then capture clean app
await p.evaluate(() => { localStorage.setItem('cosign.tour.v1','1'); localStorage.setItem('cosign.onboard.library.v1','1') })
const openWork = async (title) => {
  await p.goto(BASE + '/app', { waitUntil: 'networkidle0' })
  await p.evaluate((t) => { const el=[...document.querySelectorAll('button')].find(e=>e.innerText.includes(t)); el&&el.click() }, title)
  await new Promise((r) => setTimeout(r, 500))
}
await p.goto(BASE + '/app', { waitUntil: 'networkidle0' }); await new Promise(r=>setTimeout(r,300)); await p.screenshot({ path: '/tmp/v4-library.png' }); console.log('library')
await openWork('No Ceilings'); await p.screenshot({ path: '/tmp/v4-work.png' }); console.log('work')
await p.goto(BASE + '/app/new', { waitUntil: 'networkidle0' }); await new Promise(r=>setTimeout(r,300)); await p.screenshot({ path: '/tmp/v4-new.png' }); console.log('new')
await b.close()
