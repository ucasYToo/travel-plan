#!/usr/bin/env node
import { Command } from 'commander'
import { buildCommand } from './commands/build.js'
import { validateCommand } from './commands/validate.js'

function collect(value: string, previous: string[]): string[] {
  return previous.concat([value])
}

const program = new Command('trip-packer')
  .description('Build standalone travel map HTML from JSON itinerary data')
  .version('1.0.0', '-v, --version')
  .configureHelp({ sortSubcommands: true })

program
  .command('build')
  .description('Build a single HTML file from itinerary JSON data')
  .requiredOption('-d, --data <path>', 'Path to city JSON file (repeatable)', collect, [])
  .option('-o, --output <path>', 'Output file or directory', './dist/index.html')
  .option('--default-city <cityId>', 'Default active city ID')
  .option('--strict', 'Treat validation warnings as errors', false)
  .option('--no-validate', 'Skip data validation')
  .action(buildCommand)

program
  .command('validate')
  .description('Validate itinerary JSON data without building')
  .requiredOption('-d, --data <path>', 'Path to city JSON file (repeatable)', collect, [])
  .option('--strict', 'Treat validation warnings as errors', false)
  .action(validateCommand)

program.parse()
