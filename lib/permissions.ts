import type { Role } from '@/components/ThemeProvider'

export type Permission =
  | 'students.view'
  | 'students.create'
  | 'students.edit'
  | 'students.archive'
  | 'offerings.view'
  | 'offerings.create'
  | 'offerings.edit'
  | 'offerings.add_enrolment'

const rolePermissions: Record<Role, Permission[]> = {
  super_user: [
    'students.view',
    'students.create',
    'students.edit',
    'students.archive',
    'offerings.view',
    'offerings.create',
    'offerings.edit',
    'offerings.add_enrolment',
  ],
  read_write: [
    'students.view',
    'students.edit',
    'offerings.view',
    'offerings.edit',
  ],
  read_only: [
    'students.view',
    'offerings.view',
  ],
}

export function can(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false
}

export function canAny(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => can(role, p))
}
