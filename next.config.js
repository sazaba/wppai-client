// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // ⛔ Ignora errores de ESLint durante el build en producción (solo Vercel)
        ignoreDuringBuilds: true,
    },
    typescript: {
        // ⛔ También ignora errores de TypeScript (opcional)
        ignoreBuildErrors: true,
    },

}

module.exports = nextConfig
