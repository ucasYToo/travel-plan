import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { bundledTiles } from '../../data/tiles/bundledTiles'
import { getTileSource, getChinaTileSource } from '../../utils/tileSource'

class TrackedHybridTileLayer extends L.TileLayer {
  private _source: { url: string; subdomains: string }
  private _trackTile?: (img: HTMLImageElement) => void

  constructor(country?: string, trackTile?: (img: HTMLImageElement) => void) {
    const source = country === 'CN' ? getChinaTileSource() : getTileSource()
    super(source.url, {
      subdomains: source.subdomains,
      attribution: source.attribution,
      maxZoom: 19,
    })
    this._source = source
    this._trackTile = trackTile
  }

  createTile(coords: L.Coords, done: (err?: Error, tile?: HTMLImageElement) => void): HTMLImageElement {
    const tile = document.createElement('img')
    const key = `${coords.z}/${coords.x}/${coords.y}`

    const finish = () => done(undefined, tile)
    const fail = () => done(new Error('tile load failed'), tile)

    tile.onload = finish
    tile.onerror = fail

    if (bundledTiles[key]) {
      tile.src = bundledTiles[key]
    } else {
      const retina = L.Browser.retina && coords.z <= (this.options.maxZoom ?? 19) ? '@2x' : ''
      let url = this._source.url
        .replace('{z}', String(coords.z))
        .replace('{x}', String(coords.x))
        .replace('{y}', String(coords.y))
        .replace('{r}', retina)
      if (this._source.subdomains) {
        const subdomains = this._source.subdomains
        const index = (coords.x + coords.y) % subdomains.length
        url = url.replace('{s}', subdomains[index])
      }
      tile.crossOrigin = 'anonymous'
      tile.src = url
    }

    this._trackTile?.(tile)
    return tile
  }
}

export function ExportSmartTileLayer({
  country,
  trackTile,
}: {
  country?: string
  trackTile?: (img: HTMLImageElement) => void
}) {
  const map = useMap()

  useEffect(() => {
    const layer = new TrackedHybridTileLayer(country, trackTile)
    map.addLayer(layer)
    return () => {
      map.removeLayer(layer)
    }
  }, [map, country, trackTile])

  return null
}
