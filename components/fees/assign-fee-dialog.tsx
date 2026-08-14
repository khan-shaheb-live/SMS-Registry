'use client'

import { useState } from 'react'
import { assignFeeAction } from '@/app/staff/fees/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog'
import { Loader2, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { CurrencyDisplay } from '@/components/common/currency-display'

interface AssignFeeDialogProps {
  studentId: string
  studentName: string
  hasFee: boolean
  currentFee?: number
  currentDueDate?: Date | null
  defaultFee?: number
  totalPaid: number
}

export function AssignFeeDialog({
  studentId,
  studentName,
  hasFee,
  currentFee,
  currentDueDate,
  defaultFee,
  totalPaid,
}: AssignFeeDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const initialAmount = currentFee ?? defaultFee ?? 0
  const [feeAmountStr, setFeeAmountStr] = useState<string>(initialAmount.toString())
  
  const parsedFee = parseFloat(feeAmountStr)
  const feeAmount = isNaN(parsedFee) ? 0 : parsedFee
  const newOutstanding = Math.max(0, feeAmount - totalPaid)
  const isInvalid = feeAmount < totalPaid

  const defaultDueDateStr = currentDueDate
    ? new Date(currentDueDate).toISOString().split('T')[0]
    : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  async function handleSubmit(formData: FormData) {
    if (isInvalid) return

    setIsLoading(true)
    setError(null)
    formData.set('studentId', studentId)

    const result = await assignFeeAction(formData)
    setIsLoading(false)

    if (result?.error) {
      setError(result.error)
      return
    }

    toast.success(hasFee ? 'Fee updated successfully' : 'Fee assigned successfully')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val)
      if (!val) {
        setFeeAmountStr(initialAmount.toString())
        setError(null)
      }
    }}>
      <DialogTrigger asChild>
        <Button variant={hasFee ? 'outline' : 'default'} size="sm" className="gap-2">
          <CreditCard className="w-4 h-4" />
          {hasFee ? 'Edit Fee' : 'Assign Fee'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{hasFee ? 'Edit Fee' : 'Assign Fee'}</DialogTitle>
          <DialogDescription>
            Update the fee assignment and payment deadline for {studentName}.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-6 pt-2">
          
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Fee Amount</span>
            </div>
            
            <div className="space-y-1.5">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 dark:text-slate-300 z-10">£</span>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={feeAmountStr}
                  onChange={(e) => setFeeAmountStr(e.target.value)}
                  placeholder="0.00"
                  className={`pl-8 ${isInvalid ? 'border-red-300 focus-visible:ring-red-500' : ''}`}
                  required
                  disabled={isLoading}
                />
              </div>
              {defaultFee !== undefined && (
                <p className="text-xs text-slate-700">Programme default: {formatCurrency(defaultFee)}</p>
              )}
            </div>

            <div className="border-b border-slate-100 pb-2 pt-2">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Due Date</span>
            </div>

            <div className="space-y-1.5">
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={defaultDueDateStr}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Current paid</span>
              <CurrencyDisplay amount={totalPaid} className="text-slate-900 font-medium" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">New outstanding</span>
              <CurrencyDisplay amount={newOutstanding} className="text-slate-900 font-medium" />
            </div>
          </div>

          {(error || isInvalid) && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-sm text-red-700">
              {error || `Fee amount cannot be lower than the amount already paid (${formatCurrency(totalPaid)}).`}
            </div>
          )}

          <div className="flex gap-2 pt-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isInvalid} className="gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

