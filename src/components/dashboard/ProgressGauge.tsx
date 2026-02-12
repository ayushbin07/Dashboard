import { Card } from "@/components/ui/card"
import type { Habit } from "@/types"

export function ProgressGauge({ habits }: { habits: Habit[] }) {
    const total = habits.length
    const completed = habits.filter(h => h.completedToday).length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    // Calculate circumference for SVG stroke (r=80) -> 2*pi*r ≈ 502
    // We want a semi-circle, so we only use half the circumference for the full gauge range.
    // Actually, css rotation trick is easier for the "half gauge" look.

    return (
        <Card className="h-full bg-white/40 dark:bg-[#1f2937]/40 backdrop-blur-[50px] rounded-[2rem] p-6 shadow-soft flex flex-col items-center justify-center relative overflow-visible">
            <h3 className="text-lg font-bold text-gray-900 absolute top-6 left-6">Daily Progress</h3>

            {/* CSS Only Semi Circle Gauge */}
            <div className="relative w-40 h-20 overflow-hidden mt-6">
                {/* Background Arc */}
                <div className="w-40 h-40 rounded-full border-[16px] border-gray-100 absolute top-0 left-0" />

                {/* Progress Arc */}
                {/* 
                    Rotation logic: 
                    -45deg (start) to 135deg (end) for a 180 degree gauge? 
                    Actually standard css border gauge usually goes from -135deg to 45deg.
                    Let's stick to the previous border-based mask approach but dynamic.
                 */}
                <svg viewBox="0 0 100 50" className="w-full h-full">
                    {/* Background Path */}
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f3f4f6" strokeWidth="12" strokeLinecap="round" />
                    {/* Foreground Path */}
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="#0F5132"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray="126" // Approx length of arc
                        strokeDashoffset={126 - (126 * percentage) / 100}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
            </div>

            <div className="text-center mt-[-5px]">
                <div className="text-4xl font-bold text-[#0F5132]">{percentage}%</div>
                <div className="text-xs text-gray-400">Goals Reached</div>
            </div>

            <div className="flex gap-4 mt-6 text-xs font-medium">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#0F5132]" />Done ({completed})</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-200" />TBD ({total - completed})</div>
            </div>
        </Card>
    )
}
