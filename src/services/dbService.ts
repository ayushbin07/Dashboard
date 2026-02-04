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
            content: n.content,
            createdAt: n.created_at,
            updatedAt: n.updated_at
        }))
    },

    async addNote(content: string): Promise<Note | null> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data, error } = await supabase
            .from('notes')
            .insert({
                user_id: user.id,
                content
            })
            .select()
            .single()

        if (error) throw error

        return {
            id: data.id,
            content: data.content,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        }
    },

    async updateNote(id: string, content: string): Promise<void> {
        const { error } = await supabase
            .from('notes')
            .update({
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
                    user_id: user.id,
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

    // --- PROFILE ---
    async getProfile(): Promise<{ username: string; avatar: string; theme: string } | null> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data, error } = await supabase
            .from('profiles')
            .select('username, avatar, theme')
            .eq('id', user.id)
            .single()

        if (error) {
            console.error('Error fetching profile:', error)
            return null
        }
        return data
    },

    async updateProfile(updates: { username?: string; avatar?: string; theme?: string }): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { error } = await supabase
            .from('profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

        if (error) throw error
    },

    async getUserByUsername(username: string): Promise<{ id: string; username: string; avatar: string } | null> {
        console.log('Searching for username:', username)

        const { data, error } = await supabase
            .from('profiles')
            .select('id, username, avatar')
            .eq('username', username)
            .maybeSingle()

        console.log('getUserByUsername result:', { data, error })

        if (error) {
            console.error('Error fetching user by username:', error)
            return null
        }

        return data
    },

    async getUserTodayProgress(userId: string): Promise<number> {
        const today = new Date().toISOString().split('T')[0]

        // Get habits for user
        const { data: habits } = await supabase
            .from('habits')
            .select('id, history')
            .eq('user_id', userId)

        if (!habits || habits.length === 0) return 0

        // Count completed habits today
        const completedToday = habits.filter(habit => {
            const history = habit.history as Record<string, boolean> || {}
            return history[today] === true
        }).length

        // Calculate percentage
        return Math.round((completedToday / habits.length) * 100)
    },

    // --- FRIENDS ---
    async getFriends(): Promise<Array<{ id: string; username: string; avatar: string }>> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        const { data, error } = await supabase
            .from('friends')
            .select(`
                friend_id,
                profiles:friend_id (
                    id,
                    username,
                    avatar
                )
            `)
            .eq('user_id', user.id)

        if (error) {
            console.error('Error fetching friends:', error)
            return []
        }

        // Transform the data to flatten the nested structure
        return data.map((f: any) => ({
            id: f.profiles.id,
            username: f.profiles.username,
            avatar: f.profiles.avatar || '🧑'
        }))
    },

    async addFriend(friendId: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { error } = await supabase
            .from('friends')
            .insert({
                user_id: user.id,
                friend_id: friendId
            })

        if (error) throw error
    },

    async removeFriend(friendId: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { error } = await supabase
            .from('friends')
            .delete()
            .eq('user_id', user.id)
            .eq('friend_id', friendId)

        if (error) throw error
    },

    // --- USER FEEDBACK ---
    async getFeedback(): Promise<Array<{ id: string; comment: string; username: string; avatar: string; created_at: string }>> {
        // Fetch feedback entries
        const { data: feedbackData, error: feedbackError } = await supabase
            .from('user_feedback')
            .select('id, comment, created_at, user_id')
            .order('created_at', { ascending: false })
            .limit(50)

        if (feedbackError) {
            console.error('Error fetching feedback:', feedbackError)
            return []
        }

        if (!feedbackData || feedbackData.length === 0) {
            console.log('No feedback found')
            return []
        }

        // Get unique user IDs
        const userIds = [...new Set(feedbackData.map(f => f.user_id))]

        // Fetch profiles for these users
        const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, username, avatar')
            .in('id', userIds)

        if (profilesError) {
            console.error('Error fetching profiles:', profilesError)
        }

        // Create a map of user profiles
        const profileMap = new Map()
        profilesData?.forEach(p => {
            profileMap.set(p.id, { username: p.username, avatar: p.avatar })
        })

        // Combine feedback with profile data
        const result = feedbackData.map(f => {
            const profile = profileMap.get(f.user_id)
            return {
                id: f.id,
                comment: f.comment,
                username: profile?.username || 'Anonymous',
                avatar: profile?.avatar || '👤',
                created_at: f.created_at
            }
        })

        console.log('Fetched feedback:', result)
        return result
    },

    async addFeedback(comment: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        if (!comment || comment.length === 0 || comment.length > 500) {
            throw new Error('Comment must be between 1 and 500 characters')
        }

        const { error } = await supabase
            .from('user_feedback')
            .insert({
                user_id: user.id,
                comment: comment.trim()
            })

        if (error) throw error
    },

    async deleteFeedback(feedbackId: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { error } = await supabase
            .from('user_feedback')
            .delete()
            .eq('id', feedbackId)
            .eq('user_id', user.id)

        if (error) throw error
    },

    // --- STREAK ---
    async getStreak(): Promise<{ count: number; status: string } | null> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data, error } = await supabase
            .from('streak_data')
            .select('count, status')
            .eq('user_id', user.id)
            .single()

        if (error) return null
        return data
    },

    async checkAndIncrementStreak(): Promise<{ count: number; status: string } | null> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        // Get current streak data
        let { data } = await supabase
            .from('streak_data')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle()

        // Helper for local date string YYYY-MM-DD
        const getLocalDateStr = () => {
            const d = new Date()
            const year = d.getFullYear()
            const month = String(d.getMonth() + 1).padStart(2, '0')
            const day = String(d.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
        }

        const todayStr = getLocalDateStr()

        // Initialize if empty
        if (!data) {
            const { data: newData, error: insertError } = await supabase
                .from('streak_data')
                .insert({
                    user_id: user.id,
                    count: 1,
                    last_check_in: todayStr,
                    status: 'active'
                })
                .select()
                .single()

            if (insertError) {
                console.error('Error initializing streak:', insertError)
                return { count: 1, status: 'active' } // Fallback
            }
            return { count: newData.count, status: newData.status }
        }

        const lastCheckInStr = data.last_check_in // Date string from DB (YYYY-MM-DD)

        // If already checked in today, return current
        if (todayStr === lastCheckInStr) {
            return { count: data.count, status: data.status }
        }

        // Parse dates safely (treat as UTC to avoid timezone shifts when comparing just dates)
        const d1 = new Date(todayStr).getTime()
        const d2 = new Date(lastCheckInStr).getTime()
        const dayGap = Math.round((d1 - d2) / (1000 * 60 * 60 * 24))

        let newCount = data.count
        let newStatus = data.status

        if (dayGap === 1) {
            // Consecutive day
            newCount += 1
            newStatus = 'active'
        } else if (dayGap === 2) {
            // Missed 1 day
            newStatus = 'grace1'
        } else if (dayGap === 3) {
            // Missed 2 days
            newStatus = 'grace2'
        } else if (dayGap > 3 || dayGap < 0) {
            // Broken streak (or time travel)
            newCount = 1
            newStatus = 'active'
        }

        // Update DB
        const { error: updateError } = await supabase
            .from('streak_data')
            .update({
                count: newCount,
                status: newStatus,
                last_check_in: todayStr,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)

        if (updateError) {
            console.error('Error updating streak:', updateError)
            return { count: data.count, status: data.status }
        }

        return { count: newCount, status: newStatus }
    },

    // Deprecated manual update, kept if needed but not for overwrite
    async updateStreak(_count: number): Promise<void> {
        // This is restricted now
        console.warn("Manual streak update is deprecated")
    }
}
