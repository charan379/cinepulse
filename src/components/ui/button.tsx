import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/90 shadow-none",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-destructive/90 shadow-none",
        outline:
          "border border-border bg-card text-foreground hover:bg-muted shadow-none",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 border border-secondary shadow-none",
        success:
          "bg-[#28a745] text-white hover:bg-[#218838] border border-[#28a745] shadow-none",
        warning:
          "bg-[#ffc107] text-[#212529] hover:bg-[#e0a800] border border-[#ffc107] shadow-none",
        info:
          "bg-[#17a2b8] text-white hover:bg-[#138496] border border-[#17a2b8] shadow-none",
        ghost: "hover:bg-muted text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glow: "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/90",
        glass: "border border-border bg-card text-foreground hover:bg-muted",
      },
      size: {
        default: "h-8 px-3 py-1.5",
        sm: "h-7 rounded px-2 text-xs",
        lg: "h-9 rounded px-4 text-sm font-semibold",
        icon: "h-8 w-8 rounded",
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
