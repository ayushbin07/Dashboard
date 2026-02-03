import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

type ButtonProps = React.ComponentProps<typeof motion.button> & {
    variant?: "primary" | "secondary" | "ghost" | "icon"
    size?: "sm" | "md" | "lg" | "icon"
}

// Wrapping motion.button to allow ref forwarding properly involves some TS gymnastics, 
// keeping it simple as a wrapped component for now or standard div.
// Using standard button for semantics + motion hover.

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",

                    variant === "primary" && "bg-primary text-white hover:bg-primary/90 shadow-sm",
                    variant === "secondary" && "bg-white border border-gray-200 text-gray-900 hover:bg-gray-50",
                    variant === "ghost" && "hover:bg-gray-100 text-gray-600",
                    variant === "icon" && "p-2 hover:bg-gray-100 text-gray-500 rounded-full",

                    size === "sm" && "h-8 px-3 text-xs",
                    size === "md" && "h-10 px-4 py-2",
                    size === "lg" && "h-12 px-8",
                    size === "icon" && "h-10 w-10",
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
