import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"

interface Friend {
    id: string
    username: string
    avatar: string
    streak: number
    todayProgress: number // 0-100
}

export function FriendsList() {
    const [friends, setFriends] = useState<Friend[]>([])
    const [isAdding, setIsAdding] = useState(false)
    const [username, setUsername] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Load friends from database on mount
    useEffect(() => {
        loadFriends()
    }, [])

    const loadFriends = async () => {
        try {
            const { dbService } = await import('@/services/dbService')
            const friendProfiles = await dbService.getFriends()

            // For each friend, get their streak and progress
            const friendsWithData = await Promise.all(
                friendProfiles.map(async (profile) => {
                    try {
                        const { supabase } = await import('@/services/authService')

                        // Get streak (fallback if RLS blocks this specific table)
                        const { data: streakData } = await supabase
                            .from('streak_data')
                            .select('count')
                            .eq('user_id', profile.id)
                            .maybeSingle()

                        // Get progress
                        const todayProgress = await dbService.getUserTodayProgress(profile.id)

                        return {
                            id: profile.id,
                            username: profile.username,
                            avatar: profile.avatar,
                            streak: streakData?.count || 0,
                            todayProgress
                        }
                    } catch (memberErr) {
                        console.error(`Error loading data for friend ${profile.username}:`, memberErr)
                        return {
                            id: profile.id,
                            username: profile.username,
                            avatar: profile.avatar,
                            streak: 0,
                            todayProgress: 0
                        }
                    }
                })
            )

            setFriends(friendsWithData)
        } catch (err) {
            console.error('Error loading friends:', err)
        }
    }

    const handleAddFriend = async () => {
        if (!username.trim()) {
            setError('Please enter a username')
            return
        }

        setLoading(true)
        setError('')

        try {
            const { dbService } = await import('@/services/dbService')
            const { supabase } = await import('@/services/authService')

            // Step 1: Find the user by username
            const { data: profiles, error: searchError } = await supabase
                .from('profiles')
                .select('id, username, avatar')
                .ilike('username', username.trim())
                .limit(1)

            if (searchError) {
                console.error('Search error:', searchError)
                setError('Error searching for user')
                setLoading(false)
                return
            }

            if (!profiles || profiles.length === 0) {
                setError(`User "${username.trim()}" not found`)
                setLoading(false)
                return
            }

            const userProfile = profiles[0]

            // Step 2: Check if trying to add yourself
            const { data: { user } } = await supabase.auth.getUser()
            if (user && userProfile.id === user.id) {
                setError('Cannot add yourself as a friend')
                setLoading(false)
                return
            }

            // Step 3: Check if already friends (in local state)
            if (friends.some(f => f.id === userProfile.id)) {
                setError('Already friends with this user')
                setLoading(false)
                return
            }

            // Step 4: Check if already friends (in database)
            const { data: existingFriend } = await supabase
                .from('friends')
                .select('id')
                .eq('user_id', user?.id)
                .eq('friend_id', userProfile.id)
                .maybeSingle()

            if (existingFriend) {
                setError('Already friends with this user')
                // Reload friends to sync state
                await loadFriends()
                setLoading(false)
                return
            }

            // Step 5: Add to database
            const { error: insertError } = await supabase
                .from('friends')
                .insert({
                    user_id: user?.id,
                    friend_id: userProfile.id
                })

            if (insertError) {
                // Handle duplicate key error specifically
                if (insertError.code === '23505') {
                    setError('Already friends with this user')
                    await loadFriends()
                } else {
                    throw insertError
                }
                setLoading(false)
                return
            }

            // Step 6: Get streak data
            const { data: streakData } = await supabase
                .from('streak_data')
                .select('count')
                .eq('user_id', userProfile.id)
                .maybeSingle()

            // Step 7: Get today's progress
            const todayProgress = await dbService.getUserTodayProgress(userProfile.id)

            // Step 8: Add to local state
            const newFriend: Friend = {
                id: userProfile.id,
                username: userProfile.username,
                avatar: userProfile.avatar || '🧑',
                streak: streakData?.count || 0,
                todayProgress
            }

            setFriends(prev => [...prev, newFriend])
            setUsername('')
            setIsAdding(false)
            setError('')
        } catch (err: any) {
            console.error('Error adding friend:', err)
            setError(err.message || 'Failed to add friend')
        } finally {
            setLoading(false)
        }
    }

    const removeFriend = async (id: string) => {
        try {
            const { dbService } = await import('@/services/dbService')
            await dbService.removeFriend(id)
            setFriends(prev => prev.filter(f => f.id !== id))
        } catch (err) {
            console.error('Error removing friend:', err)
        }
    }

    return (
        <Card className="p-6 rounded-[2rem] border-none shadow-soft bg-white dark:bg-[#1f2937] transition-all duration-300 hover:shadow-xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Friends</h3>
                {!isAdding && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsAdding(true)}
                        className="h-8 w-8 p-0 rounded-full"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mb-4 overflow-hidden"
                    >
                        <div className="flex flex-col gap-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                            <div className="flex gap-2">
                                <Input
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value)
                                        setError('')
                                    }}
                                    placeholder="Enter username..."
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddFriend()}
                                    autoFocus
                                    disabled={loading}
                                    className="bg-white dark:bg-gray-900 dark:text-white dark:border-gray-700"
                                />
                                <Button size="sm" onClick={handleAddFriend} disabled={loading}>
                                    {loading ? (
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <UserPlus className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => {
                                    setIsAdding(false)
                                    setError('')
                                    setUsername('')
                                }} disabled={loading}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            {error && (
                                <p className="text-xs text-red-500 dark:text-red-400 px-1">{error}</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {friends.length === 0 && !isAdding ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                    <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>No friends added yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    <AnimatePresence>
                        {friends.map((friend) => (
                            <motion.div
                                key={friend.id}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="relative group"
                            >
                                <div className="aspect-square bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-4 flex flex-col items-center justify-center border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
                                    {/* Remove button */}
                                    <button
                                        onClick={() => removeFriend(friend.id)}
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>

                                    {/* Avatar */}
                                    <div className="text-4xl mb-2">{friend.avatar}</div>

                                    {/* Username */}
                                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100 text-center truncate w-full">
                                        {friend.username}
                                    </div>

                                    {/* Streak */}
                                    <div className="flex items-center gap-1 mt-2">
                                        <span className="text-xl">🔥</span>
                                        <span className="text-xs font-bold text-orange-500 dark:text-orange-400">
                                            {friend.streak}
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full mt-3">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] text-gray-400">Today</span>
                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                {friend.todayProgress}%
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-500",
                                                    friend.todayProgress >= 80 ? "bg-emerald-500" :
                                                        friend.todayProgress >= 50 ? "bg-yellow-500" :
                                                            "bg-red-500"
                                                )}
                                                style={{ width: `${friend.todayProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </Card>
    )
}
