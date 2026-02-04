import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Sparkles } from 'lucide-react'

interface FeedbackItem {
    id: string
    comment: string
    username: string
    avatar: string
    created_at: string
}

interface FeedbackMarqueeProps {
    feedbackItems: FeedbackItem[]
}

export function FeedbackMarquee({ feedbackItems }: FeedbackMarqueeProps) {
    const [topRow, setTopRow] = useState<FeedbackItem[]>([])
    const [bottomRow, setBottomRow] = useState<FeedbackItem[]>([])

    useEffect(() => {
        // Split feedback into two rows
        const mid = Math.ceil(feedbackItems.length / 2)
        setTopRow(feedbackItems.slice(0, mid))
        setBottomRow(feedbackItems.slice(mid))
    }, [feedbackItems])

    if (feedbackItems.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No feedback yet. Be the first to share your thoughts!</p>
            </div>
        )
    }

    // Create extended arrays for better screen coverage
    const extendedTopRow = [...topRow, ...topRow, ...topRow, ...topRow]
    const extendedBottomRow = [...bottomRow, ...bottomRow, ...bottomRow, ...bottomRow]

    return (
        <div className="space-y-6 overflow-hidden">
            {/* Top Row - Left to Right */}
            <div className="relative flex overflow-hidden">
                <motion.div
                    className="flex gap-4 whitespace-nowrap"
                    animate={{
                        x: ['0%', '-50%']
                    }}
                    transition={{
                        x: {
                            duration: 15,
                            repeat: Infinity,
                            ease: 'linear'
                        }
                    }}
                >
                    {[...extendedTopRow, ...extendedTopRow].map((item, index) => (
                        <FeedbackCard key={`top-${item.id}-${index}`} item={item} />
                    ))}
                </motion.div>
            </div>

            {/* Bottom Row - Right to Left */}
            <div className="relative flex overflow-hidden">
                <motion.div
                    className="flex gap-4 whitespace-nowrap"
                    animate={{
                        x: ['-50%', '0%']
                    }}
                    transition={{
                        x: {
                            duration: 15,
                            repeat: Infinity,
                            ease: 'linear'
                        }
                    }}
                >
                    {[...extendedBottomRow, ...extendedBottomRow].map((item, index) => (
                        <FeedbackCard key={`bottom-${item.id}-${index}`} item={item} />
                    ))}
                </motion.div>
            </div>
        </div>
    )
}

function FeedbackCard({ item }: { item: FeedbackItem }) {
    return (
        <div className="inline-block min-w-[320px] max-w-[320px] bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border border-gray-100 dark:border-gray-700 my-2">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-xl">
                        {item.avatar}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.username}</p>
                        <Sparkles className="w-3 h-3 text-emerald-500" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 whitespace-normal">
                        {item.comment}
                    </p>
                </div>
            </div>
        </div>
    )
}
