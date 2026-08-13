'use client'

import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useEffect, useState, useRef } from 'react'
import { Input } from '@/components/ui/input'

interface SearchInputProps {
  placeholder?: string
  defaultValue?: string
  className?: string
  containerClassName?: string
  glass?: boolean
}

export function SearchInput({ 
  placeholder = "Search...", 
  defaultValue = "",
  className = "",
  containerClassName = "w-full sm:max-w-xs",
  glass = false
}: SearchInputProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(defaultValue)
  
  // Sync state if URL changes externally
  useEffect(() => {
    setValue(searchParams.get('search') || '')
  }, [searchParams])

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setValue(val)
    
    if (timerRef.current) clearTimeout(timerRef.current)
    
    timerRef.current = setTimeout(() => {
      router.push(`${pathname}?${createQueryString('search', val)}`)
    }, 300)
  }

  const handleClear = () => {
    setValue('')
    router.push(`${pathname}?${createQueryString('search', '')}`)
  }

  return (
    <div className={`relative ${containerClassName}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
      {glass ? (
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full pl-9 pr-9 py-2 bg-white/78 backdrop-blur-[24px] border border-white/70 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400/70 transition-shadow ${className}`}
        />
      ) : (
        <Input
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`pl-9 pr-9 w-full ${className}`}
        />
      )}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-600 focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}


