import { z } from 'zod'

export const createAssessmentSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters'),
  module: z
    .string()
    .min(2, 'Module name must be at least 2 characters')
    .max(100, 'Module name must not exceed 100 characters'),
  programmeId: z.string().optional().nullable(),
  academicYear: z
    .string()
    .regex(/^\d{4}-\d{4}$/, 'Academic year must be in the format YYYY-YYYY'),
  description: z.string().max(2000, 'Description must not exceed 2000 characters').optional(),
  deadline: z
    .string()
    .min(1, 'Deadline is required')
    .refine((val) => {
      const date = new Date(val)
      return !isNaN(date.getTime())
    }, 'Please enter a valid deadline'),
})

export const updateAssessmentSchema = createAssessmentSchema.partial().extend({
  id: z.string().min(1),
})

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>
export type UpdateAssessmentInput = z.infer<typeof updateAssessmentSchema>
