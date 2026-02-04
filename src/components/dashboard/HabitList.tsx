import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Plus, Flame, Trash2, X, Edit2 } from "lucide-react"
import type { Habit } from "@/types"
import { CATEGORIES } from "@/types"
import { cn } from "@/lib/utils"

interface HabitListProps {
    habits: Habit[]
    onToggle: (id: string) => void
    onAdd: (title: string, category: string, priority: boolean, target: number, color: string) => void
    onUpdate: (habit: Habit) => void
    onDelete: (id: string) => void
}

const PASTEL_COLORS = [
    '#0F5132', // Forest (Default)
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#6366F1', // Indigo
]

export function HabitList({ habits, onToggle, onAdd, onUpdate, onDelete }: HabitListProps) {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    // Form States
    const [title, setTitle] = useState('')
    const [category, setCategory] = useState('Health')
    const [priority, setPriority] = useState(false)
    const [target, setTarget] = useState(30)
    const [color, setColor] = useState('#0F5132')

    const startAdd = () => {
        setEditingId(null)
        setTitle('')
        setPriority(false)
        setTarget(30)
        setColor('#0F5132')
        setIsFormOpen(true)
    }

    const startEdit = (habit: Habit) => {
        setEditingId(habit.id)
        setTitle(habit.title)
        setCategory(habit.category)
        setPriority(habit.priority)
        setTarget(habit.targetPerMonth)
        setColor(habit.color || '#0F5132')
        setIsFormOpen(true)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        if (editingId) {
            // Update existing
            const original = habits.find(h => h.id === editingId)
            if (original) {
                onUpdate({
                    ...original,
                    title,
                    category,
                    priority,
                    targetPerMonth: target,
                    color
                })
            }
        } else {
            // Add new
            onAdd(title, category, priority, target, color)
        }

        setIsFormOpen(false)
        setEditingId(null)
        setTitle('')
    }

    return (
        <Card className="p-8 h-full flex flex-col rounded-[2rem] border-none shadow-soft bg-white dark:bg-[#1f2937] transition-all duration-300 hover:shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Daily Rituals</h3>
                <Button size="sm" variant="ghost" onClick={isFormOpen ? () => setIsFormOpen(false) : startAdd}>
                    {isFormOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
            </div>

            <AnimatePresence>
                {isFormOpen && (
                    <motion.form
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mb-4 space-y-3 overflow-hidden bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700"
                        onSubmit={handleSubmit}
                    >
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ritual name..."
                            autoFocus
                            className="bg-white dark:bg-gray-900 dark:text-white dark:border-gray-700"
                        />

                        {/* Controls Row */}
                        <div className="flex flex-wrap gap-2">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="h-9 rounded-md border border-input bg-white dark:bg-gray-900 dark:text-white dark:border-gray-700 px-3 py-1 text-sm shadow-sm"
                            >
                                {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>

                            <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-md px-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Target:</span>
                                <input
                                    type="number" min="1" max="31"
                                    value={target}
                                    onChange={(e) => setTarget(parseInt(e.target.value))}
                                    className="w-10 text-sm outline-none bg-transparent dark:text-white"
                                />
                            </div>

                            <Button
                                type="button"
                                variant={priority ? "primary" : "secondary"}
                                onClick={() => setPriority(!priority)}
                                className={cn("h-9 px-3 text-xs gap-1.5", priority && "bg-red-500 hover:bg-red-600 text-white border-transparent")}
                            >
                                <Flame className={cn("h-3.5 w-3.5", priority ? "fill-white" : "text-gray-400")} />
                                {priority ? "High" : "Normal"}
                            </Button>
                        </div>

                        {/* Color Picker Row */}
                        <div className="flex items-center gap-2 pt-1">
                            <span className="text-xs text-gray-400 font-medium">Color:</span>
                            {PASTEL_COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={cn(
                                        "w-5 h-5 rounded-full transition-all border border-transparent",
                                        color === c ? "scale-110 ring-2 ring-offset-1 ring-gray-300 dark:ring-gray-600 shadow-sm" : "hover:scale-110"
                                    )}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                            <div className="relative">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="w-6 h-6 rounded-full overflow-hidden border-0 p-0 absolute opacity-0 cursor-pointer"
                                />
                                <div className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600 bg-gradient-to-br from-white to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-[8px] text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                                    +
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-gray-200/50 dark:border-gray-700/50 mt-2">
                            <Button type="submit" size="sm" className="w-full sm:w-auto">
                                {editingId ? 'Update Ritual' : 'Create Ritual'}
                            </Button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {habits.length === 0 && !isFormOpen && (
                    <p className="text-center text-gray-400 text-sm py-8">No habits tracked yet.</p>
                )}
                {habits.map(habit => (
                    <motion.div
                        key={habit.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                            "group flex items-center justify-between p-3 rounded-xl border transition-all relative overflow-hidden",
                            habit.completedToday ? "bg-opacity-10 border-opacity-20" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600",
                            habit.priority && !habit.completedToday && "border-l-4 border-l-red-400"
                        )}
                        style={{
                            backgroundColor: habit.completedToday ? `${habit.color || '#0F5132'}15` : undefined, // 10% opacity, fallback to green
                            borderColor: habit.completedToday ? (habit.color || '#0F5132') : undefined
                        }}
                    >
                        <div className="flex items-center gap-3 relative z-10">
                            <button
                                onClick={() => onToggle(habit.id)}
                                className={cn(
                                    "flex h-6 w-6 items-center justify-center rounded-lg border transition-all",
                                )}
                                style={{
                                    backgroundColor: habit.completedToday ? habit.color : undefined, // Remove 'white' default, let CSS handle it
                                    borderColor: habit.completedToday ? habit.color : 'currentColor', // inherit text color which we set below
                                }}
                            >
                                {habit.completedToday ? <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} /> : <div className="dark:border-white opacity-20" />}
                            </button>
                            <div className="cursor-pointer" onClick={() => startEdit(habit)}>
                                <p className={cn("text-sm font-medium transition-colors text-gray-800 dark:text-gray-200", habit.completedToday && "line-through opacity-50")}>
                                    {habit.title}
                                </p>
                                <div className="flex gap-2 items-center">
                                    <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60">
                                        {habit.category}
                                    </span>
                                    {habit.priority && (
                                        <span className="text-[10px] text-red-500 font-bold bg-red-50 px-1.5 rounded">PRIORITY</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 relative z-10">
                            {habit.streak > 0 && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: `${habit.color || '#F59E0B'}15` }}>
                                    <Flame className="h-3 w-3" style={{ fill: habit.color || '#F59E0B', color: habit.color || '#F59E0B' }} />
                                    <span className="text-xs font-bold" style={{ color: habit.color || '#F59E0B' }}>{habit.streak}</span>
                                </div>
                            )}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEdit(habit)} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                                    <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => onDelete(habit.id)} className="p-1 hover:bg-red-50 rounded text-gray-300 hover:text-red-500">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </Card>
    )
}
