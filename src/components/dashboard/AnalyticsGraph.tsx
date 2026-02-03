import { useEffect, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { Card } from "@/components/ui/card"
import type { Habit } from '@/types'
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'

interface GraphData {
    day: number
    date: string
    completed: number
    total: number
}

export function AnalyticsGraph({ habits }: { habits: Habit[] }) {
    const [data, setData] = useState<GraphData[]>([])
    const [monthName, setMonthName] = useState('')
    const [maxPoints, setMaxPoints] = useState(0)

    useEffect(() => {
        const now = new Date()
        const monthStart = startOfMonth(now)
        const monthEnd = endOfMonth(now)

        // Get all days in current month
        const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

        // Set month name for display
        setMonthName(format(now, 'MMMM yyyy'))

        // Get today's date in same format as localService uses (UTC)
        const today = new Date().toISOString().split('T')[0]

        const historyData: GraphData[] = daysInMonth.map((date) => {
            // Use UTC date format to match localService
            const dateKey = format(date, 'yyyy-MM-dd')
            const dayNumber = parseInt(format(date, 'd'))

            let completedCount = 0

            habits.forEach(habit => {
                // For today, use completedToday flag as source of truth
                if (dateKey === today) {
                    if (habit.completedToday) {
                        completedCount++
                    }
                } else {
                    // For past days, check history
                    if (habit.history[dateKey] === true) {
                        completedCount++
                    }
                }
            })

            return {
                day: dayNumber,
                date: dateKey,
                completed: completedCount,
                total: habits.length,
            }
        })

        setData(historyData)
        setMaxPoints(habits.length)
    }, [habits])

    return (
        <Card className="p-8 h-full flex flex-col justify-between rounded-[2rem] border-none shadow-soft bg-white dark:bg-[#1f2937] transition-colors duration-300">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Habit Analytics</h3>
                <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs px-3 py-1.5 rounded-lg font-medium">
                    {monthName}
                </div>
            </div>

            <div className="flex-1 w-full min-h-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barSize={12}>
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#0F5132" stopOpacity={0.9} />
                                <stop offset="100%" stopColor="#0F5132" stopOpacity={0.6} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }}
                            interval="preserveStartEnd"
                            dy={10}
                            tickFormatter={(value) => {
                                // Show day 1, and every 5th day
                                if (value === 1 || value % 5 === 0) return value.toString()
                                return ''
                            }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 10 }}
                            domain={[0, maxPoints]}
                            allowDecimals={false}
                            width={30}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload as GraphData
                                    return (
                                        <div className="bg-gray-900 dark:bg-gray-800 text-white text-xs py-2 px-3 rounded-lg shadow-xl border border-gray-700">
                                            <div className="font-bold mb-1">Day {data.day}</div>
                                            <div className="text-[#4ade80] text-lg font-bold">{data.completed} points</div>
                                            <div className="text-gray-400 text-[10px]">out of {data.total} max</div>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Bar
                            dataKey="completed"
                            radius={[6, 6, 0, 0]}
                        >
                            {
                                data.map((entry, index) => (
                                    <Cell
                                        key={`cell - ${index} `}
                                        fill={entry.completed > 0 ? "url(#barGradient)" : "#E5E7EB"}
                                        className={entry.completed === 0 ? "dark:fill-gray-700" : ""}
                                    />
                                ))
                            }
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    )
}
