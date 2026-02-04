import { useEffect } from 'react'

/**
 * Custom hook to add elastic scroll animation at page boundaries
 */
export function useElasticScroll() {
    useEffect(() => {
        let scrollTimeout: number

        const handleScroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const scrollHeight = document.documentElement.scrollHeight
            const clientHeight = document.documentElement.clientHeight

            // Clear previous timeout
            clearTimeout(scrollTimeout)

            // Check if at bottom (within 10px threshold)
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10
            const isAtTop = scrollTop <= 10

            const rootElement = document.documentElement

            if (isAtBottom || isAtTop) {
                // Add bounce animation class
                rootElement.classList.add('scroll-end-indicator')

                // Remove after animation completes
                scrollTimeout = setTimeout(() => {
                    rootElement.classList.remove('scroll-end-indicator')
                }, 600)
            }
        }

        // Throttle scroll event
        let ticking = false
        const throttledScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll()
                    ticking = false
                })
                ticking = true
            }
        }

        window.addEventListener('scroll', throttledScroll, { passive: true })

        return () => {
            window.removeEventListener('scroll', throttledScroll)
            clearTimeout(scrollTimeout)
        }
    }, [])
}
