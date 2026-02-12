import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { dbService } from '@/services/dbService'
import type { Task, Habit } from '@/types'

export default function Tasks() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [habits, setHabits] = useState<Habit[]>([])

    const refreshData = async () => {
        try {
            const [fetchedTasks, fetchedHabits] = await Promise.all([
                dbService.getTasks(),
                dbService.getHabits()
            ])
            setTasks(fetchedTasks)
            setHabits(fetchedHabits)
        } catch (error) {
            console.error('Failed to load tasks data', error)
        }
    }

    useEffect(() => {
        refreshData()
    }, [])

    const toggleTask = async (taskId: string) => {
        // Optimistic update
        const task = tasks.find(t => t.id === taskId)
        if (!task) return

        const updatedTasks = tasks.map(t => {
            if (t.id === taskId) {
                return {
                    ...t,
                    status: (t.status === 'completed' ? 'pending' : 'completed') as 'pending' | 'completed'
                }
            }
            return t
        })
        setTasks(updatedTasks)

        await dbService.toggleTask(taskId, task.status)
        refreshData()
    }

    const toggleHabit = async (habitId: string) => {
        // Optimistic update
        const habit = habits.find(h => h.id === habitId)
        if (!habit) return

        const updatedHabits = habits.map(h => {
            if (h.id === habitId) {
                return { ...h, completedToday: !h.completedToday }
            }
            return h
        })
        setHabits(updatedHabits)

        const today = format(new Date(), 'yyyy-MM-dd')
        await dbService.toggleHabit(habitId, today, habit.completedToday)
        refreshData()
    }

    const pendingTasks = tasks.filter(t => t.status === 'pending')
    const completedTasks = tasks.filter(t => t.status === 'completed')

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-[90%] mx-auto space-y-6"
        >
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0F5132] to-[#4ade80] bg-clip-text text-transparent">
                    Tasks & Habits
                </h2>
                <p className="text-gray-500 dark:text-gray-400">Manage all your tasks and daily rituals</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/40 dark:bg-[#1f2937]/40 backdrop-blur-[50px] p-6 rounded-[2rem] border-none shadow-soft">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pending Tasks</div>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">{pendingTasks.length}</div>
                </div>
                <div className="bg-white/40 dark:bg-[#1f2937]/40 backdrop-blur-[50px] p-6 rounded-[2rem] border-none shadow-soft">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Completed Tasks</div>
                    <div className="text-4xl font-bold text-[#0F5132] dark:text-[#4ade80]">{completedTasks.length}</div>
                </div>
                <div className="bg-white/40 dark:bg-[#1f2937]/40 backdrop-blur-[50px] p-6 rounded-[2rem] border-none shadow-soft">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Habits</div>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">{habits.length}</div>
                </div>
            </div>

            {/* Tasks Section */}
            <div className="bg-white/40 dark:bg-[#1f2937]/40 backdrop-blur-[50px] p-8 rounded-[2rem] border-none shadow-soft">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tasks</h3>

                {tasks.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        No tasks yet. Add your first task from the dashboard!
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Pending Tasks */}
                        {pendingTasks.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                                    PENDING ({pendingTasks.length})
                                </h4>
                                <div className="space-y-2">
                                    {pendingTasks.map(task => (
                                        <motion.div
                                            key={task.id}
                                            whileHover={{ scale: 1.01 }}
                                            onClick={() => toggleTask(task.id)}
                                            className="p-4 rounded-xl bg-white/20 dark:bg-gray-800/20 border-l-4 border-l-[#0F5132] cursor-pointer relative overflow-hidden"
                                        >
                                            <div className="flex items-start gap-3 relative z-10">
                                                <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center mt-0.5 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <h5 className="font-semibold text-gray-900 dark:text-white">
                                                        {task.title}
                                                    </h5>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        <span className="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700">
                                                            {task.category}
                                                        </span>
                                                        {task.dueDate && (
                                                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {task.priority && (
                                                <motion.div
                                                    className="absolute right-2 top-1/2 -translate-y-1/2"
                                                    animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                                >
                                                    <svg width="56" height="56" viewBox="0 0 24 24" className="drop-shadow-lg">
                                                        <defs>
                                                            <linearGradient id="taskStarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                                                                <stop offset="40%" stopColor="#fef3c7" stopOpacity="0.7" />
                                                                <stop offset="100%" stopColor="#fbbf24" stopOpacity="1" />
                                                            </linearGradient>
                                                        </defs>
                                                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" fill="url(#taskStarGrad)" />
                                                    </svg>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Completed Tasks */}
                        {completedTasks.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                                    COMPLETED ({completedTasks.length})
                                </h4>
                                <div className="space-y-2">
                                    {completedTasks.map(task => (
                                        <motion.div
                                            key={task.id}
                                            whileHover={{ scale: 1.01 }}
                                            onClick={() => toggleTask(task.id)}
                                            className="p-4 rounded-xl bg-[#0F5132]/10 dark:bg-[#0F5132]/20 cursor-pointer"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-[#0F5132] flex items-center justify-center mt-0.5 flex-shrink-0">
                                                    <Check size={16} className="text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="font-semibold text-gray-600 dark:text-gray-300 line-through">
                                                        {task.title}
                                                    </h5>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        <span className="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700">
                                                            {task.category}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Habits Section */}
            <div className="bg-white/40 dark:bg-[#1f2937]/40 backdrop-blur-[50px] p-8 rounded-[2rem] border-none shadow-soft">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Daily Rituals</h3>

                {habits.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        No habits yet. Add your first habit from the dashboard!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {habits.map(habit => (
                            <motion.div
                                key={habit.id}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => toggleHabit(habit.id)}
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden ${habit.completedToday
                                    ? 'bg-[#0F5132]/10 dark:bg-[#0F5132]/20 border-[#0F5132]'
                                    : 'bg-transparent border-l-4 border-l-[#0F5132] border-gray-300/40 dark:border-gray-600/40 hover:bg-white/10 dark:hover:bg-gray-800/10'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${habit.completedToday ? 'bg-[#0F5132]' : 'bg-gray-200 dark:bg-gray-700'
                                            }`}>
                                            {habit.completedToday && <Check size={16} className="text-white" />}
                                        </div>
                                        <h5 className={`font-semibold ${habit.completedToday
                                            ? 'text-[#0F5132] dark:text-[#4ade80]'
                                            : 'text-gray-900 dark:text-white'
                                            }`}>
                                            {habit.title}
                                        </h5>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 ml-9 relative z-10">
                                    <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
                                        {habit.category}
                                    </span>
                                    <span>Streak: {habit.streak} days</span>
                                </div>
                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 ml-9 relative z-10">
                                    Target: {habit.targetPerMonth} times/month
                                </div>
                                {habit.priority && (
                                    <motion.div
                                        className="absolute right-1 top-1/2 -translate-y-1/2"
                                        animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <svg width="64" height="64" viewBox="0 0 24 24" className="drop-shadow-lg">
                                            <defs>
                                                <linearGradient id="habitStarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                                                    <stop offset="40%" stopColor="#fef3c7" stopOpacity="0.7" />
                                                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="1" />
                                                </linearGradient>
                                            </defs>
                                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" fill="url(#habitStarGrad)" />
                                        </svg>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    )
}
