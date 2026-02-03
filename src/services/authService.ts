import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const authService = {
    // Sign up with email and password
    async signUp(email: string, password: string, username: string, avatar: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    avatar
                },
                emailRedirectTo: window.location.origin
            }
        })

        if (error) throw error

        // Auto sign in after signup (bypass email confirmation)
        if (data.user && !data.session) {
            // If no session was created, sign in anyway
            return await this.signIn(email, password)
        }

        return data
    },

    // Sign in with email and password
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) throw error
        return data
    },

    // Sign out
    async signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    },

    // Get current user
    async getCurrentUser() {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        return user
    },

    // Get current session
    async getSession() {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        return session
    },

    // Listen for auth state changes
    onAuthStateChange(callback: (event: string, session: any) => void) {
        return supabase.auth.onAuthStateChange(callback)
    },

    // Reset password
    async resetPassword(email: string) {
        const { error } = await supabase.auth.resetPasswordForEmail(email)
        if (error) throw error
    }
}
