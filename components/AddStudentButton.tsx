'use client'

import { useTheme } from './ThemeProvider'
import { can } from '@/lib/permissions'

export default function AddStudentButton() {
  const { role } = useTheme()
  if (!can(role, 'students.create')) return null

  return (
    <button
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition"
      style={{ background: '#7c3aed' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#6d28d9')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '#7c3aed')}
    >
      + Add New Student
    </button>
  )
}
