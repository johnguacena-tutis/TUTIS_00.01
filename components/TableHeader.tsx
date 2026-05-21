'use client'

import { Star, Settings } from 'lucide-react'
import { useFavorites } from '@/lib/useFavorites'

export default function TableHeader({
  title,
  count,
  favKey,
  children,
}: {
  title: string
  count: number
  favKey: 'students' | 'offerings'
  children?: React.ReactNode
}) {
  const { isFavorite, toggle } = useFavorites('fav_widgets')
  const pinned = isFavorite(favKey === 'students' ? 1 : 2)

  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
            <button
              onClick={() => toggle(favKey === 'students' ? 1 : 2)}
              className="hover:opacity-70 transition"
              title={pinned ? 'Remove from dashboard' : 'Pin to dashboard'}
            >
              <Star
                size={18}
                style={{
                  color: pinned ? '#f59e0b' : 'var(--text-muted)',
                  fill: pinned ? '#f59e0b' : 'none',
                  transition: 'all 0.2s',
                }}
              />
            </button>
            <button className="hover:opacity-70 transition" style={{ color: 'var(--text-muted)' }}>
              <Settings size={16} />
            </button>
          </div>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{count} records</p>
        </div>
      </div>
      {children}
    </div>
  )
}
