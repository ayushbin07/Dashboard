import { useEffect, useState } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, CartesianGrid, ReferenceLine, Legend } from "recharts"
import { Card } from "@/components/ui/card"
import type { Habit } from '@/types'
import { format, subDays, isMonday } from 'date-fns'

interface GraphData {
    date: string
    isoDate: string
    overall: number
    [key: string]: any
}

export function AnalyticsGraph({ habits }: { habits: Habit[] }) {
    const [data, setData] = useState<GraphData[]>([])
    const [weekDividers, setWeekDividers] = useState<string[]>([])

    useEffect(() => {
        const historyData: GraphData[] = []
        const dividers: string[] = []

        // Show last 30 Days
        for (let i = 29; i >= 0; i--) {
            const d = subDays(new Date(), i)
            const dateKey = format(d, 'yyyy-MM-dd')
            const displayDate = format(d, 'd MMM')

            if (isMonday(d)) {
                dividers.push(displayDate)
            }

            const dayPoint: GraphData = {
                date: displayDate,
                isoDate: dateKey,
                overall: 0
            }

            let totalCompleted = 0

            // Populate individual habit data points
            habits.forEach(h => {
                let isDone = h.history[dateKey]
                // Use live status for today
                if (i === 0) isDone = h.completedToday

                dayPoint[h.id] = isDone ? 100 : 0
                if (isDone) totalCompleted++
            })

            // Calculate Overall
            if (habits.length > 0) {
                dayPoint.overall = Math.round((totalCompleted / habits.length) * 100)
            }

            historyData.push(dayPoint)
        }
        setData(historyData)
        setWeekDividers(dividers)
    }, [habits])

    return (
        <Card className="p-6 h-[400px] flex flex-col justify-between">
            <div className="mb-4">
                <h3 className="text-lg font-semibold">Habit Consistency</h3>
                <p className="text-sm text-gray-500">
                    Individual Performance & Overall Average (Last 30 Days)
                </p>
            </div>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />

                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 10 }}
                            interval={4}
                            dy={10}
                        />

                        {/* Weekly Dividers */}
                        {weekDividers.map(date => (
                            <ReferenceLine key={date} x={date} stroke="#e5e7eb" strokeDasharray="3 3" />
                        ))}

                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: any, name: any) => {
                                if (name === 'Average') return [`${value}%`, name]
                                // Find habit name by ID? Recharts passes ID as name if dataKey is ID
                                const h = habits.find(habit => habit.id === name)
                                return [value === 100 ? 'Done' : 'Missed', h ? h.title : name]
                            }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />

                        {/* Overall Average Line */}
                        <Line
                            type="monotone"
                            dataKey="overall"
                            name="Average"
                            stroke="#94a3b8"
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            dot={false}
                            zIndex={10}
                        />

                        {/* Individual Habit Lines */}
                        {habits.map(habit => (
                            <Line
                                key={habit.id}
                                type="monotone"
                                dataKey={habit.id}
                                name={habit.id}
                                stroke={habit.color || '#8B5CF6'}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                                opacity={0.8}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    )
}
