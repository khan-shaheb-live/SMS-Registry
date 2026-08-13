import { GradeClassification } from '@prisma/client'

/**
 * Classify a numeric grade (0–100) into the appropriate grade band.
 * 
 * Classification boundaries:
 *   Distinction  ≥ 70
 *   Merit        ≥ 60
 *   Pass         ≥ 40
 *   Fail         < 40
 */
export function getGradeClassification(grade: number): GradeClassification {
  if (grade < 0 || grade > 100) {
    throw new Error(`Grade must be between 0 and 100, received: ${grade}`)
  }
  if (grade >= 70) return GradeClassification.DISTINCTION
  if (grade >= 60) return GradeClassification.MERIT
  if (grade >= 40) return GradeClassification.PASS
  return GradeClassification.FAIL
}

export const classifyGrade = getGradeClassification;


/**
 * Returns the human-readable label for a classification
 */
export function classificationLabel(classification: GradeClassification): string {
  const labels: Record<GradeClassification, string> = {
    DISTINCTION: 'Distinction',
    MERIT: 'Merit',
    PASS: 'Pass',
    FAIL: 'Fail',
  }
  return labels[classification]
}

/**
 * Validate a grade value — returns error message or null
 */
export function validateGrade(grade: number): string | null {
  if (isNaN(grade)) return 'Grade must be a number'
  if (grade < 0) return 'Grade cannot be less than 0'
  if (grade > 100) return 'Grade cannot exceed 100'
  if (!Number.isInteger(grade)) return 'Grade must be a whole number'
  return null
}
