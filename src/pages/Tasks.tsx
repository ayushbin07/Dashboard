import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { localService } from '@/services/localService'
import type { Task, Habit } from '@/types'

export default function Tasks() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [habits, setHabits] = useState<Habit[]>([])

    useEffect(() => {
        setTasks(localService.getTasks())
        setHabits(localService.getHabits())
    }, [])

    const toggleTask = (taskId: string) => {
        const updatedTasks = tasks.map(task => {
            if (task.id === taskId) {
                return {
                    ...task,
                    status: (task.status === 'completed' ? 'pending' : 'completed') as 'pending' | 'completed'
                }
            }
            return task
        })
        setTasks(updatedTasks)
        localService.saveTasks(updatedTasks)
    }

    const toggleHabit = (habitId: string) => {
        const updatedHabits = habits.map(habit => {
            if (habit.id === habitId) {
                const newCompleted = !habit.completedToday
                const dateKey = new Date().toISOString().split('T')[0]

                return {
                    ...habit,
                    completedToday: newCompleted,
                    history: {
                        ...habit.history,
                        [dateKey]: newCompleted
                    },
                    streak: newCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1)
                }
            }
            return habit
        })
        setHabits(updatedHabits)
        localService.saveHabits(updatedHabits)
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
                <div className="bg-white dark:bg-[#1f2937] p-6 rounded-[2rem] border-none shadow-soft">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pending Tasks</div>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">{pendingTasks.length}</div>
                </div>
                <div className="bg-white dark:bg-[#1f2937] p-6 rounded-[2rem] border-none shadow-soft">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Completed Tasks</div>
                    <div className="text-4xl font-bold text-[#0F5132] dark:text-[#4ade80]">{completedTasks.length}</div>
                </div>
                <div className="bg-white dark:bg-[#1f2937] p-6 rounded-[2rem] border-none shadow-soft">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Habits</div>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">{habits.length}</div>
                </div>
            </div>

            {/* Tasks Section */}
            <div className="bg-white dark:bg-[#1f2937] p-8 rounded-[2rem] border-none shadow-soft">
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
                                            className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-l-4 border-l-[#0F5132] cursor-pointer"
                                        >
                                            <div className="flex items-start gap-3">
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
                                                {task.priority && (
                                                    <span className="text-xs font-bold text-red-500 dark:text-red-400">
                                                        HIGH
                                                    </span>
                                                )}
                                            </div>
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
            <div className="bg-white dark:bg-[#1f2937] p-8 rounded-[2rem] border-none shadow-soft">
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
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${habit.completedToday
                                    ? 'bg-[#0F5132]/10 dark:bg-[#0F5132]/20 border-[#0F5132]'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
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
                                    {habit.priority && (
                                        <span className="text-xs font-bold text-red-500 dark:text-red-400">★</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 ml-9">
                                    <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
                                        {habit.category}
                                    </span>
                                    <span>Streak: {habit.streak} days</span>
                                </div>
                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 ml-9">
                                    Target: {habit.targetPerMonth} times/month
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    )
}
