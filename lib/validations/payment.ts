import { z } from 'zod'

export const assignFeeSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  amount: z
    .number({
      required_error: 'Fee amount is required',
      invalid_type_error: 'Fee amount must be a number',
    })
    .positive('Fee amount must be greater than £0')
    .max(100000, 'Fee amount seems unreasonably large'),
  dueDate: z
    .string()
    .min(1, 'Due date is required')
    .refine((val) => {
      const date = new Date(val)
      return !isNaN(date.getTime())
    }, 'Please enter a valid due date'),
})

export const recordPaymentSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  amount: z
    .number({
      required_error: 'Payment amount is required',
      invalid_type_error: 'Payment amount must be a number',
    })
    .positive('Payment amount must be greater than £0')
    .max(100000, 'Payment amount seems unreasonably large'),
  paymentDate: z
    .string()
    .min(1, 'Payment date is required')
    .refine((val) => {
      const date = new Date(val)
      return !isNaN(date.getTime())
    }, 'Please enter a valid payment date'),
  referenceNumber: z
    .string()
    .min(1, 'Reference number is required')
    .max(50, 'Reference number must not exceed 50 characters')
    .regex(/^[A-Z0-9_-]+$/i, 'Reference number may only contain letters, numbers, hyphens, and underscores'),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
})

export type AssignFeeInput = z.infer<typeof assignFeeSchema>
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>
