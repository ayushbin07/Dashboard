import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { User, Palette, Bell, Database, ChevronRight, LogOut } from "lucide-react"
import { localService } from "@/services/localService"

export default function Settings() {
    const [name, setName] = useState(() => localStorage.getItem("antigravity_username") || "")
    const [darkMode, setDarkMode] = useState(false)
    const [notifications, setNotifications] = useState(false)

    useEffect(() => {
        if (name) {
            localStorage.setItem("antigravity_username", name)
        }
    }, [name])

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
        <div
            className="max-w-5xl mx-auto space-y-10 pb-20"
        >
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-gray-900">Settings</h2>
                    <p className="text-gray-500 mt-2 text-lg">Manage your account and preferences.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Sidebar Navigation Styled Section (Visual Only for now as requested) */}
                <div className="hidden md:block col-span-3 space-y-2">
                    <nav className="flex flex-col gap-1 text-sm font-medium text-gray-600">
                        <button className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0F5132] text-white shadow-soft">
                            <User size={18} />
                            Profile
                        </button>
                        <button className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-100 transition-colors">
                            <Palette size={18} />
                            Appearance
                        </button>
                        <button className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-100 transition-colors">
                            <Bell size={18} />
                            Notifications
                        </button>
                        <button className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-100 transition-colors">
                            <Database size={18} />
                            Data
                        </button>
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="col-span-1 md:col-span-9 space-y-8">
                    {/* Profile Section */}
                    <Card className="p-8 rounded-[2rem] border-none shadow-soft hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#0F5132] text-xl font-bold">
                                    {name && name.length > 0 ? name[0].toUpperCase() : <User />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{name || "User"}</h3>
                                    <p className="text-gray-500">Update your photo and details</p>
                                </div>
                            </div>
                            <Button variant="secondary" className="rounded-xl border-gray-200 text-gray-600" size="sm">
                                Edit Profile
                            </Button>
                        </div>

                        <div className="grid gap-6 max-w-xl">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Display Name</label>
                                <Input
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#0F5132]/20 focus:ring-[#0F5132]/20"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Preferences Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-8 rounded-[2rem] border-none shadow-soft flex flex-col justify-between h-full bg-[#111827] text-white">
                            <div>
                                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                                    <Palette className="text-white" size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Dark Mode</h3>
                                <p className="text-gray-400 mb-6 text-sm">Reduce eye strain with a dark theme.</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">Enable</span>
                                <Switch
                                    checked={darkMode}
                                    onCheckedChange={setDarkMode}
                                    className="data-[state=checked]:bg-[#4ade80]"
                                />
                            </div>
                        </Card>

                        <Card className="p-8 rounded-[2rem] border-none shadow-soft flex flex-col justify-between h-full">
                            <div>
                                <div className="h-12 w-12 rounded-2xl bg-[#E8F5E9] flex items-center justify-center mb-6">
                                    <Bell className="text-[#0F5132]" size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Notifications</h3>
                                <p className="text-gray-500 mb-6 text-sm">Stay updated with your daily progress.</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900 text-sm">Allow Notifications</span>
                                <Switch
                                    checked={notifications}
                                    onCheckedChange={setNotifications}
                                    className="data-[state=checked]:bg-[#0F5132]"
                                />
                            </div>
                        </Card>
                    </div>

                    {/* Data Section */}
                    <Card className="p-8 rounded-[2rem] border-none shadow-soft">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                                <Database size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Data Management</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group" onClick={handleExportData}>
                                <div>
                                    <p className="font-semibold text-gray-900">Export Information</p>
                                    <p className="text-sm text-gray-500">Download your data as JSON</p>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <ChevronRight size={16} className="text-gray-400" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-2xl bg-red-50 hover:bg-red-100/50 transition-colors cursor-pointer group" onClick={handleClearData}>
                                <div>
                                    <p className="font-semibold text-red-600">Delete Account Data</p>
                                    <p className="text-sm text-red-400/80">Permanently remove all local data</p>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <LogOut size={16} className="text-red-500" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
