export default async function ComingSoonPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>
}) {
  const { section } = await searchParams
  const label = section ? decodeURIComponent(section) : 'This section'

  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="text-center max-w-md">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}
        >
          <span style={{ fontSize: 36 }}>🔧</span>
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          {label}
        </h1>
        <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
          This section is currently in development.
        </p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Check back in a future release.
        </p>
      </div>
    </div>
  )
}
