import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { chromium } from 'playwright-core'

interface BrowserGlobal {
  __tripPackerHeadlessExport?: (modes: string[]) => Promise<Record<string, string>>
}

function createServer(rootDir: string): Promise<{ server: http.Server; port: number }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || '/', `http://${req.headers.host}`)
      let filePath = path.join(rootDir, decodeURIComponent(url.pathname))
      // Default to index.html for root path
      if (url.pathname === '/') {
        filePath = path.join(rootDir, 'index.html')
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
  const { server, port } = await createServer(rootDir)

  const browser = await chromium.launch({ headless: true })
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
