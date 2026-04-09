import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { loadCityData } from '../lib/data-loader.js'
import { logger } from '../lib/logger.js'
import { ensureDir, resolveOutput } from '../lib/output.js'
import { createTempProject } from '../lib/temp-project.js'
import type { ItineraryData } from '../../src/types/index.js'

export interface BuildOptions {
  data: string[]
  output: string
  defaultCity?: string
  strict?: boolean
  validate?: boolean
}

function runViteBuild(projectDir: string): void {
  const viteBin = path.resolve(
    path.dirname(fileURLToPath(import.meta.resolve('vite/package.json'))),
    'bin/vite.js'
  )

  const result = spawnSync(
    process.execPath,
    [viteBin, 'build'],
    {
      cwd: projectDir,
      env: { ...process.env, NODE_ENV: 'production' },
      stdio: 'pipe',
    }
  )

  if (result.status !== 0) {
    logger.error('Vite build failed')
    if (result.stderr) console.error(result.stderr.toString())
    if (result.stdout) console.log(result.stdout.toString())
    process.exit(1)
  }
}

export function buildCommand(options: BuildOptions): void {
  logger.info('Loading itinerary data...')

  const cities = loadCityData(
    options.data,
    options.validate === false,
    !!options.strict
  )

  const cityRecord: Record<string, ItineraryData> = {}
  for (const { cityId, data } of cities) {
    cityRecord[cityId] = data
  }

  const cityIds = Object.keys(cityRecord)
  const defaultCity = options.defaultCity ?? cityIds[0]

  if (!cityIds.includes(defaultCity)) {
    logger.error(`Default city "${defaultCity}" not found in provided data files`)
    process.exit(2)
  }

  logger.info(`Cities: ${cityIds.join(', ')}`)
  logger.info(`Default city: ${defaultCity}`)

  const originalRoot = process.cwd()
  const { projectDir, cleanup } = createTempProject(cityRecord, defaultCity, originalRoot)

  try {
    logger.info('Building with Vite...')
    runViteBuild(projectDir)

    const sourceHtml = path.join(projectDir, 'dist', 'index.html')
    if (!fs.existsSync(sourceHtml)) {
      logger.error('Build output not found: dist/index.html')
      process.exit(1)
    }

    const { dir: outDir, file: outFile } = resolveOutput(options.output)
    ensureDir(outDir)
    const destPath = path.join(outDir, outFile)

    fs.copyFileSync(sourceHtml, destPath)
    logger.success(`Build complete: ${destPath}`)
  } finally {
    cleanup()
  }
}
