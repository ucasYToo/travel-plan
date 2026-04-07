import { useEffect, useState } from 'react'
import { useMap } from 'react-leaflet'

export function ZoomIndicator() {
  const map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())

  useEffect(() => {
    const handleZoom = () => setZoom(map.getZoom())
    map.on('zoomend', handleZoom)
    return () => {
      map.off('zoomend', handleZoom)
    }
  }, [map])

  return (
    <div
      className="fixed top-3 left-3 sm:top-40 sm:right-3 sm:left-auto z-[1000] bg-white/90 px-2.5 py-1 rounded-full text-xs font-semibold text-[#2D3436] shadow-sm pointer-events-none"
    >
      z{zoom}
    </div>
  )
}
