import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { localService } from '@/services/localService'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BackgroundBlobs } from './BackgroundBlobs'

interface LayoutProps {
    children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
    const location = useLocation()
    const isDashboard = location.pathname === '/'
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    useEffect(() => {
        const applyTheme = () => {
            const theme = localService.getTheme()
            if (theme === 'dark') {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
        }

        applyTheme()
        window.addEventListener('theme-updated', applyTheme)
        return () => window.removeEventListener('theme-updated', applyTheme)
    }, [])



    return (
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#111827] text-primary dark:text-gray-100 font-sans transition-colors duration-300">
            <BackgroundBlobs />
            {/* Mobile Menu Toggle - Hide on Dashboard as Header handles it */}
            {!isDashboard && (
                <div className="lg:hidden fixed top-6 left-6 z-50">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="bg-white dark:bg-[#1f2937] border-gray-100 dark:border-gray-800 shadow-md rounded-xl"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            )}

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="lg:pl-64 min-h-screen flex flex-col transition-all duration-300 relative z-[1]">
                {isDashboard && <Header onOpenSidebar={() => setIsSidebarOpen(true)} />}
                <main className={`flex-1 p-8 ${isDashboard ? 'pt-24' : 'pt-20'} pb-8`}>
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
