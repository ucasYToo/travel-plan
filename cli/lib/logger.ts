import pc from 'picocolors'

export const logger = {
  info: (msg: string) => console.log(pc.blue('INFO ') + msg),
  error: (msg: string, details?: unknown) => {
    console.error(pc.red('ERROR ') + msg)
    if (details) console.error(details)
  },
  success: (msg: string) => console.log(pc.green('SUCCESS ') + msg),
  warn: (msg: string) => console.warn(pc.yellow('WARN ') + msg),
}
