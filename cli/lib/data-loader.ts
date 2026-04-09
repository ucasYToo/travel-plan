import fs from 'node:fs'
import path from 'node:path'
import { itinerarySchema } from '../../src/data/schema.js'
import type { ItineraryData } from '../../src/types/index.js'
import { logger } from './logger.js'

export interface LoadedCity {
  cityId: string
  data: ItineraryData
}

function slugifyCityId(fileName: string): string {
  return fileName
    .replace(/\.json$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function loadCityData(dataPaths: string[], skipValidation = false, strict = false): LoadedCity[] {
  const cities: LoadedCity[] = []

  for (const dataPath of dataPaths) {
    const absPath = path.resolve(dataPath)
    if (!fs.existsSync(absPath)) {
      logger.error(`Data file not found: ${absPath}`)
      process.exit(1)
    }

    let raw: unknown
    try {
      raw = JSON.parse(fs.readFileSync(absPath, 'utf-8'))
    } catch (err) {
      logger.error(`Failed to parse JSON: ${absPath}`, err)
      process.exit(1)
    }

    if (!skipValidation) {
      const result = itinerarySchema.safeParse(raw)
      if (!result.success) {
        logger.error(`Validation failed for ${absPath}`)
        for (const issue of result.error.issues) {
          console.error(`  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
        }
        process.exit(1)
      }
      // In strict mode we treat warnings as errors.
      // Currently our schema has no warning distinction, but we keep the flag for future extension.
      if (strict) {
        // no-op placeholder
      }
      raw = result.data
    }

    const cityId = slugifyCityId(path.basename(absPath))
    cities.push({ cityId, data: raw as ItineraryData })
  }

  return cities
}
