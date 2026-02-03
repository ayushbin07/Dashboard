/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#F9FAFB", // Soft off-white
                surface: "#FFFFFF",
                primary: "#111827",   // Strong dark for text/primary actions
                secondary: "#6B7280", // Muted text
                border: "#E5E7EB",    // Subtle border
                accent: {
                    DEFAULT: "#3B82F6", // General accent
                    priority: "#EF4444", // Red for priority
                    additional: "#10B981", // Emerald for additional
                    gym: "#F59E0B",
                    coding: "#8B5CF6",
                    reading: "#EC4899",
                    deepwork: "#6366F1",
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
            }
        },
    },
    plugins: [],
}
