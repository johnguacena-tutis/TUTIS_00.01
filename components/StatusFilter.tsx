'use client'

export type StudentFilter = 'all' | 'active' | 'inactive' | 'archived'
export type OfferingFilter = 'all' | 'active' | 'completed' | 'archived'

type FilterValue = string

interface Pill {
  label: string
  value: FilterValue
}

export default function StatusFilter({
  pills,
  current,
  counts,
  onChange,
}: {
  pills: Pill[]
  current: FilterValue
  counts: Record<FilterValue, number>
  onChange: (f: FilterValue) => void
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {pills.map((pill) => {
        const active = current === pill.value
        return (
          <button
            key={pill.value}
            onClick={() => onChange(pill.value)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition"
            style={{
              background: active ? '#7c3aed' : 'var(--bg-sub)',
              color: active ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${active ? '#7c3aed' : 'var(--border)'}`,
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.background = 'var(--bg-sidebar-hover)'
                e.currentTarget.style.borderColor = '#7c3aed'
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.background = 'var(--bg-sub)'
                e.currentTarget.style.borderColor = 'var(--border)'
              }
            }}
          >
            {pill.label}
            {active && (
              <span
                className="rounded-full px-1.5 py-0.5 text-xs font-semibold"
                style={{ background: 'rgba(255,255,255,0.25)', color: '#fff' }}
              >
                {counts[pill.value] ?? 0}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export const studentPills: Pill[] = [
  { label: 'Active',   value: 'active' },
  { label: 'Archived', value: 'archived' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'All',      value: 'all' },
]

export const offeringPills: Pill[] = [
  { label: 'Active',    value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Archived',  value: 'archived' },
  { label: 'All',       value: 'all' },
]
