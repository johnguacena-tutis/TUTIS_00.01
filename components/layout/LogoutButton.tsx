'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)

  if (confirming) {
    return (
      <div className="px-4 py-2">
        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Are you sure you want to logout?</p>
        <div className="flex gap-2">
          <button onClick={() => router.push('/login')}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white transition"
            style={{ background: '#ef4444' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#dc2626')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#ef4444')}>
            Yes, logout
          </button>
          <button onClick={() => setConfirming(false)}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition"
            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-sidebar-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <button onClick={() => setConfirming(true)} style={{ color: '#ef4444' }}
      className="w-full flex items-center gap-3 px-4 py-2 text-sm transition"
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-sidebar-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
      <LogOut size={16} />
      <span>Logout</span>
    </button>
  )
}
