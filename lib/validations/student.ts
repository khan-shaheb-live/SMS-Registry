import { z } from 'zod'
import { StudentStatus } from '@prisma/client'

export const ACADEMIC_YEAR_REGEX = /^\d{4}-\d{4}$/

export const createStudentSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Full name may only contain letters, spaces, hyphens, and apostrophes'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(255, 'Email address is too long'),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((val) => {
      const date = new Date(val)
      const now = new Date()
      const age = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      return age >= 15 && age <= 100
    }, 'Date of birth must represent an age between 15 and 100'),
  programmeId: z.string().min(1, 'Please select a programme'),
  academicYear: z
    .string()
    .regex(ACADEMIC_YEAR_REGEX, 'Academic year must be in the format YYYY-YYYY (e.g. 2024-2025)'),
  status: z.nativeEnum(StudentStatus, {
    errorMap: () => ({ message: 'Please select a valid enrolment status' }),
  }),
})

export const updateStudentSchema = createStudentSchema.partial().extend({
  id: z.string().min(1, 'Student ID is required'),
})

export type CreateStudentInput = z.infer<typeof createStudentSchema>
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>
