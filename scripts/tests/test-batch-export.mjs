import { chromium } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const downloadDir = path.resolve('/Users/niannian/seoul/export-downloads')

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
await panel.getByText('Day1').first().click()
await panel.getByText('Day3').first().click()
await page.waitForTimeout(200)

const downloads = []
page.on('download', async (download) => {
  const savePath = path.join(downloadDir, `batch-${downloads.length}.png`)
  downloads.push(savePath)
  await download.saveAs(savePath)
})

await page.getByText('当天横图 (2560×1440)').click()

// Wait for both downloads
await page.waitForTimeout(8000)

console.log('Batch downloads:', downloads)
await browser.close()
