import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-[10px] px-3 py-2 text-sm text-slate-900",
          "bg-white/78 backdrop-blur-[24px] [-webkit-backdrop-filter:blur(12px)]",
          "border border-slate-200/70",
          "shadow-[0_1px_3px_rgba(15,23,42,0.05)]",
          "placeholder:text-slate-600",
          "transition-all duration-150 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-0",
          "focus-visible:border-indigo-400/70 focus-visible:bg-white/90",
          "focus-visible:shadow-[0_0_0_3px_rgba(99,102,241,0.12),0_1px_3px_rgba(15,23,42,0.05)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }


