/**
 * Determine if a student can view a result.
 * 
 * A student can view their result ONLY if:
 * 1. A grade exists for their submission
 * 2. The grade has been published (isPublished = true)
 * 
 * This is enforced server-side — student data queries filter on isPublished.
 * This function documents the rule explicitly.
 */
export function canViewResult(isPublished: boolean): boolean {
  return isPublished === true
}

/**
 * Determine if a staff member can publish a result.
 * 
 * A result can only be published if a grade has been entered.
 */
export function canPublishResult(gradeValue: number | null | undefined): boolean {
  return gradeValue !== null && gradeValue !== undefined
}
