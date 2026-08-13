import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/common/page-header'
import { AssessmentStatusBadge } from '@/components/common/status-badges'
import { EmptyState } from '@/components/common/empty-state'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getAssessmentStatus, getDeadlineDescription } from '@/lib/business/submissions'
import { formatDate } from '@/lib/utils'
import { ClipboardList, Plus, Eye, Edit } from 'lucide-react'

export const metadata = { title: 'Assessments' }

export default async function AssessmentsPage() {
  const assessments = await prisma.assessment.findMany({
    include: {
      programme: { select: { name: true } },
      submissions: {
        include: { grade: true },
      },
      _count: { select: { submissions: true } },
    },
    orderBy: { deadline: 'asc' },
  })

  return (
    <div className="space-y-5">
      <PageHeader title="Assessments" description={`${assessments.length} assessment${assessments.length !== 1 ? 's' : ''}`}>
        <Link href="/staff/assessments/new">
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            New Assessment
          </Button>
        </Link>
      </PageHeader>

      <div className="bg-white/78 backdrop-blur-[24px] border border-white/70 rounded-[20px] overflow-hidden shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
        {assessments.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No assessments yet"
            description="Create the first assessment to get started."
            action={
              <Link href="/staff/assessments/new">
                <Button size="sm" className="gap-2"><Plus className="w-4 h-4" />New Assessment</Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/70" style={{ background: 'rgba(241,245,249,0.70)' }}>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Assessment</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Module</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Programme</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Deadline</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600 hidden sm:table-cell">Submissions</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600 hidden sm:table-cell">Graded</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Late</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assessments.map((a) => {
                  const status = getAssessmentStatus(a.deadline)
                  const gradedCount = a.submissions.filter(s => s.grade).length
                  const lateCount = a.submissions.filter(s => s.isLate).length

                  return (
                    <tr key={a.id} className="hover:bg-indigo-50/20 transition-colors duration-100">
                      <td className="px-4 py-3">
                        <Link href={`/staff/assessments/${a.id}`} className="font-medium text-slate-900 hover:text-blue-600">
                          {a.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-700 hidden md:table-cell">{a.module}</td>
                      <td className="px-4 py-3 text-slate-700 hidden lg:table-cell">
                        {a.programme?.name ?? <span className="text-slate-300">All</span>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-700 whitespace-nowrap">{formatDate(a.deadline)}</p>
                        <p className="text-xs text-slate-600">{getDeadlineDescription(a.deadline)}</p>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-700 hidden sm:table-cell">
                        {a._count.submissions}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-700 hidden sm:table-cell">
                        {gradedCount}
                      </td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        {lateCount > 0 ? (
                          <span className="text-red-600 font-semibold">{lateCount}</span>
                        ) : (
                          <span className="text-slate-300">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <AssessmentStatusBadge status={status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/staff/assessments/${a.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="View">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/staff/assessments/${a.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Edit">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
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
  )
}


