import { useState } from 'react'
import clsx from 'clsx'
import { CITY_OPTIONS } from '../data'
import styles from './MapControls.module.css'

export interface MapControlsSettings {
  showLocationNames: boolean
  showTransit: boolean
}

export interface MapControlsProps {
  currentCity: string
  settings: MapControlsSettings
  dayOptions: string[]
  activeDay: number | null
  onCityChange: (cityId: string) => void
  onResetView: () => void
  onSelectDay: (dayIndex: number) => void
  onSettingsChange: (settings: MapControlsSettings) => void
  viewMode: 'route' | 'full'
  onRouteView: () => void
  zoom?: number
}

export function MapControls({
  currentCity,
  settings,
  dayOptions: dayOpts,
  activeDay,
  onCityChange,
  onResetView,
  onSelectDay,
  onSettingsChange,
  viewMode,
  onRouteView,
  zoom
}: MapControlsProps): JSX.Element {
  const [daysExpanded, setDaysExpanded] = useState(true)

  const firstRow = (
    <div className={styles.firstRow}>
      <div className={styles.leftGroup}>
        {zoom !== undefined && (
          <span className={styles.zoomBadge}>
            z{zoom}
          </span>
        )}
        <select
          value={currentCity}
          onChange={(e) => onCityChange(e.target.value)}
          className={styles.citySelect}
        >
          {CITY_OPTIONS.map((city) => (
            <option key={city.id} value={city.id}>
              {city.flag} {city.name}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.viewToggle}>
        <button
          type="button"
          onClick={onResetView}
          data-active={viewMode === 'full' ? 'true' : undefined}
          className={clsx(styles.viewButton, {
            [styles.viewButtonActive]: viewMode === 'full',
            [styles.viewButtonInactive]: viewMode !== 'full',
          })}
        >
          全景
        </button>
        <button
          type="button"
          onClick={onRouteView}
          data-active={viewMode === 'route' ? 'true' : undefined}
          className={clsx(styles.viewButton, {
            [styles.viewButtonActive]: viewMode === 'route',
            [styles.viewButtonInactive]: viewMode !== 'route',
          })}
        >
          线路
        </button>
      </div>
      <div className={styles.settingsGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={settings.showLocationNames}
            onChange={(e) => onSettingsChange({ ...settings, showLocationNames: e.target.checked })}
            className={styles.checkbox}
          />
          地点名
        </label>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={settings.showTransit}
            onChange={(e) => onSettingsChange({ ...settings, showTransit: e.target.checked })}
            className={styles.checkbox}
          />
          交通
        </label>
      </div>
    </div>
  )

  const secondRow = (
    <div className={styles.secondRow}>
      {daysExpanded ? (
        <>
          <div className={styles.daysList}>
            {dayOpts.map((label, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelectDay(i)}
                className={clsx(styles.dayButton, {
                  [styles.dayButtonActive]: activeDay === i,
                  [styles.dayButtonInactive]: activeDay !== i,
                })}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setDaysExpanded(false)}
            className={styles.iconButton}
            aria-label="收起日期"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.iconSvg}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setDaysExpanded(true)}
          className={clsx(styles.iconButton, styles.mlAuto)}
          aria-label="展开日期"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.iconSvg}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop: Top Right Two Rows */}
      <div className={styles.desktopControls} data-testid="desktop-controls">
        {firstRow}
        {secondRow}
      </div>

      {/* Mobile: Top Two Rows */}
      <div className={styles.mobileTopControls} data-testid="mobile-top-controls">
        {firstRow}
        {secondRow}
      </div>
    </>
  )
}
