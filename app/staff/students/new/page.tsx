import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/common/page-header'
import { StudentForm } from '@/components/students/student-form'

export const metadata = { title: 'Add Student' }

export default async function NewStudentPage() {
  const programmes = await prisma.programme.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Add Student"
        description="Register a new student in the Registry"
        className="mb-6"
      />
      <StudentForm programmes={programmes} />
    </div>
  )
}
