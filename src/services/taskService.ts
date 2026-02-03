import { supabase } from '@/lib/supabase'
import type { Task } from '@/types'

export const taskService = {
    async getTasks() {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        // Map DB fields to Task type if needed (e.g. snake_case to camelCase)
        // Assuming DB has snake_case, we should map it.
        return (data || []).map((t: any) => ({
            id: t.id,
            title: t.title,
            notes: t.description,
            status: t.status,
            priority: t.priority,
            category: t.category,
            dueDate: t.due_date, // Map due_date -> dueDate
            createdAt: t.created_at
        })) as Task[]
    },

    async addTask(title: string, priority: boolean, category: string, dueDate: string, notes?: string) {
        // For development without Auth, we might need to bypass RLS or ensure anonymous access is allowed
        // Or just insert without user_id if RLS is off.
        // Ideally user is anonymous auth.

        const { data, error } = await supabase
            .from('tasks')
            .insert([{
                title,
                priority,
                category,
                due_date: dueDate, // Map back
                description: notes,
                status: 'pending'
            }])
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateStatus(id: string, status: 'pending' | 'completed') {
        const { error } = await supabase
            .from('tasks')
            .update({ status })
            .eq('id', id)

        if (error) throw error
    },

    async deleteTask(id: string) {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}
