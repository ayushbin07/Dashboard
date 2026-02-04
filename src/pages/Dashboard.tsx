import { useEffect, useState } from 'react'
import { StatCards } from '@/components/dashboard/StatCards'
import { AnalyticsGraph } from '@/components/dashboard/AnalyticsGraph'
import { TaskList } from '@/components/dashboard/TaskList'
import { HabitList } from '@/components/dashboard/HabitList'
import { Reminders } from '@/components/dashboard/Reminders'
import { Timer } from '@/components/dashboard/Timer'
import { motion } from 'framer-motion'
import { dbService } from '@/services/dbService'
import type { Task, Habit } from '@/types'

export default function Dashboard() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [habits, setHabits] = useState<Habit[]>([])
    const [loading, setLoading] = useState(true)

    const refreshData = async () => {
        try {
            console.log('Refreshing Dashboard Data (Tasks/Habits)...')
            const [fetchedTasks, fetchedHabits] = await Promise.all([
                dbService.getTasks(),
                dbService.getHabits()
            ])
            console.log(`Loaded ${fetchedTasks.length} tasks and ${fetchedHabits.length} habits`)
            setTasks(fetchedTasks)
            setHabits(fetchedHabits)
        } catch (error) {
            console.error('Failed to load dashboard data', error)
            alert('Dashboard Load Error: ' + (error as any).message)
        }
    }

    useEffect(() => {
        const loadInitial = async () => {
            await refreshData()
            setLoading(false)
        }
        loadInitial()
    }, [])

    // --- Task Handlers ---
    const handleToggleTask = async (id: string) => {
        const task = tasks.find(t => t.id === id)
        if (task) {
            // Optimistic update
            setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending' } : t))

            await dbService.toggleTask(id, task.status)
            refreshData()
        }
    }

    const handleAddTask = async (newTask: any) => {
        try {
            await dbService.addTask({
                title: newTask.title,
                priority: newTask.priority,
                category: newTask.category || 'General',
                dueDate: newTask.due,
                notes: newTask.notes
            })
            refreshData()
        } catch (error: any) {
            console.error('Failed to add task:', error)
            alert('Failed to add task: ' + (error.message || error.details || JSON.stringify(error)))
        }
    }

    const handleUpdateTask = async (updatedTask: Task) => {
        await dbService.updateTask(updatedTask)
        refreshData()
    }

    // --- Habit Handlers ---
    const handleToggleHabit = async (id: string) => {
        const habit = habits.find(h => h.id === id)
        if (habit) {
            const today = new Date().toISOString().split('T')[0]
            // Optimistic update
            setHabits(prev => prev.map(h => h.id === id ? { ...h, completedToday: !h.completedToday } : h))

            await dbService.toggleHabit(id, today, habit.completedToday)
            refreshData()
        }
    }

    const handleAddHabit = async (title: string, category: string, priority: boolean, target: number, color: string) => {
        await dbService.addHabit(title, category, priority, target, color)
        refreshData()
    }

    const handleUpdateHabit = async (updatedHabit: Habit) => {
        await dbService.updateHabit(updatedHabit)
        refreshData()
    }

    const handleDeleteHabit = async (id: string) => {
        setHabits(prev => prev.filter(h => h.id !== id))
        await dbService.deleteHabit(id)
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
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        Dashboard <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">v 1.17</span>
                    </h2>
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
