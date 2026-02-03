import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Moon, Sun, Bell, BellOff } from 'lucide-react'
import { supabase, authService } from '@/services/authService'
import { localService } from '@/services/localService'
import { notificationManager } from '@/utils/notificationManager'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const AVATARS = ['👨‍💻', '👩‍💻', '🧑‍🎓', '👨‍🎨', '👩‍🔬', '🧑‍💼', '👨‍🚀', '👩‍⚕️', '🧙‍♂️', '🧙‍♀️', '🦸‍♂️', '🦸‍♀️']

interface OnboardingProps {
    onComplete: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
    const [currentStep, setCurrentStep] = useState(1)
    const [direction, setDirection] = useState(1)
    const [isLoading, setIsLoading] = useState(false)

    // Form state
    const [username, setUsername] = useState('')
    const [selectedAvatar, setSelectedAvatar] = useState('👨‍💻')
    const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('light')
    const [notificationsEnabled, setNotificationsEnabled] = useState(false)

    const totalSteps = 4

    // Load user data on mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                const user = await authService.getCurrentUser()
                if (user?.user_metadata) {
                    if (user.user_metadata.username) setUsername(user.user_metadata.username)
                    if (user.user_metadata.avatar) setSelectedAvatar(user.user_metadata.avatar)
                }
            } catch (error) {
                console.error('Error loading user data:', error)
            }
        }
        loadUser()
    }, [])

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setDirection(1)
            setCurrentStep(currentStep + 1)
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setDirection(-1)
            setCurrentStep(currentStep - 1)
        }
    }

    const handleComplete = async () => {
        setIsLoading(true)
        try {
            // Save to Supabase
            const { error } = await supabase.from('profiles').update({
                username,
                avatar: selectedAvatar,
                theme: selectedTheme,
                updated_at: new Date().toISOString()
            }).eq('id', (await authService.getCurrentUser())?.id)

            if (error) {
                console.error('Error updating profile:', error)
                // Continue anyway to avoid blocking user
            }

            // Sync with localService (legacy/cache)
            localService.saveUserProfile({ name: username, avatar: selectedAvatar })
            localService.saveTheme(selectedTheme)
            document.documentElement.classList.toggle('dark', selectedTheme === 'dark')

            // Save notification settings
            if (notificationsEnabled) {
                try {
                    await notificationManager.requestPermission()
                    localService.saveNotificationSettings({ pushNotifications: true, audioAlarms: true })

                    // Send test notification
                    setTimeout(() => {
                        notificationManager.sendNotification(
                            'Welcome to AntiGravity! 🚀',
                            'We\'ll notify you about upcoming deadlines just like this.'
                        )
                    }, 500)
                } catch (e) {
                    console.error('Notification permission failed', e)
                }
            } else {
                localService.saveNotificationSettings({ pushNotifications: false, audioAlarms: false })
            }

            // Mark onboarding as complete specific to this user? 
            // For now, keep using browser storage but maybe we should store this in DB profile too?
            localStorage.setItem('antigravity_onboarding_complete', 'true')

            onComplete()
        } catch (error) {
            console.error('Onboarding error:', error)
            onComplete() // Fail safe: let them in
        } finally {
            setIsLoading(false)
        }
    }

    const canProceed = () => {
        if (currentStep === 1) return username.trim().length > 0
        return true
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0F5132] to-[#1e7e34] dark:from-gray-900 dark:to-gray-800"
        >
            <div className="w-full max-w-2xl mx-4">
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#0F5132] to-[#4ade80] p-8 text-white">
                        <h1 className="text-3xl font-bold mb-2">Welcome to your own dashboard</h1>
                        <p className="text-white/90 text-sm">Now get ready to conquer the world</p>
                    </div>

                    {/* Step Indicators */}
                    <div className="flex items-center justify-center gap-2 p-6 border-b border-gray-200 dark:border-gray-700">
                        {[1, 2, 3, 4].map((step, index) => (
                            <div key={step} className="flex items-center">
                                <motion.div
                                    animate={{
                                        scale: currentStep === step ? 1.2 : 1,
                                        backgroundColor: currentStep >= step ? '#0F5132' : '#e5e7eb'
                                    }}
                                    className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white"
                                >
                                    {currentStep > step ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <span className={currentStep >= step ? 'text-white' : 'text-gray-500'}>
                                            {step}
                                        </span>
                                    )}
                                </motion.div>
                                {index < 3 && (
                                    <motion.div
                                        animate={{
                                            backgroundColor: currentStep > step ? '#0F5132' : '#e5e7eb'
                                        }}
                                        className="w-12 h-1 mx-2 rounded"
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="relative h-[400px] overflow-hidden">
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={currentStep}
                                custom={direction}
                                initial={{ x: direction > 0 ? '100%' : '-100%', opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: direction > 0 ? '-50%' : '50%', opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="absolute inset-0 p-8"
                            >
                                {currentStep === 1 && (
                                    <StepOne
                                        username={username}
                                        setUsername={setUsername}
                                        selectedAvatar={selectedAvatar}
                                        setSelectedAvatar={setSelectedAvatar}
                                    />
                                )}
                                {currentStep === 2 && (
                                    <StepTwo
                                        selectedAvatar={selectedAvatar}
                                        setSelectedAvatar={setSelectedAvatar}
                                    />
                                )}
                                {currentStep === 3 && (
                                    <StepThree
                                        selectedTheme={selectedTheme}
                                        setSelectedTheme={setSelectedTheme}
                                    />
                                )}
                                {currentStep === 4 && (
                                    <StepFour
                                        notificationsEnabled={notificationsEnabled}
                                        setNotificationsEnabled={setNotificationsEnabled}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            className="text-gray-600 dark:text-gray-400"
                        >
                            Back
                        </Button>
                        <Button
                            onClick={currentStep === totalSteps ? handleComplete : handleNext}
                            disabled={!canProceed() || isLoading}
                            className="bg-[#0F5132] hover:bg-[#0d4228] text-white px-6"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Starting...
                                </span>
                            ) : (
                                currentStep === totalSteps ? 'Get Started! 🚀' : 'Continue'
                            )}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}

// Step Components
function StepOne({ username, setUsername, selectedAvatar }: any) {
    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">What should we call you?</h2>
                <p className="text-gray-600 dark:text-gray-400">Choose a name that motivates you</p>
            </div>

            <div className="max-w-sm mx-auto space-y-4">
                <div className="text-center text-6xl mb-4">{selectedAvatar}</div>
                <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your name..."
                    className="text-center text-lg h-12 dark:bg-gray-900 dark:text-white dark:border-gray-700"
                    autoFocus
                    maxLength={20}
                />
            </div>
        </div>
    )
}

function StepTwo({ selectedAvatar, setSelectedAvatar }: any) {
    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pick your avatar</h2>
                <p className="text-gray-600 dark:text-gray-400">Choose one that represents you</p>
            </div>

            <div className="grid grid-cols-6 gap-4 max-w-md mx-auto">
                {AVATARS.map((avatar) => (
                    <motion.button
                        key={avatar}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedAvatar(avatar)}
                        className={`text-4xl p-4 rounded-2xl transition-all ${selectedAvatar === avatar
                            ? 'bg-[#0F5132]/20 ring-4 ring-[#0F5132] scale-110'
                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        {avatar}
                    </motion.button>
                ))}
            </div>
        </div>
    )
}

function StepThree({ selectedTheme, setSelectedTheme }: any) {
    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Choose your theme</h2>
                <p className="text-gray-600 dark:text-gray-400">You can change this anytime in settings</p>
            </div>

            <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTheme('light')}
                    className={`p-8 rounded-2xl border-2 transition-all ${selectedTheme === 'light'
                        ? 'border-[#0F5132] bg-[#0F5132]/10 ring-4 ring-[#0F5132]/20'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        }`}
                >
                    <Sun className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                    <div className="text-xl font-semibold text-gray-900 dark:text-white">Light Mode</div>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTheme('dark')}
                    className={`p-8 rounded-2xl border-2 transition-all ${selectedTheme === 'dark'
                        ? 'border-[#0F5132] bg-[#0F5132]/10 ring-4 ring-[#0F5132]/20'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        }`}
                >
                    <Moon className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                    <div className="text-xl font-semibold text-gray-900 dark:text-white">Dark Mode</div>
                </motion.button>
            </div>
        </div>
    )
}

function StepFour({ notificationsEnabled, setNotificationsEnabled }: any) {
    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Enable notifications?</h2>
                <p className="text-gray-600 dark:text-gray-400">Get reminders for upcoming deadlines</p>
            </div>

            <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setNotificationsEnabled(true)}
                    className={`p-8 rounded-2xl border-2 transition-all ${notificationsEnabled
                        ? 'border-[#0F5132] bg-[#0F5132]/10 ring-4 ring-[#0F5132]/20'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        }`}
                >
                    <Bell className="w-16 h-16 mx-auto mb-4 text-green-500" />
                    <div className="text-xl font-semibold text-gray-900 dark:text-white">Yes, notify me</div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Stay on top of deadlines</p>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setNotificationsEnabled(false)}
                    className={`p-8 rounded-2xl border-2 transition-all ${!notificationsEnabled
                        ? 'border-[#0F5132] bg-[#0F5132]/10 ring-4 ring-[#0F5132]/20'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        }`}
                >
                    <BellOff className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                    <div className="text-xl font-semibold text-gray-900 dark:text-white">Not right now</div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Enable later in settings</p>
                </motion.button>
            </div>
        </div>
    )
}
