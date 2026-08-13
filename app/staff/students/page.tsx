import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/common/page-header'
import { StudentStatusBadge, FeeStatusBadge } from '@/components/common/status-badges'
import { CurrencyDisplay } from '@/components/common/currency-display'
import { EmptyState } from '@/components/common/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StudentStatus } from '@prisma/client'
import Link from 'next/link'
import { calculateOutstandingBalance, getFeeStatus } from '@/lib/business/fees'
import { formatDate } from '@/lib/utils'
import { Users, Plus, Search, Eye, Edit } from 'lucide-react'
import { SearchInput } from '@/components/common/search-input'

export const metadata = { title: 'Students' }

interface SearchParams {
  search?: string
  status?: string
  programme?: string
  year?: string
  page?: string
}

const PAGE_SIZE = 20

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const page = parseInt(searchParams.page ?? '1', 10)
  const search = searchParams.search ?? ''
  const status = searchParams.status as StudentStatus | undefined
  const programmeId = searchParams.programme
  const academicYear = searchParams.year

  // Build where clause
  const where: any = {}
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { studentId: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (status && Object.values(StudentStatus).includes(status as StudentStatus)) {
    where.status = status
  }
  if (programmeId) where.programmeId = programmeId
  if (academicYear) where.academicYear = academicYear

  const [students, total, programmes] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        programme: { select: { name: true, code: true } },
        fee: true,
        payments: { select: { amount: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.student.count({ where }),
    prisma.programme.findMany({ where: { status: 'ACTIVE' }, select: { id: true, name: true } }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  // Build URL helper
  function buildUrl(params: Record<string, string | undefined>) {
    const merged = {
      search: searchParams.search,
      status: searchParams.status,
      programme: searchParams.programme,
      year: searchParams.year,
      page: '1',
      ...params,
    }
    const qs = Object.entries(merged)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&')
    return `/staff/students${qs ? '?' + qs : ''}`
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Students"
        description={`${total} student${total !== 1 ? 's' : ''} in the Registry`}
      >
        <Link href="/staff/students/new">
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Student
          </Button>
        </Link>
      </PageHeader>

      {/* Search & Filters */}
      <div className="mb-5 space-y-5">
        {/* Primary Row: Search */}
        <div className="flex">
          <SearchInput defaultValue={search} containerClassName="flex-1 max-w-md" />
        </div>

        {/* Secondary Row: Filters */}
        <div className="flex flex-col xl:flex-row xl:items-end gap-5">
          <div className="flex flex-col md:flex-row gap-5">
            {/* Status Filter */}
            <div className="space-y-1.5">
              <h3 className="text-[11px] font-medium text-slate-700 uppercase tracking-wider pl-1">Status</h3>
              <div className="inline-flex flex-wrap items-center bg-white/78 backdrop-blur-[24px] border border-white/70 rounded-[12px] p-1 shadow-[0_2px_8px_rgba(15,23,42,0.02)]">
                {[
                  { label: 'All', value: '' },
                  { label: 'Enrolled', value: 'ENROLLED' },
                  { label: 'Deferred', value: 'DEFERRED' },
                  { label: 'Withdrawn', value: 'WITHDRAWN' },
                  { label: 'Completed', value: 'COMPLETED' },
                ].map(({ label, value }) => {
                  const isActive = (!status && !value) || status === value;
                  return (
                    <Link key={value} href={buildUrl({ status: value || undefined })}>
                      <div className={`px-3.5 py-1.5 text-sm rounded-[8px] transition-all duration-150 cursor-pointer ${isActive ? 'bg-slate-900 text-white font-medium shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'}`}>
                        {label}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Programme Filter */}
            {programmes.length > 0 && (
              <div className="space-y-1.5">
                <h3 className="text-[11px] font-medium text-slate-700 uppercase tracking-wider pl-1">Programme</h3>
                <div className="inline-flex flex-wrap items-center bg-white/78 backdrop-blur-[24px] border border-white/70 rounded-[12px] p-1 shadow-[0_2px_8px_rgba(15,23,42,0.02)]">
                  <Link href={buildUrl({ programme: undefined })}>
                    <div className={`px-3.5 py-1.5 text-sm rounded-[8px] transition-all duration-150 cursor-pointer ${!programmeId ? 'bg-slate-900 text-white font-medium shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'}`}>
                      All Programmes
                    </div>
                  </Link>
                  {programmes.map((p) => {
                    const isActive = programmeId === p.id;
                    return (
                      <Link key={p.id} href={buildUrl({ programme: p.id })}>
                        <div className={`px-3.5 py-1.5 text-sm rounded-[8px] transition-all duration-150 cursor-pointer ${isActive ? 'bg-slate-900 text-white font-medium shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'}`}>
                          {p.name}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Clear Filters */}
          {(status || programmeId || search) && (
            <div className="pb-2.5">
              <Link href="/staff/students" className="text-sm text-slate-700 hover:text-slate-900 transition-colors">
                Clear filters
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/78 backdrop-blur-[24px] border border-white/70 rounded-[20px] overflow-hidden shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
        {students.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students found"
            description={search || status ? 'Try adjusting your filters.' : 'Add the first student to get started.'}
            action={
              !search && !status ? (
                <Link href="/staff/students/new">
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Student
                  </Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/70" style={{ background: 'rgba(241,245,249,0.70)' }}>
                  <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">Student ID</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Programme</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Year</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600 hidden sm:table-cell">Balance</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => {
                  const totalPaid = student.payments.reduce(
                    (sum, p) => sum + parseFloat(p.amount.toString()), 0
                  )
                  const outstanding = calculateOutstandingBalance(student.fee?.amount, totalPaid)
                  const feeStatus = getFeeStatus(
                    student.fee ? parseFloat(student.fee.amount.toString()) : null,
                    totalPaid,
                    student.fee?.dueDate
                  )

                  return (
                    <tr key={student.id} className="hover:bg-indigo-50/20 transition-colors duration-100">
                      <td className="px-4 py-3 font-mono text-xs text-slate-600 whitespace-nowrap">
                        {student.studentId}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/staff/students/${student.id}`} className="font-medium text-slate-900 hover:text-blue-600">
                          {student.fullName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-700 hidden md:table-cell truncate max-w-[160px]">
                        {student.email}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-slate-700">{student.programme.name}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 hidden lg:table-cell whitespace-nowrap">
                        {student.academicYear}
                      </td>
                      <td className="px-4 py-3">
                        <StudentStatusBadge status={student.status} />
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        {!student.fee ? (
                          <span className="text-xs text-slate-600">No fee</span>
                        ) : (
                          <div className="flex flex-col items-end gap-1">
                            <CurrencyDisplay
                              amount={outstanding}
                              className={outstanding > 0 ? 'text-red-600' : 'text-emerald-600'}
                            />
                            <FeeStatusBadge status={feeStatus} />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/staff/students/${student.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="View student">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/staff/students/${student.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Edit student">
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-slate-200/60 px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-slate-700">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={buildUrl({ page: String(page - 1) })}>
                  <Button variant="outline" size="sm">Previous</Button>
                </Link>
              )}
              {page < totalPages && (
                <Link href={buildUrl({ page: String(page + 1) })}>
                  <Button variant="outline" size="sm">Next</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


