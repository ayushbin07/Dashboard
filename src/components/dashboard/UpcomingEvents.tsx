import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Clock, Briefcase, ChevronRight } from 'lucide-react';
import type { Task } from '@/types';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface UpcomingEventsProps {
    tasks: Task[];
}

export function UpcomingEvents({ tasks }: UpcomingEventsProps) {
    const upcomingTasks = tasks
        .filter(t => t.status === 'pending' && t.dueDate)
        .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

    return (
        <Card className="p-5 rounded-[2rem] border-none shadow-soft bg-white/40 dark:bg-[#1f2937]/40 backdrop-blur-[50px] flex flex-col h-[220px]">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-[#0F5132] dark:text-[#4ade80] dark:drop-shadow-[0_0_8px_rgba(74,222,128,0.6)] dark:text-[#4ade80]" />
                    Upcoming
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                {upcomingTasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                        No upcoming deadlines.
                    </div>
                ) : (
                    <AnimatePresence>
                        {upcomingTasks.map(task => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="group flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-gray-800/30 hover:bg-white/80 dark:hover:bg-gray-800/50 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {task.title}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        <Clock size={10} />
                                        <span className={task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) ? 'text-red-500 font-bold' : ''}>
                                            {formatDueDate(task.dueDate)}
                                        </span>
                                        {task.priority && (
                                            <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1 rounded">High</span>
                                        )}
                                    </div>
                                </div>
                                {/* Status Ring */}
                                <div className={`w-2 h-2 rounded-full ${task.priority ? 'bg-red-500' : 'bg-blue-500'}`} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </Card>
    );
}

function formatDueDate(date: string | Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return format(d, 'MMM d, h:mm a');
}
