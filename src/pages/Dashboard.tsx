import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { AnalyticsGraph } from '@/components/dashboard/AnalyticsGraph'
import { TaskList } from '@/components/dashboard/TaskList'
import { HabitList } from '@/components/dashboard/HabitList'
import { Reminders } from '@/components/dashboard/Reminders'
import { QuoteCard } from '@/components/dashboard/QuoteCard'
import { FriendsList } from '@/components/dashboard/FriendsList'
import { AIChat } from '@/components/dashboard/AIChat';
import { InsightCard } from '@/components/dashboard/InsightCard'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { Bot, X } from 'lucide-react'
import { dbService } from '@/services/dbService'
import type { Task, Habit, TaskStatus } from '@/types'
import { triggerConfetti } from '@/utils/confetti';

export default function Dashboard() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [habits, setHabits] = useState<Habit[]>([])
    const [apiKey, setApiKey] = useState<string | null>(null)
    const [userAvatar, setUserAvatar] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [isChatOpen, setIsChatOpen] = useState(false)

    const refreshData = async () => {
        try {
            console.log('Refreshing Dashboard Data (Tasks/Habits)...')
            const [fetchedTasks, fetchedHabits, profile] = await Promise.all([
                dbService.getTasks(),
                dbService.getHabits(),
                dbService.getProfile()
            ])
            setTasks(fetchedTasks)
            setHabits(fetchedHabits)
            // @ts-ignore - profile type might not be updated yet
            const userProfile = profile as any;
            setApiKey(userProfile?.gemini_api_key || null)
            setUserAvatar(userProfile?.avatar || null)

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
            const newStatus: TaskStatus = task.status === 'pending' ? 'completed' : 'pending';
            // Optimistic update
            const updatedTasks = tasks.map(t => t.id === id ? { ...t, status: newStatus } : t);
            setTasks(updatedTasks);

            if (newStatus === 'completed') {
                const allCompleted = updatedTasks.every(t => t.status === 'completed');
                if (allCompleted && updatedTasks.length > 0) {
                    triggerConfetti();
                }
            }

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
            const newCompleted = !habit.completedToday;
            // Optimistic update
            const updatedHabits = habits.map(h => h.id === id ? { ...h, completedToday: newCompleted } : h);
            setHabits(updatedHabits);

            if (newCompleted) {
                const allCompleted = updatedHabits.every(h => h.completedToday);
                if (allCompleted && updatedHabits.length > 0) {
                    triggerConfetti();
                }
            }

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

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    }

    const itemVariants: Variants = {
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
                            {apiKey ? (
                                <InsightCard apiKey={apiKey} tasks={tasks} habits={habits} />
                            ) : (
                                <Reminders tasks={tasks} />
                            )}
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

            {/* Floating AI Chat Button & Interface */}
            {apiKey && (
                <>
                    {/* Floating Toggle Button */}
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#0F5132] dark:bg-[#4ade80] dark:shadow-[0_0_8px_rgba(74,222,128,0.6)] dark:bg-[#4ade80] text-white dark:text-gray-900 dark:drop-shadow-[0_0_8px_rgba(74,222,128,0.6)] shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
                    >
                        {isChatOpen ? (
                            <X size={24} />
                        ) : (
                            <Bot size={24} />
                        )}
                    </motion.button>

                    {/* Chat Interface Overlay */}
                    <AnimatePresence>
                        {isChatOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="fixed bottom-24 right-6 z-50 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] shadow-2xl rounded-[2rem] overflow-hidden"
                            >
                                <AIChat
                                    apiKey={apiKey}
                                    tasks={tasks}
                                    habits={habits}
                                    onRefresh={refreshData}
                                    userAvatar={userAvatar || undefined}
                                    className="h-full border-none rounded-none"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </motion.div>
    )
}
