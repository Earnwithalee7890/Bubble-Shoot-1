/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'base-blue': '#0052FF',
                'neon-blue': '#00D4FF',
                'neon-purple': '#B026FF',
                'neon-pink': '#FF006E',
                'crypto-orange': '#F7931A',
                'crypto-purple': '#627EEA',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'cyber-grid': "url('/assets/cyber-grid.svg')",
            },
            boxShadow: {
                'neon-blue': '0 0 20px rgba(0, 212, 255, 0.5)',
                'neon-purple': '0 0 20px rgba(176, 38, 255, 0.5)',
                'neon-pink': '0 0 20px rgba(255, 0, 110, 0.5)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(0, 212, 255, 0.5)' },
                    '100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 1)' },
                },
            },
        },
    },
    plugins: [],
}
