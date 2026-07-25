import styles from './ExportButton.module.css'

interface ExportButtonProps {
  onClick: () => void
  disabled?: boolean
}

export function ExportButton({ onClick, disabled = false }: ExportButtonProps) {
  return (
    <button
      type="button"
      className={styles.exportButton}
      onClick={onClick}
      disabled={disabled}
      aria-label={disabled ? '正在导出' : '导出'}
      title={disabled ? '正在生成图片…' : '导出图片'}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    </button>
  )
}
