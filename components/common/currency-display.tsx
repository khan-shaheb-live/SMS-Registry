import { cn, formatCurrency } from '@/lib/utils'

interface CurrencyDisplayProps {
  amount: number | string | null | undefined
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function CurrencyDisplay({ amount, className, size = 'md' }: CurrencyDisplayProps) {
  if (amount === null || amount === undefined) {
    return <span className={cn('text-slate-600', className)}>—</span>
  }
  
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  const formatted = formatCurrency(num)
  
  return (
    <span className={cn(
      'tabular-nums font-medium',
      size === 'sm' && 'text-xs',
      size === 'md' && 'text-sm',
      size === 'lg' && 'text-lg',
      className
    )}>
      {formatted}
    </span>
  )
}

