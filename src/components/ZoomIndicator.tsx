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
      style={{
        position: 'absolute',
        top: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: 'rgba(255,255,255,0.9)',
        padding: '4px 10px',
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 600,
        color: '#2D3436',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        pointerEvents: 'none',
      }}
    >
      z{zoom}
    </div>
  )
}
