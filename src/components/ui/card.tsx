import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, type HTMLMotionProps } from "framer-motion"

interface CardProps extends HTMLMotionProps<"div"> {
    variant?: "default" | "glass" | "interactive"
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = "default", ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={cn(
                    "rounded-2xl border border-white/50 bg-white shadow-soft",
                    variant === "glass" && "glass shadow-none",
                    variant === "interactive" && "hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer",
                    className
                )}
                {...props}
            />
        )
    }
)
Card.displayName = "Card"

export { Card }
