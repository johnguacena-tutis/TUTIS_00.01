'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, X, UserPlus } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { can } from '@/lib/permissions'
import EnrolmentModal from './EnrolmentModal'

type Student = {
  person_id: number
  code: string | null
  first_name: string | null
  other_names: string | null
  surname: string | null
  preferred_name: string | null
  date_of_birth: string | null
  status: string | null
  archived: boolean
  organisation_id: number | null
  position_id: number | null
  email: string | null
}

type Enrolment = {
  enrolment_id: number
  code: string | null
  qualification_course: string | null
  offering_code: string | null
  trainer: string | null
  started: string | null
  end_date: string | null
  status: string
}

const tabs = ['Details', 'Training Record']

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-AU') : '—'

const statusColor = (status: string) => {
  const s = status.toLowerCase()
  if (s.includes('active'))  return { background: '#dcfce7', color: '#16a34a' }
  if (s.includes('complet')) return { background: '#dbeafe', color: '#2563eb' }
  if (s.includes('cancel'))  return { background: '#fee2e2', color: '#dc2626' }
  if (s.includes('archive')) return { background: '#f3f4f6', color: '#6b7280' }
  return { background: '#f3f4f6', color: '#6b7280' }
}

const inputStyle = {
  width: '100%',
  padding: '6px 10px',
  fontSize: '14px',
  borderRadius: '6px',
  border: '1px solid #7c3aed',
  background: 'var(--bg-page)',
  color: 'var(--text-primary)',
  outline: 'none',
}

function Field({
  label,
  value,
  editing,
  onChange,
  readOnly = false,
}: {
  label: string
  value: string | null
  editing: boolean
  onChange?: (v: string) => void
  readOnly?: boolean
}) {
  return (
    <div
      className="flex items-center py-3"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <span className="text-sm font-medium w-48 shrink-0" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      {editing && !readOnly ? (
        <input
          style={inputStyle}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
        />
      ) : (
        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
          {value || '—'}
        </span>
      )}
    </div>
  )
}

export default function StudentDetail({
  student,
  enrolments,
  initialEditing = false,
}: {
  student: Student
  enrolments: Enrolment[]
  initialEditing?: boolean
}) {
  const router = useRouter()
  const { role } = useTheme()
  const canEdit           = can(role, 'students.edit')
  const canAddEnrolment   = can(role, 'offerings.add_enrolment')
  const [showEnrolModal, setShowEnrolModal] = useState(false)
  const [activeTab, setActiveTab] = useState('Details')
  const [isEditing, setIsEditing] = useState(initialEditing && canEdit)
  const [draft, setDraft] = useState({ ...student })

  const fullName = [draft.first_name, draft.surname].filter(Boolean).join(' ') || '—'

  const handleCancel = () => {
    setDraft({ ...student })
    setIsEditing(false)
  }

  const handleSave = () => {
    // Save logic will go here
    setIsEditing(false)
  }

  const set = (key: keyof typeof draft) => (value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="pb-24">
      {/* Breadcrumb */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs mb-3 transition"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#7c3aed')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <ArrowLeft size={13} />
        Back
      </button>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {fullName}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {draft.code ?? '—'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition"
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-sidebar-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <X size={14} />
              Cancel
            </button>
          ) : (
            <>
              {canAddEnrolment && (
                <button
                  onClick={() => setShowEnrolModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition"
                  style={{ background: 'transparent', border: '1px solid #10b981', color: '#10b981' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#10b981' }}
                >
                  <UserPlus size={14} />
                  Add Enrolment
                </button>
              )}
              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition"
                  style={{ background: '#7c3aed' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#6d28d9')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#7c3aed')}
                >
                  <Pencil size={14} />
                  Edit
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Card with attached tabs */}
      <div
        className="rounded-xl shadow"
        style={{ background: 'var(--bg-sidebar)', border: `1px solid ${isEditing ? '#7c3aed' : 'var(--border)'}` }}
      >
        {/* Tab bar */}
        <div className="flex" style={{ borderBottom: '1px solid var(--border)' }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-3 text-sm font-medium transition"
              style={{
                color: activeTab === tab ? '#7c3aed' : 'var(--text-muted)',
                borderBottom: activeTab === tab ? '2px solid #7c3aed' : '2px solid transparent',
                marginBottom: '-1px',
                background: 'transparent',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Details Tab */}
        {activeTab === 'Details' && (
          <div className="p-6">
            <Field label="Code"           value={draft.code}           editing={isEditing} readOnly onChange={set('code')} />
            <Field label="Status"         value={draft.status}         editing={isEditing} readOnly />
            <Field label="First Name"     value={draft.first_name}     editing={isEditing} onChange={set('first_name')} />
            <Field label="Other Names"    value={draft.other_names}    editing={isEditing} onChange={set('other_names')} />
            <Field label="Surname"        value={draft.surname}        editing={isEditing} onChange={set('surname')} />
            <Field label="Preferred Name" value={draft.preferred_name} editing={isEditing} onChange={set('preferred_name')} />
            <Field label="Date of Birth"  value={draft.date_of_birth}  editing={isEditing} onChange={set('date_of_birth')} />
            <Field label="Email"          value={draft.email}          editing={isEditing} onChange={set('email')} />
          </div>
        )}

        {/* Training Record Tab */}
        {activeTab === 'Training Record' && (
          <div className="overflow-hidden">
            <div style={{ overflowX: 'auto' }}>
              <table className="w-full text-sm" style={{ minWidth: '700px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-sub)', borderBottom: '1px solid var(--border)' }}>
                    {['Code', 'Qualification / Course', 'Offering', 'Trainer', 'Started', 'End Date', 'Status'].map((col) => (
                      <th key={col} className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {enrolments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                        No enrolments found
                      </td>
                    </tr>
                  ) : (
                    enrolments.map((e) => (
                      <tr
                        key={e.enrolment_id}
                        style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={(el) => (el.currentTarget.style.background = 'var(--bg-sidebar-hover)')}
                        onMouseLeave={(el) => (el.currentTarget.style.background = 'transparent')}
                      >
                        <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{e.code ?? '—'}</td>
                        <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{e.qualification_course ?? '—'}</td>
                        <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{e.offering_code ?? '—'}</td>
                        <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{e.trainer ?? '—'}</td>
                        <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{formatDate(e.started)}</td>
                        <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{formatDate(e.end_date)}</td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
                            style={statusColor(e.status)}
                          >
                            {e.status || '—'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Enrolment Modal */}
      {showEnrolModal && (
        <EnrolmentModal
          studentName={fullName}
          onClose={() => setShowEnrolModal(false)}
        />
      )}

      {/* Sticky Save bar */}
      {isEditing && (
        <div
          className="fixed bottom-0 left-0 right-0 flex items-center justify-end gap-3 px-8 py-4 shadow-lg"
          style={{
            background: 'var(--bg-sidebar)',
            borderTop: '1px solid var(--border)',
            zIndex: 50,
          }}
        >
          <p className="text-sm mr-auto" style={{ color: 'var(--text-muted)' }}>
            You have unsaved changes
          </p>
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition"
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-sidebar-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition"
            style={{ background: '#7c3aed' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#6d28d9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#7c3aed')}
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  )
}
