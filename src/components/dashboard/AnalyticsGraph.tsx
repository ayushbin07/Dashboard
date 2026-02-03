import { useEffect, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, CartesianGrid } from "recharts"
import { Card } from "@/components/ui/card"
import { localService } from '@/services/localService'
import { format, subDays } from 'date-fns'

interface GraphData {
    date: string
    score: number
}

export function AnalyticsGraph() {
    const [data, setData] = useState<GraphData[]>([])

    useEffect(() => {
        // Calculate Habit Consistency Score for last 7 days
        const habits = localService.getHabits()
        const historyData = []

        for (let i = 6; i >= 0; i--) {
            const d = subDays(new Date(), i)
            const dateKey = format(d, 'yyyy-MM-dd')
            const displayDate = format(d, 'EEE') // Mon, Tue...

            if (habits.length === 0) {
                historyData.push({ date: displayDate, score: 0 })
                continue
            }

            // Count how many habits were done on this date
            const completedCount = habits.reduce((acc, h) => {
                return acc + (h.history[dateKey] ? 1 : 0)
            }, 0)

            // Score = (Completed / Total) * 100
            const score = Math.round((completedCount / habits.length) * 100)
            historyData.push({ date: displayDate, score })
        }
        setData(historyData)
    }, [])

    return (
        <Card className="p-6 h-[400px] flex flex-col justify-between">
            <div className="mb-4">
                <h3 className="text-lg font-semibold">Habit Consistency</h3>
                <p className="text-sm text-gray-500">Daily completion rate (Last 7 Days)</p>
            </div>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            dy={10}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{ stroke: '#8B5CF6', strokeWidth: 1, strokeDasharray: '4 4' }}
                            formatter={(value: any) => [`${value}%`, 'Completion']}
                        />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#8B5CF6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorScore)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    )
}
