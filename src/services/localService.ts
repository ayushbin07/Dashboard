import type { Task, Habit } from '@/types'

const TASKS_KEY = 'antigravity_tasks'
const HABITS_KEY = 'antigravity_habits'
const USER_KEY = 'antigravity_user'

export interface UserProfile {
    name: string
    avatar: string
}

export const localService = {
    // --- USER PROFILE ---
    getUserProfile(): UserProfile {
        const stored = localStorage.getItem(USER_KEY)
        if (stored) {
            try {
                return JSON.parse(stored)
            } catch {
                return { name: '', avatar: '👨‍💻' }
            }
        }
        return { name: '', avatar: '👨‍💻' }
    },

    saveUserProfile(profile: UserProfile) {
        localStorage.setItem(USER_KEY, JSON.stringify(profile))
    },

    // --- THEME ---
    getTheme(): 'light' | 'dark' {
        return (localStorage.getItem('antigravity_theme') as 'light' | 'dark') || 'light'
    },

    saveTheme(theme: 'light' | 'dark') {
        localStorage.setItem('antigravity_theme', theme)
    },

    // --- TASKS ---
    getTasks(): Task[] {
        const stored = localStorage.getItem(TASKS_KEY)
        if (!stored) return []
        try {
            return JSON.parse(stored)
        } catch {
            return []
        }
    },

    saveTasks(tasks: Task[]) {
        localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
    },

    addTask(task: Omit<Task, 'id' | 'createdAt' | 'status'>) {
        const tasks = this.getTasks()
        const newTask: Task = {
            ...task,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            status: 'pending'
        }
        this.saveTasks([newTask, ...tasks]) // Add to top
        return newTask
    },

    toggleTask(id: string) {
        const tasks = this.getTasks()
        const updated = tasks.map(t =>
            t.id === id ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending' } : t
        ) as Task[] // Explicit cast to avoid type narrowing issues
        this.saveTasks(updated)
        return updated
    },

    deleteTask(id: string) {
        const tasks = this.getTasks()
        const updated = tasks.filter(t => t.id !== id)
        this.saveTasks(updated)
        return updated
    },

    // --- HABITS ---
    getHabits(): Habit[] {
        const stored = localStorage.getItem(HABITS_KEY)
        let habits: Habit[] = []
        if (stored) {
            try {
                habits = JSON.parse(stored)
            } catch {
                habits = []
            }
        }

        // Check if day changed, reset completedToday if needed
        const today = new Date().toISOString().split('T')[0]
        habits = habits.map((h: Habit) => {
            // If last history entry is NOT today, then completedToday should be false (unless we just marked it)
            // Actually simpler: we just trust `completedToday` but when we load, if history[today] is missing, ensure completedToday is false
            const isDoneInHistory = !!(h.history && h.history[today])
            if (h.completedToday !== isDoneInHistory) {
                return { ...h, completedToday: isDoneInHistory }
            }
            return h
        })
        return habits
    },

    saveHabits(habits: Habit[]) {
        localStorage.setItem(HABITS_KEY, JSON.stringify(habits))
    },

    addHabit(title: string, category: string, priority: boolean, targetPerMonth: number, color?: string) {
        const habits = this.getHabits()
        const newHabit: Habit = {
            id: crypto.randomUUID(),
            title,
            category,
            priority,
            targetPerMonth,
            color: color || '#8B5CF6', // Default purple
            streak: 0,
            completedToday: false,
            history: {}
        }
        this.saveHabits([...habits, newHabit])
        return newHabit
    },

    updateHabit(updatedHabit: Habit) {
        const habits = this.getHabits()
        const updated = habits.map(h => h.id === updatedHabit.id ? updatedHabit : h)
        this.saveHabits(updated)
        // Recalculate streak/today status might be needed if history changed, 
        // but for simple metadata edits (title, color) it's fine.
        return updated
    },

    updateTask(updatedTask: Task) {
        const tasks = this.getTasks()
        const updated = tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
        this.saveTasks(updated)
        return updated
    },

    toggleHabit(id: string) {
        const habits = this.getHabits()
        const today = new Date().toISOString().split('T')[0]

        const updated = habits.map((h: Habit) => {
            if (h.id !== id) return h

            const newCompleted = !h.completedToday
            const newHistory = { ...h.history }

            if (newCompleted) {
                newHistory[today] = true
            } else {
                delete newHistory[today]
            }

            // Simple streak logic: if completed, streak +1 (if not already incremented today in a real app, but here just visual)
            // Actually, best to just recalculate streak from history if we want accuracy, or just increment/decrement
            // User reported weird behavior, so let's stick to:
            // If checking -> streak + 1
            // If unchecking -> streak - 1 (but not below 0)
            // But we must ensure we don't double count if we toggle rapidly.
            // The issue is likely that state in UI assumes X but local storage has Y.
            // Let's rely on the direct toggle.

            let streak = h.streak
            if (newCompleted) streak += 1
            else streak = Math.max(0, streak - 1)

            return {
                ...h,
                completedToday: newCompleted,
                history: newHistory,
                streak
            }
        })

        this.saveHabits(updated)
        return updated
    },

    deleteHabit(id: string) {
        const habits = this.getHabits()
        const updated = habits.filter((h: Habit) => h.id !== id)
        this.saveHabits(updated)
        return updated
    }
}
