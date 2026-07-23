// CrimeSphere AI — Role-Based Access Control (RBAC) Utility
import type { Role } from '../types';

export const ROLE_HIERARCHY: Record<Role, number> = {
  commissioner: 5,
  inspector: 4,
  sub_inspector: 3,
  head_constable: 2,
  constable: 1,
};

export const ROLE_LABELS: Record<Role, string> = {
  commissioner: 'Commissioner of Police',
  inspector: 'Inspector of Police',
  sub_inspector: 'Sub Inspector (SI)',
  head_constable: 'Head Constable',
  constable: 'Police Constable',
};

export type PermissionKey =
  | 'VIEW_COMMISSIONER_MODULES'
  | 'VIEW_COMMISSIONER_CARDS'
  | 'MANAGE_POLICE_STATIONS'
  | 'MANAGE_OFFICERS'
  | 'VIEW_DISTRICT_ANALYTICS'
  | 'VIEW_CRIME_ANALYTICS'
  | 'VIEW_REPORTS'
  | 'TRANSFER_CASES'
  | 'ASSIGN_OFFICERS'
  | 'VIEW_PERFORMANCE'
  | 'GENERATE_FIR'
  | 'CREATE_COMPLAINT'
  | 'DELETE_CASES'
  | 'MANAGE_USERS'
  | 'MODIFY_LEGAL_SECTIONS'
  | 'UPDATE_INVESTIGATION'
  | 'UPLOAD_EVIDENCE'
  | 'RECORD_STATEMENTS'
  | 'VIEW_AI_SUGGESTIONS'
  | 'VIEW_ASSIGNED_TASKS_ONLY';

// Define explicit minimum role level required for each permission
const PERMISSION_MIN_LEVEL: Record<PermissionKey, number> = {
  VIEW_COMMISSIONER_MODULES: 5, // Commissioner only
  VIEW_COMMISSIONER_CARDS: 5,   // Commissioner only
  MANAGE_POLICE_STATIONS: 5,    // Commissioner only
  MANAGE_OFFICERS: 5,           // Commissioner only
  VIEW_DISTRICT_ANALYTICS: 5,   // Commissioner only
  VIEW_CRIME_ANALYTICS: 5,      // Commissioner only
  VIEW_PERFORMANCE: 5,          // Commissioner only
  TRANSFER_CASES: 5,            // Commissioner only
  ASSIGN_OFFICERS: 5,           // Commissioner only
  MANAGE_USERS: 5,              // Commissioner only

  DELETE_CASES: 4,              // Commissioner & Inspector

  GENERATE_FIR: 3,              // Commissioner, Inspector & Sub Inspector
  CREATE_COMPLAINT: 3,          // Commissioner, Inspector & Sub Inspector
  VIEW_REPORTS: 3,              // Commissioner, Inspector & Sub Inspector

  MODIFY_LEGAL_SECTIONS: 2,     // Commissioner, Inspector, SI, Head Constable
  UPDATE_INVESTIGATION: 2,      // Commissioner, Inspector, SI, Head Constable
  VIEW_AI_SUGGESTIONS: 2,       // Commissioner, Inspector, SI, Head Constable

  UPLOAD_EVIDENCE: 1,           // All roles (including Constable)
  RECORD_STATEMENTS: 1,         // All roles (including Constable)
  VIEW_ASSIGNED_TASKS_ONLY: 1,  // Constable & Head Constable default mode
};

/**
  Check if a given role has permission to perform an action.
 */
export function hasPermission(role: Role | undefined | null, permission: PermissionKey): boolean {
  if (!role) return false;
  const userLevel = ROLE_HIERARCHY[role] ?? 0;
  const requiredLevel = PERMISSION_MIN_LEVEL[permission] ?? 99;
  return userLevel >= requiredLevel;
}

/**
  Check if user role is at least a specific role level.
 */
export function isRoleAtLeast(currentRole: Role | undefined | null, targetRole: Role): boolean {
  if (!currentRole) return false;
  return ROLE_HIERARCHY[currentRole] >= ROLE_HIERARCHY[targetRole];
}
