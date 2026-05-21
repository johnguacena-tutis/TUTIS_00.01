'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { db: { schema: 'enterprise_uat' } }
)

type Offering = {
  offering_version_id: number
  offering_id: number
  code: string | null
  title: string | null
  start_timestamp: string | null
  end_timestamp: string | null
  trainer_name: string | null
}

type EnrolmentForm = {
  offering: Offering | null
  start_date: string
  planned_completion_date: string
  training_organisation: string
}

const steps = ['Select Offering', 'Enrolment Details', 'Training Structure', 'Confirm']

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-AU') : '—'

function DateInput({ value, onChange, style }: { value: string; onChange: (v: string) => void; style: React.CSSProperties }) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <input
      ref={ref}
      type="date"
      style={{ ...style, cursor: 'pointer' }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onClick={() => { try { ref.current?.showPicker() } catch {} }}
    />
  )
}

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  fontSize: '14px',
  borderRadius: '8px',
  border: '1px solid var(--border)',
  background: 'var(--bg-page)',
  color: 'var(--text-primary)',
  outline: 'none',
}

export default function EnrolmentModal({
  studentName,
  onClose,
}: {
  studentName: string
  onClose: () => void
}) {
  const [step, setStep] = useState(0)
  const [maxStep, setMaxStep] = useState(0)
  const [offerings, setOfferings] = useState<Offering[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<EnrolmentForm>({
    offering: null,
    start_date: new Date().toISOString().split('T')[0],
    planned_completion_date: '',
    training_mode: '',
    training_organisation: '',
  })

  useEffect(() => {
    async function fetchOfferings() {
      setLoading(true)
      const { data: versions } = await supabase
        .from('offeringversions_current')
        .select('offering_version_id, offering_id, code, title, start_timestamp, end_timestamp, default_trainer_person_id')
        .order('title', { ascending: true })
        .limit(200)

      const offeringIds = [...new Set((versions ?? []).map((v: any) => v.offering_id))]
      const { data: offs } = offeringIds.length
        ? await supabase.from('offerings').select('offering_id, archived').in('offering_id', offeringIds).eq('archived', false)
        : { data: [] }

      const activeIds = new Set((offs ?? []).map((o: any) => o.offering_id))
      const now = new Date()
      const active = (versions ?? []).filter((v: any) =>
        activeIds.has(v.offering_id) &&
        (v.end_timestamp === null || new Date(v.end_timestamp) >= now)
      )

      const trainerIds = [...new Set(active.map((v: any) => v.default_trainer_person_id).filter(Boolean))]
      const { data: trainers } = trainerIds.length
        ? await supabase.from('persons').select('person_id, first_name, surname').in('person_id', trainerIds)
        : { data: [] }
      const trainerMap = Object.fromEntries((trainers ?? []).map((p: any) => [p.person_id, `${p.first_name ?? ''} ${p.surname ?? ''}`.trim()]))

      setOfferings(active.map((v: any) => ({
        offering_version_id: v.offering_version_id,
        offering_id: v.offering_id,
        code: v.code,
        title: v.title,
        start_timestamp: v.start_timestamp,
        end_timestamp: v.end_timestamp,
        trainer_name: v.default_trainer_person_id ? trainerMap[v.default_trainer_person_id] ?? null : null,
      })))
      setLoading(false)
    }
    fetchOfferings()
  }, [])

  const filtered = offerings.filter((o) =>
    (o.title ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (o.code ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const canNext =
    (step === 0 && form.offering !== null) ||
    (step === 1 && form.start_date !== '') ||
    step === 2

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col"
        style={{
          background: 'var(--bg-sidebar)',
          border: '1px solid var(--border)',
          maxHeight: '85vh',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {form.offering ? form.offering.title : 'Add Enrolment'}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {form.offering
                ? <>Enrolling <span style={{ color: '#7c3aed', fontWeight: 600 }}>{studentName}</span></>
                : studentName}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ color: 'var(--text-muted)' }}
            className="hover:opacity-70 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="relative flex items-start justify-between">
            {/* Connector lines — drawn behind circles */}
            <div className="absolute left-0 right-0 flex" style={{ top: 16, zIndex: 0, padding: '0 16px' }}>
              {steps.slice(0, -1).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-px"
                  style={{ background: i < maxStep ? '#7c3aed' : 'var(--border)' }}
                />
              ))}
            </div>

            {steps.map((s, i) => (
              <div
                key={s}
                className="flex flex-col items-center gap-1.5 relative"
                style={{ zIndex: 1, cursor: i <= maxStep ? 'pointer' : 'default', flex: 1 }}
                onClick={() => { if (i <= maxStep) setStep(i) }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition"
                  style={{
                    background: i <= maxStep ? '#7c3aed' : 'var(--bg-sub)',
                    color: i <= maxStep ? '#fff' : 'var(--text-muted)',
                    border: i <= maxStep ? 'none' : '1px solid var(--border)',
                  }}
                >
                  {i < maxStep ? <Check size={12} /> : i + 1}
                </div>
                <span
                  className="text-xs font-medium text-center"
                  style={{
                    color: i === step ? '#7c3aed' : i <= maxStep ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}
                >
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {/* Step 1 — Select Offering */}
          {step === 0 && (
            <div>
              <input
                placeholder="Search by title or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...inputStyle, marginBottom: '12px' }}
              />
              {loading ? (
                <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Loading offerings...</p>
              ) : (
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: '1px solid var(--border)' }}
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: 'var(--bg-sub)', borderBottom: '1px solid var(--border)' }}>
                        {['Code', 'Title', 'Start', 'End', 'Trainer'].map((col) => (
                          <th key={col} className="text-left px-4 py-2 font-semibold" style={{ color: 'var(--text-muted)' }}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center" style={{ color: 'var(--text-muted)' }}>
                            No offerings found
                          </td>
                        </tr>
                      ) : (
                        filtered.map((o) => {
                          const selected = form.offering?.offering_version_id === o.offering_version_id
                          return (
                            <tr
                              key={o.offering_version_id}
                              onClick={() => setForm((f) => ({ ...f, offering: o }))}
                              style={{
                                borderBottom: '1px solid var(--border)',
                                cursor: 'pointer',
                                background: selected ? 'rgba(124,58,237,0.08)' : 'transparent',
                              }}
                              onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'var(--bg-sidebar-hover)' }}
                              onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent' }}
                            >
                              <td className="px-4 py-2" style={{ color: selected ? '#7c3aed' : 'var(--text-muted)' }}>{o.code ?? '—'}</td>
                              <td className="px-4 py-2 font-medium" style={{ color: selected ? '#7c3aed' : 'var(--text-primary)' }}>{o.title ?? '—'}</td>
                              <td className="px-4 py-2" style={{ color: 'var(--text-muted)' }}>{formatDate(o.start_timestamp)}</td>
                              <td className="px-4 py-2" style={{ color: 'var(--text-muted)' }}>{formatDate(o.end_timestamp)}</td>
                              <td className="px-4 py-2" style={{ color: 'var(--text-muted)' }}>{o.trainer_name ?? '—'}</td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Enrolment Details */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              {/* Selected offering summary */}
              <div
                className="rounded-xl p-4"
                style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)' }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: '#7c3aed' }}>Selected Offering</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{form.offering?.title ?? '—'}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{form.offering?.code ?? '—'}</p>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Start Date *</label>
                  <DateInput style={inputStyle} value={form.start_date} onChange={(v) => setForm((f) => ({ ...f, start_date: v }))} />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Planned Completion Date</label>
                  <DateInput style={inputStyle} value={form.planned_completion_date} onChange={(v) => setForm((f) => ({ ...f, planned_completion_date: v }))} />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Training Organisation</label>
                <input type="text" style={inputStyle} value={form.training_organisation} onChange={(e) => setForm((f) => ({ ...f, training_organisation: e.target.value }))} />
              </div>
            </div>
          )}

          {/* Step 3 — Training Structure */}
          {step === 2 && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}
                >
                  <span style={{ fontSize: 28 }}>🔧</span>
                </div>
                <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Integrating Soon
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  Training Structure configuration is coming in a future release.
                </p>
              </div>
            </div>
          )}

          {/* Step 4 — Confirm */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Please review the enrolment details before confirming.
              </p>
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: '1px solid var(--border)' }}
              >
                {[
                  { label: 'Student',                 value: studentName },
                  { label: 'Offering',                value: form.offering?.title ?? '—' },
                  { label: 'Offering Code',           value: form.offering?.code ?? '—' },
                  { label: 'Start Date',              value: form.start_date || '—' },
                  { label: 'Planned Completion',      value: form.planned_completion_date || '—' },
                  { label: 'Training Organisation',   value: form.training_organisation || '—' },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center px-4 py-3"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <span className="text-sm font-medium w-48 shrink-0" style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            onClick={() => step === 0 ? onClose() : setStep((s) => s - 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition"
            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-sidebar-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <ChevronLeft size={14} />
            {step === 0 ? 'Cancel' : 'Back'}
          </button>

          {step < steps.length - 1 ? (
            <button
              onClick={() => { const next = step + 1; setStep(next); setMaxStep((m) => Math.max(m, next)) }}
              disabled={!canNext}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition"
              style={{ background: canNext ? '#7c3aed' : '#c4b5fd', cursor: canNext ? 'pointer' : 'not-allowed' }}
            >
              Next
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition"
              style={{ background: '#7c3aed' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#6d28d9')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#7c3aed')}
            >
              <Check size={14} />
              Create Enrolment
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
