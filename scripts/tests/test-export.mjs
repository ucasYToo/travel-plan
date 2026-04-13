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

async function exportPanorama() {
  await page.getByTestId('desktop-controls').getByLabel('导出').click()
  await page.waitForTimeout(300)

  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 30000 }),
    page.getByText('全景横图 (2560×1440)').click(),
  ])
  const savePath = path.join(downloadDir, 'panorama.png')
  await download.saveAs(savePath)
  console.log('Panorama saved to', savePath)
  await page.waitForTimeout(1200)
}

async function exportDayHorizontal(dayIndex) {
  await page.getByTestId('desktop-controls').getByLabel('导出').click()
  await page.waitForTimeout(300)

  const dayPill = page.getByText(`Day${dayIndex + 1}`).filter({ hasText: `Day${dayIndex + 1}` })
  // In the export panel, day pills are separate from the top bar
  const panel = page.locator('[class*="panel"]')
  const pillInPanel = panel.getByText(`Day${dayIndex + 1}`).first()
  await pillInPanel.click()
  await page.waitForTimeout(200)

  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 30000 }),
    page.getByText('当天横图 (2560×1440)').click(),
  ])
  const savePath = path.join(downloadDir, `day${dayIndex + 1}-horizontal.png`)
  await download.saveAs(savePath)
  console.log(`Day ${dayIndex + 1} horizontal saved to`, savePath)
  await page.waitForTimeout(1200)
}

async function exportItineraryVertical() {
  await page.getByTestId('desktop-controls').getByLabel('导出').click()
  await page.waitForTimeout(300)

  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 30000 }),
    page.getByText('完整竖图 (1080px 宽)').click(),
  ])
  const savePath = path.join(downloadDir, 'itinerary-vertical.png')
  await download.saveAs(savePath)
  console.log('Itinerary vertical saved to', savePath)
  await page.waitForTimeout(1200)
}

async function exportDayVertical(dayIndex) {
  await page.getByTestId('desktop-controls').getByLabel('导出').click()
  await page.waitForTimeout(300)

  const panel = page.locator('[class*="panel"]')
  const pillInPanel = panel.getByText(`Day${dayIndex + 1}`).first()
  await pillInPanel.click()
  await page.waitForTimeout(200)

  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 30000 }),
    page.getByText('当天竖图 (1080px 宽)').click(),
  ])
  const savePath = path.join(downloadDir, `day${dayIndex + 1}-vertical.png`)
  await download.saveAs(savePath)
  console.log(`Day ${dayIndex + 1} vertical saved to`, savePath)
  await page.waitForTimeout(1200)
}

await exportPanorama()
await exportDayHorizontal(1)
await exportItineraryVertical()
await exportDayVertical(2)

await browser.close()
