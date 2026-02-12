import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Menu } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { localService, type StreakData } from '@/services/localService'
import type { Task } from '@/types'

interface HeaderProps {
    onOpenSidebar?: () => void
}

export function Header({ onOpenSidebar }: HeaderProps) {
    const [profile, setProfile] = useState({ name: '', avatar: '👨‍💻' })
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [tasks, setTasks] = useState<Task[]>([])
    const [streak, setStreak] = useState<StreakData>({ count: 0, lastCheckIn: '', status: 'broken' })
    const searchInputRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const loadProfile = async () => {
            // Try load from local first for speed
            const localProfile = localService.getUserProfile()
            if (localProfile && localProfile.name) {
                setProfile(localProfile)
            }

            // Then sync from DB
            try {
                const user = await import('@/services/authService').then(m => m.authService.getCurrentUser())
                if (user) {
                    const { data } = await import('@/services/authService').then(m => m.supabase
                        .from('profiles')
                        .select('username, avatar')
                        .eq('id', user.id)
                        .single()
                    )

                    if (data) {
                        const dbProfile = { name: data.username || '', avatar: data.avatar || '👨‍💻' }
                        setProfile(dbProfile)
                        // Update local cache
                        localService.saveUserProfile(dbProfile)
                    }

                    // Sync Streak from DB
                    const { dbService } = await import('@/services/dbService')
                    const newStreak = await dbService.checkAndIncrementStreak()
                    if (newStreak) {
                        setStreak({
                            count: newStreak.count,
                            status: newStreak.status as any,
                            lastCheckIn: new Date().toISOString()
                        })
                    }
                }
            } catch (error) {
                console.error('Error loading profile from DB:', error)
            }
        }

        loadProfile()
        setTasks(localService.getTasks())

        window.addEventListener('profile-updated', loadProfile)
        return () => window.removeEventListener('profile-updated', loadProfile)
    }, [])

    useEffect(() => {
        if (searchQuery.trim().length > 1) {
            const tasks = localService.getTasks()
            const filtered = tasks.filter((t: any) =>
                t.title?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setSearchResults(filtered.slice(0, 5))
            setIsSearching(true)
        } else {
            setSearchResults([])
            setIsSearching(false)
        }
    }, [searchQuery])

    const handleResultClick = (date: string | Date) => {
        setSearchQuery('')
        setIsSearching(false)
        navigate('/calendar', { state: { selectedDate: date } })
    }

    // Keyboard shortcut: Ctrl+K or Cmd+K to focus search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                searchInputRef.current?.focus()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Get deadline notifications
    const getDeadlineNotifications = () => {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        return tasks
            .filter(task => task.status === 'pending' && task.dueDate)
            .map(task => {
                const dueDate = new Date(task.dueDate)
                if (isNaN(dueDate.getTime())) return null

                const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())
                const diffTime = dueDateOnly.getTime() - today.getTime()
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                return {
                    task,
                    dueDate: dueDateOnly,
                    diffDays,
                    isOverdue: diffDays < 0,
                    isDueToday: diffDays === 0,
                    isDueSoon: diffDays > 0 && diffDays <= 3
                }
            })
            .filter((n): n is NonNullable<typeof n> => n !== null && (n.isOverdue || n.isDueToday || n.isDueSoon))
            .sort((a, b) => a.diffDays - b.diffDays)
    }

    const notifications = getDeadlineNotifications()
    const hasNotifications = notifications.length > 0

    return (
        <header className="fixed top-6 left-4 right-4 lg:left-0 lg:right-0 max-w-5xl mx-auto rounded-full bg-white/40 dark:bg-[#1f2937]/40 backdrop-blur-[50px] shadow-soft border border-white/20 dark:border-gray-700 z-50 px-2 py-2 h-16 transition-all duration-300 ease-out hover:shadow-xl hover:bg-white/50 dark:hover:bg-[#1f2937]/50">
            <div className="flex h-full items-center justify-between px-2">

                {/* Left: Mobile Menu + Search */}
                <div className="flex items-center w-full max-w-sm gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden shrink-0 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                        onClick={onOpenSidebar}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    <div className="relative w-full group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center transition-colors group-focus-within:bg-[#0F5132]/10 dark:group-focus-within:bg-[#4ade80]/20">
                            <Search className="h-4 w-4 text-gray-500 dark:text-gray-400 group-focus-within:text-[#0F5132] dark:group-focus-within:text-[#4ade80]" />
                        </div>
                        <Input
                            ref={searchInputRef}
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchQuery.length > 1 && setIsSearching(true)}
                            className="pl-12 h-12 bg-gray-50/50 dark:bg-gray-800/50 border-transparent dark:border-transparent rounded-full focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#0F5132]/10 dark:focus:ring-[#4ade80]/20 transition-all font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-40">
                            <span className="text-[10px] font-bold bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600">⌘ K</span>
                        </div>

                        {/* Search Results Dropdown */}
                        {isSearching && (
                            <div className="absolute top-14 left-0 right-0 bg-white dark:bg-[#1f2937] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-[60] py-2">
                                {searchResults.length > 0 ? (
                                    <>
                                        <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tasks Found</p>
                                        {searchResults.map((task: any) => (
                                            <div
                                                key={task.id}
                                                onClick={() => handleResultClick(task.dueDate)}
                                                className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer flex flex-col transition-colors group"
                                            >
                                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[#0F5132] dark:group-hover:text-[#4ade80]">{task.title}</span>
                                                <span className="text-[10px] text-gray-400">{new Date(task.dueDate).toLocaleDateString()}</span>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="px-4 py-4 text-center">
                                        <p className="text-sm text-gray-500">No matching tasks found</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {isSearching && (
                            <div
                                className="fixed inset-0 z-[-1]"
                                onClick={() => setIsSearching(false)}
                            />
                        )}
                    </div>
                </div>

                {/* Right: Actions & Profile */}
                <div className="flex items-center gap-3 pr-2">

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 pr-3 border-r border-gray-100 dark:border-gray-700 relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="rounded-full h-10 w-10 bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md hover:text-[#0F5132] dark:hover:text-[#4ade80] transition-all relative text-gray-500 dark:text-gray-400"
                        >
                            <Bell className="h-5 w-5" />
                            {hasNotifications && (
                                <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
                            )}
                        </Button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute top-14 right-0 w-80 bg-white dark:bg-[#1f2937] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-[60] py-2">
                                {notifications.length > 0 ? (
                                    <>
                                        <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Deadlines</p>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.map(({ task, diffDays, isOverdue, isDueToday }) => (
                                                <div
                                                    key={task.id}
                                                    onClick={() => {
                                                        setShowNotifications(false)
                                                        navigate('/tasks')
                                                    }}
                                                    className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors border-l-4 ${isOverdue ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10' :
                                                        isDueToday ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-900/10' :
                                                            'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-2 h-2 rounded-full mt-2 ${isOverdue ? 'bg-red-500' :
                                                            isDueToday ? 'bg-orange-500' :
                                                                'bg-blue-500'
                                                            }`} />
                                                        <div className="flex-1">
                                                            <div className={`font-semibold text-sm ${isOverdue ? 'text-red-600 dark:text-red-400' :
                                                                'text-gray-900 dark:text-white'
                                                                }`}>
                                                                {task.title}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                {task.category}
                                                            </div>
                                                            <div className={`text-[10px] font-bold mt-1 ${isOverdue ? 'text-red-500' :
                                                                isDueToday ? 'text-orange-500' :
                                                                    'text-blue-500'
                                                                }`}>
                                                                {isOverdue ? `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue` :
                                                                    isDueToday ? 'Due today' :
                                                                        `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="px-4 py-6 text-center">
                                        <p className="text-sm text-gray-500">No upcoming deadlines</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {showNotifications && (
                            <div
                                className="fixed inset-0 z-[-1]"
                                onClick={() => setShowNotifications(false)}
                            />
                        )}
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

                        {/* Streak Fire Icon */}
                        {streak.count > 0 && (
                            <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                                <span
                                    className="transition-all duration-300"
                                    style={{
                                        fontSize:
                                            streak.status === 'active' ? '1.5rem' :
                                                streak.status === 'grace1' ? '1.2rem' :
                                                    streak.status === 'grace2' ? '0.9rem' : '0rem',
                                        opacity:
                                            streak.status === 'active' ? 1 :
                                                streak.status === 'grace1' ? 0.8 :
                                                    streak.status === 'grace2' ? 0.6 : 0
                                    }}
                                >
                                    🔥
                                </span>
                                <span className="text-xs font-bold text-orange-500 dark:text-orange-400">
                                    {streak.count}
                                </span>
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </header>
    )
}
