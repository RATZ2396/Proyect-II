/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx}",
        "./components/**/*.{js,jsx}",
    ],
    theme: {
        extend: {
            colors: {
                gold: '#ffd700',
                violet: '#8a2be2',
                dark: '#050505',
                'casino-green': '#006400',
                'neon-orange': '#ff9900',
                'glow-orange': '#ffaa00',
            },
            boxShadow: {
                'neon': '0 0 10px #ff9900, 0 0 20px #ff9900',
            },
            animation: {
                'float': 'float 1s ease-out forwards',
                'pulse-slow': 'pulse 3s infinite',
                'shine': 'shine 2s infinite',
            },
            keyframes: {
                float: {
                    '0%': { transform: 'translateY(0)', opacity: '1' },
                    '100%': { transform: 'translateY(-50px)', opacity: '0' },
                },
                shine: {
                    '0%': { backgroundPosition: '200% center' },
                    '100%': { backgroundPosition: '-200% center' },
                }
            }
        },
    },
    plugins: [],
}
