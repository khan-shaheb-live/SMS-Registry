import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { requireStudentSession } from '@/lib/session'
import { AssessmentStatusBadge, LateBadge } from '@/components/common/status-badges'
import { Button } from '@/components/ui/button'
import { getAssessmentStatus, getDeadlineDescription, isSubmissionLate } from '@/lib/business/submissions'
import { formatDateTime } from '@/lib/utils'
import { ArrowLeft, CheckCircle2, FileText, Clock, FileUp } from 'lucide-react'
import { UploadSubmissionDialog } from '@/components/submissions/upload-submission-dialog'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const a = await prisma.assessment.findUnique({ where: { id: params.id }, select: { title: true } })
  return { title: a?.title ?? 'Assessment' }
}

export default async function StudentAssessmentDetailPage({ params }: { params: { id: string } }) {
  const session = await requireStudentSession()

  const assessment = await prisma.assessment.findUnique({
    where: { id: params.id },
  })
  if (!assessment) notFound()

  const submission = await prisma.submission.findUnique({
    where: {
      studentId_assessmentId: {
        studentId: session.studentId!,
        assessmentId: assessment.id,
      },
    },
  })

  const status = getAssessmentStatus(assessment.deadline)
  const isLate = !submission && isSubmissionLate(new Date(), assessment.deadline)

  return (
    <div className="space-y-6 w-full pb-10">
      <Link href="/student/assessments" className="inline-flex items-center gap-2 text-[14px] text-[#64748B] hover:text-[#0F172A] transition-colors mb-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Assessments
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-[28px] sm:text-[30px] font-semibold text-[#0F172A] tracking-tight">{assessment.title}</h1>
            <AssessmentStatusBadge status={status} />
          </div>
          <p className="text-[15px] text-[#64748B]">{assessment.module}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/70 backdrop-blur-[20px] rounded-[24px] border border-white/65 p-6 sm:p-8 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">

            <h2 className="text-[18px] font-semibold text-[#0F172A] mb-4">Assessment Brief</h2>
            <div className="text-[15px] text-[#334155] whitespace-pre-wrap leading-relaxed">
              {assessment.description || 'No description provided by the instructor.'}
            </div>
          </div>

          {submission?.textContent && (
            <div className="bg-white/70 backdrop-blur-[20px] rounded-[24px] border border-white/65 p-6 sm:p-8 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/50">

                <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#2563EB]">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="text-[18px] font-semibold text-[#0F172A]">Your Text Submission</h2>
              </div>
              <div className="text-[14px] text-[#334155] whitespace-pre-wrap leading-relaxed" style={{ background: 'rgba(241,245,249,0.50)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.50)' }}>
                {submission.textContent}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white/70 backdrop-blur-[20px] rounded-[24px] border border-white/65 p-6 sm:p-8 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-[#8B5CF6]">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-[18px] font-semibold text-[#0F172A]">Deadline</h2>
            </div>
            
            <p className="text-[15px] font-medium text-[#0F172A]">{formatDateTime(assessment.deadline)}</p>
            <p className="text-[13px] text-[#64748B] mt-1">{getDeadlineDescription(assessment.deadline)}</p>

            <hr className="my-6 border-white/50" />

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] flex items-center justify-center text-[#10B981]">
                <FileUp className="w-5 h-5" />
              </div>
              <h2 className="text-[18px] font-semibold text-[#0F172A]">Submission Status</h2>
            </div>
            
            {submission ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#059669] bg-[#ECFDF5] px-4 py-3 rounded-xl border border-emerald-100/50">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-[14px] font-semibold">Submitted</span>
                </div>
                {submission.fileName && (
                  <div className="text-[14px]">
                    <p className="text-[#64748B] mb-1">File Attachment:</p>
                    <p className="font-medium text-[#0F172A] truncate p-2 rounded-lg border" style={{ background: 'rgba(241,245,249,0.50)', borderColor: 'rgba(255,255,255,0.60)' }} title={submission.fileName}>{submission.fileName}</p>
                  </div>
                )}
                <div className="text-[14px]">
                  <p className="text-[#64748B] mb-1">Submitted at:</p>
                  <p className="font-medium text-[#0F172A]">{formatDateTime(submission.submittedAt)}</p>
                  {submission.isLate && <div className="mt-2"><LateBadge /></div>}
                </div>
                <Link href="/student/submissions" className="block pt-2">
                  <Button variant="outline" className="w-full h-10 rounded-xl">View in My Submissions</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="px-4 py-3 rounded-xl" style={{ background: 'rgba(241,245,249,0.60)', border: '1px solid rgba(255,255,255,0.60)' }}>

                  <span className="text-[14px] font-medium text-[#64748B]">Not submitted</span>
                </div>
                <UploadSubmissionDialog
                  assessmentId={assessment.id}
                  assessmentTitle={assessment.title}
                  deadline={assessment.deadline}
                  isLate={isLate}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
