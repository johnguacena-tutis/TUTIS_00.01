'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => router.push('/dashboard'), 800)
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: 'var(--bg-page)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl shadow-xl p-8 flex flex-col items-center"
        style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border)' }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/assets/images/tutis_full_2026.png"
            alt="TUTIS Logo"
            width={180}
            height={80}
            priority
            style={{ objectFit: 'contain' }}
          />
          <span
            className="text-xs font-semibold tracking-[0.3em] mt-2 uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            VI
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Username
            </label>
            <input
              type="text"
              defaultValue="admin"
              className="rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-600"
              style={{
                background: 'var(--bg-page)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Password
            </label>
            <input
              type="password"
              defaultValue="password"
              className="rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-600"
              style={{
                background: 'var(--bg-page)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg py-2.5 text-sm font-semibold text-white bg-purple-700 hover:bg-purple-600 transition disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
