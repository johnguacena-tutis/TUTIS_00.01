import { ThemeProvider } from '@/components/layout/ThemeProvider'
import Sidebar from '@/components/layout/Sidebar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: 'var(--bg-page)', color: 'var(--text-primary)' }}>
        {children}
      </main>
    </ThemeProvider>
  )
}
