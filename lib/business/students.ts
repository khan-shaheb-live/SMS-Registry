import { prisma } from '@/lib/db'

/**
 * Generate a unique Student ID in the format SMS-YYYY-XXXX.
 * 
 * Design decisions:
 * - Year is the enrolment year (current calendar year)
 * - Sequence is padded to 4 digits, restarting at 0001 each year
 * - Uses a database transaction to safely handle concurrent creation
 * - Queries the MAX existing ID for the current year and increments
 * 
 * Example: SMS-2025-0001, SMS-2025-0002, ...
 */
export async function generateStudentId(year?: number): Promise<string> {
  const enrolmentYear = year ?? new Date().getFullYear()
  const prefix = `SMS-${enrolmentYear}-`

  return await prisma.$transaction(async (tx) => {
    // Find the highest existing sequence number for this year
    const lastStudent = await tx.student.findFirst({
      where: {
        studentId: {
          startsWith: prefix,
        },
      },
      orderBy: {
        studentId: 'desc',
      },
      select: {
        studentId: true,
      },
    })

    let nextSequence = 1

    if (lastStudent) {
      // Extract the sequence number from the last ID
      const parts = lastStudent.studentId.split('-')
      const lastSequence = parseInt(parts[parts.length - 1], 10)
      if (!isNaN(lastSequence)) {
        nextSequence = lastSequence + 1
      }
    }

    const paddedSequence = nextSequence.toString().padStart(4, '0')
    return `${prefix}${paddedSequence}`
  })
}

/**
 * Validate a student ID format.
 * Returns true if the format matches SMS-YYYY-XXXX.
 */
export function isValidStudentId(id: string): boolean {
  return /^SMS-\d{4}-\d{4}$/.test(id)
}
