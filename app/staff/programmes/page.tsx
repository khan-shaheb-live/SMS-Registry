import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/common/page-header'
import { CurrencyDisplay } from '@/components/common/currency-display'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const metadata = { title: 'Programmes' }

export default async function ProgrammesPage() {
  const programmes = await prisma.programme.findMany({
    include: {
      _count: {
        select: { students: true, assessments: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Programmes"
        description="Manage course details, tuition fees, and student enrollment totals."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {programmes.map((p) => {
          const isActive = p.status === 'ACTIVE'
          return (
            <div key={p.id} className="bg-white/78 backdrop-blur-[24px] border border-white/70 rounded-[20px] overflow-hidden shadow-[0_2px_12px_rgba(15,23,42,0.03)] hover:shadow-[0_4px_20px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 transition-all duration-200">

              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-mono text-xs font-semibold tracking-wider text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-md uppercase border border-blue-100/60">

                      {p.code}
                    </span>
                    <h3 className="mt-3 text-lg font-bold text-slate-900">{p.name}</h3>
                  </div>
                  <Badge className={isActive ? 'bg-emerald-100/80 text-emerald-800 hover:bg-emerald-100/80 border border-emerald-200/50' : 'bg-slate-100/80 text-slate-700 hover:bg-slate-100/80 border border-slate-200/50'}>

                    {isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/50">

                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-600">Default Tuition Fee</p>
                    <p className="text-sm font-semibold text-slate-800 mt-1">
                      <CurrencyDisplay amount={parseFloat(p.defaultFee.toString())} />
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-600">Total Enrolled</p>
                    <p className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-600" />
                      {p._count.students}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-600">Assessments</p>
                    <p className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-slate-600" />
                      {p._count.assessments}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/40 flex justify-between items-center text-xs text-slate-600">

                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Created: {formatDate(p.createdAt)}
                  </span>
                </div>
              </div>
            </div>

          )
        })}
      </div>
    </div>
  )
}


