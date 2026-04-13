import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useWaitForTiles } from './useWaitForTiles'

describe('useWaitForTiles', () => {
  it('resolves immediately when no tiles are pending', async () => {
    const { result } = renderHook(() => useWaitForTiles())
    await expect(result.current.waitForTiles(1000)).resolves.toBeUndefined()
  })

  it('resolves after tracked tiles load', async () => {
    const { result } = renderHook(() => useWaitForTiles())
    const img = document.createElement('img')
    // incomplete image
    Object.defineProperty(img, 'complete', { value: false, configurable: true })
    result.current.trackTile(img)

    const promise = result.current.waitForTiles(1000)
    img.dispatchEvent(new Event('load'))
    await expect(promise).resolves.toBeUndefined()
  })

  it('resolves after timeout even if tile never loads', async () => {
    const { result } = renderHook(() => useWaitForTiles())
    const img = document.createElement('img')
    Object.defineProperty(img, 'complete', { value: false, configurable: true })
    result.current.trackTile(img)

    const promise = result.current.waitForTiles(100)
    await expect(promise).resolves.toBeUndefined()
  }, 5000)
})
