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
await page.goto('http://localhost:4175/')
await page.waitForTimeout(2000)

await page.getByTestId('desktop-controls').getByLabel('导出').click()
await page.waitForTimeout(300)

const panel = page.locator('[class*="panel"]')
const pillInPanel = panel.getByText('Day3').first()
await pillInPanel.click()
await page.waitForTimeout(200)

const [download] = await Promise.all([
  page.waitForEvent('download', { timeout: 30000 }),
  page.getByText('当天横图 (2560×1440)').click(),
])
const savePath = path.join(downloadDir, 'day3-horizontal.png')
await download.saveAs(savePath)
console.log('Day 3 horizontal saved to', savePath)

await browser.close()
