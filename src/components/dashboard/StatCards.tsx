import { Card } from "@/components/ui/card"
import { ArrowUpRight } from "lucide-react"
import type { Habit } from "@/types"

export function StatCards({ habits }: { habits: Habit[] }) {
    const totalHabits = habits.length
    const completedToday = habits.filter(h => h.completedToday).length
    const pendingToday = totalHabits - completedToday

    return (
        <>
            {/* Card 1: Total Projects (Green) - Stays Green */}
            <Card className="p-4 rounded-[2rem] border-none shadow-soft bg-[#0F5132] text-white relative overflow-hidden aspect-square flex flex-col justify-between group h-full w-full">
                <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-white/80">Total Habits</h3>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors cursor-pointer">
                        <ArrowUpRight size={16} className="text-white" />
                    </div>
                </div>
                <div>
                    <div className="text-4xl font-bold mb-1">{totalHabits}</div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded text-white border border-white/10 uppercase tracking-wide">
                            ACTIVE
                        </span>
                    </div>
                </div>
                {/* Decor */}
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            </Card>

            {/* Card 2: Completed */}
            <Card className="p-4 rounded-[2rem] border-none shadow-soft bg-white dark:bg-[#1f2937] dark:border-gray-800 aspect-square flex flex-col justify-between group h-full w-full transition-colors duration-300">
                <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Completed</h3>
                    <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors cursor-pointer">
                        <ArrowUpRight size={16} className="text-gray-400 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                    </div>
                </div>
                <div>
                    <div className="text-4xl font-bold mb-1 text-gray-900 dark:text-white">{completedToday}</div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">Today's Focus</span>
                    </div>
                </div>
            </Card>

            {/* Card 3: Pending */}
            <Card className="p-4 rounded-[2rem] border-none shadow-soft bg-white dark:bg-[#1f2937] dark:border-gray-800 aspect-square flex flex-col justify-between group h-full w-full transition-colors duration-300">
                <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Pending</h3>
                    <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors cursor-pointer">
                        <ArrowUpRight size={16} className="text-gray-400 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                    </div>
                </div>
                <div>
                    <div className="text-4xl font-bold mb-1 text-gray-900 dark:text-white">{pendingToday}</div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded uppercase tracking-wide">
                            REMAINING
                        </span>
                    </div>
                </div>
            </Card>

            {/* Card 4: Daily Progress */}
            <Card className="p-4 rounded-[2rem] border-none shadow-soft bg-white dark:bg-[#1f2937] dark:border-gray-800 aspect-square flex flex-col justify-between group relative overflow-hidden h-full w-full transition-colors duration-300">
                <div className="flex justify-between items-start z-10">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Daily Progress</h3>
                    <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors cursor-pointer">
                        <ArrowUpRight size={16} className="text-gray-400 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                    </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center pt-6">
                    {/* Semi-Circle Gauge */}
                    <div className="relative w-32 h-16 overflow-hidden">
                        <svg viewBox="0 0 100 50" className="w-full h-full">
                            {/* Background Path */}
                            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f3f4f6" className="dark:stroke-gray-700" strokeWidth="8" strokeLinecap="round" />
                            {/* Foreground Path */}
                            <path
                                d="M 10 50 A 40 40 0 0 1 90 50"
                                fill="none"
                                stroke="#0F5132"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray="126"
                                strokeDashoffset={126 - (126 * (habits.length > 0 ? (habits.filter(h => h.completedToday).length / habits.length) * 100 : 0)) / 100}
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute bottom-0 left-0 right-0 text-center mb-[-2px]">
                            <span className="text-2xl font-bold text-[#0F5132] dark:text-[#4ade80]">
                                {habits.length > 0 ? Math.round((habits.filter(h => h.completedToday).length / habits.length) * 100) : 0}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 justify-center mt-12">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">Goals Reached</span>
                    </div>
                </div>
            </Card>
        </>
    )
}
