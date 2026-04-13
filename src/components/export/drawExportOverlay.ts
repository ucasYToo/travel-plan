import { getDayGroups } from './exportMapUtils'
import type { ItineraryData } from '../../types'
import type { ExportMode } from './utils'

interface DrawOverlayOptions {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  data: ItineraryData
  activeDay: number | null
  mode: ExportMode
}

function setFont(ctx: CanvasRenderingContext2D, size: number, weight: number | string = 400) {
  ctx.font = `${weight} ${size}px "PingFang SC", "Microsoft YaHei", sans-serif`
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function drawWatermark(ctx: CanvasRenderingContext2D, width: number, scale: number) {
  const markSize = Math.round(18 * scale)
  const gap = Math.round(6 * scale)
  const paddingX = Math.round(10 * scale)
  const paddingY = Math.round(5 * scale)
  const text = 'trip-packer'

  setFont(ctx, Math.round(11 * scale), 600)
  const textW = ctx.measureText(text).width
  const totalW = markSize + gap + textW + paddingX * 2
  const totalH = Math.max(markSize, Math.round(20 * scale)) + paddingY * 2
  const x = width - totalW - Math.round(14 * scale)
  const y = Math.round(14 * scale)

  // background pill
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  roundRect(ctx, x, y, totalW, totalH, Math.round(10 * scale))
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.06)'
  ctx.lineWidth = Math.max(1, Math.round(scale))
  ctx.stroke()

  // mark
  const markX = x + paddingX
  const markY = y + (totalH - markSize) / 2
  ctx.fillStyle = '#E07C96'
  roundRect(ctx, markX, markY, markSize, markSize, Math.round(6 * scale))
  ctx.fill()

  // "tp" inside mark
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  setFont(ctx, Math.round(8 * scale), 700)
  ctx.fillText('tp', markX + markSize / 2, markY + markSize / 2)

  // text
  const textX = markX + markSize + gap
  const textY = y + totalH / 2
  ctx.fillStyle = 'rgba(0,0,0,0.55)'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  setFont(ctx, Math.round(11 * scale), 600)
  ctx.fillText(text, textX, textY)
}

function drawMetaCard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number,
  data: ItineraryData,
) {
  const padding = Math.round(8 * scale)
  const innerGap = Math.round(4 * scale)
  const right = Math.round(12 * scale)
  const bottom = Math.round(12 * scale)
  const radius = Math.round(10 * scale)
  const sakuraDeep = '#E07C96'
  const budGreen = '#7AC4A0'
  const ink = '#2A2A2A'
  const borderSpring = '#FCE7EF'

  let contentW = 0
  let linesH = 0

  if (data.metadata.cityLabel) {
    setFont(ctx, Math.round(20 * scale), 400)
    const w = ctx.measureText(data.metadata.cityLabel).width
    contentW = Math.max(contentW, w)
    linesH += Math.round(20 * scale)
  }
  setFont(ctx, Math.round(12 * scale), 600)
  const titleW = ctx.measureText(data.metadata.title).width
  contentW = Math.max(contentW, titleW)
  linesH += Math.round(12 * scale)

  let seasonW = 0
  if (data.metadata.seasonLabel) {
    setFont(ctx, Math.round(8 * scale), 700)
    seasonW = ctx.measureText(data.metadata.seasonLabel).width + Math.round(14 * scale)
    contentW = Math.max(contentW, seasonW)
    linesH += Math.round(14 * scale)
  }

  const cardW = contentW + padding * 2
  const extraGap = (data.metadata.cityLabel ? innerGap : 0) + (data.metadata.seasonLabel ? innerGap : 0)
  const cardH = linesH + padding * 2 + extraGap
  const x = width - cardW - right
  const y = height - cardH - bottom

  ctx.fillStyle = 'rgba(255,255,255,0.96)'
  roundRect(ctx, x, y, cardW, cardH, radius)
  ctx.fill()
  ctx.strokeStyle = borderSpring
  ctx.lineWidth = Math.max(1, Math.round(scale))
  ctx.stroke()

  let ty = y + padding
  if (data.metadata.cityLabel) {
    ty += Math.round(18 * scale)
    ctx.fillStyle = sakuraDeep
    setFont(ctx, Math.round(20 * scale), 400)
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(data.metadata.cityLabel, x + padding, ty)
    ty += innerGap
  }

  ty += Math.round(12 * scale)
  ctx.fillStyle = ink
  setFont(ctx, Math.round(12 * scale), 600)
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(data.metadata.title, x + padding, ty)

  if (data.metadata.seasonLabel) {
    ty += innerGap + Math.round(6 * scale)
    const badgeH = Math.round(14 * scale)
    roundRect(ctx, x + padding, ty, seasonW, badgeH, badgeH / 2)
    ctx.fillStyle = budGreen
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    setFont(ctx, Math.round(8 * scale), 700)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(data.metadata.seasonLabel, x + padding + seasonW / 2, ty + badgeH / 2)
  }
}

function drawDayCard(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  bottomY: number,
  scale: number,
  day: ItineraryData['days'][number],
  groups: ReturnType<typeof getDayGroups>,
) {
  const padding = Math.round(10 * scale)
  const chipGap = Math.round(6 * scale)
  const chipPaddingX = Math.round(8 * scale)
  const chipHeight = Math.round(18 * scale)

  // Measure header
  setFont(ctx, Math.round(13 * scale), 700)
  const dayLabel = `Day ${day.day}`
  const dayLabelW = ctx.measureText(dayLabel).width
  setFont(ctx, Math.round(13 * scale), 500)
  const titleW = ctx.measureText(` ${day.title}`).width
  const dateW = day.date ? ctx.measureText(`  ${day.date}`).width : 0

  // Measure chips
  const chips: { text: string; width: number; color: string }[] = []
  let chipsW = 0
  groups.forEach((g, idx) => {
    setFont(ctx, Math.round(11 * scale), 500)
    const textW = ctx.measureText(g.name).width
    const w = textW + chipPaddingX * 2
    chips.push({ text: g.name, width: w, color: g.color })
    chipsW += w
    if (idx < groups.length - 1) chipsW += chipGap
  })

  const contentW = Math.max(dayLabelW + titleW + dateW, chipsW)
  const cardW = contentW + padding * 2
  const cardH = Math.round(24 * scale) + (groups.length ? Math.round(28 * scale) : 0) + padding
  const x = centerX - cardW / 2
  const y = bottomY - cardH

  // Card background
  ctx.fillStyle = 'rgba(255,255,255,0.98)'
  roundRect(ctx, x, y, cardW, cardH, Math.round(10 * scale))
  ctx.fill()
  ctx.strokeStyle = '#FCE7EF'
  ctx.lineWidth = Math.max(1, Math.round(scale))
  ctx.stroke()

  // Header text
  let tx = x + padding
  const ty = y + padding + Math.round(14 * scale)
  setFont(ctx, Math.round(13 * scale), 700)
  ctx.fillStyle = '#2A2A2A'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillText(dayLabel, tx, ty)
  tx += dayLabelW
  setFont(ctx, Math.round(13 * scale), 500)
  ctx.fillText(` ${day.title} `, tx, ty)
  if (day.date) {
    tx += titleW
    ctx.fillStyle = '#888888'
    ctx.fillText(`  ${day.date}`, tx, ty)
  }

  // Chips
  let cx = x + padding
  const cy = y + padding + Math.round(30 * scale)
  chips.forEach((chip) => {
    roundRect(ctx, cx, cy, chip.width, chipHeight, chipHeight / 2)
    ctx.fillStyle = chip.color
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    setFont(ctx, Math.round(11 * scale), 500)
    ctx.fillText(chip.text, cx + chip.width / 2, cy + chipHeight / 2)
    cx += chip.width + chipGap
  })
}

function estimateGroupLines(
  ctx: CanvasRenderingContext2D,
  groups: ReturnType<typeof getDayGroups>,
  cardW: number,
  padding: number,
  groupGap: number,
  maxLines: number,
): number {
  let lines = 1
  let currentLineW = 0
  groups.slice(0, 4).forEach((g) => {
    const w = ctx.measureText(g.name).width
    if (currentLineW && currentLineW + groupGap + w > cardW - padding * 2 && lines < maxLines) {
      lines++
      currentLineW = 0
    }
    currentLineW += currentLineW ? groupGap + w : w
  })
  if (groups.length > 4) {
    const extraW = ctx.measureText(`+${groups.length - 4}`).width
    if (currentLineW && currentLineW + groupGap + extraW > cardW - padding * 2 && lines < maxLines) {
      lines++
    }
  }
  return lines
}

function drawPanoCards(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number,
  data: ItineraryData,
) {
  const days = data.days
  const gap = Math.round(10 * scale)
  const padding = Math.round(8 * scale)
  const available = width - gap * (days.length + 1)
  const cardW = Math.max(Math.round(140 * scale), available / days.length)
  const startX = Math.round(gap)
  const bottomY = height - Math.round(12 * scale)
  const groupGap = Math.round(8 * scale)
  const maxLines = 4

  // Pre-compute max lines across all days for uniform height
  let maxNeededLines = 1
  days.forEach((day) => {
    const groups = getDayGroups(day, data)
    const lines = estimateGroupLines(ctx, groups, cardW, padding, groupGap, maxLines)
    maxNeededLines = Math.max(maxNeededLines, lines)
  })

  const headerH = Math.round(22 * scale)
  const lineH = Math.round(14 * scale)
  const cardH = headerH + maxNeededLines * lineH + padding * 2

  days.forEach((day, idx) => {
    const groups = getDayGroups(day, data)
    const x = startX + idx * (cardW + gap)
    const y = bottomY - cardH

    // Background
    ctx.fillStyle = 'rgba(255,255,255,0.98)'
    roundRect(ctx, x, y, cardW, cardH, Math.round(8 * scale))
    ctx.fill()
    ctx.strokeStyle = '#FCE7EF'
    ctx.lineWidth = Math.max(1, Math.round(scale))
    ctx.stroke()

    // Header
    setFont(ctx, Math.round(11 * scale), 700)
    const labelW = ctx.measureText(`Day ${day.day}`).width
    const maxTitleW = cardW - padding * 2 - labelW - Math.round(4 * scale)

    let title = ` ${day.title} `
    setFont(ctx, Math.round(11 * scale), 500)
    let titleW = ctx.measureText(title).width
    if (titleW > maxTitleW) {
      while (title.length > 1 && ctx.measureText(title.trim() + '… ').width > maxTitleW) {
        title = title.slice(0, -1)
      }
      title = title.trim() + '… '
      titleW = ctx.measureText(title).width
    }

    let tx = x + padding
    const ty = y + padding + Math.round(10 * scale)
    setFont(ctx, Math.round(11 * scale), 700)
    ctx.fillStyle = '#2A2A2A'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    ctx.fillText(`Day ${day.day}`, tx, ty)
    tx += labelW
    setFont(ctx, Math.round(11 * scale), 500)
    ctx.fillText(title, tx, ty)

    // Groups
    let gx = x + padding
    let gy = y + padding + Math.round(24 * scale)
    groups.slice(0, 4).forEach((g, i) => {
      const w = ctx.measureText(g.name).width
      if (gx !== x + padding && gx + w > x + cardW - padding) {
        gx = x + padding
        gy += lineH
      }
      ctx.fillStyle = g.color
      ctx.fillText(g.name, gx, gy)
      gx += w
      if (i < Math.min(groups.length, 4) - 1) {
        const sepW = ctx.measureText(' · ').width
        if (gx + sepW <= x + cardW - padding) {
          ctx.fillStyle = '#dddddd'
          ctx.fillText(' · ', gx, gy)
          gx += sepW
        } else {
          gx = x + padding
          gy += lineH
        }
      }
    })
    if (groups.length > 4) {
      const extra = `+${groups.length - 4}`
      const extraW = ctx.measureText(extra).width
      if (gx !== x + padding && gx + extraW > x + cardW - padding) {
        gx = x + padding
        gy += lineH
      }
      if (gy <= y + cardH - padding) {
        ctx.fillStyle = '#888888'
        ctx.fillText(extra, gx, gy)
      }
    }
  })
}

export function drawExportOverlay({ ctx, width, height, data, activeDay, mode }: DrawOverlayOptions) {
  const scale = width / 1280

  drawWatermark(ctx, width, scale)

  if (mode === 'day-horizontal') {
    drawMetaCard(ctx, width, height, scale, data)
    return
  }

  // Bottom gradient
  const gradH = Math.round(120 * scale)
  const grad = ctx.createLinearGradient(0, height - gradH, 0, height)
  grad.addColorStop(0, 'rgba(255,255,255,0)')
  grad.addColorStop(0.7, 'rgba(255,255,255,0.92)')
  grad.addColorStop(1, 'rgba(255,255,255,0.98)')
  ctx.fillStyle = grad
  ctx.fillRect(0, height - gradH, width, gradH)

  if (activeDay !== null) {
    const day = data.days[activeDay]
    if (!day) return
    const groups = getDayGroups(day, data)
    drawDayCard(ctx, width / 2, height - Math.round(8 * scale), scale, day, groups)
  } else {
    drawPanoCards(ctx, width, height, scale, data)
  }
}
