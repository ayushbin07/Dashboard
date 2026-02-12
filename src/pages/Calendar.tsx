import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X, Check, LayoutGrid, ListTodo } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay, isSameMonth } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { dbService } from '@/services/dbService'
import type { Habit, Task } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function Calendar() {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [view, setView] = useState<'heatmap' | 'rituals'>('heatmap')
    const [habits, setHabits] = useState<Habit[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [hoveredDate, setHoveredDate] = useState<Date | null>(null)
    const location = useLocation()

    const refreshData = async () => {
        try {
            const [fetchedHabits, fetchedTasks] = await Promise.all([
                dbService.getHabits(),
                dbService.getTasks()
            ])
            setHabits(fetchedHabits)
            setTasks(fetchedTasks)
        } catch (error) {
            console.error('Failed to load calendar data', error)
        }
    }

    useEffect(() => {
        refreshData()

        // Handle navigation from search
        const state = location.state as { selectedDate?: string | Date }
        if (state?.selectedDate) {
            const date = new Date(state.selectedDate)
            setCurrentMonth(date)
            setSelectedDate(date)
            // Clear state after handling it
            window.history.replaceState({}, document.title)
        }
    }, [location])

    const goToPreviousMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1))
    }

    const goToNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1))
    }

    // Generate calendar days
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Get the starting day of the week (0 = Sunday)
    const startDay = monthStart.getDay()

    // Create empty cells for days before month starts
    const emptyCells = Array.from({ length: startDay }, (_, i) => i)

    // Get habits for a specific date
    const getHabitsForDate = (date: Date) => {
        const dateKey = format(date, 'yyyy-MM-dd')
        const today = format(new Date(), 'yyyy-MM-dd')

        return habits.map(habit => ({
            ...habit,
            completed: dateKey === today ? habit.completedToday : (habit.history[dateKey] === true)
        }))
    }

    // Calculate heatmap color for a given date
    const getHeatmapColor = (date: Date) => {
        const dateHabits = getHabitsForDate(date)
        const completedCount = dateHabits.filter(h => h.completed).length

        if (habits.length === 0) return 'bg-gray-100 dark:bg-gray-800'
        if (completedCount === 0) return 'bg-gray-100 dark:bg-gray-800'

        // Calculate opacity percentage (20% to 100%)
        const opacity = Math.round((completedCount / habits.length) * 100)
        const opacityStep = Math.ceil(opacity / 20) * 20 // Round to nearest 20

        return `bg-[#0F5132]/${opacityStep}`
    }

    // Toggle habit for specific date
    const toggleHabitForDate = async (habitId: string, date: Date) => {
        const dateKey = format(date, 'yyyy-MM-dd')
        const today = format(new Date(), 'yyyy-MM-dd')

        const habit = habits.find(h => h.id === habitId)
        if (!habit) return

        // Check if currently completed for that date (local state logic)
        const isCurrentlyCompleted = habit.history[dateKey] === true

        const updatedHabits = habits.map(habit => {
            if (habit.id !== habitId) return habit

            const newHistory = { ...habit.history }

            if (isCurrentlyCompleted) {
                delete newHistory[dateKey]
            } else {
                newHistory[dateKey] = true
            }

            // If it's today, also update completedToday
            const newCompletedToday = dateKey === today ? !isCurrentlyCompleted : habit.completedToday

            return {
                ...habit,
                history: newHistory,
                completedToday: newCompletedToday
            }
        })

        setHabits(updatedHabits)

        // Sync with DB
        await dbService.toggleHabit(habitId, dateKey, isCurrentlyCompleted)
        refreshData()
    }

    // Get completed tasks for a specific date
    const getCompletedTasksForDate = (date: Date) => {
        const dateKey = format(date, 'yyyy-MM-dd')
        return tasks.filter(task => {
            if (task.status !== 'completed') return false
            const taskDate = new Date(task.dueDate)
            return format(taskDate, 'yyyy-MM-dd') === dateKey
        })
    }

    const isToday = (date: Date) => {
        return isSameDay(date, new Date())
    }

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-[95%] lg:w-[85%] mx-auto space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0F5132] to-[#4ade80] bg-clip-text text-transparent">Calendar</h2>
                        <p className="text-gray-500 dark:text-gray-400">Track your progress and rituals</p>
                    </div>
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                        <Button
                            variant={view === 'heatmap' ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setView('heatmap')}
                            className={cn("rounded-lg h-8 w-8 p-0", view === 'heatmap' && "bg-[#0F5132] hover:bg-[#0F5132]/90")}
                        >
                            <LayoutGrid size={16} />
                        </Button>
                        <Button
                            variant={view === 'rituals' ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setView('rituals')}
                            className={cn("rounded-lg h-8 w-8 p-0", view === 'rituals' && "bg-[#0F5132] hover:bg-[#0F5132]/90")}
                        >
                            <ListTodo size={16} />
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={goToPreviousMonth}
                        className="rounded-full h-10 w-10"
                    >
                        <ChevronLeft size={20} />
                    </Button>
                    <div className="text-xl font-bold text-gray-900 dark:text-white min-w-[160px] text-center">
                        {format(currentMonth, 'MMMM yyyy')}
                    </div>
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={goToNextMonth}
                        className="rounded-full h-10 w-10"
                    >
                        <ChevronRight size={20} />
                    </Button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {view === 'heatmap' ? (
                    <motion.div
                        key="heatmap"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="p-8 md:p-12 rounded-[2rem] border-none shadow-soft bg-white/40 dark:bg-[#1f2937]/40 backdrop-blur-[50px] transition-colors duration-300">
                            {/* Week days header */}
                            <div className="grid grid-cols-7 gap-2 md:gap-4 mb-6">
                                {weekDays.map(day => (
                                    <div key={day} className="text-center text-xs md:text-sm font-semibold text-gray-500 dark:text-gray-400 py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar grid */}
                            <div className="grid grid-cols-7 gap-2 md:gap-4">
                                {emptyCells.map(i => (
                                    <div key={`empty-${i}`} className="aspect-square" />
                                ))}

                                {daysInMonth.map(date => {
                                    const heatmapColor = getHeatmapColor(date)
                                    const isCurrentDay = isToday(date)
                                    const isCurrentMonth = isSameMonth(date, currentMonth)
                                    const dateHabits = getHabitsForDate(date)
                                    const completedHabits = dateHabits.filter(h => h.completed)
                                    const isHovered = hoveredDate && isSameDay(hoveredDate, date)

                                    return (
                                        <div key={date.toISOString()} className="relative">
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                onMouseEnter={() => setHoveredDate(date)}
                                                onMouseLeave={() => setHoveredDate(null)}
                                                onClick={() => setSelectedDate(date)}
                                                className={`
                                                    aspect-square rounded-lg md:rounded-xl p-1 md:p-2 flex flex-col justify-end items-end
                                                    ${heatmapColor}
                                                    ${isCurrentDay ? 'ring-2 ring-[#0F5132] dark:ring-[#4ade80]' : ''}
                                                    ${!isCurrentMonth ? 'opacity-30' : ''}
                                                    transition-all cursor-pointer
                                                    hover:shadow-lg
                                                `}
                                            >
                                                <div className={`text-xl md:text-4xl font-bold ${heatmapColor.includes('#0F5132')
                                                    ? 'bg-gradient-to-br from-white to-gray-200 bg-clip-text text-transparent'
                                                    : 'bg-gradient-to-br from-[#0F5132] to-[#4ade80] bg-clip-text text-transparent dark:from-[#4ade80] dark:to-[#0F5132]'
                                                    }`}>
                                                    {format(date, 'd')}
                                                </div>
                                            </motion.div>

                                            <AnimatePresence>
                                                {isHovered && habits.length > 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 10 }}
                                                        className="absolute z-50 top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-800 text-white rounded-lg p-3 shadow-xl border border-gray-700 min-w-[200px] pointer-events-none"
                                                    >
                                                        <div className="text-xs font-bold mb-2">{format(date, 'MMM d, yyyy')}</div>
                                                        <div className="space-y-1 text-xs">
                                                            <div className="text-[#4ade80]">✓ {completedHabits.length} completed</div>
                                                            {completedHabits.slice(0, 3).map(h => (
                                                                <div key={h.id} className="text-gray-300 truncate">• {h.title}</div>
                                                            ))}
                                                            {dateHabits.length - completedHabits.length > 0 && (
                                                                <div className="text-gray-500 mt-1">
                                                                    + {dateHabits.length - completedHabits.length} not completed
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Legend */}
                            <div className="mt-8 flex items-center justify-center gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Less</span>
                                <div className="flex gap-1">
                                    <div className="w-4 h-4 md:w-6 md:h-6 rounded bg-gray-100 dark:bg-gray-800" />
                                    <div className="w-4 h-4 md:w-6 md:h-6 rounded bg-[#0F5132]/20" />
                                    <div className="w-4 h-4 md:w-6 md:h-6 rounded bg-[#0F5132]/40" />
                                    <div className="w-4 h-4 md:w-6 md:h-6 rounded bg-[#0F5132]/60" />
                                    <div className="w-4 h-4 md:w-6 md:h-6 rounded bg-[#0F5132]/80" />
                                    <div className="w-4 h-4 md:w-6 md:h-6 rounded bg-[#0F5132]/100" />
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">More</span>
                            </div>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        key="rituals"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="rounded-[2rem] border-none shadow-soft bg-white/40 dark:bg-[#1f2937]/40 backdrop-blur-[50px] transition-colors duration-300 overflow-hidden">
                            <div className="overflow-auto max-h-[700px] scrollbar-hide">
                                <div className="min-w-max">
                                    {/* Header */}
                                    <div className="flex sticky top-0 z-20 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-b border-gray-200/30 dark:border-gray-700/50">
                                        <div className="w-[200px] p-4 font-bold text-gray-500 dark:text-gray-400 uppercase text-[10px] tracking-widest border-r border-gray-200/30 dark:border-gray-700/50 sticky left-0 bg-white/20 dark:bg-[#1f2937]/20 backdrop-blur-sm z-30">
                                            Daily Rituals
                                        </div>
                                        <div className="w-[60px] p-4 font-bold text-gray-500 dark:text-gray-400 uppercase text-[10px] tracking-widest text-center border-r border-gray-200/30 dark:border-gray-700/50 sticky left-[200px] bg-white/20 dark:bg-[#1f2937]/20 backdrop-blur-sm z-30">
                                            XP
                                        </div>
                                        <div className="flex">
                                            {daysInMonth.map(date => (
                                                <div key={date.toISOString()} className={cn(
                                                    "w-[40px] p-4 text-center text-xs font-bold transition-colors",
                                                    isToday(date) ? "text-[#4ade80]" : "text-gray-500 dark:text-gray-400"
                                                )}>
                                                    {format(date, 'd')}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Rows */}
                                    <div>
                                        {habits.map((habit, idx) => (
                                            <div key={habit.id} className={cn(
                                                "flex border-b border-gray-200/30 dark:border-gray-700/50 hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors group",
                                                idx === habits.length - 1 && "border-none"
                                            )}>
                                                <div className="w-[200px] p-4 font-semibold text-gray-900 dark:text-white truncate border-r border-gray-200/30 dark:border-gray-700/50 sticky left-0 bg-white/20 dark:bg-[#1f2937]/20 backdrop-blur-sm z-10 group-hover:bg-inherit transition-colors">
                                                    {habit.title}
                                                    <div className="text-[10px] font-normal text-gray-500">{habit.category}</div>
                                                </div>
                                                <div className="w-[60px] p-4 flex items-center justify-center font-mono text-xs text-gray-500 dark:text-gray-400 border-r border-gray-200/30 dark:border-gray-700/50 sticky left-[200px] bg-white/20 dark:bg-[#1f2937]/20 backdrop-blur-sm z-10 group-hover:bg-inherit transition-colors">
                                                    {habit.category.toLowerCase().includes('workout') ? '20' : '10'}
                                                </div>
                                                <div className="flex">
                                                    {daysInMonth.map(date => {
                                                        const dateKey = format(date, 'yyyy-MM-dd')
                                                        const today = format(new Date(), 'yyyy-MM-dd')
                                                        const isCompleted = dateKey === today ? habit.completedToday : (habit.history[dateKey] === true)

                                                        return (
                                                            <div key={date.toISOString()} className="w-[40px] p-2 flex items-center justify-center">
                                                                <button
                                                                    onClick={() => toggleHabitForDate(habit.id, date)}
                                                                    className={cn(
                                                                        "w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center",
                                                                        isCompleted
                                                                            ? "bg-[#0F5132] border-[#0F5132] text-white"
                                                                            : "border-gray-200 dark:border-gray-700 hover:border-[#4ade80]/50"
                                                                    )}
                                                                >
                                                                    {isCompleted && <Check size={14} />}
                                                                </button>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Summary Table */}
                        <Card className="rounded-[2rem] border-none shadow-soft bg-white/40 dark:bg-[#1f2937]/40 backdrop-blur-[50px] transition-colors duration-300 overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Overall Progress</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#0F5132]" />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Monthly Target Completion</span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ritual Name</th>
                                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Completed</th>
                                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Left</th>
                                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Progress %</th>
                                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Visual Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {habits.map(habit => {
                                            const monthKey = format(currentMonth, 'yyyy-MM')
                                            const completedCount = Object.entries(habit.history).filter(([date, status]) =>
                                                date.startsWith(monthKey) && status === true
                                            ).length + (habit.completedToday && format(new Date(), 'yyyy-MM') === monthKey ? 1 : 0)

                                            const target = habit.targetPerMonth || 30
                                            const left = Math.max(0, target - completedCount)
                                            const percentage = Math.min(100, Math.round((completedCount / target) * 100))

                                            return (
                                                <tr key={habit.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                    <td className="p-4">
                                                        <div className="font-semibold text-gray-900 dark:text-white text-sm">{habit.title}</div>
                                                        <div className="text-[10px] text-gray-500">{habit.category}</div>
                                                    </td>
                                                    <td className="p-4 text-center font-mono text-sm text-gray-600 dark:text-gray-300">
                                                        {completedCount}
                                                    </td>
                                                    <td className="p-4 text-center font-mono text-sm text-gray-600 dark:text-gray-300">
                                                        {left}
                                                    </td>
                                                    <td className="p-4 text-center font-mono text-sm font-bold text-[#0F5132] dark:text-[#4ade80]">
                                                        {percentage}%
                                                    </td>
                                                    <td className="p-4 w-1/3">
                                                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${percentage}%` }}
                                                                className="h-full bg-gradient-to-r from-[#0F5132] to-[#4ade80] rounded-full"
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Habits Modal */}
            <AnimatePresence>
                {selectedDate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedDate(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white/40 dark:bg-[#1f2937]/40 backdrop-blur-[50px] rounded-[2rem] p-8 max-w-md w-full shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {format(selectedDate, 'MMMM d, yyyy')}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Manage habits for this day
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedDate(null)}
                                    className="rounded-full"
                                >
                                    <X size={20} />
                                </Button>
                            </div>

                            <div className="space-y-4 max-h-[500px] overflow-y-auto">
                                {/* Habits Section */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Daily Rituals</h4>
                                    <div className="space-y-3">
                                        {habits.map(habit => {
                                            const dateHabits = getHabitsForDate(selectedDate)
                                            const habitData = dateHabits.find(h => h.id === habit.id)
                                            const isCompleted = habitData?.completed || false

                                            return (
                                                <motion.div
                                                    key={habit.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    onClick={() => toggleHabitForDate(habit.id, selectedDate)}
                                                    className={`
                                                        p-4 rounded-xl border-2 cursor-pointer transition-all
                                                        ${isCompleted
                                                            ? 'bg-[#0F5132]/10 border-[#0F5132] dark:bg-[#0F5132]/20'
                                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}
                                                    `}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`
                                                            w-6 h-6 rounded-full flex items-center justify-center
                                                            ${isCompleted ? 'bg-[#0F5132]' : 'bg-gray-200 dark:bg-gray-700'}
                                                        `}>
                                                            {isCompleted && <Check size={16} className="text-white" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className={`font-semibold ${isCompleted ? 'text-[#0F5132] dark:text-[#4ade80]' : 'text-gray-900 dark:text-white'}`}>
                                                                {habit.title}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {habit.category}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Completed Tasks Section */}
                                {(() => {
                                    const completedTasks = getCompletedTasksForDate(selectedDate)
                                    if (completedTasks.length === 0) return null

                                    return (
                                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Completed Tasks</h4>
                                            <div className="space-y-2">
                                                {completedTasks.map(task => (
                                                    <div
                                                        key={task.id}
                                                        className="p-3 rounded-lg bg-white/20 dark:bg-gray-800/20 border border-gray-200/30 dark:border-gray-700/50"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                                <Check size={12} className="text-blue-500" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="font-medium text-sm text-gray-900 dark:text-white line-through">
                                                                    {task.title}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {task.category}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })()}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
