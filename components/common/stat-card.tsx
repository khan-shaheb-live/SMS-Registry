import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  iconClassName?: string
  trend?: {
    value: string
    positive?: boolean
  }
  className?: string
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  trend,
  className,
}: StatCardProps) {
  return (
    <div className={cn(
      'rounded-[20px] p-5',
      'bg-white/78 backdrop-blur-[24px] [-webkit-backdrop-filter:blur(20px)]',
      'border border-white/70',
      'shadow-[0_4px_24px_rgba(15,23,42,0.07),0_1px_4px_rgba(15,23,42,0.04)]',
      'hover:shadow-[0_8px_32px_rgba(15,23,42,0.10),0_2px_6px_rgba(15,23,42,0.05)] hover:-translate-y-0.5',
      'transition-all duration-200',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 flex-1 min-w-0">
          <p className="text-[13px] font-medium text-slate-700 truncate">{title}</p>
          <p className="text-[28px] font-semibold text-slate-900 tabular-nums leading-tight">{value}</p>
          {description && (
            <p className="text-[12px] text-slate-600">{description}</p>
          )}
          {trend && (
            <p className={cn(
              'text-[12px] font-medium',
              trend.positive ? 'text-emerald-600' : 'text-red-500'
            )}>
              {trend.value}
            </p>
          )}
        </div>
        <div className={cn(
          'flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-[12px]',
          'shadow-[0_2px_8px_rgba(15,23,42,0.08)]',
          iconClassName ?? 'bg-indigo-50 text-indigo-600'
        )}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}


