import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Calendar, FileText, Settings, HelpCircle, LayoutGrid, Smartphone, Box, LogOut, X, Bug } from "lucide-react"
import { cn } from "@/lib/utils"
import { authService } from '@/services/authService'
import { Button } from '@/components/ui/button'

interface SidebarProps {
    isOpen?: boolean
    onClose?: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const location = useLocation()
    const navigate = useNavigate()
    const pathname = location.pathname

    const handleLogout = async () => {
        try {
            await authService.signOut()
            navigate('/login')
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    const handleNavClick = () => {
        if (onClose) onClose()
    }

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                "fixed left-6 top-6 bottom-6 w-64 bg-white/40 dark:bg-[#1f2937]/40 backdrop-blur-[50px] dark:border-gray-800 rounded-[2rem] border border-gray-100 shadow-xl flex flex-col justify-between p-6 transition-all duration-300 z-50",
                // Visibility
                isOpen ? "translate-x-0" : "-translate-x-[200%] lg:translate-x-0",
                // On large screens, always show and reset transform
                "lg:flex"
            )}>
                <div>
                    {/* Logo & Close */}
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#0F5132] flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-white rounded-full" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-[#0F5132]">Dashboard</span>
                        </div>
                        {/* Mobile Close Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden -mr-2 text-gray-400 hover:text-gray-600"
                            onClick={onClose}
                        >
                            <X size={20} />
                        </Button>
                    </div>

                    {/* Menu */}
                    <div className="space-y-8">
                        <div>
                            <p className="text-xs font-bold text-gray-400 mb-4 px-3">MENU</p>
                            <nav className="space-y-2">
                                <NavItem icon={LayoutGrid} label="Dashboard" to="/" active={pathname === '/'} onClick={handleNavClick} />
                                <NavItem icon={Box} label="Tasks" to="/tasks" active={pathname === '/tasks'} onClick={handleNavClick} />
                                <NavItem icon={Calendar} label="Calendar" to="/calendar" active={pathname === '/calendar'} onClick={handleNavClick} />
                                <NavItem icon={FileText} label="Notes" to="/notes" active={pathname === '/notes'} onClick={handleNavClick} />
                            </nav>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-gray-400 mb-4 px-3">GENERAL</p>
                            <nav className="space-y-2">
                                <NavItem icon={Settings} label="Settings" to="/settings" active={pathname === '/settings'} onClick={handleNavClick} />
                                <NavItem icon={HelpCircle} label="Help" to="/help" active={pathname === '/help'} onClick={handleNavClick} />
                                <NavItem
                                    icon={Bug}
                                    label="Report Bug"
                                    onClick={() => {
                                        window.open('https://wa.me/9779812294101', '_blank')
                                        handleNavClick()
                                    }}
                                />
                                <NavItem icon={LogOut} label="Logout" onClick={() => { handleLogout(); handleNavClick(); }} className="text-red-500 hover:text-red-600 hover:bg-red-50" />
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Bottom Card */}
                <div className="bg-[#051F15] rounded-[2rem] p-5 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-3">
                            <Smartphone size={16} />
                        </div>
                        <h4 className="font-semibold text-sm mb-1">Developed by Ayush</h4>
                        <p className="text-[10px] text-gray-400 mb-4">Get in touch with me</p>
                        <a
                            href="https://portfolio-theta-seven-dgkady8ks1.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full"
                        >
                            <button className="w-full py-2 bg-[#0F5132] rounded-xl text-xs font-medium hover:bg-[#156a42] transition-colors">
                                Contact
                            </button>
                        </a>
                    </div>
                    {/* Decoration */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#0F5132] rounded-full blur-2xl -mr-10 -mt-10 opacity-50" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#0F5132] rounded-full blur-2xl -ml-10 -mb-10 opacity-50" />
                </div>
            </aside>
        </>
    )
}

interface NavItemProps {
    icon: any
    label: string
    active?: boolean
    badge?: string
    to?: string
    onClick?: () => void
    className?: string
}

function NavItem({ icon: Icon, label, active, badge, to, onClick, className }: NavItemProps) {
    const content = (
        <>
            <div className="flex items-center gap-3">
                <Icon size={20} className={cn(active ? "stroke-[2.5px]" : "stroke-2")} />
                <span className={cn("text-sm font-medium", active && "font-bold")}>{label}</span>
            </div>
            {active && <div className="w-1 h-6 bg-[#0F5132] rounded-full absolute left-0" />}
            {badge && (
                <span className="text-[10px] font-bold bg-[#0F5132] text-white px-1.5 py-0.5 rounded-md">
                    {badge}
                </span>
            )}
        </>
    )

    if (to) {
        return (
            <Link
                to={to}
                onClick={onClick}
                className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group relative",
                    active ? "text-[#0F5132]" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50",
                    className
                )}
            >
                {content}
            </Link>
        )
    }

    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group relative",
                active ? "text-[#0F5132]" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50",
                className
            )}
        >
            {content}
        </button>
    )
}
