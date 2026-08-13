import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Premium dark solid — primary action
        default:
          "bg-slate-900 text-white shadow-sm hover:bg-slate-800 hover:shadow-[0_4px_14px_rgba(15,23,42,0.25)] rounded-[12px]",
        // Red glass — destructive action
        destructive:
          "bg-red-500/90 text-white backdrop-blur-sm shadow-[0_2px_8px_rgba(239,68,68,0.20)] hover:bg-red-600 rounded-[12px]",
        // Glass outline — secondary action
        outline:
          "border border-slate-200/80 bg-white/60 backdrop-blur-[12px] text-slate-700 shadow-[0_1px_4px_rgba(15,23,42,0.05)] hover:bg-white/85 hover:border-slate-300/80 hover:shadow-[0_2px_8px_rgba(15,23,42,0.08)] rounded-[12px]",
        // Light glass secondary
        secondary:
          "bg-slate-100/80 text-slate-700 backdrop-blur-sm hover:bg-slate-200/80 rounded-[12px]",
        // Transparent ghost
        ghost:
          "text-slate-600 hover:bg-white/55 hover:backdrop-blur-sm hover:text-slate-900 rounded-[12px]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
