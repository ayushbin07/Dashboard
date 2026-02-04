import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import {
    LayoutGrid,
    Box,
    Calendar as CalendarIcon,
    FileText,
    Zap,
    Clock,
    CheckCircle2
} from "lucide-react"
import { APP_VERSION } from '@/version'

export default function Help() {
    const sections = [
        {
            title: "Dashboard",
            icon: LayoutGrid,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/20",
            instructions: [
                "View your high-level progress through Stat Cards. Click them to jump to detailed views.",
                "Use the Focus Timer to implement Pomodoro sessions (25/5/15 mins).",
                "Quickly toggle Daily Rituals as you complete them.",
                "Track upcoming deadlines in the Reminders section."
            ]
        },
        {
            title: "Tasks & Execution",
            icon: Box,
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
            instructions: [
                "Navigate to the Tasks page to see your full 'Execution List'.",
                "Tasks are separated into Pending and Completed for better focus.",
                "Click a task to toggle its status or view specific details.",
                "Manage your 'Daily Rituals' (habits) with visual streak tracking."
            ]
        },
        {
            title: "Habit Calendar",
            icon: CalendarIcon,
            color: "text-[#0F5132]",
            bg: "bg-[#0F5132]/10 dark:bg-[#0F5132]/20",
            instructions: [
                "The Heatmap visualization shows your consistency over the month.",
                "Darker green indicates higher completion rates for that specific day.",
                "Hover over any date to see exactly which habits were completed.",
                "Click a date to edit its history—perfect for back-logging habits you missed recording."
            ]
        },
        {
            title: "Notes & Documentation",
            icon: FileText,
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-900/20",
            instructions: [
                "Create and organize notes with intuitive drag-and-drop functionality.",
                "Double-click any note title to rename it instantly.",
                "Review your changes in the visual Markdown preview pane.",
                "All notes are securely synced to the cloud via Supabase."
            ]
        },
        {
            title: "🔥 Streak System",
            icon: Zap,
            color: "text-orange-500",
            bg: "bg-orange-50 dark:bg-orange-900/20",
            instructions: [
                "Build daily login streaks by visiting the dashboard consistently.",
                "The fire icon next to your profile shrinks when you miss days (2-day grace period).",
                "Streak resets after 3 consecutive missed days—but you'll start fresh at 1!",
                "Keep the fire alive to stay motivated and build productive habits."
            ]
        }
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-[90%] mx-auto space-y-8 pb-20"
        >
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0F5132] to-[#4ade80] bg-clip-text text-transparent">
                        How to use Dashboard
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">Complete guide to mastering your productivity ritual</p>
                </div>
                <div className="text-xs font-mono text-gray-400 border border-gray-200 dark:border-gray-700 px-2 py-1 rounded">
                    {APP_VERSION}
                </div>
            </div>

            {/* Quick Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sections.map((section, idx) => (
                    <Card key={idx} className="p-6 rounded-[2rem] border-none shadow-soft bg-white dark:bg-[#1f2937] hover:shadow-xl transition-all group">
                        <div className={`w-12 h-12 ${section.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <section.icon className={`w-6 h-6 ${section.color}`} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{section.title}</h3>
                        <ul className="space-y-3">
                            {section.instructions.map((inst, i) => (
                                <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0F5132] flex-shrink-0" />
                                    {inst}
                                </li>
                            ))}
                        </ul>
                    </Card>
                ))}
            </div>

            {/* Coming Soon Section */}
            <Card className="p-8 rounded-[3rem] border-none shadow-soft bg-gradient-to-br from-[#0F5132] to-[#0a3d24] text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center shrink-0">
                        <Zap className="w-10 h-10 text-emerald-400" />
                    </div>
                    <div>
                        <div className="inline-block px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs font-bold mb-3 uppercase tracking-widest text-emerald-400">
                            Roadmap Update
                        </div>
                        <h3 className="text-3xl font-bold mb-2">Google Calendar Integration</h3>
                        <p className="text-white/70 max-w-xl">
                            We are working on bringing your external schedule directly into the dashboard.
                            Soon, you'll be able to sync your Google Calendar events with your daily rituals
                            and execution list automatically.
                        </p>
                        <div className="mt-6 flex items-center gap-2 font-bold text-emerald-400">
                            <Clock size={16} />
                            <span>Coming Soon</span>
                        </div>
                    </div>
                </div>
                {/* Background Decor */}
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-10 right-10 flex gap-2">
                    <CheckCircle2 className="text-white/10 w-24 h-24" />
                </div>
            </Card>

            {/* General Tips */}
            <div className="bg-gray-100 dark:bg-gray-800/50 p-8 rounded-[2rem]">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Pro Tips</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-sm">
                        <span className="font-bold text-[#0F5132]">Theme:</span> Use the Settings page to toggle between Light and Dark mode. Dark mode is optimized for "Deep Work" focus.
                    </div>
                    <div className="text-sm">
                        <span className="font-bold text-[#0F5132]">Persistence:</span> Your data is securely synced to the cloud ☁️. You can access your dashboard from any device by logging in.
                    </div>
                    <div className="text-sm">
                        <span className="font-bold text-[#0F5132]">Shortcuts:</span> Navigation is built for speed. Use the Sidebar for quick context switching between planning (Notes) and doing (Tasks).
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
