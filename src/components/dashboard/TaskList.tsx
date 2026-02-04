import { useState } from 'react'
import { format } from 'date-fns'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task } from "@/types"

interface TaskListProps {
    tasks: Task[]
    onToggle: (id: string) => void
    onAdd: (task: any) => void
    onUpdate?: (task: Task) => void
}

export function TaskList({ tasks, onToggle, onAdd, onUpdate }: TaskListProps) {
    const [filter, setFilter] = useState<'all' | 'priority' | 'normal'>('all')

    // Edit/Add Form State
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [title, setTitle] = useState('')
    const [priority, setPriority] = useState(false)
    const [dueDate, setDueDate] = useState('')
    const [category, setCategory] = useState('')

    const startAdd = () => {
        setEditingTask(null)
        setTitle('')
        setPriority(false)
        setDueDate('')
        setCategory('')
        setIsFormOpen(true)
    }

    const startEdit = (task: Task) => {
        setEditingTask(task)
        setTitle(task.title)
        setPriority(task.priority || false)
        setCategory(task.category || '')
        // Ensure dueDate is string for input
        let dueStr = ''
        if (task.dueDate instanceof Date) {
            dueStr = format(task.dueDate, 'yyyy-MM-dd')
        } else if (typeof task.dueDate === 'string') {
            dueStr = task.dueDate
        }
        setDueDate(dueStr)
        setIsFormOpen(true)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        if (editingTask && onUpdate) {
            onUpdate({
                ...editingTask,
                title,
                priority,
                category,
                dueDate: dueDate
            })
        } else {
            onAdd({
                title,
                priority,
                category,
                due: dueDate || undefined,
            })
        }
        setIsFormOpen(false)
        setEditingTask(null)
        setTitle('')
    }

    // Filter Logic
    const filteredTasks = tasks.filter(t => {
        if (t.status === 'completed') return false
        if (filter === 'priority') return t.priority
        if (filter === 'normal') return !t.priority
        return true
    })

    // Sort: Priority first
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (a.priority === b.priority) return 0
        return a.priority ? -1 : 1
    })

    const activeTasks = sortedTasks.filter(t => t.status !== 'completed')
    const completedTasks = tasks.filter(t => t.status === 'completed') // Use original tasks for completed to avoid filter interference

    return (
        <Card className="p-8 flex flex-col max-h-[350px] rounded-[2rem] border-none shadow-soft bg-white dark:bg-[#1f2937] transition-all duration-300 hover:shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Execution List</h3>
                    <div className="flex gap-2 text-xs text-gray-400 mt-1">
                        <button onClick={() => setFilter('all')} className={cn("hover:text-gray-600 dark:hover:text-gray-300", filter === 'all' && "text-black dark:text-white font-medium")}>All</button>
                        <button onClick={() => setFilter('priority')} className={cn("hover:text-gray-600 dark:hover:text-gray-300", filter === 'priority' && "text-black dark:text-white font-medium")}>Priority</button>
                    </div>
                </div>
                <Button size="sm" variant="secondary" onClick={isFormOpen ? () => setIsFormOpen(false) : startAdd}>
                    {isFormOpen ? <X className="h-4 w-4" /> : "+ Add Task"}
                </Button>
            </div>

            <AnimatePresence>
                {isFormOpen && (
                    <motion.form
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mb-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl space-y-3 border border-gray-200 dark:border-gray-700"
                        onSubmit={handleSubmit}
                    >
                        <Input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Task description..."
                            autoFocus
                            className="bg-white dark:bg-gray-900 dark:text-white dark:border-gray-700"
                        />

                        {/* Tag Input */}
                        <div className="relative">
                            <Input
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                placeholder="Add tag (e.g. Work, Health)..."
                                className="bg-white dark:bg-gray-900 dark:text-white dark:border-gray-700 pl-8"
                            />
                            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" /><path d="M7 7h.01" /></svg>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={priority ? "primary" : "secondary"}
                                onClick={() => setPriority(!priority)}
                                className={cn(
                                    "h-9 text-xs flex-1 gap-1.5",
                                    priority ? "bg-red-500 hover:bg-red-600 text-white border-transparent" : "text-gray-500"
                                )}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={priority ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(priority ? "text-white" : "text-gray-400")}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
                                {priority ? "High Priority" : "Normal Priority"}
                            </Button>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                                className="h-9 rounded-md border border-input bg-white dark:bg-gray-900 dark:text-white dark:border-gray-700 px-3 py-1 text-sm shadow-sm"
                            />
                            <Button type="submit" size="sm" className="bg-[#0F5132] hover:bg-[#156a42] text-white">
                                {editingTask ? 'Save' : 'Add'}
                            </Button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                {/* Active Tasks */}
                {activeTasks.length === 0 && !isFormOpen && (
                    <div className="text-center py-10 text-gray-400 text-sm">
                        No active tasks.
                    </div>
                )}

                {activeTasks.map((task) => (
                    <TaskItem key={task.id} task={task} onToggle={onToggle} startEdit={startEdit} />
                ))}

                {/* Completed Tasks Dropdown */}
                {completedTasks.length > 0 && (
                    <div className="mt-6">
                        <details className="group">
                            <summary className="flex items-center gap-2 text-xs font-semibold text-gray-400 cursor-pointer select-none mb-3">
                                <span className="group-open:rotate-90 transition-transform">▶</span>
                                COMPLETED ({completedTasks.length})
                            </summary>
                            <div className="space-y-2 pl-2 border-l-2 border-gray-100/50">
                                {completedTasks.map((task) => (
                                    <TaskItem key={task.id} task={task} onToggle={onToggle} startEdit={startEdit} isCompleted />
                                ))}
                            </div>
                        </details>
                    </div>
                )}
            </div>

        </Card>
    )
}

function TaskItem({ task, onToggle, startEdit, isCompleted }: { task: Task, onToggle: (id: string) => void, startEdit: (t: Task) => void, isCompleted?: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isCompleted ? 0.6 : 1, y: 0 }}
            className={cn(
                "group flex items-start gap-3 p-3 rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 hover:shadow-sm transition-all relative",
                task.priority && !isCompleted ? "border-l-4 border-l-red-500" : "border-gray-100 dark:border-gray-700",
                isCompleted && "bg-gray-50 dark:bg-gray-900 grayscale opacity-80"
            )}
        >
            <button
                onClick={() => onToggle(task.id)}
                className={cn(
                    "mt-0.5 w-6 h-6 rounded-full border-2 border-gray-200 hover:border-[#0F5132] flex items-center justify-center transition-colors",
                    task.status === 'completed' && "bg-[#0F5132] border-[#0F5132]"
                )}
            >
                {task.status === 'completed' && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
            </button>

            <div className="flex-1 cursor-pointer" onClick={() => startEdit(task)}>
                <p className={cn("text-sm font-medium text-gray-800 dark:text-gray-200 leading-tight", isCompleted && "line-through text-gray-400")}>{task.title}</p>
                <div className="flex gap-2 items-center mt-1.5">
                    {task.category && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60">
                            {task.category}
                        </span>
                    )}
                    {task.dueDate && (
                        <p className="text-[10px] text-gray-400">Due {task.dueDate instanceof Date ? task.dueDate.toLocaleDateString() : task.dueDate}</p>
                    )}
                </div>
            </div>

            {
                task.priority && !isCompleted && (
                    <Badge variant="outline" className="text-[10px] border-red-200 text-red-500 bg-red-50">
                        PRIORITY
                    </Badge>
                )
            }

            < div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity" >
                <button onClick={() => startEdit(task)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                </button>
            </div>
        </motion.div >
    )
}
