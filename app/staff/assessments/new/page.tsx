import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/common/page-header'
import { AssessmentForm } from '@/components/assessments/assessment-form'

export const metadata = { title: 'New Assessment' }

export default async function NewAssessmentPage() {
  const programmes = await prisma.programme.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="max-w-2xl">
      <PageHeader title="New Assessment" description="Create an assessment for students to submit" className="mb-6" />
      <AssessmentForm programmes={programmes} />
    </div>
  )
}
