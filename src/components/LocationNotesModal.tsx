import type { NoteItem, NoteCategory } from '../types'

const CATEGORY_ICON: Record<NoteCategory, string> = {
  food: '🍽️',
  shopping: '🛍️',
  tips: '💡',
  other: '📝'
}

const CATEGORY_NAME: Record<NoteCategory, string> = {
  food: '吃什么',
  shopping: '买什么',
  tips: '注意事项',
  other: '备注'
}

export interface LocationNotesModalProps {
  open: boolean
  onClose: () => void
  locationName: string
  notes: NoteItem[]
}

export function LocationNotesModal({ open, onClose, locationName, notes }: LocationNotesModalProps): JSX.Element | null {
  if (!open || !notes || notes.length === 0) return null

  // 按分类分组
  const groupedNotes = notes.reduce<Record<NoteCategory, NoteItem[]>>((acc, note) => {
    if (!acc[note.category]) {
      acc[note.category] = []
    }
    acc[note.category].push(note)
    return acc
  }, { food: [], shopping: [], tips: [], other: [] })

  const categories = (Object.keys(groupedNotes) as NoteCategory[]).filter(
    cat => groupedNotes[cat].length > 0
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">地点备注</h2>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition text-white text-sm"
              aria-label="关闭"
            >
              ✕
            </button>
          </div>
          <p className="mt-1 text-sm opacity-90">{locationName}</p>
        </div>

        {/* Notes Content */}
        <div className="px-5 py-4 space-y-4">
          {categories.map((category) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <span>{CATEGORY_ICON[category]}</span>
                <span>{CATEGORY_NAME[category]}</span>
              </div>
              <div className="space-y-2">
                {groupedNotes[category].map((note, idx) => (
                  <div
                    key={idx}
                    className="pl-4 py-2 border-l-2 border-gray-200 text-sm text-gray-700 leading-relaxed"
                  >
                    {note.content}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 text-center">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
