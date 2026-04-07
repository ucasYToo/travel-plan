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
  // Handle calc(100vh - 72px)
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
  const containerRef = useRef<HTMLDivElement>(null)

  const getViewportHeight = useCallback(() => {
    return window.innerHeight || document.documentElement.clientHeight
  }, [])

  // Initialize height from snapPoints
  useEffect(() => {
    const vh = getViewportHeight()
    setHeight(snapToPixels(snapPoints[activeSnap] || snapPoints[0], vh))
  }, [activeSnap, snapPoints, getViewportHeight])

  // Recalculate on resize
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

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true)
    setDragOffset(0)
    dragStartRef.current = e.clientY
    dragStartHeightRef.current = height
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [height])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    const deltaY = e.clientY - dragStartRef.current
    // Dragging up (negative deltaY) increases height
    // Dragging down (positive deltaY) decreases height
    const newHeight = clampHeight(dragStartHeightRef.current - deltaY)
    setDragOffset(newHeight - dragStartHeightRef.current)
    setHeight(newHeight)
  }, [isDragging, clampHeight])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    setIsDragging(false)

    const newHeight = clampHeight(dragStartHeightRef.current + dragOffset)
    const nearestSnap = findNearestSnap(newHeight)

    const vh = getViewportHeight()
    const snapHeight = snapToPixels(snapPoints[nearestSnap], vh)
    setHeight(snapHeight)
    setDragOffset(0)
    onSnapChange(nearestSnap)

    // If collapsed to minimum and onClose provided, call it
    if (nearestSnap === 0 && onClose) {
      onClose()
    }

    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
  }, [isDragging, dragOffset, clampHeight, findNearestSnap, getViewportHeight, snapPoints, onSnapChange, onClose])

  const isMinSnap = activeSnap === 0

  const containerStyle: CSSProperties = {
    height: `${height}px`,
    transition: isDragging ? 'none' : 'height 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
    touchAction: 'none',
  }

  return (
    <div className="sm:hidden">
      {/* Backdrop */}
      {showBackdrop && !isMinSnap && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => {
            onSnapChange(0)
            onClose?.()
          }}
          aria-hidden="true"
        />
      )}

      {/* Sheet */}
      <div
        ref={containerRef}
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#F5F7FA] rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.12)] overflow-hidden"
        style={containerStyle}
      >
        {/* Drag handle */}
        <div
          className="flex items-center justify-center h-10 cursor-grab active:cursor-grabbing select-none touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div className="w-10 h-1 rounded-full bg-gray-400/60" />
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ height: `calc(100% - 40px)` }}>
          {children}
        </div>
      </div>
    </div>
  )
}
