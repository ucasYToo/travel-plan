import { chromium } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const outDir = path.resolve('/Users/niannian/seoul/export-downloads')
fs.mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  acceptDownloads: true,
})

const page = await context.newPage()
await page.goto('http://localhost:4174/')
await page.waitForTimeout(2000)

async function capture(modeLabel, dayLabel) {
  if (dayLabel) {
    await page.getByTestId('desktop-controls').getByText(dayLabel).click()
    await page.waitForTimeout(300)
  }
  await page.getByTestId('desktop-controls').getByLabel('导出').click()
  await page.waitForTimeout(300)

  const downloadPromise = page.waitForEvent('download', { timeout: 30000 })
  await page.getByText(modeLabel).click()

  await page.waitForTimeout(600)
  const el = page.locator('[data-export-mode]')

  // Make container visible on screen for a clean screenshot
  await el.evaluate((node) => {
    node.style.zIndex = '9999'
    node.style.opacity = '1'
  })

  const file = path.join(outDir, `${modeLabel.replace(/[\s\/]+/g, '-')}-${dayLabel || 'all'}.png`)
  await el.screenshot({ path: file })
  console.log('Captured', file)

  // restore (optional)
  await el.evaluate((node) => {
    node.style.zIndex = ''
    node.style.opacity = ''
  })

  await downloadPromise
  await page.waitForTimeout(200)
}

await capture('全景横图')
await capture('当天路线横图', 'Day1')
await capture('当天路线横图', 'Day3')

await browser.close()
