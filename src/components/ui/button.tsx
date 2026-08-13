import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 active:scale-[0.97] cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/25 hover:brightness-110 border border-white/20 active:shadow-sm",
        destructive:
          "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-rose-500/25 hover:brightness-110 border border-white/20",
        outline:
          "border border-border/80 bg-card text-foreground hover:bg-muted hover:border-primary/40 shadow-xs",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-muted text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glow: "bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-violet-500/35 hover:brightness-110 border border-white/25",
        glass: "bg-card/80 text-foreground border border-border/60 hover:bg-muted backdrop-blur-md shadow-xs",
      },
      size: {
        default: "h-9 px-3.5 py-2",
        sm: "h-7.5 rounded-lg px-2.5 text-xs",
        lg: "h-11 rounded-xl px-5 text-sm font-semibold",
        icon: "h-8.5 w-8.5 rounded-xl",
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
