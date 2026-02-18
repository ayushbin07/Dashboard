import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react'
import { authService } from '@/services/authService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const AVATARS = ['👨‍💻', '👩‍💻', '🧑‍🎓', '👨‍🎨', '👩‍🔬', '🧑‍💼', '👨‍🚀', '👩‍⚕️', '🧙‍♂️', '🧙‍♀️', '🦸‍♂️', '🦸‍♀️']

export default function Signup() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [username, setUsername] = useState('')
    const [selectedAvatar, setSelectedAvatar] = useState('👨‍💻')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const passwordStrength = password.length >= 8 ? 'strong' : password.length >= 6 ? 'medium' : 'weak'

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validation
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        if (!username.trim()) {
            setError('Username is required')
            return
        }

        setLoading(true)

        try {
            await authService.signUp(email, password, username, selectedAvatar)
            // Navigate to onboarding or dashboard
            navigate('/')
        } catch (err: any) {
            console.error('Signup error:', err)
            // Handle specific Supabase/Database errors
            if (err.message?.includes('Database error saving new user') ||
                err.message?.includes('duplicate key value')) {
                setError('Username is already taken. Please choose another.')
            } else if (err.message?.includes('violates unique constraint')) {
                setError('Username or email already exists.')
            } else {
                setError(err.message || 'Failed to create account')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F5132] to-[#1e7e34] dark:from-gray-900 dark:to-gray-800 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Create Your Account
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Start your productivity journey today
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3"
                        >
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </motion.div>
                    )}

                    {/* Signup Form */}
                    <form onSubmit={handleSignup} className="space-y-5">
                        {/* Avatar Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Choose your avatar
                            </label>
                            <div className="grid grid-cols-6 gap-2">
                                {AVATARS.map((avatar) => (
                                    <motion.button
                                        key={avatar}
                                        type="button"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedAvatar(avatar)}
                                        className={`text-3xl p-3 rounded-xl transition-all ${selectedAvatar === avatar
                                            ? 'bg-[#0F5132]/20 ring-2 ring-[#0F5132] scale-110'
                                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {avatar}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Choose a username"
                                    required
                                    maxLength={20}
                                    className="pl-10 h-12 dark:bg-gray-900 dark:text-white dark:border-gray-700"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                    className="pl-10 h-12 dark:bg-gray-900 dark:text-white dark:border-gray-700"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="At least 6 characters"
                                    required
                                    className="pl-10 h-12 dark:bg-gray-900 dark:text-white dark:border-gray-700"
                                />
                            </div>
                            {password && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: passwordStrength === 'strong' ? '100%' : passwordStrength === 'medium' ? '66%' : '33%'
                                            }}
                                            className={`h-full ${passwordStrength === 'strong' ? 'bg-green-500' :
                                                passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                                        {passwordStrength}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your password"
                                    required
                                    className="pl-10 h-12 dark:bg-gray-900 dark:text-white dark:border-gray-700"
                                />
                                {confirmPassword && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {password === confirmPassword ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-red-500" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-[#0F5132] hover:bg-[#0d4228] text-white font-medium rounded-xl"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating account...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <UserPlus className="w-5 h-5" />
                                    Create Account
                                </span>
                            )}
                        </Button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-[#0F5132] dark:text-[#4ade80] dark:drop-shadow-[0_0_8px_rgba(74,222,128,0.6)] dark:text-[#4ade80] font-medium hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-white/80 text-sm mt-6">
                    Join thousands of users conquering their goals 🚀
                </p>
            </motion.div>
        </div>
    )
}
