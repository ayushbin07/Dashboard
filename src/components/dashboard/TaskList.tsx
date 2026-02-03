import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Check, Calendar, Plus, X, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from "@/lib/utils"
import type { Task } from "@/types"
import { CATEGORIES } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface TaskListProps {
    tasks: Task[]
    onToggle: (id: string, current: string) => void
    onAdd: (task: any) => Promise<void>
}

export function TaskList({ tasks, onToggle, onAdd }: TaskListProps) {
    const [isAdding, setIsAdding] = useState(false)
    const [newTask, setNewTask] = useState({ title: '', category: 'Coding', priority: false, due: '', notes: '' })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTask.title) return

        await onAdd(newTask)
        setIsAdding(false)
        setNewTask({ title: '', category: 'Coding', priority: false, due: '', notes: '' })
    }

    // Sort: Priority Pending -> Additional Pending -> Completed
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1
        if (a.status !== 'completed' && b.status === 'completed') return -1
        if (a.priority && !b.priority) return -1
        if (!a.priority && b.priority) return 1
        return 0
    })

    return (
        <Card className="p-6 h-full flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Execution List</h3>
                <Button size="sm" variant="secondary" onClick={() => setIsAdding(!isAdding)} className="gap-2">
                    {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {isAdding ? 'Cancel' : 'Add Task'}
                </Button>
            </div>

            {/* Add Task Form */}
            <AnimatePresence>
                {isAdding && (
                    <motion.form
                        initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
                        exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                        onSubmit={handleSubmit}
                        className="overflow-hidden bg-gray-50/50 rounded-xl border border-dashed border-gray-300 p-4 space-y-3"
                    >
                        <Input
                            value={newTask.title}
                            onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                            placeholder="Task title..."
                            className="bg-white"
                            autoFocus
                        />
                        <div className="flex flex-wrap gap-2">
                            <Input
                                type="date"
                                value={newTask.due}
                                onChange={e => setNewTask({ ...newTask, due: e.target.value })}
                                className="w-auto bg-white"
                            />
                            <select
                                value={newTask.category}
                                onChange={e => setNewTask({ ...newTask, category: e.target.value })}
                                className="h-10 rounded-xl border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                {CATEGORIES.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                            </select>
                            <Button
                                type="button"
                                variant={newTask.priority ? "primary" : "secondary"}
                                onClick={() => setNewTask({ ...newTask, priority: !newTask.priority })}
                                className={cn("gap-2", newTask.priority && "bg-accent-priority hover:bg-accent-priority/90 text-white")}
                            >
                                <Tag className="h-4 w-4" />
                                {newTask.priority ? 'Priority' : 'Normal'}
                            </Button>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" size="sm">Create Task</Button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode='popLayout'>
                    {sortedTasks.map(task => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onToggle={() => onToggle(task.id, task.status)}
                        />
                    ))}
                    {tasks.length === 0 && !isAdding && (
                        <div className="text-center text-gray-400 py-10 text-sm">
                            No tasks found. Start by adding one.
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </Card>
    )
}

function TaskItem({ task, onToggle }: { task: Task, onToggle: () => void }) {
    const isCompleted = task.status === 'completed'

    const getCategoryColor = (cat: string) => {
        // Simplified lookup for brevity, ideally mapped cleaner
        if (cat === 'Coding') return 'bg-purple-100 text-purple-700'
        if (cat === 'Gym') return 'bg-amber-100 text-amber-700'
        if (cat === 'Reading') return 'bg-pink-100 text-pink-700'
        return 'bg-gray-100 text-gray-700'
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isCompleted ? 0.5 : 1, y: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className={cn(
                "group flex items-start p-3 rounded-xl border transition-all hover:shadow-sm",
                task.priority ? "border-l-4 border-l-accent-priority border-t-gray-100 border-r-gray-100 border-b-gray-100 bg-red-50/10" : "border-gray-100 bg-white",
                isCompleted && "border-l-gray-200 bg-gray-50 grayscale"
            )}
        >
            <button
                onClick={onToggle}
                className={cn(
                    "mt-1 mr-3 flex h-5 w-5 items-center justify-center rounded-full border transition-all",
                    isCompleted ? "bg-primary border-primary text-white" : "border-gray-300 hover:border-primary"
                )}
            >
                {isCompleted && <Check className="h-3 w-3" />}
            </button>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <span className={cn(
                        "font-medium text-sm truncate transition-all",
                        isCompleted && "line-through text-gray-400"
                    )}>
                        {task.title}
                    </span>
                    <Badge variant="secondary" className={cn("ml-2 whitespace-nowrap", getCategoryColor(task.category))}>
                        {task.category}
                    </Badge>
                </div>

                <div className="flex items-center mt-1 space-x-3 text-xs text-gray-400">
                    <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Date'}
                    </span>
                    {task.notes && (
                        <span className="truncate max-w-[200px] hidden sm:inline-block">
                            • {task.notes}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
