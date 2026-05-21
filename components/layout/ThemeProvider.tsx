'use client'

import { createContext, useContext, useState } from 'react'

type Theme = 'dark' | 'light'
export type Role = 'super_user' | 'read_write' | 'read_only'

type AppContext = {
  theme: Theme
  toggleTheme: () => void
  role: Role
  setRole: (r: Role) => void
}

const AppContext = createContext<AppContext>({
  theme: 'light',
  toggleTheme: () => {},
  role: 'super_user',
  setRole: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [role, setRole] = useState<Role>('super_user')

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <AppContext.Provider value={{ theme, toggleTheme, role, setRole }}>
      <div className={theme} style={{ display: 'flex', height: '100%', width: '100%' }}>
        {children}
      </div>
    </AppContext.Provider>
  )
}

export function useTheme() {
  return useContext(AppContext)
}
