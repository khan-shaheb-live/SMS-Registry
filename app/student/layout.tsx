import { requireStudentSession } from '@/lib/session'
import { StudentSidebar } from '@/components/layout/student-sidebar'
import { TopNavbar } from '@/components/layout/top-navbar'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireStudentSession()

  // Ensure the student record exists
  if (!session.studentId) notFound()
  const student = await prisma.student.findUnique({
    where: { id: session.studentId },
  })
  if (!student) notFound()

  return (
    <div className="flex min-h-screen">
      <StudentSidebar student={{
        fullName: student.fullName,
        studentId: student.studentId,
        email: student.email,
        role: session.role
      }} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden md:pl-[292px]">
        <TopNavbar session={session} />
        <main className="flex-1 overflow-y-auto">
          <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
