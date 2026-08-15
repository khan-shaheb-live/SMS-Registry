import { prisma } from '@/lib/db'
import { requireStudentSession } from '@/lib/session'
import { LateBadge } from '@/components/common/status-badges'
import { formatDateTime } from '@/lib/utils'
import { FileText, CheckCircle2 } from 'lucide-react'

export const metadata = { title: 'My Submissions' }

export default async function StudentSubmissionsPage() {
  const session = await requireStudentSession()

  const submissions = await prisma.submission.findMany({
    where: { studentId: session.studentId! },
    include: {
      assessment: { select: { title: true, module: true } },
    },
    orderBy: { submittedAt: 'desc' },
  })

  return (
    <div className="space-y-6 w-full pb-10">
      <div>
        <h1 className="text-[28px] sm:text-[30px] font-semibold text-[#0F172A] tracking-tight">
          My Submissions
        </h1>
        <p className="text-[14px] text-[#64748B] mt-1">History of all your uploaded assignments</p>
      </div>

      <div className="bg-white/78 backdrop-blur-[24px] rounded-[24px] border border-white/70 shadow-[0_2px_12px_rgba(15,23,42,0.03)] overflow-hidden">
        {submissions.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-[#F4F7FB] rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-[#64748B]" />
            </div>
            <h3 className="text-[18px] font-semibold text-[#0F172A]">No submissions yet</h3>
            <p className="text-[15px] text-[#64748B] mt-1">You haven't submitted any assessments.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-slate-200/70 bg-[#F1F5F9]/70 dark:bg-slate-900/60">
                  <th className="text-left px-6 py-4 font-medium text-[#64748B]">Assessment</th>
                  <th className="text-left px-6 py-4 font-medium text-[#64748B] hidden sm:table-cell">Submitted At</th>
                  <th className="text-left px-6 py-4 font-medium text-[#64748B]">Status</th>
                  <th className="text-left px-6 py-4 font-medium text-[#64748B] hidden md:table-cell">File Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-slate-800/60">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-indigo-50/20 transition-colors duration-100 group">
                    <td className="px-6 py-5">
                      <p className="font-semibold text-[#0F172A] mb-1">{sub.assessment.title}</p>
                      <p className="text-[13px] text-[#64748B]">{sub.assessment.module}</p>
                    </td>
                    <td className="px-6 py-5 text-[#0F172A] hidden sm:table-cell whitespace-nowrap">
                      {formatDateTime(sub.submittedAt)}
                    </td>
                    <td className="px-6 py-5">
                      {sub.isLate ? (
                        <LateBadge />
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#059669] dark:text-emerald-400 bg-[#ECFDF5] dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-100/50 dark:border-emerald-900/30 uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" /> On time
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-[13px] text-[#64748B] hidden md:table-cell">
                      <span className="truncate block max-w-[200px] font-mono text-[12px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-800/60" title={sub.fileName ?? undefined}>

                        {sub.fileName}
                      </span>
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

