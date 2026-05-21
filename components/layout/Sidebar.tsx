'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTheme } from './ThemeProvider'
import Accordion from '@/components/ui/Accordion'
import Image from 'next/image'
import { type Role } from './ThemeProvider'
import LogoutButton from './LogoutButton'
import { can, type Permission } from '@/lib/permissions'
import {
  UserSquare2, ClipboardList, BookOpen, ChevronDown,
  PanelLeftClose, Home, Settings, Sun, Moon, Shield,
} from 'lucide-react'

type MenuItem = {
  label: string
  icon: React.ReactNode
  children: { label: string; href: string; permission?: Permission }[]
}

const menuItems: MenuItem[] = [
  {
    label: 'Student Enrolment',
    icon: <UserSquare2 size={20} />,
    children: [
      { label: 'Students', href: '/students', permission: 'students.view' },
      { label: 'Offerings', href: '/offerings', permission: 'offerings.view' },
    ],
  },
  {
    label: 'Training & Assessment',
    icon: <ClipboardList size={20} />,
    children: [
      { label: 'Training Objects', href: '/coming-soon?section=Training+Objects' },
      { label: 'Assessments',      href: '/coming-soon?section=Assessments' },
      { label: 'Results',          href: '/coming-soon?section=Results' },
    ],
  },
  {
    label: 'Content Development',
    icon: <BookOpen size={20} />,
    children: [
      { label: 'Courses', href: '/coming-soon?section=Courses' },
      { label: 'Modules', href: '/coming-soon?section=Modules' },
      { label: 'Topics',  href: '/coming-soon?section=Topics' },
    ],
  },
]

export default function Sidebar() {
  const { theme, toggleTheme: toggle, role, setRole } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [openMenus, setOpenMenus] = useState<string[]>([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const dark = theme === 'dark'
  const [roleOpen, setRoleOpen] = useState(false)
  const settingsSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (settingsOpen && settingsSectionRef.current && !settingsSectionRef.current.contains(e.target as Node)) {
        setSettingsOpen(false); setRoleOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [settingsOpen])

  useEffect(() => {
    menuItems.forEach((item) => {
      const isActive = item.children.some((c) => pathname.startsWith(c.href))
      if (isActive) setOpenMenus((prev) => prev.includes(item.label) ? prev : [...prev, item.label])
    })
  }, [pathname])

  const toggleMenu = (label: string) => {
    if (collapsed) return
    setOpenMenus((prev) => prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label])
  }

  return (
    <aside
      style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)', color: 'var(--text-primary)' }}
      className={`flex flex-col h-screen transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
    >
      <div style={{ borderBottom: '1px solid var(--border)' }} className="flex items-center justify-between px-4 py-4">
        {collapsed ? (
          <button onClick={() => setCollapsed(false)} className="mx-auto opacity-70 hover:opacity-100 transition">
            <Image src="/assets/images/tutis_icon_2026.png" alt="TUTIS" width={28} height={28} style={{ objectFit: 'contain' }} priority />
          </button>
        ) : (
          <>
            <Image src="/assets/images/tutis_full_2026.png" alt="TUTIS" width={100} height={36} style={{ objectFit: 'contain' }} priority />
            <button onClick={() => setCollapsed(true)} style={{ color: 'var(--text-muted)' }} className="hover:opacity-100 opacity-70 transition ml-auto">
              <PanelLeftClose size={20} />
            </button>
          </>
        )}
      </div>

      <button onClick={() => router.push('/dashboard')} style={{ color: 'var(--text-primary)' }}
        className="flex items-center gap-3 px-4 py-3 w-full text-left transition"
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-sidebar-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
        <span style={{ color: 'var(--text-muted)' }}><Home size={20} /></span>
        {!collapsed && <span className="text-sm font-medium">Home</span>}
      </button>

      <div style={{ borderTop: '1px solid var(--border)' }} className="mx-3 my-1" />

      <nav className="flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const visibleChildren = item.children.filter((c) => !c.permission || can(role, c.permission))
          if (visibleChildren.length === 0) return null
          const isOpen = openMenus.includes(item.label)
          const isActive = item.children.some((c) => pathname.startsWith(c.href))
          return (
            <div key={item.label}>
              <button onClick={() => toggleMenu(item.label)}
                style={{ color: isActive ? '#7c3aed' : 'var(--text-primary)', background: isActive ? 'rgba(124,58,237,0.08)' : 'transparent', borderLeft: isActive ? '3px solid #7c3aed' : '3px solid transparent' }}
                className="w-full flex items-center gap-3 px-4 py-3 transition"
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--bg-sidebar-hover)' }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
                <span style={{ color: 'var(--text-muted)' }}>{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                    <span style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease', display: 'flex' }}>
                      <ChevronDown size={16} />
                    </span>
                  </>
                )}
              </button>
              {!collapsed && (
                <Accordion open={isOpen}>
                  <div style={{ background: 'var(--bg-sub)' }}>
                    {visibleChildren.map((child) => {
                      const childActive = pathname.startsWith(child.href)
                      return (
                        <button key={child.href} onClick={() => router.push(child.href)}
                          style={{ color: childActive ? '#7c3aed' : 'var(--text-muted)', fontWeight: childActive ? 600 : 400, background: childActive ? 'rgba(124,58,237,0.08)' : 'transparent' }}
                          className="w-full text-left px-10 py-2 text-sm transition"
                          onMouseEnter={(e) => { if (!childActive) e.currentTarget.style.background = 'var(--bg-sidebar-hover)' }}
                          onMouseLeave={(e) => { if (!childActive) e.currentTarget.style.background = childActive ? 'rgba(124,58,237,0.08)' : 'transparent' }}>
                          {child.label}
                        </button>
                      )
                    })}
                  </div>
                </Accordion>
              )}
            </div>
          )
        })}
      </nav>

      <div ref={settingsSectionRef} style={{ borderTop: '1px solid var(--border)' }} className="p-2">
        <button onClick={() => !collapsed && setSettingsOpen(!settingsOpen)} style={{ color: 'var(--text-primary)' }}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg transition"
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-sidebar-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
          <span style={{ color: 'var(--text-muted)' }}><Settings size={18} /></span>
          {!collapsed && (
            <>
              <span className="text-sm flex-1 text-left">Settings</span>
              <span style={{ color: 'var(--text-muted)', transform: settingsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease', display: 'flex' }}>
                <ChevronDown size={16} />
              </span>
            </>
          )}
        </button>

        {!collapsed && (
          <Accordion open={settingsOpen}>
            <div style={{ background: 'var(--bg-sub)', borderRadius: '0.5rem' }} className="mt-1 overflow-hidden">
              <button onClick={toggle} style={{ color: 'var(--text-muted)' }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm transition"
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-sidebar-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                {dark ? <Sun size={16} /> : <Moon size={16} />}
                <span>{dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
              </button>

              <button onClick={() => setRoleOpen(!roleOpen)} style={{ color: 'var(--text-muted)' }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm transition"
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-sidebar-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <Shield size={16} />
                <span className="flex-1 text-left">Role View</span>
                <span style={{ transform: roleOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease', display: 'flex' }}>
                  <ChevronDown size={14} />
                </span>
              </button>
              <Accordion open={roleOpen}>
                <div>
                  {([
                    { value: 'super_user', label: 'Super User' },
                    { value: 'read_write', label: 'Read & Write' },
                    { value: 'read_only',  label: 'Read Only' },
                  ] as { value: Role; label: string }[]).map((r) => (
                    <button key={r.value} onClick={() => setRole(r.value)}
                      className="w-full flex items-center gap-3 px-8 py-2 text-sm transition"
                      style={{ color: role === r.value ? '#7c3aed' : 'var(--text-muted)', fontWeight: role === r.value ? 600 : 400, background: 'transparent' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-sidebar-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                      {role === r.value && <span style={{ color: '#7c3aed', fontSize: 8 }}>●</span>}
                      {role !== r.value && <span style={{ fontSize: 8 }}>○</span>}
                      {r.label}
                    </button>
                  ))}
                </div>
              </Accordion>

              <LogoutButton />
            </div>
          </Accordion>
        )}
      </div>
    </aside>
  )
}
