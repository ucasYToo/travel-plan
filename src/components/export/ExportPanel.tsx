import { useState } from 'react'
import clsx from 'clsx'
import styles from './ExportPanel.module.css'
import type { ExportMode } from './utils'
import { MODE_LABELS } from './utils'

interface ExportPanelProps {
  open: boolean
  onClose: () => void
  onExport: (mode: ExportMode, days: number[]) => void
  isExporting: boolean
  dayCount: number
}

const DAY_MODES: ExportMode[] = ['day-horizontal', 'day-vertical']

export function ExportPanel({ open, onClose, onExport, isExporting, dayCount }: ExportPanelProps) {
  const [selectedDays, setSelectedDays] = useState<number[]>([])

  if (!open) return null

  const toggleDay = (index: number) => {
    setSelectedDays((prev) =>
      prev.includes(index) ? prev.filter((d) => d !== index) : [...prev, index].sort((a, b) => a - b)
    )
  }

  const selectAll = () => {
    setSelectedDays(Array.from({ length: dayCount }, (_, i) => i))
  }

  const clearAll = () => {
    setSelectedDays([])
  }

  const allSelected = selectedDays.length === dayCount && dayCount > 0

  const handleExport = (mode: ExportMode) => {
    if (DAY_MODES.includes(mode) && selectedDays.length === 0) return
    onExport(mode, DAY_MODES.includes(mode) ? selectedDays : [])
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>导出图片</h3>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>选择日期</span>
            {dayCount > 0 && (
              <button type="button" className={styles.textBtn} onClick={allSelected ? clearAll : selectAll}>
                {allSelected ? '取消全选' : '全选'}
              </button>
            )}
          </div>
          <div className={styles.dayPills}>
            {Array.from({ length: dayCount }, (_, i) => {
              const selected = selectedDays.includes(i)
              return (
                <button
                  key={i}
                  type="button"
                  className={clsx(styles.dayPill, selected && styles.dayPillActive)}
                  onClick={() => toggleDay(i)}
                >
                  Day{i + 1}
                </button>
              )
            })}
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionTitle}>选择格式</span>
          <div className={styles.options}>
            {(['panorama', 'day-horizontal', 'day-vertical', 'itinerary-vertical'] as ExportMode[]).map((mode) => {
              const needsDay = DAY_MODES.includes(mode)
              const disabled = isExporting || (needsDay && selectedDays.length === 0)
              return (
                <button
                  key={mode}
                  type="button"
                  disabled={disabled}
                  className={clsx(styles.optionBtn, disabled && styles.optionDisabled)}
                  onClick={() => handleExport(mode)}
                >
                  <span className={styles.optionLabel}>{MODE_LABELS[mode]}</span>
                  {needsDay && selectedDays.length === 0 && (
                    <span className={styles.optionHint}>请先选择某一天</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <button type="button" className={styles.closeBtn} onClick={onClose}>
          取消
        </button>
      </div>
    </div>
  )
}
