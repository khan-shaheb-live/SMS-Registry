import { prisma } from '@/lib/db'
import { requireStudentSession } from '@/lib/session'
import { FeeStatusBadge } from '@/components/common/status-badges'
import { CurrencyDisplay } from '@/components/common/currency-display'
import { calculateOutstandingBalance, getFeeStatus } from '@/lib/business/fees'
import { formatDate, formatCurrency } from '@/lib/utils'
import { CreditCard, AlertCircle } from 'lucide-react'

export const metadata = { title: 'My Fees' }

export default async function StudentFeesPage() {
  const session = await requireStudentSession()

  const student = await prisma.student.findUnique({
    where: { id: session.studentId! },
    include: {
      fee: true,
      payments: { orderBy: { paymentDate: 'desc' } },
    },
  })

  if (!student) return null

  const totalPaid = student.payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0)
  const outstanding = calculateOutstandingBalance(student.fee?.amount ?? null, totalPaid)
  const feeStatus = getFeeStatus(
    student.fee ? parseFloat(student.fee.amount.toString()) : null,
    totalPaid,
    student.fee?.dueDate
  )

  return (
    <div className="space-y-6 w-full pb-10">
      <div>
        <h1 className="text-[28px] sm:text-[30px] font-semibold text-[#0F172A] tracking-tight">
          My Fees & Payments
        </h1>
        <p className="text-[14px] text-[#64748B] mt-1">View your account balance and payment history</p>
      </div>

      {/* Summary */}
      <div className="bg-white/78 backdrop-blur-[24px] rounded-[24px] border border-white/70 shadow-[0_2px_12px_rgba(15,23,42,0.03)] overflow-hidden flex flex-col sm:flex-row">
        <div className="flex-1 p-6 sm:p-8 sm:border-r border-[#E2E8F0]">
          <p className="text-[13px] font-medium text-[#64748B] mb-2 uppercase tracking-wide">Total Fee Assessed</p>
          {student.fee ? (
            <CurrencyDisplay amount={student.fee.amount} className="text-[32px] font-bold text-[#0F172A] leading-none" />
          ) : (
            <span className="text-[32px] font-bold text-[#CBD5E1] leading-none">—</span>
          )}
          {student.fee?.dueDate && (
            <p className="text-[13px] text-[#64748B] mt-3">Due: {formatDate(student.fee.dueDate)}</p>
          )}
        </div>
        <div className="flex-1 p-6 sm:p-8 sm:border-r border-[#E2E8F0]">
          <p className="text-[13px] font-medium text-[#64748B] mb-2 uppercase tracking-wide">Total Paid</p>
          <CurrencyDisplay amount={totalPaid} className="text-[32px] font-bold text-[#10B981] leading-none" />
          <p className="text-[13px] text-[#64748B] mt-3">{student.payments.length} payment(s)</p>
        </div>
        <div className="flex-1 p-6 sm:p-8" style={{ background: 'rgba(241,245,249,0.50)' }}>
          <p className="text-[13px] font-medium text-[#64748B] mb-2 uppercase tracking-wide">Outstanding Balance</p>
          {student.fee ? (
            <div className="flex items-center gap-3">
              <CurrencyDisplay
                amount={outstanding}
                className={`text-[32px] font-bold leading-none ${outstanding > 0 ? 'text-[#EF4444]' : 'text-[#0F172A]'}`}
              />
              <FeeStatusBadge status={feeStatus} />
            </div>
          ) : (
            <span className="text-[32px] font-bold text-[#CBD5E1] leading-none">—</span>
          )}
          {outstanding > 0 && (
            <p className="text-[12px] text-[#64748B] mt-3 leading-snug">Please ensure your balance is cleared before graduation.</p>
          )}
        </div>
      </div>

      {feeStatus === 'OVERDUE' && (
        <div className="bg-red-50 border border-red-100 rounded-[20px] p-5 flex gap-4 items-start shadow-sm">
          <AlertCircle className="w-6 h-6 flex-shrink-0 text-red-600" />
          <div>
            <p className="text-[15px] font-semibold text-red-800 mb-1">Payment Overdue</p>
            <p className="text-[14px] text-red-700 leading-relaxed">Your fee payment is past the due date. Continued non-payment may affect your access to university services and graduation. If you are experiencing financial difficulties, please contact student finance.</p>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white/78 backdrop-blur-[24px] rounded-[24px] border border-white/70 shadow-[0_2px_12px_rgba(15,23,42,0.03)] overflow-hidden mt-6">
        <div className="p-6 border-b border-white/50">
          <h2 className="text-[18px] font-semibold text-[#0F172A]">Payment History</h2>
        </div>
        
        {student.payments.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 bg-[#F4F7FB] rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-6 h-6 text-[#64748B]" />
            </div>
            <p className="text-[15px] font-medium text-[#0F172A]">No payments yet</p>
            <p className="text-[14px] text-[#64748B] mt-1">No payments have been recorded on your account.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-slate-200/70" style={{ background: 'rgba(241,245,249,0.70)' }}>
                  <th className="text-left px-6 py-4 font-medium text-[#64748B]">Date</th>
                  <th className="text-left px-6 py-4 font-medium text-[#64748B]">Reference</th>
                  <th className="text-left px-6 py-4 font-medium text-[#64748B] hidden sm:table-cell">Notes</th>
                  <th className="text-right px-6 py-4 font-medium text-[#64748B]">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {student.payments.map((p) => (
                  <tr key={p.id} className="hover:bg-indigo-50/20 transition-colors duration-100">
                    <td className="px-6 py-4 text-[#0F172A]">{formatDate(p.paymentDate)}</td>
                    <td className="px-6 py-4 font-mono text-[13px] text-[#64748B]">
                      <span className="bg-white/60 backdrop-blur-sm px-2 py-0.5 rounded-md border border-slate-200/60">{p.referenceNumber}</span>
                    </td>
                    <td className="px-6 py-4 text-[#64748B] hidden sm:table-cell">{p.notes ?? '—'}</td>
                    <td className="px-6 py-4 text-right font-semibold text-[#10B981]">
                      {formatCurrency(parseFloat(p.amount.toString()))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

