/** @type {import('next').NextConfig} */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://wppai-server.onrender.com'

const nextConfig = {
    // Optimización para móviles
    reactStrictMode: true,
    compress: true, // Ayuda a la carga en redes móviles
    poweredByHeader: false, // Por seguridad y ahorro de bytes

    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },

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
        // Esto ayuda a que las imágenes no consuman tanta memoria en el teléfono
        deviceSizes: [640, 750, 828, 1080, 1200, 1920], 
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },

    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload'
                    },
                    {
                        // CSP simplificado para evitar cuellos de botella en Chrome Mobile
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "img-src 'self' data: blob: https://*.r2.cloudflarestorage.com https://imagedelivery.net",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", 
                            "style-src 'self' 'unsafe-inline'",
                            `connect-src 'self' https: wss: ${API_BASE}`, // Asegúrate que API_BASE no tenga '/' al final
                            "frame-ancestors 'self'",
                            "font-src 'self' data:",
                        ].join('; '),
                    },
                ],
            },
        ]
    },

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