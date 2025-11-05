// tailwind.config.js
module.exports = {
    content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    'ui-sans-serif',
                    'system-ui',
                    '-apple-system',
                    '"Segoe UI"',
                    'Roboto',
                    '"Helvetica Neue"',
                    'Arial',
                    '"Noto Color Emoji"',
                ]
            }
        }
    },
    plugins: [require('tailwind-scrollbar')],
    variants: {
        scrollbar: ['rounded', 'rounded'], // 👈 esto es clave para que funcione bien
    },
}
