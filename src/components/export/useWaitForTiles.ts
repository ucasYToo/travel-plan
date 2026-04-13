import { useRef, useCallback } from 'react'

export function useWaitForTiles() {
  const pendingTiles = useRef<Set<HTMLImageElement>>(new Set())

  const trackTile = useCallback((img: HTMLImageElement) => {
    if (img.complete && img.naturalWidth > 0) return
    pendingTiles.current.add(img)
    const onDone = () => {
      pendingTiles.current.delete(img)
    }
    img.addEventListener('load', onDone, { once: true })
    img.addEventListener('error', onDone, { once: true })
  }, [])

  const waitForTiles = useCallback((timeout = 8000): Promise<void> => {
    const start = performance.now()
    return new Promise((resolve) => {
      const check = () => {
        if (pendingTiles.current.size === 0) {
          resolve()
          return
        }
        if (performance.now() - start > timeout) {
          resolve()
          return
        }
        requestAnimationFrame(check)
      }
      check()
    })
  }, [])

  const clearTiles = useCallback(() => {
    pendingTiles.current.clear()
  }, [])

  return { trackTile, waitForTiles, clearTiles }
}
