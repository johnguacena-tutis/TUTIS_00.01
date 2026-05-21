'use client'

import { useState, useEffect } from 'react'

const EVENT = 'fav_updated'

export function useFavorites(key: string) {
  const [favorites, setFavorites] = useState<number[]>([])

  const load = () => {
    try {
      const stored = localStorage.getItem(key)
      if (stored) setFavorites(JSON.parse(stored))
      else setFavorites([])
    } catch {}
  }

  useEffect(() => {
    load()
    window.addEventListener(EVENT, load)
    return () => window.removeEventListener(EVENT, load)
  }, [key])

  const toggle = (id: number) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      try {
        localStorage.setItem(key, JSON.stringify(next))
        setTimeout(() => window.dispatchEvent(new Event(EVENT)), 0)
      } catch {}
      return next
    })
  }

  const isFavorite = (id: number) => favorites.includes(id)

  return { favorites, toggle, isFavorite }
}
