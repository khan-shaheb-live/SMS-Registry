import { cn } from '@/lib/utils'
import { StudentStatus, ProgrammeStatus, GradeClassification } from '@prisma/client'
import { AlertCircle, CheckCircle2, Clock, XCircle, MinusCircle } from 'lucide-react'

// ── Student Status Badge ──────────────────────────────────────────────────

const studentStatusConfig: Record<
  StudentStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  ENROLLED: {
    label: 'Enrolled',
    className: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/70 shadow-[0_0_0_1px_rgba(52,211,153,0.10)] dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  DEFERRED: {
    label: 'Deferred',
    className: 'bg-amber-50/80 text-amber-700 border-amber-200/70 shadow-[0_0_0_1px_rgba(251,191,36,0.10)] dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40',
    icon: <Clock className="w-3 h-3" />,
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    className: 'bg-red-50/80 text-red-700 border-red-200/70 shadow-[0_0_0_1px_rgba(248,113,113,0.10)] dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/40',
    icon: <XCircle className="w-3 h-3" />,
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-blue-50/80 text-blue-700 border-blue-200/70 shadow-[0_0_0_1px_rgba(96,165,250,0.10)] dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
}

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
  const config = studentStatusConfig[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium backdrop-blur-sm',
        config.className
      )}
    >
      {config.icon}
      {config.label}
    </span>
  )
}

// ── Fee / Payment Status Badge ────────────────────────────────────────────

type FeeStatus = 'PAID' | 'OUTSTANDING' | 'OVERDUE'

const feeStatusConfig: Record<
  FeeStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  PAID: {
    label: 'Paid',
    className: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  OUTSTANDING: {
    label: 'Outstanding',
    className: 'bg-amber-50/80 text-amber-700 border-amber-200/70 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40',
    icon: <AlertCircle className="w-3 h-3" />,
  },
  OVERDUE: {
    label: 'Overdue',
    className: 'bg-red-50/80 text-red-700 border-red-200/70 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/40',
    icon: <AlertCircle className="w-3 h-3" />,
  },
}

export function FeeStatusBadge({ status }: { status: FeeStatus }) {
  const config = feeStatusConfig[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium backdrop-blur-sm',
        config.className
      )}
    >
      {config.icon}
      {config.label}
    </span>
  )
}

// ── Assessment Status Badge ───────────────────────────────────────────────

type AssessmentStatus = 'OPEN' | 'CLOSING_SOON' | 'CLOSED'

const assessmentStatusConfig: Record<
  AssessmentStatus,
  { label: string; className: string }
> = {
  OPEN: {
    label: 'Open',
    className: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40',
  },
  CLOSING_SOON: {
    label: 'Closing Soon',
    className: 'bg-amber-50/80 text-amber-700 border-amber-200/70 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40',
  },
  CLOSED: {
    label: 'Closed',
    className: 'bg-slate-100/80 text-slate-700 border-slate-200/70 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800/40',
  },
}

export function AssessmentStatusBadge({ status }: { status: AssessmentStatus }) {
  const config = assessmentStatusConfig[status]
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium backdrop-blur-sm',
        config.className
      )}
    >
      {config.label}
    </span>
  )
}

// ── Grade Classification Badge ────────────────────────────────────────────

const gradeConfig: Record<
  GradeClassification,
  { label: string; className: string }
> = {
  DISTINCTION: {
    label: 'Distinction',
    className: 'bg-purple-50/80 text-purple-700 border-purple-200/70 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/40',
  },
  MERIT: {
    label: 'Merit',
    className: 'bg-blue-50/80 text-blue-700 border-blue-200/70 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40',
  },
  PASS: {
    label: 'Pass',
    className: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40',
  },
  FAIL: {
    label: 'Fail',
    className: 'bg-red-50/80 text-red-700 border-red-200/70 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/40',
  },
}

export function GradeBadge({ classification }: { classification: GradeClassification }) {
  const config = gradeConfig[classification]
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium backdrop-blur-sm',
        config.className
      )}
    >
      {config.label}
    </span>
  )
}

// ── Submission Late Badge ─────────────────────────────────────────────────

export function LateBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold bg-red-50/80 text-red-700 border-red-200/70 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/40 backdrop-blur-sm">
      <AlertCircle className="w-3 h-3" />
      LATE
    </span>
  )
}

// ── Publication Status Badge ──────────────────────────────────────────────

export function PublicationBadge({ isPublished }: { isPublished: boolean }) {
  if (isPublished) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium bg-emerald-50/80 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40 backdrop-blur-sm">
        <CheckCircle2 className="w-3 h-3" />
        Published
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium bg-slate-100/80 text-slate-700 border-slate-200/70 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800/40 backdrop-blur-sm">
      <MinusCircle className="w-3 h-3" />
      Withheld
    </span>
  )
}

// ── Programme Status Badge ────────────────────────────────────────────────

export function ProgrammeStatusBadge({ status }: { status: ProgrammeStatus }) {
  const isActive = status === 'ACTIVE'
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium backdrop-blur-sm',
      isActive
        ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40'
        : 'bg-slate-100/80 text-slate-700 border-slate-200/70 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800/40'
    )}>
      {isActive ? <CheckCircle2 className="w-3 h-3" /> : <MinusCircle className="w-3 h-3" />}
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

