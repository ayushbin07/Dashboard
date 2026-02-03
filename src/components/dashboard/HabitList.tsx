import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Plus, Flame, Trash2, X } from "lucide-react"
import type { Habit } from "@/types"
import { CATEGORIES } from "@/types"
import { cn } from "@/lib/utils"

interface HabitListProps {
    habits: Habit[]
    onToggle: (id: string) => void
    onAdd: (title: string, category: string) => void
    onDelete: (id: string) => void
}

export function HabitList({ habits, onToggle, onAdd, onDelete }: HabitListProps) {
    const [isAdding, setIsAdding] = useState(false)
    const [title, setTitle] = useState('')
    const [category, setCategory] = useState('Health')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return
        onAdd(title, category)
        setTitle('')
        setIsAdding(false)
    }

    return (
        <Card className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Daily Rituals</h3>
                <Button size="sm" variant="ghost" onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.form
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mb-4 space-y-2 overflow-hidden"
                        onSubmit={handleSubmit}
                    >
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="New habit..."
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="flex-1 h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm"
                            >
                                {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                            <Button type="submit" size="sm">Add</Button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {habits.length === 0 && !isAdding && (
                    <p className="text-center text-gray-400 text-sm py-8">No habits tracked yet.</p>
                )}
                {habits.map(habit => (
                    <motion.div
                        key={habit.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                            "flex items-center justify-between p-3 rounded-xl border transition-all",
                            habit.completedToday ? "bg-green-50/50 border-green-100" : "bg-white border-gray-100 hover:border-gray-200"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => onToggle(habit.id)}
                                className={cn(
                                    "flex h-6 w-6 items-center justify-center rounded-lg border transition-all",
                                    habit.completedToday ? "bg-green-500 border-green-500 text-white shadow-sm shadow-green-200" : "border-gray-300 hover:border-green-400 bg-white"
                                )}
                            >
                                {habit.completedToday && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                            </button>
                            <div>
                                <p className={cn("text-sm font-medium transition-colors", habit.completedToday && "text-gray-500 line-through")}>
                                    {habit.title}
                                </p>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                                    {habit.category}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {habit.streak > 0 && (
                                <div className="flex items-center text-orange-500 gap-1 bg-orange-50 px-2 py-0.5 rounded-full">
                                    <Flame className="h-3 w-3 fill-orange-500" />
                                    <span className="text-xs font-bold">{habit.streak}</span>
                                </div>
                            )}
                            <button onClick={() => onDelete(habit.id)} className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </Card>
    )
}
