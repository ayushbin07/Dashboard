import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { StatCards } from '@/components/dashboard/StatCards'
import { AnalyticsGraph } from '@/components/dashboard/AnalyticsGraph'
import { TaskList } from '@/components/dashboard/TaskList'
import { HabitList } from '@/components/dashboard/HabitList'
import { Reminders } from '@/components/dashboard/Reminders'
import { Timer } from '@/components/dashboard/Timer'
import { QuoteCard } from '@/components/dashboard/QuoteCard'
import { FriendsList } from '@/components/dashboard/FriendsList'
import { motion } from 'framer-motion'
import GradualBlur from '@/components/ui/GradualBlur'
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
            setTasks(fetchedTasks)
            setHabits(fetchedHabits)

            // Sync to local service for search availability
            const { localService } = await import('@/services/localService')
            localService.saveTasks(fetchedTasks)
            localService.saveHabits(fetchedHabits)
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
            const today = format(new Date(), 'yyyy-MM-dd')
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

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
    }

    if (loading) {
        return <div className="flex h-[50vh] items-center justify-center text-emerald-500 dark:text-emerald-400 font-semibold italic">Adjusting system parameters...</div>
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4 max-w-[1600px] mx-auto p-2 pb-20"
        >
            {/* Header Area */}
            <motion.div variants={itemVariants} className="flex justify-between items-end mb-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        Dashboard <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">v 1.26</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Plan, prioritize, and accomplish your tasks with ease.</p>
                </div>
            </motion.div>

            {/* Top Cards Row: 5 Columns (4 Stats + 1 Timer) */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCards habits={habits} />
                <Timer />
            </motion.div>

            {/* Main Content Grid: 2 Columns */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

                {/* Left Column (2/3 width) */}
                <div className="xl:col-span-2 space-y-4">
                    {/* Analytics Graph */}
                    <motion.div variants={itemVariants} className="h-[320px]">
                        <AnalyticsGraph habits={habits} />
                    </motion.div>

                    {/* Habits and Reminders Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div variants={itemVariants}>
                            <HabitList
                                habits={habits}
                                onToggle={handleToggleHabit}
                                onAdd={handleAddHabit}
                                onUpdate={handleUpdateHabit}
                                onDelete={handleDeleteHabit}
                            />
                        </motion.div>
                        <motion.div variants={itemVariants} className="h-full">
                            <Reminders tasks={tasks} />
                        </motion.div>
                    </div>
                </div>

                {/* Right Column (1/3 width) - Task List + Friends */}
                <div className="xl:col-span-1 space-y-4">
                    <motion.div variants={itemVariants}>
                        <TaskList
                            tasks={tasks}
                            onToggle={handleToggleTask}
                            onAdd={handleAddTask}
                            onUpdate={handleUpdateTask}
                        />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <FriendsList />
                    </motion.div>
                </div>
            </div>

            {/* Daily Quote */}
            <motion.div variants={itemVariants} className="pt-6">
                <QuoteCard />
            </motion.div>

            {/* Gradual Blur Demonstration Section */}
            <motion.div variants={itemVariants} className="pt-10">
                <h3 className="text-lg font-bold mb-4 opacity-50 uppercase tracking-widest text-center">Gradual Blur Tech Demo</h3>
                <section className="relative h-[500px] overflow-hidden rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-xl bg-white dark:bg-gray-900">
                    <div className="h-full overflow-y-auto p-10 custom-scrollbar">
                        <div className="space-y-8">
                            <h4 className="text-4xl font-bold text-emerald-600">Scroll to see the effect</h4>
                            <p className="text-gray-500 max-w-2xl leading-relaxed">
                                This section demonstrates the `GradualBlur` component. As you scroll down, the content will gradually blur as it approaches the bottom edge, creating a smooth transition rather than a hard cut.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 font-mono">
                                        Data Module {i}
                                    </div>
                                ))}
                            </div>
                            <p className="text-gray-500 pb-20">
                                More content here to enable scrolling... Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </p>
                        </div>
                    </div>

                    <GradualBlur
                        target="parent"
                        position="bottom"
                        height="7rem"
                        strength={2}
                        divCount={5}
                        curve="bezier"
                        exponential
                        opacity={1}
                        zIndex={50}
                    />
                </section>
            </motion.div>
        </motion.div>
    )
}
