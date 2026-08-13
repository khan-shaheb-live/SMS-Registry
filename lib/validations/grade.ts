import { z } from 'zod'

export const gradeSchema = z.object({
  submissionId: z.string().min(1, 'Submission is required'),
  grade: z
    .number({
      required_error: 'Grade is required',
      invalid_type_error: 'Grade must be a number',
    })
    .int('Grade must be a whole number')
    .min(0, 'Grade cannot be less than 0')
    .max(100, 'Grade cannot exceed 100'),
})

export const publishResultSchema = z.object({
  submissionId: z.string().min(1),
  isPublished: z.boolean(),
})

export type GradeInput = z.infer<typeof gradeSchema>
export type PublishResultInput = z.infer<typeof publishResultSchema>
