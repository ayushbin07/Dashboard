import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Settings, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export function Header() {
    const [greeting, setGreeting] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const hour = new Date().getHours()
        if (hour < 12) setGreeting('Good Morning')
        else if (hour < 18) setGreeting('Good Afternoon')
        else setGreeting('Good Evening')
    }, [])

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">

                {/* Left: Dynamic Greeting */}
                <div className="flex items-center gap-2">
                    <motion.h1
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-lg font-semibold text-gray-900 tracking-tight cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        {greeting}
                    </motion.h1>
                </div>

                {/* Center: Search Bar */}
                <div className="hidden md:flex max-w-md w-full mx-4">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search tasks, tags, or notes..."
                            className="pl-10 bg-white/50 focus:bg-white border-transparent focus:border-gray-200"
                        />
                    </div>
                </div>

                {/* Right: Utility Icons */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                        <SlidersHorizontal className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
                        <Settings className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </header>
    )
}
