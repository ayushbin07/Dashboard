import { useState } from 'react'
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

    const startAdd = () => {
        setEditingTask(null)
        setTitle('')
        setPriority(false)
        setDueDate('')
        setIsFormOpen(true)
    }

    const startEdit = (task: Task) => {
        setEditingTask(task)
        setTitle(task.title)
        setPriority(task.priority || false)
        // Ensure dueDate is string for input
        let dueStr = ''
        if (task.dueDate instanceof Date) {
            dueStr = task.dueDate.toISOString().split('T')[0]
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
                dueDate: dueDate
            })
        } else {
            onAdd({
                title,
                priority,
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

    return (
        <Card className="p-6 h-full flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-semibold">Execution List</h3>
                    <div className="flex gap-2 text-xs text-gray-400 mt-1">
                        <button onClick={() => setFilter('all')} className={cn("hover:text-gray-600", filter === 'all' && "text-black font-medium")}>All</button>
                        <button onClick={() => setFilter('priority')} className={cn("hover:text-gray-600", filter === 'priority' && "text-black font-medium")}>Priority</button>
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
                        className="mb-4 bg-gray-50 p-4 rounded-xl space-y-3"
                        onSubmit={handleSubmit}
                    >
                        <Input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Task description..."
                            autoFocus
                            className="bg-white"
                        />
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={priority ? "primary" : "secondary"}
                                onClick={() => setPriority(!priority)}
                                className={cn("h-9 text-xs flex-1", priority && "bg-red-100 text-red-600 border-red-200 hover:bg-red-200")}
                            >
                                {priority ? "High Priority" : "Normal Priority"}
                            </Button>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                                className="h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm"
                            />
                            <Button type="submit" size="sm">
                                {editingTask ? 'Save' : 'Add'}
                            </Button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                {sortedTasks.length === 0 && !isFormOpen && (
                    <div className="text-center py-10 text-gray-400 text-sm">
                        No active tasks.
                    </div>
                )}

                {sortedTasks.map((task) => (
                    <motion.div
                        layout
                        key={task.id}
                        className={cn(
                            "group flex items-start gap-3 p-3 rounded-xl border bg-white hover:shadow-sm transition-all relative",
                            task.priority ? "border-l-4 border-l-red-500" : "border-gray-100"
                        )}
                    >
                        <button
                            onClick={() => onToggle(task.id)}
                            className="mt-0.5 w-5 h-5 rounded border border-gray-300 hover:border-purple-500 flex items-center justify-center transition-colors"
                        >
                            {/* Empty square for pending */}
                        </button>

                        <div className="flex-1 cursor-pointer" onClick={() => startEdit(task)}>
                            <p className="text-sm font-medium text-gray-800 leading-tight">{task.title}</p>
                            {task.dueDate && (
                                <p className="text-[10px] text-gray-400 mt-1">Due {task.dueDate instanceof Date ? task.dueDate.toLocaleDateString() : task.dueDate}</p>
                            )}
                        </div>

                        {task.priority && (
                            <Badge variant="outline" className="text-[10px] border-red-200 text-red-500 bg-red-50">
                                PRIORITY
                            </Badge>
                        )}

                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(task)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </Card>
    )
}
