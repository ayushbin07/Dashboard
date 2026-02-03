import { Card } from "@/components/ui/card"
import type { Task } from "@/types"
import { CalendarClock } from "lucide-react"

export function Reminders({ tasks }: { tasks: Task[] }) {
    // Filter tasks that have due dates and are not completed
    const upcomingTasks = tasks
        .filter(t => t.dueDate && t.status !== 'completed')
        .sort((a, b) => {
            const dateA = new Date(a.dueDate!).getTime()
            const dateB = new Date(b.dueDate!).getTime()
            return dateA - dateB
        })
        .slice(0, 3) // Show top 3

    return (
        <Card className="p-6 bg-white dark:bg-[#1f2937] rounded-[2rem] shadow-soft h-full flex flex-col justify-between transition-colors duration-300">
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Reminders</h3>
                <div className="space-y-3">
                    {upcomingTasks.length === 0 && (
                        <div className="text-center text-gray-400 py-4 text-sm">
                            No upcoming reminders.
                        </div>
                    )}
                    {upcomingTasks.map(task => (
                        <div key={task.id} className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-l-4 border-[#0F5132]">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-200 truncate">{task.title}</h4>
                            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                                <CalendarClock size={12} />
                                {new Date(task.dueDate!).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {upcomingTasks.length > 0 && (
                <a
                    href="https://calendar.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                >
                    <button className="w-full py-2.5 rounded-xl bg-[#0F5132] text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#156a42] transition-colors mt-2">
                        View Schedule
                    </button>
                </a>
            )}
        </Card>
    )
}
