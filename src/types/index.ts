export type Priority = 'High' | 'Normal'
export type TaskStatus = 'pending' | 'completed'

export interface Task {
    id: string
    title: string
    priority: boolean // true = High, false = Normal/Additional
    category: string
    dueDate: string | Date
    status: TaskStatus
    notes?: string
    createdAt: string
}

export interface Habit {
    id: string
    title: string
    category: string
    streak: number
    completedToday: boolean
    history: Record<string, boolean> // 'YYYY-MM-DD': true/false
}

export type CategoryColor = {
    name: string
    color: string // Tailwind class or hex
}

export const CATEGORIES: CategoryColor[] = [
    { name: 'Coding', color: '#8B5CF6' }, // Purple
    { name: 'Gym', color: '#F59E0B' },    // Amber
    { name: 'Reading', color: '#EC4899' }, // Pink
    { name: 'Deep Work', color: '#6366F1' }, // Indigo
    { name: 'Health', color: '#10B981' }, // Emerald
]
