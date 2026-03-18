import { useEffect, useState } from 'react'
import { MessageCircle, CheckCircle } from 'lucide-react'

interface FeedbackItem {
    id: string
    comment: string
    username: string
    avatar: string
    created_at: string
    tags?: string[]
}

interface FeedbackMarqueeProps {
    feedbackItems: FeedbackItem[]
    onAddFeedback?: () => void
    isLoading?: boolean
}

const StarRating = () => (
    <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
            <svg key={star} className="w-4 h-4 text-emerald-500 fill-emerald-500" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ))}
    </div>
)

export function FeedbackMarquee({ feedbackItems, onAddFeedback, isLoading }: FeedbackMarqueeProps) {
    const [topRow, setTopRow] = useState<FeedbackItem[]>([])
    const [bottomRow, setBottomRow] = useState<FeedbackItem[]>([])

    useEffect(() => {
        // Split feedback into two rows
        const mid = Math.ceil(feedbackItems.length / 2)
        setTopRow(feedbackItems.slice(0, mid))
        setBottomRow(feedbackItems.slice(mid))
    }, [feedbackItems])

    if (isLoading) {
        return (
            <div className="w-full py-24 flex flex-col items-center justify-center min-h-[350px]">
                <div className="relative group">
                    {/* Premium Ambient Glow */}
                    <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-110 transition-transform duration-500 group-hover:scale-125" />

                    <img
                        src="https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3amM5bHRlMmxqeXZwODVkbGlzOGp2MTZ5eDR3NnFjdDdpOXo5OHZzOSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/pVXyJy2k7WO1n49bGg/giphy.gif"
                        alt="Loading feedback..."
                        className="w-24 h-24 rounded-3xl object-cover shadow-2xl border border-gray-200 dark:border-gray-700 relative z-10 transition-all duration-300"
                    />
                </div>
                <p className="mt-8 text-sm font-semibold text-slate-600 dark:text-slate-400 tracking-wide animate-pulse">
                    Gathering latest thoughts...
                </p>
            </div>
        )
    }

    if (feedbackItems.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No feedback yet. Be the first to share your thoughts!</p>
            </div>
        )
    }

    // Mathematically ensure we have enough items to exceed ultra-wide resolutions
    // Then duplicate exactly once. This guarantees a seamless loop when translated by -50%
    const createSeamlessLoop = (arr: FeedbackItem[]) => {
        if (arr.length === 0) return []
        let copies = [...arr]
        // Base width assumption: min 10 items ensures > 3500px width per set
        while (copies.length < 10) {
            copies = [...copies, ...arr]
        }
        return [...copies, ...copies]
    }

    return (
        <div
            className="space-y-8 overflow-hidden relative w-full py-4 px-2 group"
            style={{
                maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
            }}
        >
            <style>{`
                @keyframes marquee-left {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes marquee-right {
                    0% { transform: translateX(-50%); }
                    100% { transform: translateX(0%); }
                }
                .animate-marquee-left {
                    animation: marquee-left ${Math.max(40, topRow.length * 15)}s linear infinite;
                }
                .animate-marquee-right {
                    animation: marquee-right ${Math.max(40, bottomRow.length * 15)}s linear infinite;
                }
            `}</style>

            {/* Top Row - Scrolling Left */}
            <div className="flex overflow-hidden">
                <div className="flex gap-6 w-max animate-marquee-left group-hover:[animation-play-state:paused]">
                    {topRow.length > 0 && createSeamlessLoop(topRow).map((item, index) => (
                        <FeedbackCard key={`top-${item.id}-${index}`} item={item} />
                    ))}
                </div>
            </div>

            {/* Bottom Row - Scrolling Right */}
            <div className="flex overflow-hidden">
                <div className="flex gap-6 w-max animate-marquee-right group-hover:[animation-play-state:paused]">
                    {bottomRow.length > 0 && createSeamlessLoop(bottomRow).map((item, index) => {
                        // Inject CTA card periodically into the bottom row if callback is provided
                        if (index === 2 && onAddFeedback) {
                            return (
                                <div key={`bottom-cta-${index}`} className="flex gap-6">
                                    <AddFeedbackCard onClick={onAddFeedback} />
                                    <FeedbackCard item={item} />
                                </div>
                            )
                        }
                        return <FeedbackCard key={`bottom-${item.id}-${index}`} item={item} />
                    })}
                </div>
            </div>
        </div>
    )
}

function FeedbackCard({ item }: { item: FeedbackItem }) {
    // Basic sentiment tags generation if none exist
    const defaultTags = item.comment.length > 50 ? ["Detailed"] : ["Quick Read"]
    const tags = item.tags || defaultTags

    return (
        <div className="inline-block flex-shrink-0 w-[350px] max-w-full bg-white/80 dark:bg-[#1f2937]/80 backdrop-blur-xl rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer transition-all duration-300 hover:shadow-xl hover:bg-white dark:hover:bg-[#1f2937]">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-xl text-white font-bold shadow-sm">
                        {item.avatar}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 dark:text-white text-base truncate">{item.username}</p>
                            <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full">
                                <CheckCircle className="w-3 h-3" /> Verified
                            </span>
                        </div>
                    </div>
                    <StarRating />
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-normal leading-relaxed max-w-[65ch] line-clamp-4 mb-3">
                        {item.comment}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-auto">
                        {tags.map((tag, i) => (
                            <span key={i} className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function AddFeedbackCard({ onClick }: { onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className="inline-block flex-shrink-0 w-[350px] max-w-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-emerald-500/20 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] flex flex-col items-center justify-center min-h-[160px] text-center"
        >
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-3">
                <MessageCircle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-1">Add Your Feedback</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-[200px]">
                Enjoying the dashboard? Let us know your thoughts!
            </p>
        </div>
    )
}
