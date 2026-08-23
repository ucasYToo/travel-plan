export async function copyText(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // file:// pages and restricted browser contexts may reject Clipboard API.
    }
  }

  if (typeof document === 'undefined') {
    throw new Error('Clipboard is unavailable')
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  textarea.style.pointerEvents = 'none'

  const activeElement = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null

  document.body.appendChild(textarea)
  textarea.select()

  try {
    const copied = typeof document.execCommand === 'function'
      && document.execCommand('copy')
    if (!copied) throw new Error('Clipboard copy failed')
  } finally {
    textarea.remove()
    activeElement?.focus()
  }
}
