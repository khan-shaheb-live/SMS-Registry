import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/common/page-header'
import { StudentForm } from '@/components/students/student-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const student = await prisma.student.findUnique({ where: { id: params.id }, select: { fullName: true } })
  return { title: `Edit ${student?.fullName ?? 'Student'}` }
}

export default async function EditStudentPage({ params }: { params: { id: string } }) {
  const [student, programmes] = await Promise.all([
    prisma.student.findUnique({ where: { id: params.id } }),
    prisma.programme.findMany({ where: { status: 'ACTIVE' }, orderBy: { name: 'asc' } }),
  ])

  if (!student) notFound()

  return (
    <div className="max-w-2xl space-y-5">
      <Link href={`/staff/students/${student.id}`}>
        <Button variant="ghost" size="sm" className="gap-1.5 text-slate-500">
          <ArrowLeft className="w-4 h-4" />
          Back to {student.fullName}
        </Button>
      </Link>
      <PageHeader title="Edit Student" description={student.studentId} />
      <StudentForm programmes={programmes} student={student} />
    </div>
  )
}
