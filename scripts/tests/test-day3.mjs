import { chromium } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const downloadDir = path.resolve('/Users/niannian/seoul/export-downloads')
fs.mkdirSync(downloadDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  acceptDownloads: true,
})

const page = await context.newPage()
await page.goto('http://localhost:4174/')
await page.waitForTimeout(2000)

// Select day 3 and export day route
await page.getByTestId('desktop-controls').getByText('Day3').click()
await page.waitForTimeout(300)
await page.getByTestId('desktop-controls').getByLabel('导出').click()
await page.waitForTimeout(300)

const [download1] = await Promise.all([
  page.waitForEvent('download', { timeout: 30000 }),
  page.getByText('当天路线横图').click(),
])
const file1 = path.join(downloadDir, 'day3-route.png')
await download1.saveAs(file1)
console.log('Day3 route saved to', file1)

await browser.close()
