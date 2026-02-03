import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { authService } from '@/services/authService'

interface ProtectedRouteProps {
    children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [loading, setLoading] = useState(true)
    const [authenticated, setAuthenticated] = useState(false)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const session = await authService.getSession()
            setAuthenticated(!!session)
        } catch {
            setAuthenticated(false)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F5132] to-[#1e7e34] dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg font-medium">Loading...</p>
                </div>
            </div>
        )
    }

    if (!authenticated) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}
