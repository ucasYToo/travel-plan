import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { chromium } from 'playwright-core'

interface BrowserGlobal {
  __tripPackerHeadlessExport?: (modes: string[]) => Promise<Record<string, string>>
}

function resolveBrowserExecutable(): string | undefined {
  const configured = process.env.PLAYWRIGHT_EXECUTABLE_PATH
  if (configured && fs.existsSync(configured)) return configured

  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    process.env.PROGRAMFILES
      ? path.join(process.env.PROGRAMFILES, 'Google', 'Chrome', 'Application', 'chrome.exe')
      : '',
    process.env['PROGRAMFILES(X86)']
      ? path.join(process.env['PROGRAMFILES(X86)'], 'Microsoft', 'Edge', 'Application', 'msedge.exe')
      : '',
  ]

  return candidates.find((candidate) => candidate && fs.existsSync(candidate))
}

function createServer(rootDir: string, indexFile: string): Promise<{ server: http.Server; port: number }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || '/', `http://${req.headers.host}`)
      let filePath = path.join(rootDir, decodeURIComponent(url.pathname))
      // Default to the built HTML file for root path
      if (url.pathname === '/') {
        filePath = path.join(rootDir, indexFile)
      }

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404)
          res.end('Not found')
          return
        }
        const ext = path.extname(filePath)
        const contentType =
          ext === '.html'
            ? 'text/html'
            : ext === '.js'
              ? 'application/javascript'
              : ext === '.css'
                ? 'text/css'
                : 'application/octet-stream'
        res.writeHead(200, {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
        })
        res.end(data)
      })
    })

    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (address && typeof address === 'object') {
        resolve({ server, port: address.port })
      } else {
        reject(new Error('Failed to get server port'))
      }
    })

    server.on('error', reject)
  })
}

export async function captureImages(
  htmlPath: string,
  modes: string[],
): Promise<Record<string, string>> {
  const rootDir = path.dirname(htmlPath)
  const indexFile = path.basename(htmlPath)
  const { server, port } = await createServer(rootDir, indexFile)

  const executablePath = resolveBrowserExecutable()
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const page = await context.newPage()

  try {
    const url = `http://127.0.0.1:${port}/`
    await page.goto(url, { waitUntil: 'networkidle' })

    // Wait for headless export API to be available
    await page.waitForFunction(
      () => typeof (globalThis as unknown as BrowserGlobal).__tripPackerHeadlessExport === 'function',
      undefined,
      { timeout: 15000 },
    )

    // Increase default timeout for the potentially long-running export
    page.setDefaultTimeout(120000)

    // Call headless export and wait for result
    const results = await page.evaluate(async (exportModes) => {
      const api = (globalThis as unknown as BrowserGlobal).__tripPackerHeadlessExport
      if (!api) {
        throw new Error('Headless export API not available')
      }
      return api(exportModes)
    }, modes) as Record<string, string>

    return results
  } finally {
    await context.close()
    await browser.close()
    server.closeAllConnections()
    server.close()
  }
}
