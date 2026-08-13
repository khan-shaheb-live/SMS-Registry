import { prisma } from '@/lib/db'
import { requireStudentSession } from '@/lib/session'
import { AssessmentStatusBadge } from '@/components/common/status-badges'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getAssessmentStatus } from '@/lib/business/submissions'
import { formatDateTime, getDaysUntil } from '@/lib/utils'
import { ClipboardList, FileCheck, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Assessments' }

export default async function StudentAssessmentsPage() {
  const session = await requireStudentSession()

  const student = await prisma.student.findUnique({
    where: { id: session.studentId! },
    include: { submissions: true },
  })
  if (!student) return null

  // Assessments for student's programme + all programmes
  const assessments = await prisma.assessment.findMany({
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
  const now = new Date()

  const openAssessments = assessments.filter(a => a.deadline > now && !submittedAssessmentIds.has(a.id))
  const completedAssessments = assessments.filter(a => submittedAssessmentIds.has(a.id))
  const missedAssessments = assessments.filter(a => a.deadline <= now && !submittedAssessmentIds.has(a.id))

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="text-[28px] sm:text-[30px] font-semibold text-[#0F172A] tracking-tight">
          Assessments
        </h1>
        <p className="text-[14px] text-[#64748B] mt-1">View and submit your assignments</p>
      </div>

      {openAssessments.length > 0 && (
        <section>
          <h2 className="text-[16px] font-semibold text-[#0F172A] mb-4">To Do ({openAssessments.length})</h2>
          <div className="grid gap-3">
            {openAssessments.map((a) => {
              const status = getAssessmentStatus(a.deadline)
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
                <div key={a.id} className="group flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-5 sm:p-6 bg-white/78 backdrop-blur-[24px] border border-white/70 rounded-[24px] shadow-[0_2px_12px_rgba(15,23,42,0.03)] hover:shadow-[0_4px_20px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 transition-all duration-200">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <Link href={`/student/assessments/${a.id}`}>
                        <h3 className="text-[16px] font-semibold text-[#0F172A] hover:text-[#2563EB] truncate transition-colors">{a.title}</h3>
                      </Link>
                      <AssessmentStatusBadge status={status} />
                    </div>
                    <p className="text-[14px] text-[#64748B]">{a.module}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className={cn("text-[12px] font-semibold px-2.5 py-1 rounded-md", daysLeftBg, daysLeftText)}>
                        {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                      </span>
                      <span className="text-[12px] text-[#64748B] font-medium flex items-center gap-1.5">
                        <Circle className="w-1.5 h-1.5 fill-current" />
                        Due: {formatDateTime(a.deadline)}
                      </span>
                    </div>
                  </div>
                  <Link href={`/student/assessments/${a.id}`} className="flex-shrink-0 w-full sm:w-auto">
                    <Button className="w-full sm:w-auto h-10 rounded-xl">
                      View & Submit
                    </Button>
                  </Link>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {(openAssessments.length === 0 && missedAssessments.length === 0) && (
        <div className="bg-white/78 backdrop-blur-[24px] border border-white/70 rounded-[24px] p-12 text-center shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
          <div className="mx-auto w-16 h-16 bg-[#F4F7FB] rounded-full flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-[#64748B]" />
          </div>
          <h3 className="text-[18px] font-semibold text-[#0F172A]">No upcoming assessments</h3>
          <p className="text-[15px] text-[#64748B] mt-1">You have no open assessments at this time.</p>
        </div>
      )}

      {missedAssessments.length > 0 && (
        <section>
          <h2 className="text-[16px] font-semibold text-[#0F172A] mb-4">Missed Deadlines ({missedAssessments.length})</h2>
          <div className="grid gap-3">
            {missedAssessments.map((a) => (
              <div key={a.id} className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-5 sm:p-6 bg-red-50/60 backdrop-blur-[12px] border border-red-100/70 rounded-[24px] shadow-sm">
                <div className="min-w-0 flex-1">
                  <h3 className="text-[16px] font-semibold text-[#0F172A] truncate mb-1">{a.title}</h3>
                  <p className="text-[14px] text-[#64748B]">{a.module}</p>
                  <p className="text-[13px] text-red-600 mt-3 font-medium flex items-center gap-1.5">
                    <Circle className="w-1.5 h-1.5 fill-current" />
                    Missed: {formatDateTime(a.deadline)}
                  </p>
                </div>
                <Link href={`/student/assessments/${a.id}`} className="flex-shrink-0 w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto h-10 rounded-xl border-red-200/70 text-red-700 hover:bg-red-50/60">
                    Submit Late
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {completedAssessments.length > 0 && (
        <section>
          <h2 className="text-[16px] font-semibold text-[#0F172A] mb-4">Completed ({completedAssessments.length})</h2>
          <div className="grid gap-3">
            {completedAssessments.map((a) => {
              const submission = student.submissions.find(s => s.assessmentId === a.id)!
              
              return (
                <div key={a.id} className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-5 sm:p-6 bg-white/78 backdrop-blur-[24px] border border-white/70 rounded-[24px] shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h3 className="text-[16px] font-medium text-[#0F172A] truncate">{a.title}</h3>
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#059669] bg-[#ECFDF5] px-2.5 py-1 rounded-md border border-emerald-100/50">
                        <FileCheck className="w-3.5 h-3.5" /> Submitted
                      </span>
                    </div>
                    <p className="text-[14px] text-[#64748B]">{a.module}</p>
                    <p className="text-[13px] text-[#64748B] mt-3 flex items-center gap-1.5">
                      <Circle className="w-1.5 h-1.5 fill-current" />
                      Submitted on {formatDateTime(submission.submittedAt)}
                    </p>
                  </div>
                  <Link href={`/student/submissions`} className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                    <Button variant="outline" className="w-full sm:w-auto h-10 rounded-xl">

                      View Submission
                    </Button>
                  </Link>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

