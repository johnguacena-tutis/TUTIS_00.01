'use client'

import { useEffect, useState } from 'react'
import SearchWidget from './SearchWidget'
import { useWidgetSettings } from '@/lib/useWidgetSettings'

function WidgetWrapper({ type }: { type: 'students' | 'offerings' }) {
  const { settings } = useWidgetSettings(type)
  return (
    <div className={settings.size === 'full' ? 'md:col-span-2' : ''}>
      <SearchWidget type={type} />
    </div>
  )
}

export default function DashboardClient() {
  const [pinned, setPinned] = useState<number[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('fav_widgets')
      if (stored) setPinned(JSON.parse(stored))
    } catch {}

    const onUpdate = () => {
      try {
        const stored = localStorage.getItem('fav_widgets')
        setPinned(stored ? JSON.parse(stored) : [])
      } catch {}
    }
    window.addEventListener('fav_updated', onUpdate)
    return () => window.removeEventListener('fav_updated', onUpdate)
  }, [])

  const studentsPin  = pinned.includes(1)
  const offeringsPin = pinned.includes(2)
  const hasWidgets   = studentsPin || offeringsPin

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {hasWidgets ? 'Your pinned widgets' : 'No widgets pinned yet — star a table to add it here'}
        </p>
      </div>

      {hasWidgets ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studentsPin  && <WidgetWrapper type="students" />}
          {offeringsPin && <WidgetWrapper type="offerings" />}
        </div>
      ) : (
        <div
          className="rounded-xl p-12 text-center"
          style={{ background: 'var(--bg-sidebar)', border: '1px dashed var(--border)' }}
        >
          <p className="text-4xl mb-3">⭐</p>
          <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>No widgets pinned</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Go to Students or Offerings and click the star icon next to the title to pin a widget here.
          </p>
        </div>
      )}
    </div>
  )
}
