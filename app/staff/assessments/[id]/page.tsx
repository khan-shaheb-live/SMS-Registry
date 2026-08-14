import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/common/page-header'
import { AssessmentStatusBadge, LateBadge } from '@/components/common/status-badges'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAssessmentStatus, getDeadlineDescription, getLateDescription } from '@/lib/business/submissions'
import { formatDate, formatDateTime } from '@/lib/utils'
import { ArrowLeft, Edit, FileText, Calendar, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const a = await prisma.assessment.findUnique({ where: { id: params.id }, select: { title: true } })
  return { title: a?.title ?? 'Assessment' }
}

export default async function AssessmentDetailPage({ params }: { params: { id: string } }) {
  const assessment = await prisma.assessment.findUnique({
    where: { id: params.id },
    include: {
      programme: true,
      submissions: {
        include: {
          student: { select: { id: true, studentId: true, fullName: true } },
          grade: true,
        },
        orderBy: { submittedAt: 'desc' },
      },
    },
  })

  if (!assessment) notFound()

  const status = getAssessmentStatus(assessment.deadline)
  const lateCount = assessment.submissions.filter(s => s.isLate).length
  const gradedCount = assessment.submissions.filter(s => s.grade).length

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/staff/assessments">
          <Button variant="ghost" size="sm" className="gap-1.5 text-slate-500">
            <ArrowLeft className="w-4 h-4" />
            Assessments
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-semibold text-slate-900">{assessment.title}</h1>
            <AssessmentStatusBadge status={status} />
          </div>
          <p className="text-sm text-slate-500">{assessment.module}</p>
        </div>
        <Link href={`/staff/assessments/${assessment.id}/edit`}>
          <Button variant="outline" size="sm" className="gap-2 flex-shrink-0">
            <Edit className="w-4 h-4" />
            Edit
          </Button>
        </Link>
      </div>

      {/* Meta */}
      <div className="grid sm:grid-cols-4 gap-4">
        <div className="bg-white/70 backdrop-blur-[20px] border border-white/65 rounded-[16px] p-4 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
          <p className="text-xs text-slate-400 mb-1">Programme</p>
          <p className="text-sm font-medium text-slate-900">{assessment.programme?.name ?? 'All Programmes'}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-[20px] border border-white/65 rounded-[16px] p-4 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
          <p className="text-xs text-slate-400 mb-1">Academic Year</p>
          <p className="text-sm font-medium text-slate-900">{assessment.academicYear}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-[20px] border border-white/65 rounded-[16px] p-4 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
          <p className="text-xs text-slate-400 mb-1">Deadline</p>
          <p className="text-sm font-medium text-slate-900">{formatDateTime(assessment.deadline)}</p>
          <p className="text-xs text-slate-400">{getDeadlineDescription(assessment.deadline)}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-[20px] border border-white/65 rounded-[16px] p-4 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-1">
          <p className="text-xs text-slate-400">Submissions</p>
          <p className="text-sm font-medium text-slate-900">{assessment.submissions.length} received</p>
          <p className="text-xs text-slate-400">{gradedCount} graded · {lateCount} late</p>
        </div>
      </div>

      {assessment.description && (
        <div className="bg-white/70 backdrop-blur-[20px] border border-white/65 rounded-[20px] shadow-[0_2px_12px_rgba(15,23,42,0.03)] px-4 py-4">
          <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide font-semibold">Description</p>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{assessment.description}</p>
        </div>
      )}

      <div className="bg-white/70 backdrop-blur-[20px] border border-white/65 rounded-[20px] overflow-hidden shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
        <div className="pb-2 px-4 pt-4">
          <h3 className="text-sm font-semibold text-slate-900">Submissions</h3>
        </div>
        <div className="p-0">
          {assessment.submissions.length === 0 ? (
            <div className="py-10 text-center">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No submissions received yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200/70" style={{ background: 'rgba(241,245,249,0.70)' }}>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Student</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 hidden sm:table-cell">Submitted</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">File</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/70">
                  {assessment.submissions.map((sub) => (
                    <tr key={sub.id} className={`hover:bg-indigo-50/20 transition-colors duration-100 ${sub.isLate ? 'bg-red-50/20' : ''}`}>
                      <td className="px-4 py-3">
                        <Link href={`/staff/students/${sub.student.id}`} className="hover:text-blue-600">
                          <p className="font-medium text-slate-900">{sub.student.fullName}</p>
                          <p className="text-xs text-slate-400 font-mono">{sub.student.studentId}</p>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden sm:table-cell whitespace-nowrap">
                        {formatDateTime(sub.submittedAt)}
                      </td>
                      <td className="px-4 py-3">
                        {sub.isLate ? (
                          <div>
                            <LateBadge />
                            <p className="text-xs text-red-500 mt-0.5">{getLateDescription(sub.submittedAt, assessment.deadline)}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-emerald-600 font-medium">On time</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 hidden md:table-cell truncate max-w-[180px]">
                        {sub.fileName}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {sub.grade ? (
                          <span className="font-semibold text-slate-900">{sub.grade.grade}/100</span>
                        ) : (
                          <Link href="/staff/results">
                            <Button variant="ghost" size="sm" className="h-7 text-xs">Grade</Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
