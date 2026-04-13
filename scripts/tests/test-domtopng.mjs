import { chromium } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const outDir = path.resolve('/Users/niannian/seoul/export-downloads')
fs.mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
await page.goto('http://localhost:4174/')
await page.waitForTimeout(2000)

// Trigger panorama export and intercept the dataUrl
const dataUrl = await page.evaluate(() => {
  return new Promise((resolve) => {
    const original = URL.createObjectURL
    window.URL.createObjectURL = function (blob) {
      const reader = new FileReader()
      reader.onloadend = () => {
        window.URL.createObjectURL = original
        resolve(reader.result)
      }
      reader.readAsDataURL(blob)
      return original(blob)
    }
  })
})

await page.getByTestId('desktop-controls').getByLabel('导出').click()
await page.waitForTimeout(300)
const dl = page.waitForEvent('download', { timeout: 30000 })
await page.getByText('全景横图').click()

const url = await Promise.race([
  dataUrl,
  new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000))
])

// Write result to disk
fs.writeFileSync(path.join(outDir, 'domtopng-result.txt'), url.slice(0, 200))

// Display the dataUrl in a new tab and screenshot it
const imgPage = await browser.newPage()
await imgPage.setViewportSize({ width: 1280, height: 720 })
await imgPage.setContent(`<html><body style="margin:0"><img src="${url}" style="width:100%;height:100%;object-fit:contain"></body></html>`)
await imgPage.waitForTimeout(500)
await imgPage.screenshot({ path: path.join(outDir, 'domtopng-preview.png') })
console.log('Saved domtopng-preview.png')

await dl
await browser.close()
