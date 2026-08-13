import { prisma } from '@/lib/db'
import { requireStudentSession } from '@/lib/session'
import { StudentStatusBadge } from '@/components/common/status-badges'
import { formatDate } from '@/lib/utils'
import { User, BookOpen, Mail, Calendar, Hash } from 'lucide-react'

export const metadata = { title: 'My Profile' }

export default async function ProfilePage() {
  const session = await requireStudentSession()

  const student = await prisma.student.findUnique({
    where: { id: session.studentId! },
    include: { programme: true },
  })

  if (!student) return null

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      <div>
        <h1 className="text-[28px] sm:text-[30px] font-semibold text-[#0F172A] tracking-tight">
          My Profile
        </h1>
        <p className="text-[14px] text-[#64748B] mt-1">Your personal and academic details</p>
      </div>

      <div className="bg-white/78 backdrop-blur-[24px] rounded-[24px] border border-white/70 p-6 sm:p-8 shadow-[0_2px_12px_rgba(15,23,42,0.03)] hover:shadow-[0_4px_20px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 transition-all duration-200">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E2E8F0]">
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] flex items-center justify-center text-[#10B981]">
            <User className="w-5 h-5" />
          </div>
          <h2 className="text-[18px] font-semibold text-[#0F172A]">Personal Information</h2>
        </div>
        
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-8">
          <div>
            <dt className="text-[13px] text-[#64748B] mb-1.5 flex items-center gap-2">
              <User className="w-4 h-4" /> Full Name
            </dt>
            <dd className="text-[15px] font-medium text-[#0F172A]">{student.fullName}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-[#64748B] mb-1.5 flex items-center gap-2">
              <Hash className="w-4 h-4" /> Student ID
            </dt>
            <dd className="text-[15px] font-medium text-[#0F172A] font-mono bg-white/60 backdrop-blur-sm px-2 py-0.5 rounded-md inline-block border border-slate-200/60">{student.studentId}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-[#64748B] mb-1.5 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email Address
            </dt>
            <dd className="text-[15px] font-medium text-[#0F172A]">{student.email}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-[#64748B] mb-1.5 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Date of Birth
            </dt>
            <dd className="text-[15px] font-medium text-[#0F172A]">{formatDate(student.dateOfBirth)}</dd>
          </div>
        </dl>
      </div>

      <div className="bg-white/78 backdrop-blur-[24px] rounded-[24px] border border-white/70 p-6 sm:p-8 shadow-[0_2px_12px_rgba(15,23,42,0.03)] hover:shadow-[0_4px_20px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 transition-all duration-200">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/50">

          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#2563EB]">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 className="text-[18px] font-semibold text-[#0F172A]">Academic Enrolment</h2>
        </div>
        
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-8">
          <div className="sm:col-span-2">
            <dt className="text-[13px] text-[#64748B] mb-1.5">Programme of Study</dt>
            <dd className="text-[15px] font-medium text-[#0F172A]">{student.programme.name} ({student.programme.code})</dd>
          </div>
          <div>
            <dt className="text-[13px] text-[#64748B] mb-1.5">Academic Year</dt>
            <dd className="text-[15px] font-medium text-[#0F172A]">{student.academicYear}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-[#64748B] mb-1.5">Enrolment Status</dt>
            <dd><StudentStatusBadge status={student.status} /></dd>
          </div>
        </dl>
      </div>

      <p className="text-[13px] text-[#64748B] mt-4 text-center">
        To update your personal details or change your programme of study, please contact the Registry.
      </p>
    </div>
  )
}

