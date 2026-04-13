#!/usr/bin/env node
import { Command } from 'commander'
import { buildCommand } from './commands/build.js'
import { validateCommand } from './commands/validate.js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

function getVersion(): string {
  try {
    const rootDir = dirname(fileURLToPath(import.meta.url))
    const pkg = JSON.parse(readFileSync(resolve(rootDir, '../../../package.json'), 'utf-8'))
    return pkg.version ?? '0.0.0'
  } catch {
    return '0.0.0'
  }
}

function collect(value: string, previous: string[]): string[] {
  return previous.concat([value])
}

const program = new Command('trip-packer')
  .description('Build standalone travel map HTML from JSON itinerary data')
  .version(getVersion(), '-v, --version')
  .configureHelp({ sortSubcommands: true })

program
  .command('build')
  .description('Build a single HTML file from itinerary JSON data')
  .requiredOption('-d, --data <path>', 'Path to city JSON file (repeatable)', collect, [])
  .option('-o, --output <path>', 'Output file or directory', './dist/index.html')
  .option('--default-city <cityId>', 'Default active city ID')
  .option('--strict', 'Treat validation warnings as errors', false)
  .option('--no-validate', 'Skip data validation')
  .option('--images', 'Also generate panorama and itinerary-vertical PNG images', false)
  .action(buildCommand)

program
  .command('validate')
  .description('Validate itinerary JSON data without building')
  .requiredOption('-d, --data <path>', 'Path to city JSON file (repeatable)', collect, [])
  .option('--strict', 'Treat validation warnings as errors', false)
  .action(validateCommand)

program.parse()
