/**
 * Determine if a submission was late.
 * 
 * A submission is late if submittedAt > assessment deadline.
 * Late submissions are accepted but must be visually flagged.
 */
export function isSubmissionLate(
  submittedAt: Date | string,
  deadline: Date | string
): boolean {
  const submitted = typeof submittedAt === 'string' ? new Date(submittedAt) : submittedAt
  const due = typeof deadline === 'string' ? new Date(deadline) : deadline
  return submitted > due
}

/**
 * Determine the assessment status based on its deadline.
 * 
 * OPEN:          > 7 days until deadline
 * CLOSING_SOON:  1–7 days until deadline
 * CLOSED:        deadline has passed
 */
export type AssessmentStatus = 'OPEN' | 'CLOSING_SOON' | 'CLOSED'

export function getAssessmentStatus(deadline: Date | string): AssessmentStatus {
  const due = typeof deadline === 'string' ? new Date(deadline) : deadline
  const now = new Date()
  const diffMs = due.getTime() - now.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (diffDays <= 0) return 'CLOSED'
  if (diffDays <= 7) return 'CLOSING_SOON'
  return 'OPEN'
}

/**
 * Get a human-readable deadline description for display.
 */
export function getDeadlineDescription(deadline: Date | string): string {
  const due = typeof deadline === 'string' ? new Date(deadline) : deadline
  const now = new Date()
  const diffMs = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return `Closed ${Math.abs(diffDays)} days ago`
  if (diffDays === 0) return 'Due today'
  if (diffDays === 1) return 'Due tomorrow'
  return `Due in ${diffDays} days`
}

/**
 * Check if a student can submit an assessment.
 * 
 * Students can submit (or resubmit) at any time — even after the deadline.
 * Late submissions are accepted and flagged.
 * 
 * Returns: { canSubmit: boolean, reason?: string }
 */
export function canSubmitAssessment(): { canSubmit: boolean; reason?: string } {
  // Per business rules: late submissions are always accepted.
  // This function exists as an extension point if business rules change.
  return { canSubmit: true }
}

/**
 * Format a "LATE" description showing how many days after the deadline.
 */
export function getLateDescription(
  submittedAt: Date | string,
  deadline: Date | string
): string {
  const submitted = typeof submittedAt === 'string' ? new Date(submittedAt) : submittedAt
  const due = typeof deadline === 'string' ? new Date(deadline) : deadline
  const diffMs = submitted.getTime() - due.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffDays >= 1) {
    return `LATE — submitted ${diffDays} day${diffDays !== 1 ? 's' : ''} after deadline`
  }
  return `LATE — submitted ${diffHours} hour${diffHours !== 1 ? 's' : ''} after deadline`
}
