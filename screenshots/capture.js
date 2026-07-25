import { chromium } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const baseUrl = process.env.SCREENSHOT_URL ?? 'http://127.0.0.1:4173/'
const outputDir = path.resolve(process.env.SCREENSHOT_OUTPUT_DIR ?? 'screenshots')
const configuredBrowser = process.env.PLAYWRIGHT_EXECUTABLE_PATH
const systemChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const executablePath = configuredBrowser && fs.existsSync(configuredBrowser)
  ? configuredBrowser
  : fs.existsSync(systemChrome)
    ? systemChrome
    : undefined

fs.mkdirSync(outputDir, { recursive: true })

async function waitForMap(page) {
  await page.waitForSelector('.leaflet-container', { timeout: 10_000 })
  // MapController animates fitBounds on mount; wait for that move before
  // evaluating the tile set, otherwise the screenshot can catch a gray gap.
  await page.waitForTimeout(1_300)
  await page
    .waitForFunction(() => {
      const tiles = Array.from(document.querySelectorAll('.leaflet-tile'))
      return tiles.length > 0 && tiles.every((tile) => tile.complete && tile.naturalWidth > 0)
    }, undefined, { timeout: 10_000 })
    .catch(() => {})
  await page.waitForTimeout(500)
}

async function capture(browser, name, viewport, isMobile = false) {
  const context = await browser.newContext({ viewport, isMobile })
  const page = await context.newPage()
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  const response = await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
  if (!response?.ok()) {
    throw new Error(`Failed to open ${baseUrl}: HTTP ${response?.status() ?? 'unknown'}`)
  }
  try {
    await waitForMap(page)
  } catch (error) {
    const title = await page.title()
    const body = (await page.locator('body').innerText()).slice(0, 500)
    throw new Error(
      `Map did not render at ${page.url()} (title: ${title || 'empty'}). ` +
      `Page errors: ${pageErrors.join(' | ') || 'none'}. Body: ${body || 'empty'}`,
      { cause: error },
    )
  }
  await page.screenshot({ path: path.join(outputDir, `${name}.png`), fullPage: false })
  await context.close()
}

const browser = await chromium.launch({
  headless: true,
  ...(executablePath ? { executablePath } : {}),
})

try {
  await capture(browser, 'desktop', { width: 1280, height: 800 })
  await capture(browser, 'mobile', { width: 375, height: 812 }, true)
  console.log(`Screenshots saved to ${outputDir}`)
} finally {
  await browser.close()
}
