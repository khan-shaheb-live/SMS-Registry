import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-6', className)}>
      <div className="min-w-0">
        <h1 className="text-[26px] font-semibold text-slate-900 tracking-tight truncate leading-tight">{title}</h1>
        {description && (
          <p className="text-[14px] text-slate-700 mt-1 font-normal">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex-shrink-0 flex items-center gap-2 mt-0.5">
          {children}
        </div>
      )}
    </div>
  )
}

