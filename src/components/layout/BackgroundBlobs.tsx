import { useEffect, useRef } from 'react'

/**
 * Animated background blobs — moderate size, traversing the whole screen.
 */
export function BackgroundBlobs() {
    // No need for JS logic if using CSS animations for transport, but keeping ref just in case
    const containerRef = useRef<HTMLDivElement>(null)

    return (
        <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
            {/* Blob 1 – warm golden, moves horizontal L->R */}
            <div
                data-blob
                className="absolute rounded-full"
                style={{
                    width: '180px',
                    height: '180px',
                    top: '15%',
                    left: '0', // Start pos is handled by transform animation usually, but we set a baseline
                    background: 'radial-gradient(circle at 40% 40%, #fde68a, #f59e0b 60%, transparent 100%)',
                    opacity: 0.5,
                    filter: 'blur(10px)',
                    animation: 'blob-transport-h 45s linear infinite',
                }}
            />
            {/* Blob 2 – cool cyan, moves horizontal R->L */}
            <div
                data-blob
                className="absolute rounded-full"
                style={{
                    width: '220px',
                    height: '220px',
                    top: '60%',
                    right: '0',
                    background: 'radial-gradient(circle at 50% 50%, #67e8f9, #06b6d4 60%, transparent 100%)',
                    opacity: 0.45,
                    filter: 'blur(8px)',
                    animation: 'blob-transport-h-reverse 50s linear infinite',
                    animationDelay: '-5s'
                }}
            />
            {/* Blob 3 – emerald green, moves diagonal */}
            <div
                data-blob
                className="absolute rounded-full"
                style={{
                    width: '160px',
                    height: '160px',
                    top: '20%',
                    left: '20%',
                    background: 'radial-gradient(circle at 50% 50%, #6ee7b7, #10b981 60%, transparent 100%)',
                    opacity: 0.4,
                    filter: 'blur(10px)',
                    animation: 'blob-transport-d 60s linear infinite',
                    animationDelay: '-20s'
                }}
            />
            {/* Blob 4 – soft violet, moves vertical T->B */}
            <div
                data-blob
                className="absolute rounded-full"
                style={{
                    width: '140px',
                    height: '140px',
                    left: '75%',
                    top: '0',
                    background: 'radial-gradient(circle at 50% 50%, #c4b5fd, #8b5cf6 60%, transparent 100%)',
                    opacity: 0.38,
                    filter: 'blur(12px)',
                    animation: 'blob-transport-v 55s linear infinite',
                    animationDelay: '-10s'
                }}
            />
            {/* Blob 5 – rose pink, moves horizontal L->R slower */}
            <div
                data-blob
                className="absolute rounded-full"
                style={{
                    width: '150px',
                    height: '150px',
                    top: '85%',
                    left: '0',
                    background: 'radial-gradient(circle at 50% 50%, #fda4af, #f43f5e 60%, transparent 100%)',
                    opacity: 0.35,
                    filter: 'blur(10px)',
                    animation: 'blob-transport-h 65s linear infinite',
                    animationDelay: '-15s'
                }}
            />
            {/* Extra Blob 6 - Blue, moves R->L top */}
            <div
                data-blob
                className="absolute rounded-full"
                style={{
                    width: '190px',
                    height: '190px',
                    top: '5%',
                    right: '0',
                    background: 'radial-gradient(circle at 50% 50%, #93c5fd, #3b82f6 60%, transparent 100%)',
                    opacity: 0.4,
                    filter: 'blur(11px)',
                    animation: 'blob-transport-h-reverse 58s linear infinite',
                    animationDelay: '-25s'
                }}
            />
        </div>
    )
}
