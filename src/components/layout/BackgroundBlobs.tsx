import { useEffect, useState } from 'react'

/**
 * Generates random organic blobs that transport across the screen.
 * - Random sizes (100px - 350px)
 * - Random vibrant colors from app palette
 * - Random layer blur (10px - 40px) for depth
 * - Random transport animations (Horizontal, Vertical, Diagonal)
 */

const COLORS = [
    'radial-gradient(circle at 40% 40%, #fde68a, #f59e0b 60%, transparent 100%)', // Amber
    'radial-gradient(circle at 50% 50%, #67e8f9, #06b6d4 60%, transparent 100%)', // Cyan
    'radial-gradient(circle at 50% 50%, #6ee7b7, #10b981 60%, transparent 100%)', // Emerald
    'radial-gradient(circle at 50% 50%, #c4b5fd, #8b5cf6 60%, transparent 100%)', // Violet
    'radial-gradient(circle at 50% 50%, #fda4af, #f43f5e 60%, transparent 100%)', // Rose
    'radial-gradient(circle at 50% 50%, #93c5fd, #3b82f6 60%, transparent 100%)', // Blue
    'radial-gradient(circle at 50% 50%, #f0abfc, #d946ef 60%, transparent 100%)', // Fuchsia
    'radial-gradient(circle at 50% 50%, #5eead4, #14b8a6 60%, transparent 100%)', // Teal
]

const ANIMATIONS = [
    'blob-transport-h',
    'blob-transport-h-reverse',
    'blob-transport-v',
    'blob-transport-d',
]

interface BlobData {
    id: number
    size: number
    top: string
    left: string
    background: string
    opacity: number
    blur: number
    animation: string
    duration: number
    delay: number
}

export function BackgroundBlobs() {
    const [blobs, setBlobs] = useState<BlobData[]>([])

    useEffect(() => {
        // Generate 15 random blobs
        const newBlobs: BlobData[] = Array.from({ length: 15 }).map((_, i) => {
            const size = Math.floor(Math.random() * 250) + 100 // 100px - 350px
            const color = COLORS[Math.floor(Math.random() * COLORS.length)]
            const animation = ANIMATIONS[Math.floor(Math.random() * ANIMATIONS.length)]
            const duration = Math.floor(Math.random() * 40) + 40 // 40s - 80s
            const delay = Math.floor(Math.random() * -80) // start at random offsets

            // Random start positions (though transport animations override this largely, 
            // setting nice distribution helps for entries)
            const top = `${Math.floor(Math.random() * 100)}%`
            const left = `${Math.floor(Math.random() * 100)}%`

            // Varied opacity and blur for depth
            const opacity = (Math.random() * 0.2) + 0.3 // 0.3 - 0.5
            const blur = Math.floor(Math.random() * 30) + 10 // 10px - 40px

            return {
                id: i,
                size,
                top,
                left,
                background: color,
                opacity,
                blur,
                animation,
                duration,
                delay
            }
        })
        setBlobs(newBlobs)
    }, [])

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
            {blobs.map((blob) => (
                <div
                    key={blob.id}
                    className="absolute rounded-full"
                    style={{
                        width: `${blob.size}px`,
                        height: `${blob.size}px`,
                        top: blob.top,
                        left: blob.left,
                        background: blob.background,
                        opacity: blob.opacity,
                        filter: `blur(${blob.blur}px)`,
                        animation: `${blob.animation} ${blob.duration}s linear infinite`,
                        animationDelay: `${blob.delay}s`,
                    }}
                />
            ))}
        </div>
    )
}
