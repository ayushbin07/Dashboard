import { useEffect, useState } from 'react'
import { StatCards } from '@/components/dashboard/StatCards'
import { AnalyticsGraph } from '@/components/dashboard/AnalyticsGraph'
import { TaskList } from '@/components/dashboard/TaskList'
import { HabitList } from '@/components/dashboard/HabitList'
import { Reminders } from '@/components/dashboard/Reminders'
import { Timer } from '@/components/dashboard/Timer'
import { motion } from 'framer-motion'
import { localService } from '@/services/localService'
import type { Task, Habit } from '@/types'

export default function Dashboard() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [habits, setHabits] = useState<Habit[]>([])
    const [loading, setLoading] = useState(true)

    const refreshData = () => {
        setTasks(localService.getTasks())
        setHabits(localService.getHabits())
    }

    useEffect(() => {
        // Initial load
        refreshData()
        setLoading(false)
    }, [])

    // --- Task Handlers ---
    const handleToggleTask = (id: string) => {
        localService.toggleTask(id)
        refreshData()
    }

    const handleAddTask = async (newTask: any) => {
        // Adapt form data to service expectation
        localService.addTask({
            title: newTask.title,
            priority: newTask.priority,
            category: newTask.category,
            dueDate: newTask.due,
            notes: newTask.notes
        })
        refreshData()
    }

    const handleUpdateTask = (updatedTask: Task) => {
        localService.updateTask(updatedTask)
        refreshData()
    }

    // --- Habit Handlers ---
    const handleToggleHabit = (id: string) => {
        localService.toggleHabit(id)
        refreshData()
    }

    const handleAddHabit = (title: string, category: string, priority: boolean, target: number, color: string) => {
        localService.addHabit(title, category, priority, target, color)
        refreshData()
    }

    const handleUpdateHabit = (updatedHabit: Habit) => {
        localService.updateHabit(updatedHabit)
        refreshData()
    }

    const handleDeleteHabit = (id: string) => {
        localService.deleteHabit(id)
        refreshData()
    }

    if (loading) {
        return <div className="flex h-[50vh] items-center justify-center text-gray-400">Loading AntiGravity OS...</div>
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 max-w-[1600px] mx-auto p-2"
        >
            {/* Header Area */}
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Dashboard</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Plan, prioritize, and accomplish your tasks with ease.</p>
                </div>
            </div>

            {/* Top Cards Row: 5 Columns (4 Stats + 1 Timer) */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCards habits={habits} />
                <Timer />
            </div>

            {/* Main Content Grid: 2 Columns */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 h-full">

                {/* Left Column (2/3 width) */}
                <div className="xl:col-span-2 space-y-4">
                    {/* Analytics Graph */}
                    <div className="h-[320px]">
                        <AnalyticsGraph habits={habits} />
                    </div>

                    {/* Habits and Reminders Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[340px]">
                        <HabitList
                            habits={habits}
                            onToggle={handleToggleHabit}
                            onAdd={handleAddHabit}
                            onUpdate={handleUpdateHabit}
                            onDelete={handleDeleteHabit}
                        />
                        <div className="h-full">
                            <Reminders tasks={tasks} />
                        </div>
                    </div>
                </div>

                {/* Right Column (1/3 width) - Long Task List */}
                <div className="xl:col-span-1 h-full min-h-[600px]">
                    <TaskList
                        tasks={tasks}
                        onToggle={handleToggleTask}
                        onAdd={handleAddTask}
                        onUpdate={handleUpdateTask}
                    />
                </div>
            </div>

        </motion.div>
    )
}
