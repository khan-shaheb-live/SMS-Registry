import { Role } from '@prisma/client'

export type UserRole = 'STAFF' | 'STUDENT'

/**
 * Permission checks for the SMS application.
 * 
 * These are checked at the server/data-access level to prevent
 * unauthorized actions regardless of the UI state.
 */

export const STAFF_ONLY_ACTIONS = [
  'CREATE_STUDENT',
  'EDIT_STUDENT',
  'DELETE_STUDENT',
  'CREATE_PROGRAMME',
  'EDIT_PROGRAMME',
  'ASSIGN_FEE',
  'RECORD_PAYMENT',
  'CREATE_ASSESSMENT',
  'EDIT_ASSESSMENT',
  'VIEW_ALL_SUBMISSIONS',
  'ENTER_GRADE',
  'EDIT_GRADE',
  'PUBLISH_RESULT',
  'WITHHOLD_RESULT',
  'VIEW_ALL_STUDENTS',
] as const

export type StaffAction = typeof STAFF_ONLY_ACTIONS[number]

export function canPerformAction(role: UserRole, action: StaffAction): boolean {
  return role === 'STAFF'
}

export function requireStaff(role: UserRole): void {
  if (role !== 'STAFF') {
    throw new Error('Unauthorized: Staff access required')
  }
}

export function requireStudentOrStaff(role: UserRole): void {
  if (role !== 'STAFF' && role !== 'STUDENT') {
    throw new Error('Unauthorized')
  }
}

/**
 * Check if a student can access their own data.
 * Students can only view their own records.
 */
export function canStudentAccessRecord(
  studentUserId: string,
  recordStudentId: string
): boolean {
  return studentUserId === recordStudentId
}
