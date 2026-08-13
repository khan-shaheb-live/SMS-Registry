import { cn, formatCurrency } from '@/lib/utils'

interface CurrencyDisplayProps {
  amount: any
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function CurrencyDisplay({ amount, className, size = 'md' }: CurrencyDisplayProps) {
  if (amount === null || amount === undefined) {
    return <span className={cn('text-slate-600', className)}>—</span>
  }
  
  let num: number
  if (typeof amount === 'object' && amount !== null && typeof amount.toString === 'function') {
    num = parseFloat(amount.toString())
  } else if (typeof amount === 'string') {
    num = parseFloat(amount)
  } else {
    num = Number(amount)
  }
  
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

