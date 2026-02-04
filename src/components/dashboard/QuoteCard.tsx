import { Card } from '@/components/ui/card'
import { Quote } from 'lucide-react'

export function QuoteCard() {
    return (
        <Card className="p-6 rounded-[2rem] border-none shadow-soft bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 relative overflow-hidden transition-all duration-300 hover:shadow-lg">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Quote size={80} className="text-emerald-500 transform rotate-12" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <Quote className="text-emerald-500 w-8 h-8 mb-2" />
                <blockquote className="text-lg md:text-xl font-medium text-gray-800 dark:text-gray-100 italic leading-relaxed font-serif">
                    "Success is not final, failure is not fatal: it is the courage to continue that counts."
                </blockquote>
                <cite className="text-sm font-bold text-emerald-600 dark:text-emerald-400 not-italic tracking-wide uppercase">
                    — Winston Churchill
                </cite>
            </div>
        </Card>
    )
}
