import { useState, useRef, useCallback, useEffect, type CSSProperties } from 'react'

interface BottomSheetProps {
  snapPoints: string[]
  activeSnap: number
  onSnapChange: (index: number) => void
  children: React.ReactNode
  showBackdrop?: boolean
  onClose?: () => void
}

function snapToPixels(snap: string, viewportHeight: number): number {
  const calcMatch = snap.match(/^calc\((\d+)vh\s*-\s*(\d+)px\)$/)
  if (calcMatch) {
    return viewportHeight * (parseFloat(calcMatch[1]) / 100) - parseFloat(calcMatch[2])
  }
  const match = snap.match(/^([\d.]+)(px|vh)$/)
  if (!match) return 100
  const [, value, unit] = match
  const num = parseFloat(value)
  return unit === 'vh' ? viewportHeight * (num / 100) : num
}

export function BottomSheet({ snapPoints, activeSnap, onSnapChange, children, showBackdrop = true, onClose }: BottomSheetProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [height, setHeight] = useState(0)

  const dragStartRef = useRef(0)
  const dragStartHeightRef = useRef(0)
  const lastMoveTimeRef = useRef(0)
  const lastMoveYRef = useRef(0)
  const velocityRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const getViewportHeight = useCallback(() => {
    return window.innerHeight || document.documentElement.clientHeight
  }, [])

  useEffect(() => {
    const vh = getViewportHeight()
    setHeight(snapToPixels(snapPoints[activeSnap] || snapPoints[0], vh))
  }, [activeSnap, snapPoints, getViewportHeight])

  useEffect(() => {
    const handleResize = () => {
      const vh = getViewportHeight()
      setHeight(snapToPixels(snapPoints[activeSnap], vh))
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [activeSnap, snapPoints, getViewportHeight])

  const currentMaxHeight = snapToPixels(snapPoints[snapPoints.length - 1], getViewportHeight())
  const currentMinHeight = snapToPixels(snapPoints[0], getViewportHeight())

  const clampHeight = useCallback((h: number) => {
    return Math.max(currentMinHeight, Math.min(currentMaxHeight, h))
  }, [currentMinHeight, currentMaxHeight])

  const findNearestSnap = useCallback((h: number): number => {
    const vh = getViewportHeight()
    let minDist = Infinity
    let nearest = 0
    for (let i = 0; i < snapPoints.length; i++) {
      const snapPx = snapToPixels(snapPoints[i], vh)
      const dist = Math.abs(h - snapPx)
      if (dist < minDist) {
        minDist = dist
        nearest = i
      }
    }
    return nearest
  }, [snapPoints, getViewportHeight])

  const animateToSnap = useCallback((index: number) => {
    const vh = getViewportHeight()
    const snapHeight = snapToPixels(snapPoints[index], vh)
    setHeight(snapHeight)
    setDragOffset(0)
    onSnapChange(index)
    if (index === 0 && onClose) {
      onClose()
    }
  }, [getViewportHeight, snapPoints, onSnapChange, onClose])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true)
    setDragOffset(0)
    dragStartRef.current = e.clientY
    dragStartHeightRef.current = height
    lastMoveTimeRef.current = Date.now()
    lastMoveYRef.current = e.clientY
    velocityRef.current = 0
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [height])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    const now = Date.now()
    const deltaY = e.clientY - dragStartRef.current
    const newHeight = clampHeight(dragStartHeightRef.current - deltaY)
    setDragOffset(newHeight - dragStartHeightRef.current)
    setHeight(newHeight)

    const dt = now - lastMoveTimeRef.current
    if (dt > 0) {
      velocityRef.current = (e.clientY - lastMoveYRef.current) / dt
    }
    lastMoveTimeRef.current = now
    lastMoveYRef.current = e.clientY
  }, [isDragging, clampHeight])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    setIsDragging(false)

    const velocity = velocityRef.current
    const newHeight = clampHeight(dragStartHeightRef.current + dragOffset)
    const nearestSnap = findNearestSnap(newHeight)

    const vh = getViewportHeight()
    const snapPx = snapToPixels(snapPoints[nearestSnap], vh)
    const dist = newHeight - snapPx
    const velocityThreshold = 0.4

    let targetSnap = nearestSnap
    if (Math.abs(velocity) > velocityThreshold) {
      if (velocity > 0 && dist >= 0 && nearestSnap > 0) {
        targetSnap = nearestSnap - 1
      } else if (velocity < 0 && dist <= 0 && nearestSnap < snapPoints.length - 1) {
        targetSnap = nearestSnap + 1
      }
    }

    animateToSnap(targetSnap)
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
  }, [isDragging, dragOffset, clampHeight, findNearestSnap, getViewportHeight, snapPoints, animateToSnap])

  const handlePointerCancel = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    setIsDragging(false)
    animateToSnap(activeSnap)
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
  }, [isDragging, activeSnap, animateToSnap])

  const isMinSnap = activeSnap === 0 && height <= currentMinHeight + 2

  const containerStyle: CSSProperties = {
    height: `${height}px`,
    transition: isDragging ? 'none' : 'height 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
    touchAction: 'none',
  }

  const backdropStyle: CSSProperties = {
    opacity: isMinSnap ? 0 : 1,
    transition: isDragging ? 'none' : 'opacity 0.35s ease',
    pointerEvents: isMinSnap ? 'none' : 'auto',
  }

  return (
    <div className="sm:hidden">
      {showBackdrop && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          style={backdropStyle}
          onClick={() => animateToSnap(0)}
          aria-hidden="true"
        />
      )}

      <div
        ref={containerRef}
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#F5F7FA] rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.14)] overflow-hidden will-change-transform"
        style={containerStyle}
      >
        <div
          className="flex items-center justify-center h-10 cursor-grab active:cursor-grabbing select-none touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          <div className="w-10 h-1 rounded-full bg-gray-400/60" />
        </div>

        <div className="overflow-y-auto" style={{ height: `calc(100% - 40px)` }}>
          {children}
        </div>
      </div>
    </div>
  )
}
