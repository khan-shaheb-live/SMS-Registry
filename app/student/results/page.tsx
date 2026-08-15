import { prisma } from '@/lib/db'
import { requireStudentSession } from '@/lib/session'
import { GradeBadge } from '@/components/common/status-badges'
import { formatDateTime } from '@/lib/utils'
import { BarChart3, Quote } from 'lucide-react'

export const metadata = { title: 'My Results' }

export default async function StudentResultsPage() {
  const session = await requireStudentSession()

  // Only fetch grades that are published
  const submissions = await prisma.submission.findMany({
    where: { 
      studentId: session.studentId!,
      grade: { isPublished: true }
    },
    include: {
      assessment: { select: { title: true, module: true } },
      grade: true,
    },
    orderBy: { submittedAt: 'desc' },
  })

  return (
    <div className="space-y-6 w-full pb-10">
      <div>
        <h1 className="text-[28px] sm:text-[30px] font-semibold text-[#0F172A] tracking-tight">
          My Results
        </h1>
        <p className="text-[14px] text-[#64748B] mt-1">Official grades and feedback for your assessments</p>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white/78 backdrop-blur-[24px] border border-white/70 rounded-[24px] p-16 text-center shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
          <div className="mx-auto w-16 h-16 bg-[#F4F7FB] rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-[#64748B]" />
          </div>
          <h3 className="text-[18px] font-semibold text-[#0F172A]">No results available</h3>
          <p className="text-[15px] text-[#64748B] mt-1">Grades will appear here once they are published by the registry.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-white/78 backdrop-blur-[24px] border border-white/70 rounded-[24px] shadow-[0_2px_12px_rgba(15,23,42,0.03)] overflow-hidden flex flex-col sm:flex-row hover:shadow-[0_4px_20px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 transition-all duration-200">
              {/* Info side */}
              <div className="flex-1 p-6 sm:p-8 sm:border-r border-white/50 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold text-[18px] text-[#0F172A]">{sub.assessment.title}</h3>
                      <p className="text-[14px] text-[#64748B] mt-1">{sub.assessment.module}</p>
                    </div>
                  </div>
                  
                  {sub.grade!.feedback ? (
                    <div className="bg-[#EFF6FF] dark:bg-blue-950/20 rounded-xl p-5 border border-[#DBEAFE] dark:border-blue-900/30 mt-4">
                      <div className="flex items-center gap-2 text-[#1E40AF] dark:text-blue-400 mb-2">
                        <Quote className="w-4 h-4" />
                        <span className="text-[12px] font-semibold uppercase tracking-wider">Feedback</span>
                      </div>
                      <p className="text-[14px] text-[#334155] dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{sub.grade!.feedback}</p>
                    </div>
                  ) : (
                    <p className="text-[14px] text-[#94A3B8] italic mt-4">No feedback provided.</p>
                  )}
                </div>
                
                <p className="text-[13px] text-[#94A3B8] mt-6">
                  Submitted on {formatDateTime(sub.submittedAt)}
                </p>
              </div>
              
              {/* Score side */}
              <div className="flex flex-col items-center justify-center p-8 sm:w-56 flex-shrink-0 border-t sm:border-t-0 border-white/50 bg-[#F1F5F9]/50 dark:bg-slate-900/40">

                <p className="text-[12px] text-[#64748B] font-semibold uppercase tracking-widest mb-3">Final Grade</p>
                <div className="text-[48px] font-bold text-[#0F172A] tabular-nums leading-none mb-4 flex items-baseline">
                  {sub.grade!.grade}
                  <span className="text-[20px] text-[#94A3B8] font-medium ml-1">/100</span>
                </div>
                <GradeBadge classification={sub.grade!.classification} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

