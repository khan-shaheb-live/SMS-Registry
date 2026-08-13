import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/common/page-header'
import { LateBadge } from '@/components/common/status-badges'
import { EmptyState } from '@/components/common/empty-state'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'
import { FileText, AlertTriangle } from 'lucide-react'

export const metadata = { title: 'Submissions' }

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: { filter?: string }
}) {
  const filter = searchParams.filter

  const submissions = await prisma.submission.findMany({
    where: filter === 'late' ? { isLate: true } : undefined,
    include: {
      student: { select: { id: true, studentId: true, fullName: true } },
      assessment: { select: { id: true, title: true, module: true, deadline: true } },
      grade: { select: { grade: true } },
    },
    orderBy: { submittedAt: 'desc' },
  })

  const totalLate = await prisma.submission.count({ where: { isLate: true } })
  const totalUngraded = await prisma.submission.count({ where: { grade: null } })

  return (
    <div className="space-y-5">
      <PageHeader
        title="Submissions"
        description={`${submissions.length} submission${submissions.length !== 1 ? 's' : ''}${filter === 'late' ? ' — filtered by late' : ''}`}
      />

      {/* Quick stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/staff/submissions">
          <div className="bg-white/78 backdrop-blur-[24px] border border-white/70 rounded-[20px] p-4 shadow-[0_2px_12px_rgba(15,23,42,0.03)] hover:shadow-[0_4px_20px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
            <p className="text-xs text-slate-600">All Submissions</p>
            <p className="text-2xl font-bold text-slate-900">{submissions.length || await prisma.submission.count()}</p>
          </div>
        </Link>
        <Link href="/staff/submissions?filter=late">
          <div className={`backdrop-blur-[20px] border rounded-[20px] p-4 hover:shadow-[0_4px_20px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${totalLate > 0 ? 'bg-red-50/80 border-red-200/70' : 'bg-white/70 border-white/65 shadow-[0_2px_12px_rgba(15,23,42,0.03)]'}`}>
            <p className="text-xs text-slate-600">Late Submissions</p>
            <p className={`text-2xl font-bold ${totalLate > 0 ? 'text-red-600' : 'text-slate-900'}`}>{totalLate}</p>
          </div>
        </Link>
        <div className="bg-white/78 backdrop-blur-[24px] border border-white/70 rounded-[20px] p-4 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
          <p className="text-xs text-slate-600">Awaiting Grade</p>
          <p className={`text-2xl font-bold ${totalUngraded > 0 ? 'text-amber-600' : 'text-slate-900'}`}>{totalUngraded}</p>
        </div>
      </div>

      {filter === 'late' && totalLate > 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <p className="text-sm text-red-700">
            Showing late submissions only. <Link href="/staff/submissions" className="underline">Show all</Link>
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white/78 backdrop-blur-[24px] border border-white/70 rounded-[20px] overflow-hidden shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
        {submissions.length === 0 ? (
          <EmptyState icon={FileText} title="No submissions found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/70" style={{ background: 'rgba(241,245,249,0.70)' }}>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Assessment</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Submitted</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600 hidden sm:table-cell">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">File</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((sub) => (
                  <tr key={sub.id} className={`hover:bg-indigo-50/20 transition-colors duration-100 ${sub.isLate ? 'bg-red-50/20' : ''}`}>
                    <td className="px-4 py-3">
                      <Link href={`/staff/students/${sub.student.id}`} className="hover:text-blue-600">
                        <p className="font-medium text-slate-900">{sub.student.fullName}</p>
                        <p className="text-xs text-slate-600 font-mono">{sub.student.studentId}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/staff/assessments/${sub.assessment.id}`} className="hover:text-blue-600">
                        <p className="font-medium text-slate-700 truncate max-w-[160px]">{sub.assessment.title}</p>
                        <p className="text-xs text-slate-600">{sub.assessment.module}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700 hidden md:table-cell whitespace-nowrap">
                      {formatDateTime(sub.submittedAt)}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {sub.isLate ? <LateBadge /> : <span className="text-xs text-emerald-600 font-medium">On time</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 hidden lg:table-cell truncate max-w-[160px]">
                      {sub.fileName}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {sub.grade ? (
                        <span className="font-semibold text-slate-900 tabular-nums">{sub.grade.grade}/100</span>
                      ) : (
                        <Link href={`/staff/results?submissionId=${sub.id}`}>
                          <span className="text-xs text-amber-600 font-medium underline cursor-pointer">Grade</span>
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
  )
}


