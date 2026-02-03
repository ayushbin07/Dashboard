import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "outline" | "secondary" | "priority" | "additional"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                variant === "default" && "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                variant === "secondary" && "border-transparent bg-secondary/10 text-secondary hover:bg-secondary/20",
                variant === "priority" && "border-transparent bg-accent-priority/10 text-accent-priority hover:bg-accent-priority/20",
                variant === "additional" && "border-transparent bg-accent-additional/10 text-accent-additional hover:bg-accent-additional/20",
                variant === "outline" && "text-foreground",
                className
            )}
            {...props}
        />
    )
}

export { Badge }
