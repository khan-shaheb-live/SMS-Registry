import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/common/page-header'
import { AssessmentForm } from '@/components/assessments/assessment-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function EditAssessmentPage({ params }: { params: { id: string } }) {
  const [assessment, programmes] = await Promise.all([
    prisma.assessment.findUnique({ where: { id: params.id } }),
    prisma.programme.findMany({ where: { status: 'ACTIVE' }, orderBy: { name: 'asc' } }),
  ])

  if (!assessment) notFound()

  return (
    <div className="max-w-2xl space-y-5">
      <Link href={`/staff/assessments/${assessment.id}`}>
        <Button variant="ghost" size="sm" className="gap-1.5 text-slate-500">
          <ArrowLeft className="w-4 h-4" />
          Back to Assessment
        </Button>
      </Link>
      <PageHeader title="Edit Assessment" description={assessment.title} />
      <AssessmentForm programmes={programmes} assessment={assessment} />
    </div>
  )
}
