'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from './ThemeProvider'
import Accordion from './Accordion'
import Image from 'next/image'
import { type Role } from './ThemeProvider'
import { can, canAny, type Permission } from '@/lib/permissions'
import {
  UserSquare2,
  ClipboardList,
  BookOpen,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  Home,
  Settings,
  LogOut,
  Sun,
  Moon,
  Shield,
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
      { label: 'Training Objects', href: '/training/objects' },
      { label: 'Assessments', href: '/training/assessments' },
      { label: 'Results', href: '/training/results' },
    ],
  },
  {
    label: 'Content Development',
    icon: <BookOpen size={20} />,
    children: [
      { label: 'Courses', href: '/content/courses' },
      { label: 'Modules', href: '/content/modules' },
      { label: 'Topics', href: '/content/topics' },
    ],
  },
]

export default function Sidebar() {
  const { theme, toggleTheme: toggle, role, setRole } = useTheme()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [openMenus, setOpenMenus] = useState<string[]>([])
  const [settingsOpen, setSettingsOpen] = useState(false)

  const dark = theme === 'dark'
  const [roleOpen, setRoleOpen] = useState(false)

  const toggleMenu = (label: string) => {
    if (collapsed) return
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    )
  }

  return (
    <aside
      style={{
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        color: 'var(--text-primary)',
      }}
      className={`flex flex-col h-screen transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Logo */}
      <div
        style={{ borderBottom: '1px solid var(--border)' }}
        className="flex items-center justify-between px-4 py-4"
      >
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto opacity-70 hover:opacity-100 transition"
          >
            <Image
              src="/assets/images/tutis_icon_2026.png"
              alt="TUTIS"
              width={28}
              height={28}
              style={{ objectFit: 'contain' }}
              priority
            />
          </button>
        ) : (
          <>
            <Image
              src="/assets/images/tutis_full_2026.png"
              alt="TUTIS"
              width={100}
              height={36}
              style={{ objectFit: 'contain' }}
              priority
            />
            <button
              onClick={() => setCollapsed(true)}
              style={{ color: 'var(--text-muted)' }}
              className="hover:opacity-100 opacity-70 transition ml-auto"
            >
              <PanelLeftClose size={20} />
            </button>
          </>
        )}
      </div>

      {/* Home */}
      <button
        onClick={() => router.push('/dashboard')}
        style={{ color: 'var(--text-primary)' }}
        className="flex items-center gap-3 px-4 py-3 w-full text-left transition"
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-sidebar-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span style={{ color: 'var(--text-muted)' }}><Home size={20} /></span>
        {!collapsed && <span className="text-sm font-medium">Home</span>}
      </button>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--border)' }} className="mx-3 my-1" />

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const visibleChildren = item.children.filter(
            (c) => !c.permission || can(role, c.permission)
          )
          if (visibleChildren.length === 0) return null
          const isOpen = openMenus.includes(item.label)
          return (
            <div key={item.label}>
              <button
                onClick={() => toggleMenu(item.label)}
                style={{ color: 'var(--text-primary)' }}
                className="w-full flex items-center gap-3 px-4 py-3 transition"
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-sidebar-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ color: 'var(--text-muted)' }}>{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                    <span
                      style={{
                        color: 'var(--text-muted)',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                        display: 'flex',
                      }}
                    >
                      <ChevronDown size={16} />
                    </span>
                  </>
                )}
              </button>

              {!collapsed && (
                <Accordion open={isOpen}>
                  <div style={{ background: 'var(--bg-sub)' }}>
                    {visibleChildren.map((child) => (
                      <button
                        key={child.href}
                        onClick={() => router.push(child.href)}
                        style={{ color: 'var(--text-muted)' }}
                        className="w-full text-left px-10 py-2 text-sm transition"
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-sidebar-hover)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                </Accordion>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom — Settings accordion */}
      <div style={{ borderTop: '1px solid var(--border)' }} className="p-2">
        <button
          onClick={() => !collapsed && setSettingsOpen(!settingsOpen)}
          style={{ color: 'var(--text-primary)' }}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg transition"
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-sidebar-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <span style={{ color: 'var(--text-muted)' }}><Settings size={18} /></span>
          {!collapsed && (
            <>
              <span className="text-sm flex-1 text-left">Settings</span>
              <span
                style={{
                  color: 'var(--text-muted)',
                  transform: settingsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s ease',
                  display: 'flex',
                }}
              >
                <ChevronDown size={16} />
              </span>
            </>
          )}
        </button>

        {!collapsed && (
          <Accordion open={settingsOpen}>
            <div style={{ background: 'var(--bg-sub)', borderRadius: '0.5rem' }} className="mt-1 overflow-hidden">
              <button
                onClick={toggle}
                style={{ color: 'var(--text-muted)' }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm transition"
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-sidebar-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {dark ? <Sun size={16} /> : <Moon size={16} />}
                <span>{dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
              </button>
              {/* Role switcher — nested accordion */}
              <button
                onClick={() => setRoleOpen(!roleOpen)}
                style={{ color: 'var(--text-muted)' }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm transition"
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-sidebar-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Shield size={16} />
                <span className="flex-1 text-left">Role View</span>
                <span style={{
                  transform: roleOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s ease',
                  display: 'flex',
                }}>
                  <ChevronDown size={14} />
                </span>
              </button>
              <Accordion open={roleOpen}>
                <div>
                  {(
                    [
                      { value: 'super_user', label: 'Super User' },
                      { value: 'read_write', label: 'Read & Write' },
                      { value: 'read_only', label: 'Read Only' },
                    ] as { value: Role; label: string }[]
                  ).map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setRole(r.value)}
                      className="w-full flex items-center gap-3 px-8 py-2 text-sm transition"
                      style={{
                        color: role === r.value ? '#7c3aed' : 'var(--text-muted)',
                        fontWeight: role === r.value ? 600 : 400,
                        background: 'transparent',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-sidebar-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {role === r.value && <span style={{ color: '#7c3aed', fontSize: 8 }}>●</span>}
                      {role !== r.value && <span style={{ fontSize: 8 }}>○</span>}
                      {r.label}
                    </button>
                  ))}
                </div>
              </Accordion>

              <button
                onClick={() => router.push('/login')}
                style={{ color: '#ef4444' }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm transition"
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-sidebar-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </Accordion>
        )}
      </div>
    </aside>
  )
}
