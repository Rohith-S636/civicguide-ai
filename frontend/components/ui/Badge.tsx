import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline'
  }
>(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
      {
        'bg-saffron text-white': variant === 'default',
        'bg-india-green text-white': variant === 'secondary',
        'bg-green-100 text-green-700': variant === 'success',
        'bg-amber-100 text-amber-700': variant === 'warning',
        'bg-red-100 text-red-700': variant === 'danger',
        'border border-gray-300 bg-white text-gray-900': variant === 'outline',
      },
      className
    )}
    {...props}
  />
))
Badge.displayName = "Badge"

export { Badge }
