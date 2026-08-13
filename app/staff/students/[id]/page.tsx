import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { StudentStatusBadge, FeeStatusBadge, LateBadge, GradeBadge, PublicationBadge } from '@/components/common/status-badges'
import { CurrencyDisplay } from '@/components/common/currency-display'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { calculateOutstandingBalance, getFeeStatus } from '@/lib/business/fees'
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils'
import { Edit, ArrowLeft, CreditCard, FileText, BarChart3, AlertTriangle } from 'lucide-react'
import { AssignFeeDialog } from '@/components/fees/assign-fee-dialog'
import { RecordPaymentDialog } from '@/components/fees/record-payment-dialog'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const student = await prisma.student.findUnique({ where: { id: params.id }, select: { fullName: true } })
  return { title: student?.fullName ?? 'Student' }
}

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      programme: true,
      fee: true,
      payments: { orderBy: { paymentDate: 'desc' } },
      submissions: {
        include: {
          assessment: true,
          grade: true,
        },
        orderBy: { submittedAt: 'desc' },
      },
    },
  })

  if (!student) notFound()

  const totalPaid = student.payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0)
  const outstanding = calculateOutstandingBalance(student.fee?.amount ?? null, totalPaid)
  const feeStatus = getFeeStatus(
    student.fee ? parseFloat(student.fee.amount.toString()) : null,
    totalPaid,
    student.fee?.dueDate
  )
  
  const studentFeeAmount = student.fee ? parseFloat(student.fee.amount.toString()) : 0
  const paymentProgress = studentFeeAmount > 0 ? Math.min((totalPaid / studentFeeAmount) * 100, 100) : 0

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div>
        <Link href="/staff/students" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Students
        </Link>
      </div>

      {/* Unified Profile Header Area */}
      <div className="bg-white/70 backdrop-blur-[20px] border border-white/65 rounded-[20px] overflow-hidden shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
        
        {/* Top Header Block */}
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-2">{student.fullName}</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-slate-500">
              <span className="font-mono text-slate-600">{student.studentId}</span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span>{student.programme.name}</span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span>{student.academicYear}</span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <StudentStatusBadge status={student.status} />
            </div>
          </div>
          <Link href={`/staff/students/${student.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2 bg-white w-full sm:w-auto">
              <Edit className="w-4 h-4 text-slate-400" />
              Edit Student
            </Button>
          </Link>
        </div>

        <div className="h-px bg-slate-100 w-full" />

        {/* Info Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          
          {/* Personal Info */}
          <div className="p-6 sm:p-8 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Personal</h2>
            <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
              <span className="text-sm text-slate-500">Date of Birth</span>
              <span className="text-sm font-medium text-slate-900">{formatDate(student.dateOfBirth)}</span>
              
              <span className="text-sm text-slate-500">Email</span>
              <span className="text-sm font-medium text-slate-900 truncate" title={student.email}>{student.email}</span>
            </div>
          </div>

          {/* Academic Info */}
          <div className="p-6 sm:p-8 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Academic</h2>
            <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
              <span className="text-sm text-slate-500">Programme</span>
              <span className="text-sm font-medium text-slate-900 truncate">{student.programme.name}</span>
              
              <span className="text-sm text-slate-500">Academic Year</span>
              <span className="text-sm font-medium text-slate-900">{student.academicYear}</span>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Financial Overview</h2>
              <FeeStatusBadge status={feeStatus} />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Total Fee</p>
                <CurrencyDisplay amount={student.fee?.amount} className="text-slate-900 font-medium" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Paid</p>
                <CurrencyDisplay amount={totalPaid} className="text-emerald-600 font-medium" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Outstanding</p>
                <CurrencyDisplay
                  amount={outstanding}
                  className={outstanding > 0 ? 'text-slate-900 font-medium' : 'text-slate-400 font-medium'}
                />
              </div>
            </div>
            
            {studentFeeAmount > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-500">Payment Progress</span>
                  <span className="font-medium text-slate-700">{paymentProgress.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500" 
                    style={{ width: `${paymentProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <Tabs defaultValue="fees" className="w-full">
        <div className="border-b border-slate-200">
          <TabsList className="h-auto p-0 bg-transparent gap-6">
            <TabsTrigger 
              value="fees" 
              className="data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 border-b-2 border-transparent rounded-none px-1 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Fees & Payments
            </TabsTrigger>
            <TabsTrigger 
              value="submissions" 
              className="data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 border-b-2 border-transparent rounded-none px-1 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <FileText className="w-4 h-4 mr-2" />
              Submissions
            </TabsTrigger>
            <TabsTrigger 
              value="results" 
              className="data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 border-b-2 border-transparent rounded-none px-1 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Results
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Fees Tab */}
        <TabsContent value="fees" className="pt-6 outline-none space-y-8">
          
          {/* Section: Financial overview header with actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Financial Ledger</h2>
              <p className="text-sm text-slate-500">Manage fee assignments and record payments.</p>
            </div>
            <div className="flex items-center gap-2">
              <AssignFeeDialog
                studentId={student.id}
                studentName={student.fullName}
                hasFee={!!student.fee}
                currentFee={student.fee ? parseFloat(student.fee.amount.toString()) : undefined}
                currentDueDate={student.fee?.dueDate}
                defaultFee={parseFloat(student.programme.defaultFee.toString())}
                totalPaid={totalPaid}
              />
              {student.fee && outstanding > 0 && (
                <RecordPaymentDialog
                  studentId={student.id}
                  studentName={student.fullName}
                  outstanding={outstanding}
                />
              )}
            </div>
          </div>

          {/* Section: Payment History */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Payment History</h3>
            
            {student.payments.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center">
                <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-medium text-slate-900 mb-1">No payment records</h4>
                <p className="text-sm text-slate-500">No payments have been recorded for this student yet.</p>
              </div>
            ) : (
              <div className="bg-white/70 backdrop-blur-[20px] border border-white/65 rounded-[20px] overflow-hidden shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80">
                        <th className="text-left px-4 py-3 font-medium text-slate-500">Reference</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-500">Date</th>
                        <th className="text-right px-4 py-3 font-medium text-slate-500">Amount</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-500 hidden sm:table-cell">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {student.payments.map((p) => (
                        <tr key={p.id} className="hover:bg-indigo-50/20 transition-colors duration-100">
                          <td className="px-4 py-3.5 font-mono text-xs text-slate-600">{p.referenceNumber}</td>
                          <td className="px-4 py-3.5 text-slate-700">{formatDate(p.paymentDate)}</td>
                          <td className="px-4 py-3.5 text-right font-semibold text-slate-900">
                            {formatCurrency(parseFloat(p.amount.toString()))}
                          </td>
                          <td className="px-4 py-3.5 text-slate-500 hidden sm:table-cell">{p.notes ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="pt-6 outline-none">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Submissions</h2>
            <p className="text-sm text-slate-500">Student assessment submissions and submission status.</p>
          </div>

          {student.submissions.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-medium text-slate-900 mb-1">No submissions found</h4>
              <p className="text-sm text-slate-500">This student has not submitted any assessments yet.</p>
            </div>
          ) : (
            <div className="bg-white/70 backdrop-blur-[20px] border border-white/65 rounded-[20px] overflow-hidden shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Assessment</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500 hidden sm:table-cell">Submitted</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500 hidden md:table-cell">File</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {student.submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-indigo-50/20 transition-colors duration-100">
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-slate-900 truncate max-w-[250px]">{sub.assessment.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{sub.assessment.module}</p>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 hidden sm:table-cell whitespace-nowrap">
                          {formatDateTime(sub.submittedAt)}
                        </td>
                        <td className="px-4 py-3.5">
                          {sub.isLate ? <LateBadge /> : (
                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                              On time
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 hidden md:table-cell truncate max-w-[200px]">
                          {sub.fileName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="pt-6 outline-none">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Results</h2>
            <p className="text-sm text-slate-500">Published assessment results for this student.</p>
          </div>

          {student.submissions.filter(s => s.grade).length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center">
              <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-medium text-slate-900 mb-1">No results available</h4>
              <p className="text-sm text-slate-500">No grades have been entered for this student yet.</p>
            </div>
          ) : (
            <div className="bg-white/70 backdrop-blur-[20px] border border-white/65 rounded-[20px] overflow-hidden shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Assessment</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Grade</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Classification</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Publication</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {student.submissions
                      .filter(s => s.grade)
                      .map((sub) => (
                        <tr key={sub.id} className="hover:bg-indigo-50/20 transition-colors duration-100">
                          <td className="px-4 py-3.5">
                            <p className="font-medium text-slate-900">{sub.assessment.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{sub.assessment.module}</p>
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-slate-900 tabular-nums text-base">
                            {sub.grade!.grade}
                          </td>
                          <td className="px-4 py-3.5">
                            <GradeBadge classification={sub.grade!.classification} />
                          </td>
                          <td className="px-4 py-3.5">
                            <PublicationBadge isPublished={sub.grade!.isPublished} />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
