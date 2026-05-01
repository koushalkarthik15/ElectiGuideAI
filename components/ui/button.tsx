import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'danger';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          "h-10 px-4 py-2 font-inter",
          variant === 'default' && "bg-saffron text-oxford-blue hover:bg-saffron/90",
          variant === 'outline' && "border border-saffron text-saffron hover:bg-saffron/10",
          variant === 'danger' && "bg-alert-red text-cream hover:bg-alert-red/90",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
