import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'
import path from 'node:path'

const CLI_ENTRY = path.resolve('cli/index.ts')
const FIXTURES = path.resolve('cli/__tests__/fixtures')

function run(args: string): { stdout: string; stderr: string; exitCode: number } {
  try {
    const stdout = execSync(`node --import tsx ${CLI_ENTRY} ${args}`, {
      encoding: 'utf-8',
      stdio: 'pipe',
    })
    return { stdout, stderr: '', exitCode: 0 }
  } catch (err: any) {
    return {
      stdout: err.stdout ?? '',
      stderr: err.stderr ?? '',
      exitCode: err.status ?? 1,
    }
  }
}

describe('trip-packer validate', () => {
  it('passes for valid city data', () => {
    const result = run(`validate -d ${path.join(FIXTURES, 'valid-city.json')}`)
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('All data files are valid')
  })

  it('fails for invalid city data', () => {
    const result = run(`validate -d ${path.join(FIXTURES, 'invalid-city.json')}`)
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('Validation failed')
  })

  it('fails when data file does not exist', () => {
    const result = run(`validate -d ${path.join(FIXTURES, 'nonexistent.json')}`)
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('not found')
  })
})
