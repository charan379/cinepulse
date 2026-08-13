import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/15 text-primary border-primary/30",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive/15 text-destructive border-destructive/30",
        outline: "border-border text-foreground bg-card",
        glass: "bg-card/80 border border-border text-foreground backdrop-blur-md shadow-sm",
        gold: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
        cyan: "bg-primary/15 text-primary border-primary/30",
        violet: "bg-primary/15 text-primary border-primary/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
