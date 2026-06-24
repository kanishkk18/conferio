import { DocRole } from '@prisma/client'

export const ROLE_PERMISSIONS = {
  OWNER: ['read', 'write', 'delete', 'admin', 'invite'],
  ADMIN: ['read', 'write', 'delete', 'invite'],
  EDITOR: ['read', 'write'],
  COMMENTER: ['read', 'comment'],
  VIEWER: ['read'],
} as const

export function hasPermission(role: DocRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission as any) || false
}

export function canEdit(role: DocRole): boolean {
  return hasPermission(role, 'write')
}

export function canDelete(role: DocRole): boolean {
  return hasPermission(role, 'delete')
}

export function canInvite(role: DocRole): boolean {
  return hasPermission(role, 'invite')
}
