import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { localService } from '@/services/localService'

export function Header() {
    const [profile, setProfile] = useState({ name: '', avatar: '👨‍💻' })
    const navigate = useNavigate()

    useEffect(() => {
        const loadProfile = () => {
            const p = localService.getUserProfile()
            setProfile(p)
        }

        loadProfile()

        // Listen for profile updates from Settings page
        window.addEventListener('profile-updated', loadProfile)
        return () => window.removeEventListener('profile-updated', loadProfile)
    }, [])

    return (
        <header className="fixed top-6 left-0 right-0 max-w-5xl mx-auto rounded-full bg-white/90 dark:bg-[#1f2937]/90 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-gray-700 z-50 px-2 py-2 h-16 transition-all duration-300 ease-out hover:shadow-3xl hover:bg-white/95 dark:hover:bg-[#1f2937]/95">
            <div className="flex h-full items-center justify-between px-2">

                {/* Left: Search Bar (Pill) */}
                <div className="flex items-center w-full max-w-sm">
                    <div className="relative w-full group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center transition-colors group-focus-within:bg-[#0F5132]/10 dark:group-focus-within:bg-[#4ade80]/20">
                            <Search className="h-4 w-4 text-gray-500 dark:text-gray-400 group-focus-within:text-[#0F5132] dark:group-focus-within:text-[#4ade80]" />
                        </div>
                        <Input
                            placeholder="Search tasks..."
                            className="pl-12 h-12 bg-gray-50/50 dark:bg-gray-800/50 border-transparent dark:border-transparent rounded-full focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#0F5132]/10 dark:focus:ring-[#4ade80]/20 transition-all font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-40">
                            <span className="text-[10px] font-bold bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600">⌘ K</span>
                        </div>
                    </div>
                </div>

                {/* Right: Actions & Profile */}
                <div className="flex items-center gap-3 pr-2">

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 pr-3 border-r border-gray-100 dark:border-gray-700">
                        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md hover:text-[#0F5132] dark:hover:text-[#4ade80] transition-all text-gray-500 dark:text-gray-400">
                            <Mail className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md hover:text-[#0F5132] dark:hover:text-[#4ade80] transition-all relative text-gray-500 dark:text-gray-400">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
                        </Button>
                    </div>

                    {/* User Profile */}
                    <div
                        className="flex items-center gap-3 pl-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full pr-4 py-1 transition-colors group"
                        onClick={() => navigate('/settings')}
                    >
                        <div className="h-10 w-10 rounded-full bg-[#E8F5E9] border-2 border-white dark:border-gray-700 shadow-sm flex items-center justify-center text-xl">
                            {profile.avatar}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-200 leading-none group-hover:text-[#0F5132] dark:group-hover:text-[#4ade80] transition-colors">{profile.name || "Guest User"}</span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium leading-tight">View Profile</span>
                        </div>
                    </div>

                </div>
            </div>
        </header>
    )
}
