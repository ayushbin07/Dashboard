import { Link, useLocation } from 'react-router-dom'
import { Calendar, Users, Settings, HelpCircle, LogOut, LayoutGrid, Smartphone, Box } from "lucide-react"
import { cn } from "@/lib/utils"

export function Sidebar() {
    const location = useLocation()
    const pathname = location.pathname

    return (
        <aside className="fixed left-6 top-6 bottom-6 w-64 bg-white dark:bg-[#1f2937] dark:border-gray-800 rounded-[2rem] border border-gray-100 shadow-xl flex flex-col justify-between p-6 z-60 hidden lg:flex transition-all duration-300">
            <div>
                {/* Logo */}
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-8 h-8 rounded-xl bg-[#0F5132] flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white rounded-full" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-[#0F5132]">Donezo</span>
                </div>

                {/* Menu */}
                <div className="space-y-8">
                    <div>
                        <p className="text-xs font-bold text-gray-400 mb-4 px-3">MENU</p>
                        <nav className="space-y-2">
                            <NavItem icon={LayoutGrid} label="Dashboard" to="/" active={pathname === '/'} />
                            <NavItem icon={Box} label="Tasks" badge="12+" />
                            <NavItem icon={Calendar} label="Calendar" />
                            <NavItem icon={Users} label="Team" />
                        </nav>
                    </div>

                    <div>
                        <p className="text-xs font-bold text-gray-400 mb-4 px-3">GENERAL</p>
                        <nav className="space-y-2">
                            <NavItem icon={Settings} label="Settings" to="/settings" active={pathname === '/settings'} />
                            <NavItem icon={HelpCircle} label="Help" />
                            <NavItem icon={LogOut} label="Logout" />
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
                    <h4 className="font-semibold text-sm mb-1">Download our Mobile App</h4>
                    <p className="text-[10px] text-gray-400 mb-4">Get easy in another way</p>
                    <button className="w-full py-2 bg-[#0F5132] rounded-xl text-xs font-medium hover:bg-[#156a42] transition-colors">
                        Download
                    </button>
                </div>
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#0F5132] rounded-full blur-2xl -mr-10 -mt-10 opacity-50" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#0F5132] rounded-full blur-2xl -ml-10 -mb-10 opacity-50" />
            </div>
        </aside>
    )
}

function NavItem({ icon: Icon, label, active, badge, to }: { icon: any, label: string, active?: boolean, badge?: string, to?: string }) {
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
            <Link to={to} className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group relative",
                active ? "text-[#0F5132]" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            )}>
                {content}
            </Link>
        )
    }

    return (
        <button className={cn(
            "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group relative",
            active ? "text-[#0F5132]" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
        )}>
            {content}
        </button>
    )
}
