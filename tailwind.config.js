// tailwind.config.js
module.exports = {
    content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {},
    },
    plugins: [require('tailwind-scrollbar')],
    variants: {
        scrollbar: ['rounded', 'rounded'], // 👈 esto es clave para que funcione bien
    },
}
