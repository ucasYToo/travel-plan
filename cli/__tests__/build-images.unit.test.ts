import { describe, it, expect, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

// Mock screenshot module to avoid Playwright dependency in unit tests
vi.mock('../lib/screenshot.js', () => ({
  captureImages: vi.fn(async (_htmlPath: string, modes: string[]) => {
    const results: Record<string, string> = {}
    for (const mode of modes) {
      results[mode] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
    }
    return results
  }),
}))

import { buildCommand } from '../commands/build.js'

describe('trip-packer build --images', () => {
  it('generates panorama and itinerary-vertical images alongside HTML', async () => {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-build-images-test-'))
    const outFile = path.join(outDir, 'map.html')
    const fixture = path.resolve('cli/__tests__/fixtures/valid-city.json')

    buildCommand({
      data: [fixture],
      output: outFile,
      images: true,
    })

    // Wait for async image generation
    await new Promise((r) => setTimeout(r, 500))

    expect(fs.existsSync(outFile)).toBe(true)

    const panoramaPath = path.join(outDir, 'map-panorama.png')
    const verticalPath = path.join(outDir, 'map-itinerary-vertical.png')

    expect(fs.existsSync(panoramaPath)).toBe(true)
    expect(fs.existsSync(verticalPath)).toBe(true)

    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47])
    expect(fs.readFileSync(panoramaPath).subarray(0, 4)).toEqual(pngHeader)
    expect(fs.readFileSync(verticalPath).subarray(0, 4)).toEqual(pngHeader)

    fs.rmSync(outDir, { recursive: true, force: true })
  })
})
