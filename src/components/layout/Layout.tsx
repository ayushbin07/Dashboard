import { Header } from './Header'

interface LayoutProps {
    children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-background text-primary selection:bg-accent/20">
            <Header />
            <main className="container mx-auto px-4 sm:px-6 py-8">
                {children}
            </main>
        </div>
    )
}
