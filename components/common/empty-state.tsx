import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {Icon && (
        <div className={cn(
          'flex items-center justify-center w-14 h-14 rounded-[16px] mb-5',
          'bg-white/60 backdrop-blur-[12px] [-webkit-backdrop-filter:blur(12px)]',
          'border border-white/70',
          'shadow-[0_2px_12px_rgba(15,23,42,0.06)]',
        )}>
          <Icon className="w-6 h-6 text-slate-600" />
        </div>
      )}
      <h3 className="text-[15px] font-semibold text-slate-700 mb-1">{title}</h3>
      {description && (
        <p className="text-[13px] text-slate-600 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && (
        <div className="mt-5">{action}</div>
      )}
    </div>
  )
}


