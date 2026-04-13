import { chromium } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const outDir = path.resolve('/Users/niannian/seoul/export-downloads')
fs.mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
await page.goto('http://localhost:4174/')
await page.waitForTimeout(2000)

async function run(modeLabel, dayLabel) {
  if (dayLabel) {
    await page.getByTestId('desktop-controls').getByText(dayLabel).click()
    await page.waitForTimeout(300)
  }
  await page.getByTestId('desktop-controls').getByLabel('导出').click()
  await page.waitForTimeout(300)

  const dl = page.waitForEvent('download', { timeout: 30000 })
  await page.getByText(modeLabel).click()
  await page.waitForTimeout(4000) // wait for domToPng to finish

  const dataUrl = await page.evaluate(() => window.__debugExportDataUrl)
  if (!dataUrl) {
    console.log('no dataUrl')
    await dl
    return
  }

  const p2 = await browser.newPage()
  await p2.setViewportSize({ width: 1280, height: 720 })
  await p2.setContent(`<html><body style="margin:0"><img src="${dataUrl}" style="display:block;width:100%;height:100%;object-fit:contain"></body></html>`)
  await p2.waitForTimeout(500)
  const name = `${modeLabel.replace(/[\s\/]+/g, '-')}-${dayLabel || 'all'}-debug.png`
  await p2.screenshot({ path: path.join(outDir, name) })
  console.log('saved', name)
  await p2.close()
  await dl
}

await run('全景横图')
await run('当天路线横图', 'Day1')

await browser.close()
