import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Palette, Bell, Database, ChevronRight, LogOut } from "lucide-react"
import { localService } from "@/services/localService"

export default function Settings() {
    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState('👨‍💻')
    const [darkMode, setDarkMode] = useState(false)
    const [notifications, setNotifications] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const profile = localService.getUserProfile()
        if (profile.name) setName(profile.name)
        if (profile.avatar) setAvatar(profile.avatar)

        setDarkMode(localService.getTheme() === 'dark')

        setIsLoaded(true)
    }, [])

    const handleSaveProfile = () => {
        if (!isLoaded) return
        localService.saveUserProfile({ name, avatar })
        // Optional: Trigger a custom event or reload to update header instantly if not using context
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

    const handleClearData = () => {
        if (window.confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
            localStorage.clear()
            window.location.reload()
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
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

                    {/* Notifications */}
                    <Card className="p-6 rounded-[2rem] border-none shadow-soft bg-white dark:bg-[#1f2937] transition-colors duration-300 flex flex-col justify-between min-h-[160px]">
                        <div>
                            <div className="h-10 w-10 rounded-full bg-[#E8F5E9] dark:bg-[#0F5132]/20 flex items-center justify-center mb-4 text-[#0F5132] dark:text-[#4ade80]">
                                <Bell size={20} />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Notifications</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Stay updated with your daily progress.</p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Notifications</span>
                            <Switch
                                checked={notifications}
                                onCheckedChange={setNotifications}
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
                            <p className="text-xs text-gray-500 dark:text-gray-400">Manage your local storage data.</p>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button variant="secondary" size="sm" onClick={handleExportData} className="text-xs dark:bg-transparent dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800">
                                <ChevronRight size={14} className="mr-1" /> Export
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleClearData} className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/10 dark:hover:text-red-300">
                                <LogOut size={14} className="mr-1" /> Reset
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
