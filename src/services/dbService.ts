import { supabase } from './authService'
import type { Task, Habit, Note } from '@/types'

export const dbService = {
    // ... (existing code) ...

    // --- NOTES ---
    async getNotes(): Promise<Note[]> {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .order('updated_at', { ascending: false })

        if (error) {
            console.error('Error fetching notes:', error)
            return []
        }

        return data.map(n => ({
            id: n.id,
            title: n.title,
            content: n.content,
            createdAt: n.created_at,
            updatedAt: n.updated_at
        }))
    },

    async addNote(title: string, content: string): Promise<Note | null> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data, error } = await supabase
            .from('notes')
            .insert({
                user_id: user.id,
                title,
                content
            })
            .select()
            .single()

        if (error) throw error

        return {
            id: data.id,
            title: data.title,
            content: data.content,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        }
    },

    async updateNote(id: string, title: string, content: string): Promise<void> {
        const { error } = await supabase
            .from('notes')
            .update({
                title,
                content,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        if (error) throw error
    },

    async deleteNote(id: string): Promise<void> {
        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', id)

        if (error) throw error
    },

    async resetData(): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Delete all tasks
        const { error: tasksError } = await supabase
            .from('tasks')
            .delete()
            .eq('user_id', user.id)

        if (tasksError) throw tasksError

        // Delete all habits
        const { error: habitsError } = await supabase
            .from('habits')
            .delete()
            .eq('user_id', user.id)

        if (habitsError) throw habitsError

        // Delete all notes
        const { error: notesError } = await supabase
            .from('notes')
            .delete()
            .eq('user_id', user.id)

        if (notesError) throw notesError
    },
    async getTasks(): Promise<Task[]> {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching tasks:', error)
            return []
        }

        return data.map(t => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            category: t.category,
            dueDate: t.due_date,
            status: t.status,
            createdAt: t.created_at,
            // completedAt: t.completed_at
        }))
    },

    async addTask(task: Omit<Task, 'id' | 'createdAt' | 'status'>): Promise<Task | null> {
        console.log('Adding task:', task)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            console.error('Add Task failed: No user')
            return null
        }

        const { data, error } = await supabase
            .from('tasks')
            .insert({
                user_id: user.id,
                title: task.title,
                category: task.category,
                priority: task.priority,
                due_date: task.dueDate,
                status: 'pending'
            })
            .select()
            .single()

        if (error) {
            console.error('Error adding task to DB:', error)
            throw error
        }

        console.log('Task added successfully:', data)

        return {
            id: data.id,
            title: data.title,
            priority: data.priority,
            category: data.category,
            dueDate: data.due_date,
            status: data.status,
            createdAt: data.created_at
        }
    },

    async toggleTask(id: string, currentStatus: string): Promise<void> {
        const newStatus = currentStatus === 'pending' ? 'completed' : 'pending'
        const { error } = await supabase
            .from('tasks')
            .update({
                status: newStatus,
                completed_at: newStatus === 'completed' ? new Date().toISOString() : null
            })
            .eq('id', id)

        if (error) console.error('Error toggling task:', error)
    },

    async updateTask(updatedTask: Task): Promise<void> {
        const { error } = await supabase
            .from('tasks')
            .update({
                title: updatedTask.title,
                priority: updatedTask.priority,
                category: updatedTask.category,
                due_date: updatedTask.dueDate,
                status: updatedTask.status
            })
            .eq('id', updatedTask.id)
        if (error) console.error('Error updating task:', error)
    },

    async deleteTask(id: string): Promise<void> {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id)

        if (error) console.error('Error deleting task:', error)
    },

    // --- HABITS ---
    async getHabits(): Promise<Habit[]> {
        const { data: habits, error } = await supabase
            .from('habits')
            .select('*')
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Error fetching habits:', error)
            return []
        }

        // Fetch history for these habits? 
        // For efficiency, maybe we fetch all history for today?
        // Or fetch all history logic as needed.
        // For now, let's fetch history for the last 365 days to populate the grid
        const { data: historyData, error: historyError } = await supabase
            .from('habit_history')
            .select('*')

        if (historyError) console.error('Error fetching habit history:', historyError)

        const historyMap: Record<string, Record<string, boolean>> = {} // habit_id -> { date -> true }

        historyData?.forEach(h => {
            if (!historyMap[h.habit_id]) historyMap[h.habit_id] = {}
            historyMap[h.habit_id][h.date] = h.completed
        })

        const today = new Date().toISOString().split('T')[0]

        return habits.map(h => {
            const hHistory = historyMap[h.id] || {}
            return {
                id: h.id,
                title: h.title,
                category: h.category,
                streak: h.streak,
                priority: h.priority,
                targetPerMonth: h.target_per_month,
                color: h.color,
                completedToday: !!hHistory[today],
                history: hHistory
            }
        })
    },

    async addHabit(title: string, category: string, priority: boolean, targetPerMonth: number, color: string): Promise<Habit | null> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data, error } = await supabase
            .from('habits')
            .insert({
                user_id: user.id,
                title,
                category,
                priority,
                target_per_month: targetPerMonth,
                color,
                streak: 0
            })
            .select()
            .single()

        if (error) throw error

        return {
            id: data.id,
            title: data.title,
            category: data.category,
            streak: data.streak,
            priority: data.priority,
            targetPerMonth: data.target_per_month,
            color: data.color,
            completedToday: false,
            history: {}
        }
    },

    async updateHabit(updatedHabit: Habit): Promise<void> {
        const { error } = await supabase
            .from('habits')
            .update({
                title: updatedHabit.title,
                category: updatedHabit.category,
                priority: updatedHabit.priority,
                target_per_month: updatedHabit.targetPerMonth,
                color: updatedHabit.color
            })
            .eq('id', updatedHabit.id)
        if (error) console.error('Error updating habit:', error)
    },

    async toggleHabit(id: string, date: string, currentCompleted: boolean): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const newCompleted = !currentCompleted

        if (newCompleted) {
            const { error } = await supabase
                .from('habit_history')
                .insert({
                    habit_id: id,
                    date: date,
                    completed: true
                })

            if (error) console.error('Error marking habit complete:', error)
        } else {
            const { error } = await supabase
                .from('habit_history')
                .delete()
                .eq('habit_id', id)
                .eq('date', date)

            if (error) console.error('Error marking habit incomplete:', error)
        }

        // Update streak count on the habit parent?
        // This is complex to calculate in frontend exactly without full history analysis.
        // Ideally we use a Postgres trigger or simple increment/decrement.
        // Let's just increment/decrement for now like localService did.
        // Fetch current streak first?

        // Optimistic update in frontend usually, but here we update DB.
        // We really should use a DB function to "recalculate_streak(habit_id)".

        // For now, let's leave streak as is, relying on the 'streak' column which might need a separate update.
    },

    async deleteHabit(id: string): Promise<void> {
        const { error } = await supabase
            .from('habits')
            .delete()
            .eq('id', id)
        if (error) throw error
    },


}
