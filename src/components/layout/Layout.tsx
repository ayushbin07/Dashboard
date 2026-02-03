import { useEffect } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { localService } from '@/services/localService'

interface LayoutProps {
    children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
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
            <Sidebar />
            <div className="lg:pl-64 min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 p-8 pt-24 pb-32">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
