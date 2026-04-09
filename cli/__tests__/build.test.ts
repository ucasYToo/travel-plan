import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'

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

describe('trip-packer build', () => {
  it('builds a single city HTML', () => {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-build-test-'))
    const outFile = path.join(outDir, 'map.html')

    const result = run(
      `build -d ${path.join(FIXTURES, 'valid-city.json')} -o ${outFile}`
    )

    expect(result.exitCode).toBe(0)
    expect(fs.existsSync(outFile)).toBe(true)
    const html = fs.readFileSync(outFile, 'utf-8')
    expect(html).toContain('<!DOCTYPE html>')

    fs.rmSync(outDir, { recursive: true, force: true })
  })

  it('builds a multi-city HTML', () => {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-build-test-'))
    const outFile = path.join(outDir, 'multi.html')

    // Use the same valid fixture twice with different file names by copying
    const cityA = path.join(outDir, 'tokyo.json')
    const cityB = path.join(outDir, 'osaka.json')
    fs.copyFileSync(path.join(FIXTURES, 'valid-city.json'), cityA)
    fs.copyFileSync(path.join(FIXTURES, 'valid-city.json'), cityB)

    const result = run(`build -d ${cityA} -d ${cityB} -o ${outFile}`)

    expect(result.exitCode).toBe(0)
    expect(fs.existsSync(outFile)).toBe(true)
    const html = fs.readFileSync(outFile, 'utf-8')
    expect(html).toContain('<!DOCTYPE html>')

    fs.rmSync(outDir, { recursive: true, force: true })
  })

  it('fails when default-city is not found', () => {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-build-test-'))
    const outFile = path.join(outDir, 'map.html')

    const result = run(
      `build -d ${path.join(FIXTURES, 'valid-city.json')} --default-city nowhere -o ${outFile}`
    )

    expect(result.exitCode).toBe(2)
    expect(result.stderr).toContain('Default city "nowhere" not found')

    fs.rmSync(outDir, { recursive: true, force: true })
  })

  it('fails when validation fails', () => {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-build-test-'))
    const outFile = path.join(outDir, 'map.html')

    const result = run(
      `build -d ${path.join(FIXTURES, 'invalid-city.json')} -o ${outFile}`
    )

    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('Validation failed')

    fs.rmSync(outDir, { recursive: true, force: true })
  })
})
