import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Palette, Bell, Database, ChevronRight, LogOut, AlertTriangle, X } from "lucide-react"
import { localService } from "@/services/localService"
import { dbService } from "@/services/dbService"
import { supabase } from "@/services/authService"
import { motion, AnimatePresence } from "framer-motion"

export default function Settings() {
    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState('👨‍💻')
    const [darkMode, setDarkMode] = useState(false)
    const [pushNotifications, setPushNotifications] = useState(true)
    const [audioAlarms, setAudioAlarms] = useState(true)
    const [isLoaded, setIsLoaded] = useState(false)

    // Reset Data Modal State
    const [showResetModal, setShowResetModal] = useState(false)
    const [password, setPassword] = useState('')
    const [resetLoading, setResetLoading] = useState(false)
    const [resetError, setResetError] = useState('')

    useEffect(() => {
        const profile = localService.getUserProfile()
        if (profile.name) setName(profile.name)
        if (profile.avatar) setAvatar(profile.avatar)

        setDarkMode(localService.getTheme() === 'dark')

        const notifSettings = localService.getNotificationSettings()
        setPushNotifications(notifSettings.pushNotifications)
        setAudioAlarms(notifSettings.audioAlarms)

        setIsLoaded(true)
    }, [])

    const handleSaveProfile = () => {
        if (!isLoaded) return
        localService.saveUserProfile({ name, avatar })
        window.dispatchEvent(new Event('profile-updated'))
    }

    // Auto-save on change
    useEffect(() => {
        if (isLoaded) {
            handleSaveProfile()
        }
    }, [name, avatar, isLoaded])

    const AVATARS = ['👨‍💻', '👩‍🚀', '🦁', '🐼', '⚡', '🤖', '🦊', '🦉']

    const handleExportData = () => {
        // Exporting local data for now, could be updated to fetch from DB
        const data = {
            tasks: localService.getTasks(),
            habits: localService.getHabits(),
            user: { name },
            timestamp: new Date().toISOString()
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `antigravity-backup-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const handleClearLocalCache = () => {
        if (window.confirm("Safe to clear: This will only clear your BROWSER cache. Your cloud data is safe. Continue?")) {
            localStorage.clear()
            window.location.reload()
        }
    }

    const handleResetDatabase = async () => {
        setResetError('')
        setResetLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user || !user.email) throw new Error("User not found")

            // Verify password
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: password
            })

            if (signInError) {
                setResetError('Incorrect password')
                setResetLoading(false)
                return
            }

            // Perform Reset
            await dbService.resetData()

            setShowResetModal(false)
            alert("Database reset successful. All your data has been cleared.")
            window.location.reload()
        } catch (error: any) {
            console.error(error)
            setResetError(error.message || "Failed to reset database")
        } finally {
            setResetLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 relative">
            {/* Header */}
            <div className="mb-2">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Settings</h2>
                <p className="text-gray-500 dark:text-gray-400">Manage your account and preferences.</p>
            </div>

            <div className="space-y-6">
                {/* Profile Section */}
                <Card className="p-8 rounded-[2rem] border-none shadow-soft bg-white dark:bg-[#1f2937] transition-colors duration-300">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="h-24 w-24 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-5xl border-4 border-white dark:border-gray-600 shadow-sm">
                            {avatar}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{name || 'Guest User'}</h3>
                            <p className="text-gray-500 dark:text-gray-400">Update your avatar and details</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Choose Avatar</label>
                            <div className="flex gap-3 flex-wrap">
                                {AVATARS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        onClick={() => setAvatar(emoji)}
                                        className={cn(
                                            "h-12 w-12 rounded-2xl flex items-center justify-center text-2xl transition-all hover:scale-110",
                                            avatar === emoji
                                                ? "bg-[#0F5132] text-white shadow-lg shadow-[#0F5132]/20 scale-110"
                                                : "bg-gray-50 dark:bg-gray-700 text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-600"
                                        )}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Display Name</label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                className="max-w-md bg-gray-50 dark:bg-gray-700/50 border-transparent dark:border-transparent focus:bg-white dark:focus:bg-gray-800 dark:text-white transition-all"
                            />
                        </div>
                    </div>
                </Card>

                {/* Preferences Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Dark Mode */}
                    <Card className="p-6 rounded-[2rem] border-none shadow-soft bg-white dark:bg-[#1f2937] transition-colors duration-300 flex flex-col justify-between min-h-[160px]">
                        <div>
                            <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 text-gray-900 dark:text-white">
                                <Palette size={20} />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Dark Mode</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Reduce eye strain with a dark theme.</p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable</span>
                            <Switch
                                checked={darkMode}
                                onCheckedChange={(checked) => {
                                    setDarkMode(checked)
                                    localService.saveTheme(checked ? 'dark' : 'light')
                                    window.dispatchEvent(new Event('theme-updated'))
                                }}
                            />
                        </div>
                    </Card>

                    {/* Push Notifications */}
                    <Card className="p-6 rounded-[2rem] border-none shadow-soft bg-white dark:bg-[#1f2937] transition-colors duration-300 flex flex-col justify-between min-h-[180px]">
                        <div>
                            <div className="h-10 w-10 rounded-full bg-[#E8F5E9] dark:bg-[#0F5132]/20 flex items-center justify-center mb-4 text-[#0F5132] dark:text-[#4ade80]">
                                <Bell size={20} />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Push Notifications</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Get browser notifications for upcoming deadlines.</p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable</span>
                            <Switch
                                checked={pushNotifications}
                                onCheckedChange={(checked) => {
                                    setPushNotifications(checked)
                                    localService.saveNotificationSettings({ pushNotifications: checked, audioAlarms })
                                }}
                            />
                        </div>
                    </Card>

                    {/* Audio Alarms */}
                    <Card className="p-6 rounded-[2rem] border-none shadow-soft bg-white dark:bg-[#1f2937] transition-colors duration-300 flex flex-col justify-between min-h-[180px]">
                        <div>
                            <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4 text-amber-600 dark:text-amber-500">
                                <Bell size={20} />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Audio Alarms</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Play an audio alert when tasks are due.</p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable</span>
                            <Switch
                                checked={audioAlarms}
                                onCheckedChange={(checked) => {
                                    setAudioAlarms(checked)
                                    localService.saveNotificationSettings({ pushNotifications, audioAlarms: checked })
                                }}
                            />
                        </div>
                    </Card>

                    {/* Data Management */}
                    <Card className="p-6 rounded-[2rem] border-none shadow-soft bg-white dark:bg-[#1f2937] transition-colors duration-300 flex flex-col justify-between min-h-[160px]">
                        <div>
                            <div className="h-10 w-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4 text-red-500">
                                <Database size={20} />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Data Management</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Manage your data storage (Local & Cloud).</p>
                        </div>
                        <div className="flex flex-col gap-2 mt-4">
                            <Button variant="secondary" size="sm" onClick={handleExportData} className="w-full justify-start text-xs dark:bg-transparent dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800">
                                <ChevronRight size={14} className="mr-1" /> Export Local Backup
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleClearLocalCache} className="w-full justify-start text-xs text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/10">
                                <LogOut size={14} className="mr-1" /> Clear Browser Cache
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setShowResetModal(true)} className="w-full justify-start text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 font-bold">
                                <AlertTriangle size={14} className="mr-1" /> Reset Cloud Database
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Reset Confirmation Modal */}
            <AnimatePresence>
                {showResetModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowResetModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-[#1f2937] rounded-[2rem] p-8 max-w-md w-full shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3 text-red-600 dark:text-red-500">
                                    <AlertTriangle size={32} />
                                    <h3 className="text-2xl font-bold">Danger Zone</h3>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setShowResetModal(false)} className="rounded-full">
                                    <X size={20} />
                                </Button>
                            </div>

                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                You are about to <span className="font-bold text-red-600">PERMANENTLY DELETE</span> all your Tasks and Habits from the database.
                                This action cannot be undone.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Enter your password to confirm
                                    </label>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Your Password"
                                        className="bg-gray-50 dark:bg-gray-700 dark:text-white"
                                    />
                                    {resetError && (
                                        <p className="text-xs text-red-500 mt-1">{resetError}</p>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button variant="secondary" className="flex-1" onClick={() => setShowResetModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                        onClick={handleResetDatabase}
                                        disabled={!password || resetLoading}
                                    >
                                        {resetLoading ? 'Deleting...' : 'Delete Everything'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
