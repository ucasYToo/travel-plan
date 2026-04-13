import { Jimp } from 'jimp'

async function crop(file, out) {
  const img = await Jimp.read(file)
  const w = img.width
  const h = img.height
  const cropped = img.crop({ x: 0, y: h - 200, w, h: 200 })
  await cropped.write(out)
  console.log('Cropped', out, `${w}x${h}`)
}

await crop('/Users/niannian/seoul/export-downloads/panorama.png', '/Users/niannian/seoul/export-downloads/panorama-bottom.png')
await crop('/Users/niannian/seoul/export-downloads/day3-route.png', '/Users/niannian/seoul/export-downloads/day3-bottom.png')
