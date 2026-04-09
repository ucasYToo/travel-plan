import { describe, it, expect } from 'vitest'
import path from 'node:path'
import { resolveOutput } from '../lib/output.js'

describe('resolveOutput', () => {
  it('returns file name when path ends with .html', () => {
    const result = resolveOutput('./dist/map.html')
    expect(result.file).toBe('map.html')
    expect(result.dir).toBe(path.resolve('./dist'))
  })

  it('returns index.html when path is a directory', () => {
    const result = resolveOutput('./dist')
    expect(result.file).toBe('index.html')
    expect(result.dir).toBe(path.resolve('./dist'))
  })

  it('handles absolute paths', () => {
    const result = resolveOutput('/tmp/output.html')
    expect(result.file).toBe('output.html')
    expect(result.dir).toBe('/tmp')
  })
})
