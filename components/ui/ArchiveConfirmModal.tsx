'use client'

import { Archive, X } from 'lucide-react'

export default function ArchiveConfirmModal({
  name, onConfirm, onClose,
}: {
  name: string; onConfirm: () => void; onClose: () => void
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-sm rounded-2xl shadow-2xl p-6 flex flex-col gap-4"
        style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#fee2e2' }}>
            <Archive size={22} color="#ef4444" />
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }} className="hover:opacity-70 transition">
            <X size={18} />
          </button>
        </div>
        <div>
          <h2 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Archive {name}?</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Are you sure you want to archive <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{name}</span>? This can be undone later from the Archived filter.
          </p>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold transition"
            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-sidebar-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>Cancel</button>
          <button onClick={() => { onConfirm(); onClose() }} className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition"
            style={{ background: '#ef4444' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#dc2626')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#ef4444')}>Archive</button>
        </div>
      </div>
    </div>
  )
}
