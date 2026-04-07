import { useEffect, useState } from 'react'
import { useMap } from 'react-leaflet'
import styles from './ZoomIndicator.module.css'

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
    <div className={styles.container}>
      z{zoom}
    </div>
  )
}
