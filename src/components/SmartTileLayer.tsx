import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { bundledTiles } from '../data/tiles/bundledTiles'
import { getTileSource } from '../utils/tileSource'

/**
 * 智能瓦片层：z10-z13 优先使用内联 base64 瓦片，未命中时回退到 CARTO CDN
 */
class HybridTileLayer extends L.TileLayer {
  private _source: { url: string; subdomains: string }

  constructor() {
    const source = getTileSource()
    super(source.url, {
      subdomains: source.subdomains,
      attribution: source.attribution,
      maxZoom: 19,
    })
    this._source = source
  }

  createTile(coords: L.Coords, done: (err?: Error, tile?: HTMLImageElement) => void): HTMLImageElement {
    const tile = document.createElement('img')
    const key = `${coords.z}/${coords.x}/${coords.y}`

    // 优先使用内联瓦片
    if (bundledTiles[key]) {
      tile.onload = () => done(undefined, tile)
      tile.onerror = () => done(new Error('Failed to load bundled tile'), tile)
      tile.src = bundledTiles[key]
      return tile
    }

    // 回退到 CARTO CDN
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

    tile.onload = () => done(undefined, tile)
    tile.onerror = () => done(new Error(`Failed to load tile ${key}`), tile)
    tile.crossOrigin = 'anonymous'
    tile.src = url

    return tile
  }
}

export function SmartTileLayer() {
  const map = useMap()

  useEffect(() => {
    const layer = new HybridTileLayer()
    map.addLayer(layer)
    return () => {
      map.removeLayer(layer)
    }
  }, [map])

  return null
}
