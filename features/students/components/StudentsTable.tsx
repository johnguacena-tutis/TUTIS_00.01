'use client'

import { useState, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Pencil, Archive, ArchiveRestore, ChevronDown } from 'lucide-react'
import Accordion from '@/components/ui/Accordion'
import { useTheme } from '@/components/layout/ThemeProvider'
import { can, type Permission } from '@/lib/permissions'
import StatusFilter, { studentPills, type StudentFilter } from '@/components/ui/StatusFilter'
import ArchiveConfirmModal from '@/components/ui/ArchiveConfirmModal'
import type { Student } from '../types'

const allActions: { label: string; icon: React.ReactNode; color: string; permission: Permission }[] = [
  { label: 'View',    icon: <Eye size={14} />,     color: '#6366f1', permission: 'students.view' },
  { label: 'Edit',    icon: <Pencil size={14} />,  color: '#f59e0b', permission: 'students.edit' },
  { label: 'Archive', icon: <Archive size={14} />, color: '#ef4444', permission: 'students.archive' },
]

const archivedActions: { label: string; icon: React.ReactNode; color: string; permission: Permission }[] = [
  { label: 'View',      icon: <Eye size={14} />,            color: '#6366f1', permission: 'students.view' },
  { label: 'Unarchive', icon: <ArchiveRestore size={14} />, color: '#10b981', permission: 'students.unarchive' },
]

type Filters = {
  code: string
  first_name: string
  surname: string
  date_of_birth: string
  organisation_id: string
  position_id: string
}

export default function StudentsTable({
  students,
  counts,
}: {
  students: Student[]
  counts: Record<StudentFilter, number>
}) {
  const { role } = useTheme()
  const router = useRouter()

  const getActions = (s: Student) => {
    const base = s.archived ? archivedActions : allActions
    return base.filter((a) => can(role, a.permission))
  }
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<{ id: number; name: string } | null>(null)
  const [activeFilter, setActiveFilter] = useState<StudentFilter>('active')
  const [filters, setFilters] = useState<Filters>({
    code: '', first_name: '', surname: '', date_of_birth: '', organisation_id: '', position_id: '',
  })

  const toggle = (id: number) => setExpandedId((prev) => (prev === id ? null : id))
  const setFilter = (key: keyof Filters, value: string) => setFilters((prev) => ({ ...prev, [key]: value }))

  const statusFiltered = students.filter((s) => {
    if (activeFilter === 'active')   return s.status === 'ACTIVE'   && !s.archived
    if (activeFilter === 'inactive') return s.status === 'INACTIVE' && !s.archived
    if (activeFilter === 'archived') return s.archived
    return true
  })

  const filtered = statusFiltered.filter((s) =>
    (s.code ?? '').toLowerCase().includes(filters.code.toLowerCase()) &&
    (s.first_name ?? '').toLowerCase().includes(filters.first_name.toLowerCase()) &&
    (s.surname ?? '').toLowerCase().includes(filters.surname.toLowerCase()) &&
    (s.date_of_birth ?? '').includes(filters.date_of_birth) &&
    String(s.organisation_id ?? '').includes(filters.organisation_id) &&
    String(s.position_id ?? '').includes(filters.position_id)
  )

  const inputStyle = {
    width: '100%', padding: '4px 8px', fontSize: '12px', borderRadius: '6px',
    border: '1px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-primary)', outline: 'none',
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <StatusFilter
          pills={studentPills}
          current={activeFilter}
          counts={counts}
          onChange={(f) => { setActiveFilter(f as StudentFilter); setExpandedId(null) }}
        />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{filtered.length} records</p>
      </div>

      <div className="rounded-xl shadow" style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border)', overflowX: 'auto' }}>
        <table className="text-sm" style={{ minWidth: '700px', width: '100%' }}>
          <thead>
            <tr style={{ background: 'var(--bg-sub)', borderBottom: '1px solid var(--border)' }}>
              {['Code', 'First Name', 'Surname', 'Date of Birth', 'Organisation', 'Position'].map((col, i) => (
                <th key={i} className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>{col}</th>
              ))}
              <th className="px-4 py-3" style={{ position: 'sticky', right: 0, background: 'var(--bg-sub)', width: '40px' }} />
            </tr>
            <tr style={{ background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border)' }}>
              {([
                { key: 'code', placeholder: 'Search code...' },
                { key: 'first_name', placeholder: 'Search first name...' },
                { key: 'surname', placeholder: 'Search surname...' },
                { key: 'date_of_birth', placeholder: 'Search DOB...' },
                { key: 'organisation_id', placeholder: 'Search org...' },
                { key: 'position_id', placeholder: 'Search position...' },
              ] as { key: keyof Filters; placeholder: string }[]).map((col) => (
                <td key={col.key} className="px-3 py-2">
                  <input type="text" placeholder={col.placeholder} value={filters[col.key]}
                    onChange={(e) => setFilter(col.key, e.target.value)} style={inputStyle} />
                </td>
              ))}
              <td style={{ position: 'sticky', right: 0, background: 'var(--bg-sidebar)' }} />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: 'var(--text-muted)' }}>No students found</td></tr>
            ) : (
              filtered.map((s) => {
                const isOpen = expandedId === s.person_id
                return (
                  <Fragment key={s.person_id}>
                    <tr
                      onClick={() => toggle(s.person_id)}
                      style={{ borderBottom: isOpen ? 'none' : '1px solid var(--border)', cursor: 'pointer', background: isOpen ? 'var(--bg-sub)' : 'transparent' }}
                      onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.background = 'var(--bg-sidebar-hover)' }}
                      onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.background = 'transparent' }}
                    >
                      <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{s.code ?? '—'}</td>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{s.first_name ?? '—'}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{s.surname ?? '—'}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{s.date_of_birth ? new Date(s.date_of_birth).toLocaleDateString('en-AU') : '—'}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{s.organisation_id ?? '—'}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{s.position_id ?? '—'}</td>
                      <td className="px-4 py-3 text-right" style={{ position: 'sticky', right: 0, background: isOpen ? 'var(--bg-sub)' : 'var(--bg-sidebar)' }}>
                        <ChevronDown size={16} style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                      </td>
                    </tr>
                    <tr style={{ background: 'var(--bg-sub)' }}>
                      <td colSpan={7} style={{ padding: 0, borderBottom: isOpen ? '1px solid var(--border)' : 'none' }}>
                        <Accordion open={isOpen}>
                          <div className="flex items-center gap-3 px-6 py-3">
                            {getActions(s).map((action) => (
                              <button
                                key={action.label}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (action.permission === 'students.view') router.push(`/students/${s.person_id}`)
                                  if (action.permission === 'students.edit') router.push(`/students/${s.person_id}?edit=true`)
                                  if (action.permission === 'students.archive') setArchiveTarget({
                                    id: s.person_id,
                                    name: [s.first_name, s.surname].filter(Boolean).join(' ') || 'this student',
                                  })
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                                style={{ color: action.color, border: `1px solid ${action.color}`, background: 'transparent' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = action.color; e.currentTarget.style.color = '#fff' }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = action.color }}
                              >
                                {action.icon}{action.label}
                              </button>
                            ))}
                          </div>
                        </Accordion>
                      </td>
                    </tr>
                  </Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {archiveTarget && (
        <ArchiveConfirmModal
          name={archiveTarget.name}
          onConfirm={() => console.log('Archive student', archiveTarget.id)}
          onClose={() => setArchiveTarget(null)}
        />
      )}
    </div>
  )
}
