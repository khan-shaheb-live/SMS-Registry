import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/common/page-header'
import { GradeBadge, PublicationBadge, LateBadge } from '@/components/common/status-badges'
import { EmptyState } from '@/components/common/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { BarChart3, AlertTriangle } from 'lucide-react'
import { EnterGradeDialog } from '@/components/results/enter-grade-dialog'

export const metadata = { title: 'Results' }

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: { filter?: string }
}) {
  const filter = searchParams.filter

  // Get all submissions that are NOT in DRAFT state
  const submissions = await prisma.submission.findMany({
    include: {
      student: { select: { id: true, studentId: true, fullName: true } },
      assessment: { select: { id: true, title: true, module: true } },
      grade: true,
    },
    orderBy: { submittedAt: 'desc' },
  })

  const totalUngraded = submissions.filter(s => !s.grade).length
  const totalUnpublished = submissions.filter(s => s.grade && !s.grade.isPublished).length
  const totalGraded = submissions.filter(s => s.grade).length

  const filtered = filter === 'unpublished'
    ? submissions.filter(s => s.grade && !s.grade.isPublished)
    : filter === 'ungraded'
    ? submissions.filter(s => !s.grade)
    : submissions

  return (
    <div className="space-y-5">
      <PageHeader title="Results & Grading" description="Manage grades, feedback, and result publication" />

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/staff/results?filter=ungraded">
          <div className={`backdrop-blur-[20px] border rounded-[20px] p-4 text-center cursor-pointer hover:shadow-[0_4px_20px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 transition-all duration-200 ${totalUngraded > 0 ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-900/30' : 'bg-white/70 border-white/65 shadow-[0_2px_12px_rgba(15,23,42,0.03)]'}`}>
            <p className="text-xs text-slate-600">Needs Grading</p>
            <p className={`text-2xl font-bold ${totalUngraded > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>{totalUngraded}</p>
          </div>
        </Link>
        <Link href="/staff/results?filter=unpublished">
          <div className={`backdrop-blur-[20px] border rounded-[20px] p-4 text-center cursor-pointer hover:shadow-[0_4px_20px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 transition-all duration-200 ${totalUnpublished > 0 ? 'bg-purple-50/80 dark:bg-purple-950/20 border-purple-200/70 dark:border-purple-900/30' : 'bg-white/70 border-white/65 shadow-[0_2px_12px_rgba(15,23,42,0.03)]'}`}>
            <p className="text-xs text-slate-600">Ready to Publish</p>
            <p className={`text-2xl font-bold ${totalUnpublished > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-slate-900 dark:text-white'}`}>{totalUnpublished}</p>
          </div>
        </Link>
        <Link href="/staff/results">
          <div className="bg-white/78 backdrop-blur-[24px] border border-white/70 rounded-[20px] p-4 text-center cursor-pointer shadow-[0_2px_12px_rgba(15,23,42,0.03)] hover:shadow-[0_4px_20px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 transition-all duration-200">
            <p className="text-xs text-slate-600">Total Graded</p>
            <p className="text-2xl font-bold text-emerald-600">{totalGraded}</p>
          </div>
        </Link>
      </div>

      {filter === 'unpublished' && totalUnpublished > 0 && (
        <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/30 rounded-lg px-4 py-2.5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Showing grades awaiting publication. <Link href="/staff/results" className="underline">Show all</Link>
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white/78 backdrop-blur-[24px] border border-white/70 rounded-[20px] overflow-hidden shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
        {filtered.length === 0 ? (
          <EmptyState icon={BarChart3} title="No submissions match this filter" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/70 dark:border-slate-800/60 bg-slate-100/70 dark:bg-slate-900/60">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Assessment</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Module</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Grade</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600 hidden sm:table-cell">Classification</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Publication</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-indigo-50/20 dark:hover:bg-slate-900/30 transition-colors duration-100">
                    <td className="px-4 py-3">
                      <Link href={`/staff/students/${sub.student.id}`} className="hover:text-blue-600">
                        <p className="font-medium text-slate-900">{sub.student.fullName}</p>
                        <p className="text-xs text-slate-600 font-mono">{sub.student.studentId}</p>
                      </Link>
                      {sub.isLate && <div className="mt-1"><LateBadge /></div>}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/staff/assessments/${sub.assessment.id}`} className="hover:text-blue-600">
                        <p className="font-medium text-slate-700 truncate max-w-[160px]">{sub.assessment.title}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700 hidden md:table-cell">{sub.assessment.module}</td>
                    <td className="px-4 py-3 text-right">
                      {sub.grade ? (
                        <span className="font-semibold text-slate-900 tabular-nums">{sub.grade.grade}/100</span>
                      ) : (
                        <span className="text-xs text-slate-600 italic">Not graded</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {sub.grade ? <GradeBadge classification={sub.grade.classification} /> : '—'}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {sub.grade ? <PublicationBadge isPublished={sub.grade.isPublished} /> : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <EnterGradeDialog
                        submissionId={sub.id}
                        studentName={sub.student.fullName}
                        assessmentTitle={sub.assessment.title}
                        currentGrade={sub.grade?.grade}
                        currentFeedback={sub.grade?.feedback}
                        isPublished={sub.grade?.isPublished}
                      />
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


