import { Decimal } from '@prisma/client/runtime/library'

/**
 * Calculate the outstanding balance for a student.
 * 
 * Formula: outstanding = totalFees - totalPayments
 * 
 * Always computed from database values — never trust client-provided balances.
 */
export function calculateOutstandingBalance(
  feeAmount: Decimal | number | string | null,
  totalPayments: Decimal | number | string
): number {
  if (!feeAmount) return 0
  const fee = typeof feeAmount === 'object' ? parseFloat(feeAmount.toString()) : Number(feeAmount)
  const paid = typeof totalPayments === 'object' ? parseFloat(totalPayments.toString()) : Number(totalPayments)
  return Math.max(0, fee - paid)
}

/**
 * Determine if a student has an overdue balance.
 * 
 * A balance is considered overdue if:
 *   - There is an outstanding balance (> 0)
 *   - AND the fee due date has passed
 */
export function isBalanceOverdue(
  outstandingBalance: number,
  dueDate: Date | string | null | undefined
): boolean {
  if (outstandingBalance <= 0) return false
  if (!dueDate) return false
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  return due < new Date()
}

/**
 * Fee status for display purposes
 */
export type FeeStatus = 'PAID' | 'OUTSTANDING' | 'OVERDUE'

export function getFeeStatus(
  feeAmount: number | null,
  totalPayments: number,
  dueDate: Date | string | null | undefined
): FeeStatus {
  if (!feeAmount) return 'OUTSTANDING'
  const outstanding = calculateOutstandingBalance(feeAmount, totalPayments)
  if (outstanding <= 0) return 'PAID'
  if (isBalanceOverdue(outstanding, dueDate)) return 'OVERDUE'
  return 'OUTSTANDING'
}
