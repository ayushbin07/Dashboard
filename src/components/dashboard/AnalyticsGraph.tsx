import { useEffect, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip, Cell } from "recharts"
import { Card } from "@/components/ui/card"
import type { Habit } from '@/types'
import { format, subDays } from 'date-fns'

interface GraphData {
    day: string
    active: number
    total: number
    percentage: number
}

export function AnalyticsGraph({ habits }: { habits: Habit[] }) {
    const [data, setData] = useState<GraphData[]>([])

    useEffect(() => {
        const historyData: GraphData[] = []

        // Show last 7 Days (S M T W T F S style)
        for (let i = 6; i >= 0; i--) {
            const d = subDays(new Date(), i)
            const dateKey = format(d, 'yyyy-MM-dd')
            // Day letter
            const dayLetter = format(d, 'EEEEE') // Single letter (S, M, T...)

            let completedCount = 0
            habits.forEach(h => {
                let isDone = h.history[dateKey]
                if (i === 0) isDone = h.completedToday
                if (isDone) completedCount++
            })

            const percentage = habits.length > 0 ? (completedCount / habits.length) * 100 : 0

            historyData.push({
                day: dayLetter,
                active: completedCount,
                total: habits.length,
                percentage
            })
        }
        setData(historyData)
    }, [habits])

    return (
        <Card className="p-8 h-full flex flex-col justify-between rounded-[2rem] border-none shadow-soft bg-white dark:bg-[#1f2937] transition-colors duration-300">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Habit Analytics</h3>
                <div className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-lg">Last 7 Days</div>
            </div>

            <div className="flex-1 w-full min-h-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barSize={40}>
                        <defs>
                            <pattern id="stripe-pattern" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
                                <rect width="2" height="4" fill="#9CA3AF" fillOpacity="0.3" />
                            </pattern>
                        </defs>
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                            dy={10}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-gray-900 text-white text-xs py-1 px-2 rounded-lg shadow-xl">
                                            {`${Math.round(payload[0].value as number)}% Completed`}
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Bar
                            dataKey="percentage"
                            radius={[20, 20, 20, 20]} // Fully rounded
                        >
                            {
                                data.map((_entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={index % 2 === 0 ? "url(#stripe-pattern)" : "#0F5132"}
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
