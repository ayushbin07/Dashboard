import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
    LayoutGrid,
    Box,
    Calendar as CalendarIcon,
    FileText,
    Zap,
    Clock,
    CheckCircle2,
    MessageCircle,
    X
} from "lucide-react"
import { APP_VERSION } from '@/version'
import { FeedbackMarquee } from '@/components/FeedbackMarquee'
import { dbService } from '@/services/dbService'

export default function Help() {
    const [feedbackItems, setFeedbackItems] = useState<any[]>([])
    const [showModal, setShowModal] = useState(false)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        loadFeedback()
    }, [])

    const loadFeedback = async () => {
        try {
            const data = await dbService.getFeedback()
            setFeedbackItems(data)
        } catch (err) {
            console.error('Error loading feedback:', err)
        }
    }

    const handleSubmit = async () => {
        if (!comment.trim()) {
            setError('Please enter a comment')
            return
        }

        if (comment.length > 500) {
            setError('Comment must be 500 characters or less')
            return
        }

        setSubmitting(true)
        setError('')

        try {
            await dbService.addFeedback(comment)
            setComment('')
            setShowModal(false)
            await loadFeedback()
        } catch (err: any) {
            setError(err.message || 'Failed to submit feedback')
        } finally {
            setSubmitting(false)
        }
    }

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
            color: "text-[#0F5132] dark:text-[#4ade80] dark:drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]",
            bg: "bg-[#0F5132]/10 dark:bg-[#4ade80]/10",
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
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0F5132] to-[#4ade80] dark:from-[#4ade80] dark:to-[#0F5132] bg-clip-text text-transparent dark:drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]">
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
                    <Card key={idx} className="p-6 rounded-[2rem] border-none shadow-soft bg-white/40 dark:bg-[#1f2937]/40 backdrop-blur-[50px] hover:shadow-xl transition-all group">
                        <div className={`w-12 h-12 ${section.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <section.icon className={`w-6 h-6 ${section.color}`} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{section.title}</h3>
                        <ul className="space-y-3">
                            {section.instructions.map((inst, i) => (
                                <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0F5132] dark:bg-[#4ade80] dark:shadow-[0_0_5px_rgba(74,222,128,0.8)] flex-shrink-0" />
                                    {inst}
                                </li>
                            ))}
                        </ul>
                    </Card>
                ))}

                {/* User Feedback Card */}
                <Card className="p-6 rounded-[2rem] border-none shadow-soft bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 hover:shadow-xl transition-all group col-span-1 md:col-span-2 lg:col-span-1">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <MessageCircle className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">User Feedback</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        See what other users are saying!
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <MessageCircle size={16} />
                        Add Comment
                    </button>
                </Card>
            </div>

            {/* Feedback  Marquee Display */}
            {feedbackItems.length > 0 && (
                <Card className="p-8 rounded-[2rem] border-none shadow-soft bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-emerald-500" />
                        Recent Feedback
                    </h4>
                    <FeedbackMarquee
                        feedbackItems={feedbackItems}
                        onAddFeedback={() => setShowModal(true)}
                    />
                </Card>
            )}


            {/* Coming Soon Section */}
            <Card className="p-8 rounded-[3rem] border-none shadow-soft bg-gradient-to-br from-[#0F5132] to-[#0a3d24] dark:from-[#4ade80]/20 dark:to-[#0F5132]/40 dark:border dark:border-[#4ade80]/30 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-20 h-20 bg-white/10 dark:bg-[#4ade80]/20 rounded-[2rem] flex items-center justify-center shrink-0">
                        <Zap className="w-10 h-10 text-emerald-400 dark:text-[#4ade80] dark:drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
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
                        <span className="font-bold text-[#0F5132] dark:text-[#4ade80] dark:drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]">Theme:</span> Use the Settings page to toggle between Light and Dark mode. Dark mode is optimized for "Deep Work" focus.
                    </div>
                    <div className="text-sm">
                        <span className="font-bold text-[#0F5132] dark:text-[#4ade80] dark:drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]">Persistence:</span> Your data is securely synced to the cloud ☁️. You can access your dashboard from any device by logging in.
                    </div>
                    <div className="text-sm">
                        <span className="font-bold text-[#0F5132] dark:text-[#4ade80] dark:drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]">Shortcuts:</span> Navigation is built for speed. Use the Sidebar for quick context switching between planning (Notes) and doing (Tasks).
                    </div>
                </div>
            </div>



            {/* Comment Submission Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            className="bg-white/40 dark:bg-[#1f2937]/40 backdrop-blur-[50px] rounded-[2rem] p-8 max-w-lg w-full shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Share Your Thoughts</h3>
                                <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="rounded-full">
                                    <X size={20} />
                                </Button>
                            </div>

                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Your feedback helps us improve! Share what you love or what we can do better.
                            </p>

                            <Textarea
                                value={comment}
                                onChange={(e) => {
                                    setComment(e.target.value)
                                    setError('')
                                }}
                                placeholder="Type your comment here... (max 500 characters)"
                                className="mb-4 min-h-[120px] bg-white/20 dark:bg-gray-800/20 dark:text-white dark:border-gray-700/50"
                                maxLength={500}
                            />

                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {comment.length}/500 characters
                                </span>
                            </div>

                            {error && (
                                <p className="text-sm text-red-500 mb-4">{error}</p>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={handleSubmit}
                                    disabled={submitting || !comment.trim()}
                                >
                                    {submitting ? 'Submitting...' : 'Submit'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
