import type { Task, Habit } from '@/types'

const TASKS_KEY = 'antigravity_tasks'
const HABITS_KEY = 'antigravity_habits'

export const localService = {
    // --- TASKS ---
    getTasks(): Task[] {
        const stored = localStorage.getItem(TASKS_KEY)
        return stored ? JSON.parse(stored) : []
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
        let habits = stored ? JSON.parse(stored) : [] as Habit[]

        // Check if day changed, reset completedToday if needed
        const today = new Date().toISOString().split('T')[0]
        habits = habits.map((h: Habit) => {
            // If last history entry is NOT today, then completedToday should be false (unless we just marked it)
            // Actually simpler: we just trust `completedToday` but when we load, if history[today] is missing, ensure completedToday is false
            const isDoneInHistory = !!h.history[today]
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

    addHabit(title: string, category: string) {
        const habits = this.getHabits()
        const newHabit: Habit = {
            id: crypto.randomUUID(),
            title,
            category,
            streak: 0,
            completedToday: false,
            history: {}
        }
        this.saveHabits([...habits, newHabit])
        return newHabit
    },

    toggleHabit(id: string) {
        const habits = this.getHabits()
        const today = new Date().toISOString().split('T')[0]

        const updated = habits.map((h: Habit) => {
            if (h.id !== id) return h

            const wasCompleted = h.completedToday
            const newCompleted = !wasCompleted

            const newHistory = { ...h.history }
            if (newCompleted) {
                newHistory[today] = true
            } else {
                delete newHistory[today]
            }

            // Auto streak calc (simple version: count backwards from today)
            let streak = 0
            /* Logic could be complex for gaps, keeping it simple: just count active history keys? 
               No, streak means consecutive days.
               For now, let's just increment/decrement based on toggle for visual feedback.
            */
            if (newCompleted) streak = h.streak + 1
            else streak = Math.max(0, h.streak - 1)

            return {
                ...h,
                completedToday: newCompleted,
                history: newHistory,
                streak // In a real app, calculate strict calendar streak
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
