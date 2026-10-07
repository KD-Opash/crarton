import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", asChild = false, ...props }, ref) => {
    
    // Using simple inline conditions rather than full class-variance-authority for now
    // to keep the dependency tree light.
    const variants = {
      primary: "bg-paper text-ink hover:bg-white active:scale-[0.98]",
      secondary: "bg-ink text-paper hover:bg-[#353a2c] active:scale-[0.98]",
      outline: "border border-line hover:bg-white/5 active:scale-[0.98]",
      ghost: "hover:bg-white/5 active:scale-[0.98]",
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex min-h-[48px] items-center justify-center gap-[22px] rounded-full px-6 text-[12.5px] font-medium transition-all duration-200 ease-out",
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
