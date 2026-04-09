import fs from 'node:fs'
import path from 'node:path'

export function resolveOutput(userOutput: string): { dir: string; file: string } {
  const abs = path.resolve(userOutput)
  if (path.extname(abs) === '.html') {
    return { dir: path.dirname(abs), file: path.basename(abs) }
  }
  return { dir: abs, file: 'index.html' }
}

export function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}
