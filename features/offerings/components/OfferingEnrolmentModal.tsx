'use client'

import { useState, useEffect, useRef, Fragment } from 'react'
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'

type Student = {
  person_id: number
  code: string | null
  first_name: string | null
  surname: string | null
  date_of_birth: string | null
}

type EnrolmentForm = {
  students: Student[]
  start_date: string
  planned_completion_date: string
  training_organisation: string
}

const steps = ['Select Students', 'Enrolment Details', 'Training Structure', 'Confirm']
const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-AU') : '—'

const inputStyle = {
  width: '100%', padding: '8px 12px', fontSize: '14px', borderRadius: '8px',
  border: '1px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-primary)', outline: 'none',
}

function DateInput({ value, onChange, style }: { value: string; onChange: (v: string) => void; style: React.CSSProperties }) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <input ref={ref} type="date" style={{ ...style, cursor: 'pointer' }} value={value}
      onChange={(e) => onChange(e.target.value)}
      onClick={() => { try { ref.current?.showPicker() } catch {} }} />
  )
}

export default function OfferingEnrolmentModal({ offeringTitle, offeringCode, onClose }: {
  offeringTitle: string; offeringCode: string | null; onClose: () => void
}) {
  const [step, setStep] = useState(0)
  const [maxStep, setMaxStep] = useState(0)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showSelectedOnly, setShowSelectedOnly] = useState(false)
  const [form, setForm] = useState<EnrolmentForm>({
    students: [], start_date: new Date().toISOString().split('T')[0],
    planned_completion_date: '', training_organisation: '',
  })

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true)
      const { data } = await getSupabase().from('persons')
        .select('person_id, code, first_name, surname, date_of_birth')
        .eq('archived', false).order('surname', { ascending: true }).limit(200)
      setStudents(data ?? [])
      setLoading(false)
    }
    fetchStudents()
  }, [])

  const isSelected = (id: number) => form.students.some((s) => s.person_id === id)
  const toggleStudent = (s: Student) => setForm((f) => {
    const exists = f.students.find((x) => x.person_id === s.person_id)
    return { ...f, students: exists ? f.students.filter((x) => x.person_id !== s.person_id) : [...f.students, s] }
  })

  const filtered = students
    .filter((s) => showSelectedOnly ? isSelected(s.person_id) :
      `${s.first_name ?? ''} ${s.surname ?? ''} ${s.code ?? ''}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (isSelected(a.person_id) ? 0 : 1) - (isSelected(b.person_id) ? 0 : 1))

  const canNext = (step === 0 && form.students.length > 0) || (step === 1 && form.start_date !== '') || step === 2

  const StepIndicator = () => (
    <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="relative flex items-start justify-between">
        <div className="absolute left-0 right-0 flex" style={{ top: 16, zIndex: 0, padding: '0 16px' }}>
          {steps.slice(0, -1).map((_, i) => (
            <div key={i} className="flex-1 h-px" style={{ background: i < maxStep ? '#7c3aed' : 'var(--border)' }} />
          ))}
        </div>
        {steps.map((s, i) => (
          <div key={s} className="flex flex-col items-center gap-1.5 relative"
            style={{ zIndex: 1, cursor: i <= maxStep ? 'pointer' : 'default', flex: 1 }}
            onClick={() => { if (i <= maxStep) setStep(i) }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition"
              style={{ background: i <= maxStep ? '#7c3aed' : 'var(--bg-sub)', color: i <= maxStep ? '#fff' : 'var(--text-muted)', border: i <= maxStep ? 'none' : '1px solid var(--border)' }}>
              {i < maxStep ? <Check size={12} /> : i + 1}
            </div>
            <span className="text-xs font-medium text-center"
              style={{ color: i === step ? '#7c3aed' : i <= maxStep ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col"
        style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border)', maxHeight: '85vh' }}>

        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{offeringTitle}</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {form.students.length === 0 ? offeringCode ?? 'Add Enrolment' :
                <>Enrolling <span style={{ color: '#7c3aed', fontWeight: 600 }}>{form.students.length} student{form.students.length > 1 ? 's' : ''}</span></>}
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }} className="hover:opacity-70 transition"><X size={20} /></button>
        </div>

        <StepIndicator />

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {step === 0 && (
            <div>
              <div className="flex items-center justify-between mb-3 gap-3">
                {!showSelectedOnly && (
                  <input placeholder="Search by name or code..." value={search}
                    onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                )}
                {showSelectedOnly && (
                  <p className="text-sm font-medium flex-1" style={{ color: '#7c3aed' }}>
                    {form.students.length} student{form.students.length !== 1 ? 's' : ''} selected
                  </p>
                )}
                {form.students.length > 0 && (
                  <button onClick={() => { setShowSelectedOnly(!showSelectedOnly); setSearch('') }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition"
                    style={{ background: showSelectedOnly ? '#7c3aed' : 'rgba(124,58,237,0.1)', color: showSelectedOnly ? '#fff' : '#7c3aed' }}>
                    {form.students.length} selected
                  </button>
                )}
              </div>
              {loading ? (
                <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Loading students...</p>
              ) : (
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: 'var(--bg-sub)', borderBottom: '1px solid var(--border)' }}>
                        <th className="px-4 py-2 w-10">
                          <input type="checkbox"
                            checked={filtered.length > 0 && filtered.every((s) => isSelected(s.person_id))}
                            onChange={(e) => {
                              if (e.target.checked) setForm((f) => ({ ...f, students: [...f.students, ...filtered.filter((s) => !isSelected(s.person_id))] }))
                              else setForm((f) => ({ ...f, students: f.students.filter((s) => !filtered.find((x) => x.person_id === s.person_id)) }))
                            }} />
                        </th>
                        {['Code', 'First Name', 'Surname', 'Date of Birth'].map((col) => (
                          <th key={col} className="text-left px-4 py-2 font-semibold" style={{ color: 'var(--text-muted)' }}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan={5} className="px-4 py-6 text-center" style={{ color: 'var(--text-muted)' }}>No students found</td></tr>
                      ) : filtered.map((s, idx) => {
                        const selected = isSelected(s.person_id)
                        const showDivider = !selected && idx > 0 && isSelected(filtered[idx - 1].person_id)
                        return (
                          <Fragment key={s.person_id}>
                            {showDivider && (
                              <tr>
                                <td colSpan={5} className="px-4 py-1 text-xs font-semibold"
                                  style={{ background: 'var(--bg-sub)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                                  Other Students
                                </td>
                              </tr>
                            )}
                            <tr key={s.person_id} onClick={() => toggleStudent(s)}
                              style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', background: selected ? 'rgba(124,58,237,0.06)' : 'transparent' }}
                              onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'var(--bg-sidebar-hover)' }}
                              onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent' }}>
                              <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                                <input type="checkbox" checked={selected} onChange={() => toggleStudent(s)} />
                              </td>
                              <td className="px-4 py-2" style={{ color: 'var(--text-muted)' }}>{s.code ?? '—'}</td>
                              <td className="px-4 py-2 font-medium" style={{ color: selected ? '#7c3aed' : 'var(--text-primary)' }}>{s.first_name ?? '—'}</td>
                              <td className="px-4 py-2" style={{ color: selected ? '#7c3aed' : 'var(--text-primary)' }}>{s.surname ?? '—'}</td>
                              <td className="px-4 py-2" style={{ color: 'var(--text-muted)' }}>{formatDate(s.date_of_birth)}</td>
                            </tr>
                          </Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div className="rounded-xl p-4" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#7c3aed' }}>Enrolling {form.students.length} student{form.students.length > 1 ? 's' : ''} in</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{offeringTitle}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{offeringCode ?? '—'}</p>
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

          {step === 2 && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <span style={{ fontSize: 28 }}>🔧</span>
                </div>
                <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Integrating Soon</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Training Structure configuration is coming in a future release.</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Please review before confirming.</p>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {[
                  { label: 'Offering',             value: offeringTitle },
                  { label: 'Offering Code',         value: offeringCode ?? '—' },
                  { label: 'Start Date',            value: form.start_date || '—' },
                  { label: 'Planned Completion',    value: form.planned_completion_date || '—' },
                  { label: 'Training Organisation', value: form.training_organisation || '—' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="text-sm font-medium w-44 shrink-0" style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>STUDENTS ({form.students.length})</p>
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  {form.students.map((s) => (
                    <div key={s.person_id} className="flex items-center px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{[s.first_name, s.surname].filter(Boolean).join(' ')}</span>
                      <span className="text-xs ml-3" style={{ color: 'var(--text-muted)' }}>{s.code ?? '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={() => step === 0 ? onClose() : setStep((s) => s - 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition"
            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-sidebar-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
            <ChevronLeft size={14} />{step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < steps.length - 1 ? (
            <button onClick={() => { const next = step + 1; setStep(next); setMaxStep((m) => Math.max(m, next)) }}
              disabled={!canNext} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition"
              style={{ background: canNext ? '#7c3aed' : '#c4b5fd', cursor: canNext ? 'pointer' : 'not-allowed' }}>
              Next<ChevronRight size={14} />
            </button>
          ) : (
            <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition"
              style={{ background: '#7c3aed' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#6d28d9')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#7c3aed')}>
              <Check size={14} />Create Enrolment{form.students.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
