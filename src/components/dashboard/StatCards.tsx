import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import type { Task } from "@/types"

interface StatCardProps {
    title: string
    value: string | number
    subtitle: string
    type: "priority" | "additional" | "neutral"
}

export function StatCards({ tasks }: { tasks: Task[] }) {
    const priorityTasks = tasks.filter(t => t.priority && t.status === 'pending')
    const additionalTasks = tasks.filter(t => !t.priority && t.status === 'pending')

    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'completed').length
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SingleStatCard
                title="Priority Tasks"
                value={priorityTasks.length}
                subtitle="Active"
                type="priority"
            />
            <SingleStatCard
                title="Additional Tasks"
                value={additionalTasks.length}
                subtitle="Pending"
                type="additional"
            />
            <SingleStatCard
                title="Overall Progress"
                value={`${progress}%`}
                subtitle="Total Completion"
                type="neutral"
            />
        </div>
    )
}

function SingleStatCard({ title, value, subtitle, type }: StatCardProps) {
    const textClass =
        type === 'priority' ? 'text-accent-priority' :
            type === 'additional' ? 'text-accent-additional' :
                'text-primary'

    return (
        <Card className="relative overflow-hidden p-6 flex flex-col justify-between h-36">
            {/* Background decorative blob */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-2xl ${type === 'priority' ? 'bg-accent-priority' :
                type === 'additional' ? 'bg-accent-additional' : 'bg-gray-200'
                }`} />

            <div className="relative z-10 flex justify-between items-start">
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                <Badge variant={
                    type === 'priority' ? 'priority' :
                        type === 'additional' ? 'additional' : 'secondary'
                }>Live</Badge>
            </div>

            <div className="relative z-10 mt-2">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`text-4xl font-bold tracking-tight ${textClass}`}
                >
                    {value}
                </motion.div>
                <p className="text-xs text-gray-400 mt-1 font-medium bg-white/50 inline-block px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                    {subtitle}
                </p>
            </div>
        </Card>
    )
}
