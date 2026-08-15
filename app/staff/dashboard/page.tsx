import { prisma } from '@/lib/db'
import { CurrencyDisplay } from '@/components/common/currency-display'
import {
  Users, CreditCard, FileText, AlertCircle, 
  TrendingUp, BarChart3, ChevronRight, Clock, CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatDateTime, getDaysUntil } from '@/lib/utils'
import { calculateOutstandingBalance, isBalanceOverdue } from '@/lib/business/fees'

export const metadata = { title: 'Dashboard' }

async function getDashboardData() {
  const now = new Date()

  // Student counts by status
  const studentCounts = await prisma.student.groupBy({
    by: ['status'],
    _count: { _all: true },
  })

  const totalStudents = studentCounts.reduce((sum, s) => sum + s._count._all, 0)
  const enrolledCount = studentCounts.find(s => s.status === 'ENROLLED')?._count._all ?? 0
  const deferredCount = studentCounts.find(s => s.status === 'DEFERRED')?._count._all ?? 0
  const withdrawnCount = studentCounts.find(s => s.status === 'WITHDRAWN')?._count._all ?? 0
  const completedCount = studentCounts.find(s => s.status === 'COMPLETED')?._count._all ?? 0

  // Financial overview — aggregate fees and payments
  const feeAggregate = await prisma.fee.aggregate({ _sum: { amount: true } })
  const paymentAggregate = await prisma.payment.aggregate({ _sum: { amount: true } })
  const totalFees = parseFloat(feeAggregate._sum.amount?.toString() ?? '0')
  const totalPaid = parseFloat(paymentAggregate._sum.amount?.toString() ?? '0')
  const totalOutstanding = Math.max(0, totalFees - totalPaid)

  // Students with outstanding or overdue balances
  const studentsWithFees = await prisma.student.findMany({
    include: {
      fee: true,
      payments: { select: { amount: true } },
    },
  })

  const studentsWithBalance = studentsWithFees.filter(s => {
    if (!s.fee) return false
    const paid = s.payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0)
    const outstanding = calculateOutstandingBalance(s.fee.amount, paid)
    return outstanding > 0
  })

  const overdueStudents = studentsWithBalance.filter(s => {
    if (!s.fee) return false
    const paid = s.payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0)
    const outstanding = calculateOutstandingBalance(s.fee.amount, paid)
    return isBalanceOverdue(outstanding, s.fee.dueDate)
  })

  // Assessments
  const assessments = await prisma.assessment.findMany({
    include: {
      _count: { select: { submissions: true } },
    },
    orderBy: { deadline: 'asc' },
  })

  const upcomingAssessments = assessments.filter(a => a.deadline > now).slice(0, 5)

  // Late submissions
  const lateSubmissions = await prisma.submission.count({ where: { isLate: true } })

  // Results awaiting publication
  const unpublishedGrades = await prisma.grade.count({ where: { isPublished: false } })

  // Recent submissions
  const recentSubmissions = await prisma.submission.findMany({
    take: 5,
    orderBy: { submittedAt: 'desc' },
    include: {
      student: { select: { studentId: true, fullName: true } },
      assessment: { select: { title: true, deadline: true } },
    },
  })

  return {
    totalStudents,
    enrolledCount,
    deferredCount,
    withdrawnCount,
    completedCount,
    totalFees,
    totalPaid,
    totalOutstanding,
    studentsWithBalance: studentsWithBalance.length,
    overdueStudents: overdueStudents.length,
    upcomingAssessments,
    lateSubmissions,
    unpublishedGrades,
    recentSubmissions,
  }
}

import { requireStaffSession } from '@/lib/session'

export default async function StaffDashboardPage() {
  const data = await getDashboardData()
  const session = await requireStaffSession()
  const displayName = session.fullName ?? session.email.split('@')[0]
  const now = new Date()

  const pendingActionsCount = data.overdueStudents + data.lateSubmissions + data.unpublishedGrades

  // Glass card base
  const cardBase = "bg-white/78 backdrop-blur-[24px] rounded-[20px] border border-white/70 p-6 shadow-[0_4px_24px_rgba(15,23,42,0.07),0_1px_4px_rgba(15,23,42,0.04)] transition-all duration-200"
  
  // Math for visual bars
  const collectionRate = data.totalFees > 0 ? (data.totalPaid / data.totalFees) * 100 : 0
  
  const getPct = (val: number) => data.totalStudents > 0 ? (val / data.totalStudents) * 100 : 0
  const enrolledPct = getPct(data.enrolledCount)
  const deferredPct = getPct(data.deferredCount)
  const withdrawnPct = getPct(data.withdrawnCount)
  const completedPct = getPct(data.completedCount)

  return (
    <div className="space-y-6 pb-12">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <h1 className="text-[30px] font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            Good morning, {displayName} <span className="text-[26px]">👋</span>
          </h1>
          <p className="text-[14px] text-slate-700 mt-1 font-medium">
            Registry overview · {formatDate(now)}
          </p>
        </div>
        
        {/* Minimal Status Summary */}
        <div className="flex items-center gap-5 text-[13px] bg-white/78 backdrop-blur-[24px] border border-white/70 px-5 py-2.5 rounded-full shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-700 font-medium">Enrolled <strong className="text-slate-900 ml-1">{data.enrolledCount}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-700 font-medium">Deferred <strong className="text-slate-900 ml-1">{data.deferredCount}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-300" />
            <span className="text-slate-700 font-medium">Withdrawn <strong className="text-slate-900 ml-1">{data.withdrawnCount}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-slate-700 font-medium">Completed <strong className="text-slate-900 ml-1">{data.completedCount}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className={cardBase}>
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800/80">
              <Users className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
          <p className="text-[14px] font-medium text-slate-700 mb-1">Total Students</p>
          <p className="text-[32px] font-semibold text-slate-900 tabular-nums tracking-tight leading-none mb-3">
            {data.totalStudents}
          </p>
          <div className="flex items-center gap-2 mt-auto">
             <span className="text-[12px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded flex items-center gap-1">
               <CheckCircle2 className="w-3 h-3" /> {data.enrolledCount} Active
             </span>
             <span className="text-[12px] text-slate-600 font-medium">Currently enrolled</span>
          </div>
        </div>

        <div className={cardBase}>
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800/80">
              <CreditCard className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
          <p className="text-[14px] font-medium text-slate-700 mb-1">Outstanding Balance</p>
          <p className="text-[32px] font-semibold text-slate-900 tabular-nums tracking-tight leading-none mb-3">
            <CurrencyDisplay amount={data.totalOutstanding} />
          </p>
          <div className="flex items-center gap-2 mt-auto">
            <span className="text-[12px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {data.studentsWithBalance} Students
            </span>
            <span className="text-[12px] text-slate-600 font-medium">Have remaining balances</span>
          </div>
        </div>

        <div className={cardBase}>
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800/80">
              <TrendingUp className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
          <p className="text-[14px] font-medium text-slate-700 mb-1">Payments Received</p>
          <p className="text-[32px] font-semibold text-slate-900 tabular-nums tracking-tight leading-none mb-3">
            <CurrencyDisplay amount={data.totalPaid} />
          </p>
          <div className="flex items-center gap-2 mt-auto">
            <span className="text-[12px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded">
              {collectionRate.toFixed(1)}%
            </span>
            <span className="text-[12px] text-slate-600 font-medium">Of assigned fees collected</span>
          </div>
        </div>

        <div className={cardBase}>
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center border border-amber-100 dark:border-amber-900/40">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-[14px] font-medium text-slate-700 mb-1">Pending Actions</p>
          <p className="text-[32px] font-semibold text-slate-900 tabular-nums tracking-tight leading-none mb-3">
            {pendingActionsCount}
          </p>
          <div className="flex items-center gap-2 mt-auto">
            {pendingActionsCount > 0 ? (
               <span className="text-[12px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded">
                 Requires Review
               </span>
            ) : (
               <span className="text-[12px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded">
                 All Clear
               </span>
            )}
            <span className="text-[12px] text-slate-600 font-medium">Items need attention</span>
          </div>
        </div>
      </div>

      {/* 3. ANALYTICS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Financial Performance Hero */}
        <div className={`lg:col-span-2 ${cardBase} flex flex-col justify-between`}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-[18px] font-semibold text-slate-900">Financial Performance</h2>
              <p className="text-[14px] text-slate-700 mt-0.5">Fee collection and outstanding balance overview</p>
            </div>
            <Link href="/staff/fees" className="text-[13px] font-medium text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-1 group">
              View details <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          
          <div className="mb-8">
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-[36px] font-semibold text-slate-900 tabular-nums leading-none tracking-tight">
                  {collectionRate.toFixed(1)}%
                </p>
                <p className="text-[14px] font-medium text-slate-700 mt-2">Overall Collection Rate</p>
              </div>
              <div className="text-right">
                <p className="text-[20px] font-semibold text-slate-900 tabular-nums leading-tight">
                  <CurrencyDisplay amount={data.totalPaid} />
                </p>
                <p className="text-[14px] font-medium text-slate-700 mt-1">Total Collected</p>
              </div>
            </div>

            {/* Premium Horizontal Progress */}
            <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
               <div className="bg-slate-900 dark:bg-white h-full rounded-full relative z-10 transition-all duration-700 ease-out" style={{ width: `${collectionRate}%` }} />
            </div>
            
            <div className="flex justify-between items-center mt-3 text-[13px]">
              <span className="font-medium text-slate-900"><CurrencyDisplay amount={data.totalPaid} /> <span className="text-slate-700 font-normal ml-1">Collected</span></span>
              <span className="font-medium text-slate-900"><CurrencyDisplay amount={data.totalOutstanding} /> <span className="text-slate-700 font-normal ml-1">Outstanding</span></span>
              <span className="font-medium text-slate-700">Total: <CurrencyDisplay amount={data.totalFees} /></span>
            </div>
          </div>
        </div>

        {/* Student Status Overview */}
        <div className={`${cardBase} flex flex-col justify-between`}>
          <div className="mb-6">
            <h2 className="text-[18px] font-semibold text-slate-900">Student Status</h2>
            <p className="text-[14px] text-slate-700 mt-0.5">Current enrollment distribution</p>
          </div>
          
          <div className="flex-1 flex flex-col justify-center mb-6">
            <div className="flex items-end gap-2 mb-4">
              <span className="text-[40px] font-semibold text-slate-900 leading-none tracking-tight">{data.totalStudents}</span>
              <span className="text-[14px] font-medium text-slate-700 mb-1">Total Students</span>
            </div>
            
            {/* Distribution Bar */}
            <div className="w-full h-3 rounded-full overflow-hidden flex gap-0.5 mb-5 shadow-inner">
               {enrolledPct > 0 && <div className="bg-emerald-500 h-full transition-all duration-700" style={{ width: `${enrolledPct}%` }} title="Enrolled" />}
               {deferredPct > 0 && <div className="bg-amber-500 h-full transition-all duration-700" style={{ width: `${deferredPct}%` }} title="Deferred" />}
               {withdrawnPct > 0 && <div className="bg-slate-300 h-full transition-all duration-700" style={{ width: `${withdrawnPct}%` }} title="Withdrawn" />}
               {completedPct > 0 && <div className="bg-blue-500 h-full transition-all duration-700" style={{ width: `${completedPct}%` }} title="Completed" />}
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500"/><span className="text-slate-600">Enrolled</span></div>
                <span className="font-semibold text-slate-900">{data.enrolledCount}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-amber-500"/><span className="text-slate-600">Deferred</span></div>
                <span className="font-semibold text-slate-900">{data.deferredCount}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-slate-300"/><span className="text-slate-600">Withdrawn</span></div>
                <span className="font-semibold text-slate-900">{data.withdrawnCount}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-blue-500"/><span className="text-slate-600">Completed</span></div>
                <span className="font-semibold text-slate-900">{data.completedCount}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. OPERATIONS & ACTIVITY ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Needs Attention */}
        <div className={`${cardBase} flex flex-col`}>
          <div className="mb-5">
            <h2 className="text-[16px] font-semibold text-slate-900">Needs Attention</h2>
            <p className="text-[13px] text-slate-700 mt-0.5">Items requiring staff action</p>
          </div>
          
          <div className="flex-1 space-y-2">
            {pendingActionsCount === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-3 opacity-50" />
                <p className="text-[14px] font-medium text-slate-600">All caught up</p>
              </div>
            ) : (
              <>
                {data.overdueStudents > 0 && (
                  <Link href="/staff/fees?filter=overdue" className="group flex items-center justify-between p-3 -mx-3 rounded-[12px] hover:bg-indigo-50/20 dark:hover:bg-slate-900/40 transition-colors duration-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-slate-900 dark:text-slate-100">Overdue balances</p>
                        <p className="text-[13px] text-slate-700 dark:text-slate-300">{data.overdueStudents} student{data.overdueStudents !== 1 ? 's' : ''} require follow-up</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                )}
                
                {data.lateSubmissions > 0 && (
                  <Link href="/staff/submissions?filter=late" className="group flex items-center justify-between p-3 -mx-3 rounded-[12px] hover:bg-indigo-50/20 dark:hover:bg-slate-900/40 transition-colors duration-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-slate-900 dark:text-slate-100">Late submissions</p>
                        <p className="text-[13px] text-slate-700 dark:text-slate-300">{data.lateSubmissions} submission{data.lateSubmissions !== 1 ? 's' : ''} received late</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                )}
                
                {data.unpublishedGrades > 0 && (
                  <Link href="/staff/results?filter=unpublished" className="group flex items-center justify-between p-3 -mx-3 rounded-[12px] hover:bg-indigo-50/20 dark:hover:bg-slate-900/40 transition-colors duration-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-slate-900 dark:text-slate-100">Pending results</p>
                        <p className="text-[13px] text-slate-700 dark:text-slate-300">{data.unpublishedGrades} result{data.unpublishedGrades !== 1 ? 's' : ''} awaiting publication</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* Upcoming Assessments */}
        <div className={`${cardBase} flex flex-col`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[16px] font-semibold text-slate-900">Upcoming Assessments</h2>
              <p className="text-[13px] text-slate-700 mt-0.5">Deadlines in the near future</p>
            </div>
            <Link href="/staff/assessments" className="text-[12px] font-medium text-slate-600 hover:text-slate-900 transition-colors">
              View all
            </Link>
          </div>
          
          <div className="flex-1 space-y-4">
            {data.upcomingAssessments.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-center py-6">
                 <p className="text-[14px] text-slate-700">No upcoming assessments</p>
               </div>
            ) : (
              data.upcomingAssessments.map((a) => {
                const daysLeft = getDaysUntil(a.deadline)
                const isUrgent = daysLeft <= 3
                return (
                  <div key={a.id} className="group">
                    <Link href={`/staff/assessments/${a.id}`} className="block">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 pr-3">
                          <p className="text-[14px] font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">{a.title}</p>
                          <p className="text-[13px] text-slate-700 truncate mt-0.5">{a.module}</p>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0 text-right">
                          <span className={`text-[12px] font-medium ${isUrgent ? 'text-amber-600' : 'text-slate-600'}`}>
                            {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                          </span>
                          <span className="text-[11px] text-slate-600 mt-0.5">Open</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className={`${cardBase} flex flex-col`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[16px] font-semibold text-slate-900">Recent Submissions</h2>
              <p className="text-[13px] text-slate-700 mt-0.5">Latest student activity</p>
            </div>
            <Link href="/staff/submissions" className="text-[12px] font-medium text-slate-600 hover:text-slate-900 transition-colors">
              View all
            </Link>
          </div>
          
          <div className="flex-1 space-y-4">
            {data.recentSubmissions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-6">
                <p className="text-[14px] text-slate-700">No submissions yet</p>
              </div>
            ) : (
              data.recentSubmissions.map((sub) => {
                const initials = sub.student.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                return (
                  <div key={sub.id} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{initials}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium text-slate-900 truncate">{sub.student.fullName}</p>
                      <p className="text-[13px] text-slate-700 truncate">{sub.assessment.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-slate-600">{formatDateTime(sub.submittedAt)}</span>
                        {sub.isLate && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">Late</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


