'use client'

import { useState, useEffect, useRef } from 'react'
import { Star, Settings, ChevronDown, Settings2, X, ArrowUpRight, Trash2 } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Accordion from '@/components/ui/Accordion'
import { useWidgetSettings } from '../hooks/useWidgetSettings'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { db: { schema: 'enterprise_uat' } }
)

type WidgetType = 'students' | 'offerings'

type Result = { id: number; cells: string[] }

const COLUMNS: Record<WidgetType, string[]> = {
  students: ['Code', 'First Name', 'Surname'],
  offerings: ['Code', 'Title', 'Start Date'],
}

const FILTERS: Record<WidgetType, { label: string; value: string }[]> = {
  students: [
    { label: 'Active',   value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Archived', value: 'archived' },
    { label: 'All',      value: 'all' },
  ],
  offerings: [
    { label: 'Active',    value: 'active' },
    { label: 'Completed', value: 'completed' },
    { label: 'Archived',  value: 'archived' },
    { label: 'All',       value: 'all' },
  ],
}

async function searchStudents(q: string, filter: string): Promise<Result[]> {
  let query = supabase.from('persons')
    .select('person_id, code, first_name, surname, archived, status')
    .or(`first_name.ilike.%${q}%,surname.ilike.%${q}%,code.ilike.%${q}%`)
    .limit(10)
  if (filter === 'active')   query = query.eq('archived', false).eq('status', 'ACTIVE')
  if (filter === 'inactive') query = query.eq('archived', false).eq('status', 'INACTIVE')
  if (filter === 'archived') query = query.eq('archived', true)
  const { data } = await query
  return (data ?? []).map((s: any) => ({ id: s.person_id, cells: [s.code ?? '—', s.first_name ?? '—', s.surname ?? '—'] }))
}

async function searchOfferings(q: string, filter: string): Promise<Result[]> {
  const { data: versions } = await supabase.from('offeringversions_current')
    .select('offering_id, code, title, start_timestamp, end_timestamp')
    .or(`title.ilike.%${q}%,code.ilike.%${q}%`).limit(50)

  const offeringIds = [...new Set((versions ?? []).map((v: any) => v.offering_id))]
  if (!offeringIds.length) return []

  const { data: offs } = await supabase.from('offerings').select('offering_id, archived').in('offering_id', offeringIds)
  const archiveMap = Object.fromEntries((offs ?? []).map((o: any) => [o.offering_id, o.archived]))
  const now = new Date()

  return (versions ?? [])
    .filter((v: any) => {
      const archived = archiveMap[v.offering_id]
      if (filter === 'archived')  return archived
      if (filter === 'completed') return !archived && v.end_timestamp && new Date(v.end_timestamp) < now
      if (filter === 'active')    return !archived && (!v.end_timestamp || new Date(v.end_timestamp) >= now)
      return true
    })
    .slice(0, 10)
    .map((o: any) => ({
      id: o.offering_id,
      cells: [o.code ?? '—', o.title ?? '—', o.start_timestamp ? new Date(o.start_timestamp).toLocaleDateString('en-AU') : '—'],
    }))
}

export default function SearchWidget({ type }: { type: WidgetType }) {
  const router = useRouter()
  const { settings, update } = useWidgetSettings(type)
  const { toggle: toggleFav } = useFavorites('fav_widgets')
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)
  const widgetId = type === 'students' ? 1 : 2

  useEffect(() => {
    if (!search.trim()) { setResults([]); setExpandedId(null); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      const data = type === 'students' ? await searchStudents(search, settings.filter) : await searchOfferings(search, settings.filter)
      setResults(data)
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, type, settings.filter])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false); setConfirmRemove(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const cols = COLUMNS[type]
  const title = type === 'students' ? 'Students' : 'Offerings'
  const filters = FILTERS[type]
  const activeFilterLabel = filters.find((f) => f.value === settings.filter)?.label ?? 'Active'
  const handleManage = (id: number) => { if (type === 'students') router.push(`/students/${id}`); else router.push(`/offerings`) }

  return (
    <div className="rounded-xl shadow flex flex-col" style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <Star size={15} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed' }}>{activeFilterLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push(type === 'students' ? '/students' : '/offerings')}
            style={{ color: 'var(--text-muted)' }} className="hover:opacity-70 transition flex items-center" title={`Go to ${title}`}>
            <ArrowUpRight size={15} />
          </button>
          <div className="relative flex items-center" ref={settingsRef}>
            <button onClick={() => setShowSettings(!showSettings)}
              style={{ color: showSettings ? '#7c3aed' : 'var(--text-muted)' }} className="hover:opacity-70 transition">
              <Settings size={15} />
            </button>
            {showSettings && (
              <div className="absolute right-0 top-7 rounded-xl shadow-xl z-50 p-4 flex flex-col gap-4"
                style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border)', width: 220 }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Widget Settings</span>
                  <button onClick={() => setShowSettings(false)} style={{ color: 'var(--text-muted)' }}><X size={14} /></button>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>WIDGET SIZE</p>
                  <div className="flex gap-2">
                    {[{ label: 'Compact', value: 'half' }, { label: 'Full', value: 'full' }].map((s) => (
                      <button key={s.value} onClick={() => update({ size: s.value as any })}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium transition"
                        style={{ background: settings.size === s.value ? '#7c3aed' : 'var(--bg-sub)', color: settings.size === s.value ? '#fff' : 'var(--text-muted)', border: `1px solid ${settings.size === s.value ? '#7c3aed' : 'var(--border)'}` }}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>FILTER</p>
                  <div className="flex flex-col gap-1">
                    {filters.map((f) => (
                      <button key={f.value} onClick={() => update({ filter: f.value })}
                        className="text-left px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2"
                        style={{ background: settings.filter === f.value ? 'rgba(124,58,237,0.08)' : 'transparent', color: settings.filter === f.value ? '#7c3aed' : 'var(--text-muted)' }}
                        onMouseEnter={(e) => { if (settings.filter !== f.value) e.currentTarget.style.background = 'var(--bg-sidebar-hover)' }}
                        onMouseLeave={(e) => { if (settings.filter !== f.value) e.currentTarget.style.background = 'transparent' }}>
                        <span style={{ fontSize: 8 }}>{settings.filter === f.value ? '●' : '○'}</span>{f.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  {!confirmRemove ? (
                    <button onClick={() => setConfirmRemove(true)}
                      className="flex items-center gap-2 text-xs font-medium w-full px-2 py-1.5 rounded-lg transition"
                      style={{ color: '#ef4444' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fee2e2')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                      <Trash2 size={13} />Remove Widget
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Are you sure you want to remove this widget?</p>
                      <div className="flex gap-2">
                        <button onClick={() => { toggleFav(widgetId); setShowSettings(false) }}
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white transition"
                          style={{ background: '#ef4444' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#dc2626')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = '#ef4444')}>Remove</button>
                        <button onClick={() => setConfirmRemove(false)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition"
                          style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-sidebar-hover)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <input type="text" placeholder={`Search ${title.toLowerCase()}...`} value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '6px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-primary)', outline: 'none' }} />
      </div>

      <div className="grid px-4 py-2" style={{ gridTemplateColumns: `repeat(${cols.length}, 1fr) 24px`, borderBottom: '1px solid var(--border)', background: 'var(--bg-sub)' }}>
        {cols.map((col) => (<span key={col} className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{col}</span>))}
        <span />
      </div>

      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 300 }}>
        {!search.trim() ? (
          <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>Start typing to search</p>
        ) : loading ? (
          <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>Searching...</p>
        ) : results.length === 0 ? (
          <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>No results found</p>
        ) : (
          results.map((row) => {
            const isOpen = expandedId === row.id
            return (
              <div key={row.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="grid px-4 py-2 cursor-pointer transition"
                  style={{ gridTemplateColumns: `repeat(${cols.length}, 1fr) 24px`, background: isOpen ? 'var(--bg-sub)' : 'transparent' }}
                  onClick={() => setExpandedId(isOpen ? null : row.id)}
                  onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.background = 'var(--bg-sidebar-hover)' }}
                  onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.background = 'transparent' }}>
                  {row.cells.map((cell, j) => (
                    <span key={j} className="text-xs" style={{ color: j === 0 ? 'var(--text-muted)' : 'var(--text-primary)' }}>{cell}</span>
                  ))}
                  <ChevronDown size={13} style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </div>
                <Accordion open={isOpen}>
                  <div className="px-4 py-2" style={{ background: 'var(--bg-sub)' }}>
                    <button onClick={() => handleManage(row.id)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                      style={{ color: '#8b5cf6', border: '1px solid #8b5cf6', background: 'transparent' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#8b5cf6'; e.currentTarget.style.color = '#fff' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8b5cf6' }}>
                      <Settings2 size={12} />Manage
                    </button>
                  </div>
                </Accordion>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
