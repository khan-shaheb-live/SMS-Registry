'use client'

import { useState } from 'react'
import { recordPaymentAction } from '@/app/staff/fees/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2, PlusCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, generateReferenceNumber } from '@/lib/utils'

interface RecordPaymentDialogProps {
  studentId: string
  studentName: string
  outstanding: number
}

export function RecordPaymentDialog({ studentId, studentName, outstanding }: RecordPaymentDialogProps) {
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null)
  const [previewAmount, setPreviewAmount] = useState<string>('')
  const [reference, setReference] = useState(generateReferenceNumber())

  async function handleFormSubmit(formData: FormData) {
    // Show confirmation dialog first
    setPendingFormData(formData)
    setConfirmOpen(true)
  }

  async function handleConfirm() {
    if (!pendingFormData) return
    setIsLoading(true)
    setError(null)

    pendingFormData.set('studentId', studentId)
    const result = await recordPaymentAction(pendingFormData)
    setIsLoading(false)
    setConfirmOpen(false)

    if (result?.error) {
      setError(result.error)
      return
    }

    toast.success(`Payment of ${formatCurrency(parseFloat(previewAmount || '0'))} recorded`)
    setOpen(false)
    setReference(generateReferenceNumber())
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Record Payment
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <form action={handleFormSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="bg-blue-50 rounded-lg px-3 py-2.5">
              <p className="text-sm text-blue-700">
                Recording payment for <strong>{studentName}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                Outstanding balance: <strong>{formatCurrency(outstanding)}</strong>
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="payAmount">Amount (£) <span className="text-red-500">*</span></Label>
              <Input
                id="payAmount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={outstanding}
                value={previewAmount}
                onChange={(e) => setPreviewAmount(e.target.value)}
                placeholder="e.g. 1000.00"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="payDate">Payment Date <span className="text-red-500">*</span></Label>
              <Input
                id="payDate"
                name="paymentDate"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reference">Reference Number <span className="text-red-500">*</span></Label>
              <Input
                id="reference"
                name="referenceNumber"
                value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
                placeholder="PAY-XXXXX"
                required
                disabled={isLoading}
                className="font-mono text-sm"
              />
              <p className="text-xs text-slate-600">Must be unique across all payments</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="e.g. First instalment, Scholarship payment..."
                rows={2}
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={isLoading || !previewAmount} className="gap-2">
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Continue
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Record a payment of <strong>{formatCurrency(parseFloat(previewAmount || '0'))}</strong> for{' '}
              <strong>{studentName}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isLoading} className="gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

