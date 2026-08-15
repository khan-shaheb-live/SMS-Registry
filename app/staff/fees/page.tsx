import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/common/page-header'
import { FeeStatusBadge } from '@/components/common/status-badges'
import { CurrencyDisplay } from '@/components/common/currency-display'
import { EmptyState } from '@/components/common/empty-state'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { calculateOutstandingBalance, getFeeStatus } from '@/lib/business/fees'
import { formatDate } from '@/lib/utils'
import { CreditCard, AlertTriangle, Wallet, ArrowUpRight, Clock, Search, X } from 'lucide-react'
import { SearchInput } from '@/components/common/search-input'

export const metadata = { title: 'Fees & Payments' }

export default async function FeesPage({
  searchParams,
}: {
  searchParams: { filter?: string; search?: string }
}) {
  const students = await prisma.student.findMany({
    include: {
      programme: { select: { name: true } },
      fee: true,
      payments: { select: { amount: true, paymentDate: true } },
    },
    orderBy: { fullName: 'asc' },
  })

  type FeeStudent = typeof students[number] & {
    totalPaid: number
    outstanding: number
    feeStatus: 'PAID' | 'OUTSTANDING' | 'OVERDUE'
  }

  const studentsWithStatus: FeeStudent[] = students.map((s) => {
    const totalPaid = s.payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0)
    const outstanding = calculateOutstandingBalance(s.fee?.amount ?? null, totalPaid)
    const feeStatus = getFeeStatus(
      s.fee ? parseFloat(s.fee.amount.toString()) : null,
      totalPaid,
      s.fee?.dueDate
    )
    return { ...s, totalPaid, outstanding, feeStatus }
  })

  // Calculate Global Metrics
  const studentsWithFeesCount = studentsWithStatus.filter(s => s.fee).length || 1 // avoid div by 0
  const totalFeesAssigned = studentsWithStatus.reduce((sum, s) => sum + (s.fee ? parseFloat(s.fee.amount.toString()) : 0), 0)
  const totalCollected = studentsWithStatus.reduce((sum, s) => sum + s.totalPaid, 0)
  const totalOutstanding = studentsWithStatus.reduce((sum, s) => sum + s.outstanding, 0)
  const totalOverdueAmount = studentsWithStatus.reduce((sum, s) => sum + (s.feeStatus === 'OVERDUE' ? s.outstanding : 0), 0)
  
  const collectionRate = totalFeesAssigned > 0 ? (totalCollected / totalFeesAssigned) * 100 : 0
  const outstandingRate = totalFeesAssigned > 0 ? (totalOutstanding / totalFeesAssigned) * 100 : 0
  
  const avgFeePerStudent = totalFeesAssigned / studentsWithFeesCount
  
  const fullyPaidCount = studentsWithStatus.filter(s => s.feeStatus === 'PAID').length
  const outstandingCount = studentsWithStatus.filter(s => s.outstanding > 0).length
  const overdueCount = studentsWithStatus.filter(s => s.feeStatus === 'OVERDUE').length

  const filter = searchParams.filter || 'all'
  const search = searchParams.search || ''

  let filtered = studentsWithStatus

  if (filter === 'overdue') {
    filtered = filtered.filter(s => s.feeStatus === 'OVERDUE')
  } else if (filter === 'outstanding') {
    filtered = filtered.filter(s => s.feeStatus === 'OUTSTANDING' || s.feeStatus === 'OVERDUE')
  } else if (filter === 'paid') {
    filtered = filtered.filter(s => s.feeStatus === 'PAID')
  }

  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(s => 
      s.fullName.toLowerCase().includes(q) || 
      s.studentId.toLowerCase().includes(q) ||
      s.programme.name.toLowerCase().includes(q)
    )
  }

  const buildUrl = (newFilter: string) => {
    const params = new URLSearchParams()
    if (newFilter !== 'all') params.set('filter', newFilter)
    if (search) params.set('search', search)
    return `/staff/fees?${params.toString()}`
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Fees & Payments" 
        description="Manage student fee assignments and payment records" 
      />

      {/* Financial Overview (Primary KPIs) */}
      <div className="bg-white/78 backdrop-blur-[24px] border border-white/70 rounded-[20px] overflow-hidden shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/50">
          
          {/* Card 1: Total Assigned */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-700">Total Fees</h3>
              <Wallet className="w-4 h-4 text-slate-600" />
            </div>
            <CurrencyDisplay amount={totalFeesAssigned} size="lg" className="text-3xl font-semibold text-slate-900 block mb-1" />
            <div className="flex items-center text-sm text-slate-700">
              <span>{studentsWithFeesCount} students</span>
              <span className="mx-2 text-slate-300">•</span>
              <span>Avg <CurrencyDisplay amount={avgFeePerStudent} size="sm" />/student</span>
            </div>
          </div>

          {/* Card 2: Total Collected */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-700">Total Paid</h3>
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            </div>
            <CurrencyDisplay amount={totalCollected} size="lg" className="text-3xl font-semibold text-emerald-600 block mb-1" />
            <div className="flex items-center text-sm text-slate-700">
              <span className="font-medium text-emerald-600">{collectionRate.toFixed(1)}%</span>
              <span className="ml-1">collected</span>
            </div>
          </div>

          {/* Card 3: Outstanding */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-700">Outstanding</h3>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <CurrencyDisplay amount={totalOutstanding} size="lg" className="text-3xl font-semibold text-amber-600 block mb-1" />
            <div className="flex items-center text-sm text-slate-700">
              <span className="font-medium text-amber-600">{outstandingRate.toFixed(1)}%</span>
              <span className="ml-1">remaining</span>
            </div>
          </div>

          {/* Card 4: Overdue */}
          <div className="p-6 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-700">Overdue</h3>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <CurrencyDisplay amount={totalOverdueAmount} size="lg" className="text-3xl font-semibold text-red-600 block mb-1" />
            <div className="flex items-center text-sm text-red-600/80">
              <span>{overdueCount} {overdueCount === 1 ? 'student' : 'students'} overdue</span>
            </div>
          </div>
        </div>

        {/* Global Collection Progress Bar */}
        <div className="px-6 py-4 border-t border-slate-200/50 dark:border-slate-800/60 bg-slate-100/60 dark:bg-slate-900/40">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-slate-700 dark:text-slate-300">Collection Progress</span>
            <span className="font-medium text-slate-900 dark:text-white">{collectionRate.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500" 
              style={{ width: `${collectionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Financial Health Summary */}
        <div className="bg-white/78 backdrop-blur-[24px] border border-white/70 rounded-[20px] p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-6">Financial Health</h3>
            <div className="space-y-5">
              <div className="flex items-center justify-between p-3 rounded-[12px] bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100/80 dark:border-slate-800/60">
                <span className="text-sm text-slate-600">Collection Rate</span>
                <div className="text-right">
                  <span className="text-lg font-semibold text-emerald-600 block">{collectionRate.toFixed(1)}%</span>
                  <span className="text-xs text-slate-700"><CurrencyDisplay amount={totalCollected} size="sm" /> from <CurrencyDisplay amount={totalFeesAssigned} size="sm" /></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-700 mb-1">Total Assigned</p>
                  <CurrencyDisplay amount={totalFeesAssigned} className="text-slate-900 font-medium" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700 mb-1">Total Collected</p>
                  <CurrencyDisplay amount={totalCollected} className="text-emerald-600 font-medium" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700 mb-1">Total Outstanding</p>
                  <CurrencyDisplay amount={totalOutstanding} className="text-amber-600 font-medium" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700 mb-1">Overdue Amount</p>
                  <CurrencyDisplay amount={totalOverdueAmount} className="text-red-600 font-medium" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status & Attention */}
        <div className="space-y-6">
            <div className="bg-white/78 backdrop-blur-[24px] border border-white/70 rounded-[20px] p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
            <h3 className="text-base font-semibold text-slate-900 mb-6">Payment Status</h3>
            <div className="space-y-4">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium text-slate-700">Fully Paid</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-slate-900">{fullyPaidCount} <span className="text-slate-700 font-normal">students</span></span>
                  <span className="text-xs text-slate-600 ml-3 tabular-nums">{studentsWithFeesCount > 0 ? ((fullyPaidCount / studentsWithFeesCount) * 100).toFixed(1) : 0}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-sm font-medium text-slate-700">Outstanding</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-slate-900">{outstandingCount - overdueCount} <span className="text-slate-700 font-normal">students</span></span>
                  <span className="text-xs text-slate-600 ml-3 tabular-nums">{studentsWithFeesCount > 0 ? (((outstandingCount - overdueCount) / studentsWithFeesCount) * 100).toFixed(1) : 0}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-slate-700">Overdue</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-slate-900">{overdueCount} <span className="text-slate-700 font-normal">students</span></span>
                  <span className="text-xs text-slate-600 ml-3 tabular-nums">{studentsWithFeesCount > 0 ? ((overdueCount / studentsWithFeesCount) * 100).toFixed(1) : 0}%</span>
                </div>
              </div>

            </div>
          </div>

          {overdueCount > 0 && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-red-900 dark:text-red-400 mb-1 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Attention Required
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {overdueCount} {overdueCount === 1 ? 'student has' : 'students have'} <span className="font-semibold"><CurrencyDisplay amount={totalOverdueAmount} size="sm" /></span> in overdue balances.
                </p>
              </div>
              <Link href="/staff/fees?filter=overdue">
                <Button size="sm" variant="outline" className="bg-white dark:bg-slate-900 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
                  View Overdue →
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Student Payment Records */}
      <div className="space-y-4">
        
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <SearchInput defaultValue={search} glass />

          <div className="flex p-1 bg-white/78 backdrop-blur-[24px] border border-white/70 rounded-[12px] w-full sm:w-auto overflow-x-auto shadow-[0_2px_8px_rgba(15,23,42,0.02)]">
            <Link
              href={buildUrl('all')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-[8px] whitespace-nowrap transition-all duration-150 ${
                filter === 'all' 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 dark:hover:bg-slate-800/60'
              }`}
            >
              All Records
            </Link>
            <Link
              href={buildUrl('paid')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-[8px] whitespace-nowrap transition-all duration-150 ${
                filter === 'paid' 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 dark:hover:bg-slate-800/60'
              }`}
            >
              Paid
            </Link>
            <Link
              href={buildUrl('outstanding')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-[8px] whitespace-nowrap transition-all duration-150 ${
                filter === 'outstanding' 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 dark:hover:bg-slate-800/60'
              }`}
            >
              Outstanding
            </Link>
            <Link
              href={buildUrl('overdue')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-[8px] whitespace-nowrap transition-all duration-150 ${
                filter === 'overdue' 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 dark:hover:bg-slate-800/60'
              }`}
            >
              Overdue
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/78 backdrop-blur-[24px] border border-white/70 rounded-[20px] overflow-hidden shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
          {filtered.length === 0 ? (
            <EmptyState icon={CreditCard} title="No students match this filter" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200/70 dark:border-slate-800/60 bg-[#F1F5F9]/70 dark:bg-slate-900/60">
                    <th className="text-left px-4 py-3.5 font-medium text-slate-600">Student</th>
                    <th className="text-left px-4 py-3.5 font-medium text-slate-600 hidden md:table-cell">Programme</th>
                    <th className="text-right px-4 py-3.5 font-medium text-slate-600">Total Fee</th>
                    <th className="text-right px-4 py-3.5 font-medium text-slate-600">Paid</th>
                    <th className="text-right px-4 py-3.5 font-medium text-slate-600">Outstanding</th>
                    <th className="text-left px-4 py-3.5 font-medium text-slate-600 hidden sm:table-cell">Due Date</th>
                    <th className="text-left px-4 py-3.5 font-medium text-slate-600">Status</th>
                    <th className="text-right px-4 py-3.5 font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filtered.map((s) => {
                    const studentFeeAmount = s.fee ? parseFloat(s.fee.amount.toString()) : 0
                    const studentCollectionRate = studentFeeAmount > 0 ? (s.totalPaid / studentFeeAmount) * 100 : 0
                    
                    return (
                      <tr key={s.id} className="hover:bg-indigo-50/20 transition-colors duration-100">
                        <td className="px-4 py-3">
                          <Link href={`/staff/students/${s.id}`} className="hover:text-blue-600">
                            <p className="font-medium text-slate-900">{s.fullName}</p>
                            <p className="text-xs text-slate-700 font-mono mt-0.5">{s.studentId}</p>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{s.programme.name}</td>
                        
                        <td className="px-4 py-3 text-right">
                          <CurrencyDisplay amount={studentFeeAmount} className="text-slate-900" />
                        </td>
                        
                        <td className="px-4 py-3 text-right">
                          <div className="flex flex-col items-end gap-1.5">
                            <CurrencyDisplay amount={s.totalPaid} className="text-emerald-600 font-medium" />
                            {studentFeeAmount > 0 && (
                              <div className="w-16 h-1 bg-slate-100 dark:bg-slate-950/60 rounded-full overflow-hidden flex">
                                <div 
                                  className="h-full bg-emerald-500 transition-all" 
                                  style={{ width: `${Math.min(studentCollectionRate, 100)}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-4 py-3 text-right">
                          <CurrencyDisplay
                            amount={s.outstanding}
                            className={s.outstanding > 0 ? 'text-slate-900 font-medium' : 'text-slate-600'}
                          />
                        </td>
                        
                        <td className="px-4 py-3 text-slate-700 hidden sm:table-cell whitespace-nowrap">
                          {s.fee?.dueDate ? formatDate(s.fee.dueDate) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <FeeStatusBadge status={s.feeStatus} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/staff/students/${s.id}#fees`}>
                            <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                              Manage
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


