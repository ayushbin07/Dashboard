import { useEffect, useState } from 'react'
import { StatCards } from '@/components/dashboard/StatCards'
import { AnalyticsGraph } from '@/components/dashboard/AnalyticsGraph'
import { TaskList } from '@/components/dashboard/TaskList'
import { HabitList } from '@/components/dashboard/HabitList'
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Top Cards (Now reflecting Habits) */}
            <StatCards habits={habits} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Analytics */}
                <div className="lg:col-span-2 space-y-6">
                    <AnalyticsGraph habits={habits} />
                </div>

                {/* Right Column: Execution List (To-Dos) */}
                <div className="lg:col-span-1 h-full min-h-[400px]">
                    <TaskList
                        tasks={tasks}
                        onToggle={handleToggleTask}
                        onAdd={handleAddTask}
                        onUpdate={handleUpdateTask}
                    />
                </div>

                {/* Bottom Row: Habits */}
                <div className="lg:col-span-3">
                    <HabitList
                        habits={habits}
                        onToggle={handleToggleHabit}
                        onAdd={handleAddHabit}
                        onUpdate={handleUpdateHabit}
                        onDelete={handleDeleteHabit}
                    />
                </div>

            </div>
        </motion.div>
    )
}
