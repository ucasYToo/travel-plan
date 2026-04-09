import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import type { ItineraryData } from '../../src/types/index.js'

const IGNORED_DIRS = new Set([
  'node_modules',
  'dist',
  '.git',
  '.claude',
  'coverage',
  'test-results',
])

function copyDirSync(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true })
  const entries = fs.readdirSync(src, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.name === '.DS_Store') continue
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue
      copyDirSync(path.join(src, entry.name), path.join(dest, entry.name))
    } else {
      fs.copyFileSync(path.join(src, entry.name), path.join(dest, entry.name))
    }
  }
}

function generateDataIndexTs(cities: Record<string, ItineraryData>, defaultCity: string): string {
  const cityIds = Object.keys(cities)
  const cityEntries = cityIds
    .map((id) => `  ${JSON.stringify(id)}: (${JSON.stringify(cities[id])}) as ItineraryData,`)
    .join('\n')

  const cityOptions = cityIds
    .map((id) => {
      const data = cities[id]
      const name = data.metadata.title
      const flag = data.metadata.flag ?? ''
      return `  { id: ${JSON.stringify(id)}, name: ${JSON.stringify(name)}, flag: ${JSON.stringify(flag)} },`
    })
    .join('\n')

  return `import type { ItineraryData, CityOption } from '../types'

export const CITIES: Record<string, ItineraryData> = {
${cityEntries}
}

export const CITY_OPTIONS: CityOption[] = [
${cityOptions}
]

export function getCityData(cityId: string): ItineraryData | null {
  return CITIES[cityId] || null
}

export function getCityName(cityId: string): string {
  const city = CITY_OPTIONS.find(c => c.id === cityId)
  return city?.name || cityId
}

export const DEFAULT_CITY = ${JSON.stringify(defaultCity)}
`
}

export function createTempProject(
  cities: Record<string, ItineraryData>,
  defaultCity: string,
  originalRoot: string
): { projectDir: string; cleanup: () => void } {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'trip-packer-'))
  const projectDir = path.join(tmpDir, 'project')

  copyDirSync(originalRoot, projectDir)

  // Symlink node_modules to avoid massive copy
  const origNodeModules = path.join(originalRoot, 'node_modules')
  const destNodeModules = path.join(projectDir, 'node_modules')
  if (fs.existsSync(origNodeModules) && !fs.existsSync(destNodeModules)) {
    fs.symlinkSync(origNodeModules, destNodeModules, 'dir')
  }

  // Generate the dynamic data index
  const dataIndexPath = path.join(projectDir, 'src', 'data', 'index.ts')
  fs.writeFileSync(dataIndexPath, generateDataIndexTs(cities, defaultCity), 'utf-8')

  return {
    projectDir,
    cleanup: () => {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true })
      } catch {
        // ignore cleanup errors
      }
    },
  }
}
