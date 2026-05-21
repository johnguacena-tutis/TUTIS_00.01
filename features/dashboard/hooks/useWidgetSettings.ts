'use client'

import { useState, useEffect } from 'react'

export type WidgetSize = 'half' | 'full'

export type WidgetSettings = {
  size: WidgetSize
  filter: string
}

const DEFAULTS: Record<string, WidgetSettings> = {
  students: { size: 'half', filter: 'active' },
  offerings: { size: 'half', filter: 'active' },
}

const EVENT = 'widget_settings_updated'

export function useWidgetSettings(type: string) {
  const key = `widget_settings_${type}`
  const [settings, setSettings] = useState<WidgetSettings>(DEFAULTS[type])

  const load = () => {
    try {
      const stored = localStorage.getItem(key)
      if (stored) setSettings(JSON.parse(stored))
    } catch {}
  }

  useEffect(() => {
    load()
    window.addEventListener(EVENT, load)
    return () => window.removeEventListener(EVENT, load)
  }, [key])

  const update = (partial: Partial<WidgetSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial }
      try {
        localStorage.setItem(key, JSON.stringify(next))
        window.dispatchEvent(new Event(EVENT))
      } catch {}
      return next
    })
  }

  return { settings, update }
}
