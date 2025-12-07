/** @type {import('next').NextConfig} */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://wppai-server.onrender.com'

const nextConfig = {
    // 🚀 OPTIMIZACIONES DE RENDIMIENTO
    reactStrictMode: true,
    compress: true,      // Comprime archivos para que carguen rápido en 4G/3G
    swcMinify: true,     // Minificación rápida
    poweredByHeader: false,

    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },

    // 🖼️ OPTIMIZACIÓN DE IMÁGENES (Vital para móviles)
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.r2.cloudflarestorage.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'imagedelivery.net',
                pathname: '/**',
            },
        ],
        // Tamaños específicos para que el móvil no descargue imágenes 4K
        deviceSizes: [640, 750, 828, 1080, 1200, 1920], 
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60, // Cachear imágenes por 60 segundos mínimo
    },

    // 🔗 CONEXIÓN CON BACKEND
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${API_BASE}/api/:path*`,
            },
        ]
    },
}

module.exports = nextConfig