import { prisma } from '@/lib/db'
import { requireStudentSession } from '@/lib/session'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { calculateOutstandingBalance } from '@/lib/business/fees'
import { formatDateTime, getDaysUntil } from '@/lib/utils'
import { CreditCard, ClipboardList, BookOpen, AlertTriangle, FileText, CheckCircle2, User, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Student Portal | Dashboard' }

export default async function StudentDashboardPage() {
  const session = await requireStudentSession()
  const now = new Date()

  const student = await prisma.student.findUnique({
    where: { id: session.studentId! },
    include: {
      programme: true,
      fee: true,
      payments: { select: { amount: true } },
      submissions: {
        include: { grade: true, assessment: true },
      },
    },
  })

  if (!student) return null

  // Financials
  const totalPaid = student.payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0)
  const outstanding = calculateOutstandingBalance(student.fee?.amount ?? null, totalPaid)

  // Assessments
  const applicableAssessments = await prisma.assessment.findMany({
    where: {
      OR: [
        { programmeId: null },
        { programmeId: student.programmeId },
      ],
      academicYear: student.academicYear,
    },
    orderBy: { deadline: 'asc' },
  })

  const submittedAssessmentIds = new Set(student.submissions.map(s => s.assessmentId))
  const upcomingAssessments = applicableAssessments
    .filter(a => a.deadline > now && !submittedAssessmentIds.has(a.id))
    .slice(0, 3)

  // Recent grades: published grades
  const publishedGrades = student.submissions
    .filter(s => s.grade?.isPublished)
    .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
    .slice(0, 3)

  // Academic Overview logic
  const totalAssessments = applicableAssessments.length
  const completedAssessments = submittedAssessmentIds.size
  const pendingAssessments = totalAssessments - completedAssessments
  const progressPercentage = totalAssessments > 0 ? Math.round((completedAssessments / totalAssessments) * 100) : 0

  return (
    <div className="space-y-8 pb-10 max-w-5xl mx-auto">
      {/* 1. HERO / GREETING SECTION */}
      <div>
        <h1 className="text-[28px] sm:text-[30px] font-semibold text-[#0F172A] tracking-tight">
          Good morning, {student.fullName.split(' ')[0]} 👋
        </h1>
        {/* Academic Context */}
        <div className="flex items-center gap-2 mt-2 text-[14px] text-[#64748B]">
          <span className="font-medium text-[#0F172A]">{student.programme.code}</span>
          <span>·</span>
          <span>{student.academicYear}</span>
          <span>·</span>
          <div className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", student.status === 'ENROLLED' ? "bg-[#10B981]" : "bg-[#64748B]")}></span>
            <span className="capitalize">{student.status.toLowerCase()}</span>
          </div>
        </div>
      </div>

      {/* Financial Alert */}
      {outstanding > 0 && student.fee?.dueDate && student.fee.dueDate < now && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-4 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-[14px] font-semibold text-red-800">Overdue Balance</h4>
            <p className="text-[14px] text-red-700 mt-1">
              You have an overdue balance of <strong>£{outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>. 
              Please contact the registry to arrange payment.
            </p>
          </div>
          <Link href="/student/fees">
            <Button size="sm" variant="outline" className="bg-white hover:bg-red-50 text-red-700 border-red-200 shadow-sm rounded-xl">
              View Fees
            </Button>
          </Link>
        </div>
      )}

      {/* 2. REDESIGNED KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 — Programme */}
        <div className="bg-[#ECFDF5] rounded-[20px] p-[20px] sm:p-[24px] border border-emerald-100/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center text-[#10B981]">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[13px] font-medium text-emerald-800/70 mb-1">Programme</p>
            <h3 className="text-[24px] font-bold text-emerald-900 leading-none">{student.programme.code}</h3>
          </div>
        </div>

        {/* Card 2 — Outstanding Fees */}
        <div className="bg-[#EFF6FF] rounded-[20px] p-[20px] sm:p-[24px] border border-blue-100/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center text-[#2563EB]">
              <CreditCard className="w-5 h-5" />
            </div>
            {outstanding === 0 && (
              <span className="inline-flex items-center gap-1 text-[12px] font-medium text-blue-700 bg-blue-100/50 px-2 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Paid in full
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-[13px] font-medium text-blue-800/70 mb-1">Outstanding Fees</p>
            <h3 className="text-[24px] font-bold text-blue-900 leading-none">
              £{outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        {/* Card 3 — Upcoming Due */}
        <div className="bg-[#F5F3FF] rounded-[20px] p-[20px] sm:p-[24px] border border-purple-100/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center text-[#8B5CF6]">
              <ClipboardList className="w-5 h-5" />
            </div>
            {upcomingAssessments.length > 0 && (
              <span className="inline-flex text-[12px] font-medium text-purple-700 bg-purple-100/50 px-2 py-1 rounded-md">
                {upcomingAssessments.length} pending
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-[13px] font-medium text-purple-800/70 mb-1">Upcoming Due</p>
            <h3 className="text-[24px] font-bold text-purple-900 leading-none">{upcomingAssessments.length}</h3>
          </div>
        </div>

        {/* Card 4 — Results */}
        <div className="bg-[#FFFBEB] rounded-[20px] p-[20px] sm:p-[24px] border border-amber-100/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center text-[#F59E0B]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            {publishedGrades.length > 0 && (
              <span className="inline-flex text-[12px] font-medium text-amber-700 bg-amber-100/50 px-2 py-1 rounded-md">
                Latest: {publishedGrades[0].grade?.grade}/100
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-[13px] font-medium text-amber-800/70 mb-1">Results Published</p>
            <h3 className="text-[24px] font-bold text-amber-900 leading-none">
              {publishedGrades.length}
            </h3>
          </div>
        </div>
      </div>

      {/* 3. ACADEMIC OVERVIEW */}
      <div className="bg-white/78 backdrop-blur-[24px] rounded-[24px] border border-white/70 p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)] hover:shadow-[0_4px_20px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 transition-all duration-200">
        <h2 className="text-[16px] font-semibold text-[#0F172A] mb-4">Academic Progress</h2>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[14px] text-[#0F172A] font-medium">
            <span>Assessments Completed</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="h-3 w-full bg-[#F4F7FB] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#2563EB] rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[13px] text-[#64748B] mt-1">
            <span>{completedAssessments} completed</span>
            <span>{pendingAssessments} pending</span>
          </div>
        </div>
      </div>

      {/* 4. UPCOMING DEADLINES & RECENT RESULTS */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Upcoming Deadlines */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-[#0F172A]">Upcoming Deadlines</h2>
            <Link href="/student/assessments" className="text-[13px] font-medium text-[#2563EB] hover:underline">
              View all
            </Link>
          </div>
          
          <div className="space-y-3">
            {upcomingAssessments.length === 0 ? (
              <div className="bg-white/78 backdrop-blur-[24px] border border-white/70 rounded-[20px] p-8 text-center shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
                <div className="mx-auto w-12 h-12 bg-[#F4F7FB] rounded-full flex items-center justify-center mb-3">
                  <ClipboardList className="w-6 h-6 text-[#64748B]" />
                </div>
                <h3 className="text-[15px] font-medium text-[#0F172A]">You're all caught up!</h3>
                <p className="text-[14px] text-[#64748B] mt-1">No upcoming assessments.</p>
              </div>
            ) : (
              upcomingAssessments.map((a) => {
                const daysLeft = getDaysUntil(a.deadline)
                let daysLeftBg = "bg-[#EFF6FF]"
                let daysLeftText = "text-[#2563EB]"
                
                if (daysLeft <= 3) {
                  daysLeftBg = "bg-red-50"
                  daysLeftText = "text-red-700"
                } else if (daysLeft <= 7) {
                  daysLeftBg = "bg-[#FFFBEB]"
                  daysLeftText = "text-[#F59E0B]"
                }

                return (
                  <div key={a.id} className="group flex items-start justify-between p-5 bg-white/78 backdrop-blur-[24px] border border-white/70 rounded-[20px] shadow-[0_2px_12px_rgba(15,23,42,0.03)] hover:shadow-[0_4px_20px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 transition-all duration-200">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={cn("text-[12px] font-semibold px-2.5 py-1 rounded-md", daysLeftBg, daysLeftText)}>
                          {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                        </span>
                        <span className="text-[12px] text-[#64748B] font-medium flex items-center gap-1.5">
                          <Circle className="w-1.5 h-1.5 fill-current" />
                          {formatDateTime(a.deadline)}
                        </span>
                      </div>
                      <h3 className="text-[16px] font-semibold text-[#0F172A] truncate mb-1">{a.title}</h3>
                      <p className="text-[14px] text-[#64748B] truncate">{a.module}</p>
                    </div>
                    <Link href={`/student/assessments/${a.id}`} className="flex-shrink-0 ml-4 mt-2">
                      <Button variant="outline" className="h-9 rounded-xl text-[13px] font-medium bg-white/50 backdrop-blur-[20px] border-[#E2E8F0]/50 hover:bg-[#F4F7FB]/50">
                        Submit
                      </Button>
                    </Link>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Recent Results */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-[#0F172A]">Recent Results</h2>
            <Link href="/student/results" className="text-[13px] font-medium text-[#2563EB] hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {publishedGrades.length === 0 ? (
              <div className="bg-white/78 backdrop-blur-[24px] border border-white/70 rounded-[20px] p-8 text-center shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
                <div className="mx-auto w-12 h-12 bg-[#F4F7FB] rounded-full flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-[#64748B]" />
                </div>
                <h3 className="text-[15px] font-medium text-[#0F172A]">No results yet</h3>
                <p className="text-[14px] text-[#64748B] mt-1">Published results will appear here.</p>
              </div>
            ) : (
              publishedGrades.map((sub) => (
                <div key={sub.id} className="group flex items-center justify-between p-5 bg-white/78 backdrop-blur-[24px] border border-white/70 rounded-[20px] shadow-[0_2px_12px_rgba(15,23,42,0.03)] hover:shadow-[0_4px_20px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 transition-all duration-200">
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-medium text-[#8B5CF6] mb-1">New Result</p>
                    <h3 className="text-[16px] font-semibold text-[#0F172A] truncate mb-1">{sub.assessment.title}</h3>
                    <p className="text-[14px] text-[#64748B] truncate">{sub.assessment.module}</p>
                  </div>
                  <div className="flex-shrink-0 text-right ml-4 flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-[28px] font-bold text-[#0F172A] tabular-nums leading-none">{sub.grade!.grade}</span>
                        <span className="text-[14px] text-[#64748B] font-medium">/100</span>
                      </div>
                      <span className="text-[13px] font-semibold text-[#10B981] capitalize mt-1">
                        {sub.grade!.classification.toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 5. QUICK ACTIONS */}
      <div className="flex flex-col gap-4 mt-4">
        <h2 className="text-[16px] font-semibold text-[#0F172A]">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/student/assessments">
            <Button variant="outline" className="h-10 rounded-xl bg-white border-[#E2E8F0] hover:bg-[#F4F7FB] text-[#0F172A] gap-2 shadow-sm">
              <ClipboardList className="w-4 h-4 text-[#64748B]" />
              Submit Assignment
            </Button>
          </Link>
          <Link href="/student/results">
            <Button variant="outline" className="h-10 rounded-xl bg-white border-[#E2E8F0] hover:bg-[#F4F7FB] text-[#0F172A] gap-2 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-[#64748B]" />
              View Results
            </Button>
          </Link>
          <Link href="/student/fees">
            <Button variant="outline" className="h-10 rounded-xl bg-white border-[#E2E8F0] hover:bg-[#F4F7FB] text-[#0F172A] gap-2 shadow-sm">
              <CreditCard className="w-4 h-4 text-[#64748B]" />
              View Fees
            </Button>
          </Link>
          <Link href="/student/profile">
            <Button variant="outline" className="h-10 rounded-xl bg-white border-[#E2E8F0] hover:bg-[#F4F7FB] text-[#0F172A] gap-2 shadow-sm">
              <User className="w-4 h-4 text-[#64748B]" />
              View Profile
            </Button>
          </Link>
        </div>
      </div>
      
    </div>
  )
}

