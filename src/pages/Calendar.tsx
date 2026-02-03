import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, Check } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay, isSameMonth } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { localService } from '@/services/localService'
import type { Habit } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

export default function Calendar() {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [habits, setHabits] = useState<Habit[]>([])
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [hoveredDate, setHoveredDate] = useState<Date | null>(null)

    useEffect(() => {
        setHabits(localService.getHabits())
    }, [])

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
        const today = new Date().toISOString().split('T')[0]

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
    const toggleHabitForDate = (habitId: string, date: Date) => {
        const dateKey = format(date, 'yyyy-MM-dd')
        const today = new Date().toISOString().split('T')[0]

        const updatedHabits = habits.map(habit => {
            if (habit.id !== habitId) return habit

            const newHistory = { ...habit.history }
            const isCurrentlyCompleted = newHistory[dateKey] === true

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
        localService.saveHabits(updatedHabits)
    }

    const isToday = (date: Date) => {
        return isSameDay(date, new Date())
    }

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-[80%] mx-auto space-y-6"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0F5132] to-[#4ade80] bg-clip-text text-transparent">Calendar</h2>
                    <p className="text-gray-500 dark:text-gray-400">Track your habit completion heatmap</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={goToPreviousMonth}
                        className="rounded-full"
                    >
                        <ChevronLeft size={20} />
                    </Button>
                    <div className="text-xl font-bold text-gray-900 dark:text-white min-w-[200px] text-center">
                        {format(currentMonth, 'MMMM yyyy')}
                    </div>
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={goToNextMonth}
                        className="rounded-full"
                    >
                        <ChevronRight size={20} />
                    </Button>
                </div>
            </div>

            {/* Calendar Card */}
            <Card className="p-12 rounded-[2rem] border-none shadow-soft bg-white dark:bg-[#1f2937] transition-colors duration-300">
                {/* Week days header */}
                <div className="grid grid-cols-7 gap-4 mb-6">
                    {weekDays.map(day => (
                        <div key={day} className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-4">
                    {/* Empty cells before month starts */}
                    {emptyCells.map(i => (
                        <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {/* Actual days */}
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
                                        aspect-square rounded-xl p-2 flex flex-col justify-end items-end
                                        ${heatmapColor}
                                        ${isCurrentDay ? 'ring-2 ring-[#0F5132] dark:ring-[#4ade80]' : ''}
                                        ${!isCurrentMonth ? 'opacity-30' : ''}
                                        transition-all cursor-pointer
                                        hover:shadow-lg
                                    `}
                                >
                                    <div className={`text-4xl font-bold ${heatmapColor.includes('#0F5132')
                                        ? 'bg-gradient-to-br from-white to-gray-200 bg-clip-text text-transparent'
                                        : 'bg-gradient-to-br from-[#0F5132] to-[#4ade80] bg-clip-text text-transparent dark:from-[#4ade80] dark:to-[#0F5132]'
                                        }`}>
                                        {format(date, 'd')}
                                    </div>
                                </motion.div>

                                {/* Hover Tooltip */}
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
                        <div className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-800" />
                        <div className="w-6 h-6 rounded bg-[#0F5132]/20" />
                        <div className="w-6 h-6 rounded bg-[#0F5132]/40" />
                        <div className="w-6 h-6 rounded bg-[#0F5132]/60" />
                        <div className="w-6 h-6 rounded bg-[#0F5132]/80" />
                        <div className="w-6 h-6 rounded bg-[#0F5132]/100" />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">More</span>
                </div>
            </Card>

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
                            className="bg-white dark:bg-[#1f2937] rounded-[2rem] p-8 max-w-md w-full shadow-2xl"
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

                            <div className="space-y-3 max-h-[400px] overflow-y-auto">
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
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
