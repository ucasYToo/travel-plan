import { loadCityData } from '../lib/data-loader.js'
import { logger } from '../lib/logger.js'

export interface ValidateOptions {
  data: string[]
  strict?: boolean
}

export function validateCommand(options: ValidateOptions): void {
  logger.info('Validating itinerary data...')
  loadCityData(options.data, false, !!options.strict)
  logger.success('All data files are valid.')
}
