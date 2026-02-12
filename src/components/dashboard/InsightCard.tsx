import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, Clock } from 'lucide-react';
import { geminiService } from '@/services/geminiService';
import { dbService } from '@/services/dbService';
import type { Task, Habit } from '@/types';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface InsightCardProps {
    apiKey: string;
    tasks: Task[];
    habits: Habit[];
}

export function InsightCard({ apiKey, tasks, habits }: InsightCardProps) {
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter for Reminders Logic (Embedded)
    const upcomingTasks = tasks
        .filter(t => t.status === 'pending' && t.dueDate)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 3); // Show top 3

    const generateNewInsight = async () => {
        setLoading(true);
        setError(null);
        try {
            // Use props data instead of fetching again where possible, 
            // but for "fresh" insight maybe fetch profile user name
            const profile = await dbService.getProfile();
            const userName = profile?.username || 'User';

            const insightText = await geminiService.generateInsight(apiKey, tasks, habits, userName);

            setInsight(insightText);
            sessionStorage.setItem('cached_insight', insightText);
            sessionStorage.setItem('cached_insight_date', new Date().toDateString());
        } catch (err) {
            console.error(err);
            setError("Couldn't gaze into the future right now.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const cached = sessionStorage.getItem('cached_insight');
        const cachedDate = sessionStorage.getItem('cached_insight_date');
        const today = new Date().toDateString();

        if (cached && cachedDate === today) {
            setInsight(cached);
        } else {
            generateNewInsight();
        }
    }, [apiKey]); // Depend on apiKey change to re-trigger if needed, but mainly on mount

    return (
        <Card className="p-6 rounded-[2rem] border-none shadow-soft bg-white/40 dark:bg-[#1f2937]/40 backdrop-blur-[50px] relative overflow-hidden group flex flex-col h-full transition-colors duration-300">

            {/* Top Section: AI Insight */}
            <div className="mb-6 relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-[#0F5132] dark:text-[#4ade80]" size={18} />
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">
                            Daily Insight
                        </h3>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={generateNewInsight}
                        disabled={loading}
                        className="rounded-full h-8 w-8 hover:bg-black/5 dark:hover:bg-white/10 -mt-1 -mr-2"
                        title="Regenerate Insight"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : "text-gray-500"} />
                    </Button>
                </div>

                <div className="min-h-[60px] flex items-center">
                    {loading && !insight ? (
                        <div className="animate-pulse flex space-x-4 w-full">
                            <div className="flex-1 space-y-2 py-1">
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed italic border-l-2 border-[#0F5132]/30 dark:border-[#4ade80]/30 pl-3">
                            "{insight || error || "Initializing..."}"
                        </p>
                    )}
                </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200 dark:bg-gray-700/50 mb-4 w-full" />

            {/* Bottom Section: Embedded Reminders */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center gap-2 mb-3">
                    <BellIcon className="text-amber-500" size={16} />
                    <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">
                        Upcoming
                    </h3>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                    {upcomingTasks.length === 0 ? (
                        <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-xs">
                            No upcoming deadlines. Clear skies ahead! ☀️
                        </div>
                    ) : (
                        <AnimatePresence>
                            {upcomingTasks.map(task => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/50 dark:bg-gray-800/30 hover:bg-white/80 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700 group/task"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${task.priority ? 'bg-red-500 shadow-sm shadow-red-500/20' : 'bg-blue-500'
                                            }`} />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover/task:text-[#0F5132] dark:group-hover/task:text-[#4ade80] transition-colors">
                                                {task.title}
                                            </p>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
                                                <span className={`flex items-center gap-1 ${task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate))
                                                    ? 'text-red-500 font-bold'
                                                    : ''
                                                    }`}>
                                                    <Clock size={10} />
                                                    {formatDueDate(task.dueDate)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* Attribution */}
            <div className="absolute bottom-2 right-3 opacity-0 group-hover:opacity-50 transition-opacity">
                <span className="text-[9px] text-gray-400 dark:text-gray-600">
                    Gemini 3 Flash
                </span>
            </div>
        </Card>
    );
}

// Helper icon
function BellIcon({ className, size }: { className?: string, size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
    )
}

function formatDueDate(date: string | Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return format(d, 'MMM d');
}
