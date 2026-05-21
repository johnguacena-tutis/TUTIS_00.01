'use client'

import { useState, Fragment } from 'react'
import { Eye, Pencil, UserPlus, Settings2, Archive, ArchiveRestore, ChevronDown } from 'lucide-react'
import { useTheme } from '@/components/layout/ThemeProvider'
import { can, type Permission } from '@/lib/permissions'
import Accordion from '@/components/ui/Accordion'
import StatusFilter, { offeringPills, type OfferingFilter } from '@/components/ui/StatusFilter'
import OfferingEnrolmentModal from './OfferingEnrolmentModal'
import ArchiveConfirmModal from '@/components/ui/ArchiveConfirmModal'
import type { Offering } from '../types'

const allActions: { label: string; icon: React.ReactNode; color: string; permission: Permission }[] = [
  { label: 'Manage',        icon: <Settings2 size={14} />, color: '#8b5cf6', permission: 'offerings.manage' },
  { label: 'Add Enrolment', icon: <UserPlus size={14} />,  color: '#10b981', permission: 'offerings.add_enrolment' },
  { label: 'Edit',          icon: <Pencil size={14} />,    color: '#f59e0b', permission: 'offerings.edit' },
  { label: 'View',          icon: <Eye size={14} />,       color: '#6366f1', permission: 'offerings.view' },
  { label: 'Archive',       icon: <Archive size={14} />,   color: '#ef4444', permission: 'offerings.archive' },
]

const archivedActions: { label: string; icon: React.ReactNode; color: string; permission: Permission }[] = [
  { label: 'View',      icon: <Eye size={14} />,            color: '#6366f1', permission: 'offerings.view' },
  { label: 'Unarchive', icon: <ArchiveRestore size={14} />, color: '#10b981', permission: 'offerings.unarchive' },
]

const completedActions: { label: string; icon: React.ReactNode; color: string; permission: Permission }[] = [
  { label: 'View', icon: <Eye size={14} />, color: '#6366f1', permission: 'offerings.view' },
]

type Filters = {
  code: string; title: string; number_enrolled: string
  start_timestamp: string; end_timestamp: string; trainer_name: string
}

const formatDate = (ts: string | null) => ts ? new Date(ts).toLocaleDateString('en-AU') : '—'
const now = new Date()

export default function OfferingsTable({
  offerings, counts,
}: {
  offerings: Offering[]
  counts: Record<OfferingFilter, number>
}) {
  const { role } = useTheme()
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [activeFilter, setActiveFilter] = useState<OfferingFilter>('active')

  const getActions = (o: Offering) => {
    if (o.archived) return archivedActions.filter((a) => can(role, a.permission))
    if (o.end_timestamp && new Date(o.end_timestamp) < now) return completedActions.filter((a) => can(role, a.permission))
    return allActions.filter((a) => can(role, a.permission))
  }

  const [enrolModal, setEnrolModal] = useState<{ title: string; code: string | null } | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<{ id: number; name: string } | null>(null)
  const [filters, setFilters] = useState<Filters>({ code: '', title: '', number_enrolled: '', start_timestamp: '', end_timestamp: '', trainer_name: '' })

  const toggle = (id: number) => setExpandedId((prev) => (prev === id ? null : id))
  const setFilter = (key: keyof Filters, value: string) => setFilters((prev) => ({ ...prev, [key]: value }))

  const statusFiltered = offerings.filter((o) => {
    if (activeFilter === 'archived')  return o.archived
    if (activeFilter === 'completed') return !o.archived && o.end_timestamp !== null && new Date(o.end_timestamp) < now
    if (activeFilter === 'active')    return !o.archived && (o.end_timestamp === null || new Date(o.end_timestamp) >= now)
    return true
  })

  const filtered = statusFiltered.filter((o) =>
    (o.code ?? '').toLowerCase().includes(filters.code.toLowerCase()) &&
    (o.title ?? '').toLowerCase().includes(filters.title.toLowerCase()) &&
    String(o.number_enrolled ?? '').includes(filters.number_enrolled) &&
    (o.start_timestamp ?? '').includes(filters.start_timestamp) &&
    (o.end_timestamp ?? '').includes(filters.end_timestamp) &&
    (o.trainer_name ?? '').toLowerCase().includes(filters.trainer_name.toLowerCase())
  )

  const inputStyle = {
    width: '100%', padding: '4px 8px', fontSize: '12px', borderRadius: '6px',
    border: '1px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-primary)', outline: 'none',
  }

  const columns = ['Code', 'Title', 'Enrolments', 'Actual Start', 'Actual End', 'Trainer']
  const filterKeys: { key: keyof Filters; placeholder: string }[] = [
    { key: 'code', placeholder: 'Search code...' },
    { key: 'title', placeholder: 'Search title...' },
    { key: 'number_enrolled', placeholder: 'Search...' },
    { key: 'start_timestamp', placeholder: 'Search date...' },
    { key: 'end_timestamp', placeholder: 'Search date...' },
    { key: 'trainer_name', placeholder: 'Search trainer...' },
  ]

  return (
    <>
      <div>
        <div className="mb-4 flex items-center justify-between">
          <StatusFilter pills={offeringPills} current={activeFilter} counts={counts}
            onChange={(f) => { setActiveFilter(f as OfferingFilter); setExpandedId(null) }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{filtered.length} records</p>
        </div>

        <div className="rounded-xl shadow" style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border)', overflowX: 'auto' }}>
          <table className="text-sm" style={{ minWidth: '750px', width: '100%' }}>
            <thead>
              <tr style={{ background: 'var(--bg-sub)', borderBottom: '1px solid var(--border)' }}>
                {columns.map((col, i) => (
                  <th key={i} className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>{col}</th>
                ))}
                <th style={{ position: 'sticky', right: 0, background: 'var(--bg-sub)', width: '40px' }} />
              </tr>
              <tr style={{ background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border)' }}>
                {filterKeys.map((col) => (
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
                <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: 'var(--text-muted)' }}>No offerings found</td></tr>
              ) : (
                filtered.map((o) => {
                  const isOpen = expandedId === o.offering_version_id
                  return (
                    <Fragment key={o.offering_version_id}>
                      <tr onClick={() => toggle(o.offering_version_id)}
                        style={{ borderBottom: isOpen ? 'none' : '1px solid var(--border)', cursor: 'pointer', background: isOpen ? 'var(--bg-sub)' : 'transparent' }}
                        onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.background = 'var(--bg-sidebar-hover)' }}
                        onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.background = 'transparent' }}>
                        <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{o.code ?? '—'}</td>
                        <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{o.title ?? '—'}</td>
                        <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{o.number_enrolled ?? 0}/{o.available_places ?? '∞'}</td>
                        <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{formatDate(o.start_timestamp)}</td>
                        <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{formatDate(o.end_timestamp)}</td>
                        <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{o.trainer_name ?? '—'}</td>
                        <td className="px-4 py-3 text-right" style={{ position: 'sticky', right: 0, background: isOpen ? 'var(--bg-sub)' : 'var(--bg-sidebar)' }}>
                          <ChevronDown size={16} style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                        </td>
                      </tr>
                      <tr style={{ background: 'var(--bg-sub)' }}>
                        <td colSpan={7} style={{ padding: 0, borderBottom: isOpen ? '1px solid var(--border)' : 'none' }}>
                          <Accordion open={isOpen}>
                            <div className="flex items-center gap-3 px-6 py-3">
                              {getActions(o).map((action) => (
                                <button key={action.label}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (action.permission === 'offerings.add_enrolment') setEnrolModal({ title: o.title ?? 'Offering', code: o.code })
                                    if (action.permission === 'offerings.archive') setArchiveTarget({ id: o.offering_id, name: o.title ?? 'this offering' })
                                  }}
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                                  style={{ color: action.color, border: `1px solid ${action.color}`, background: 'transparent' }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = action.color; e.currentTarget.style.color = '#fff' }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = action.color }}>
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
      </div>

      {enrolModal && <OfferingEnrolmentModal offeringTitle={enrolModal.title} offeringCode={enrolModal.code} onClose={() => setEnrolModal(null)} />}
      {archiveTarget && <ArchiveConfirmModal name={archiveTarget.name} onConfirm={() => console.log('Archive offering', archiveTarget.id)} onClose={() => setArchiveTarget(null)} />}
    </>
  )
}
