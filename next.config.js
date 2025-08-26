/** @type {import('next').NextConfig} */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://wppai-server.onrender.com'

const nextConfig = {
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
                pathname: '/**', // 👈 habilita todas las imágenes Cloudflare Images
            },
            // Si usas dominio propio, añade aquí:
            // { protocol: 'https', hostname: 'wppai-products.example.com', pathname: '/**' },
        ],
    },

    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            // 👇 habilita ambos buckets (R2 y Cloudflare Images)
                            "img-src 'self' data: blob: https://*.r2.cloudflarestorage.com https://imagedelivery.net",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                            "style-src 'self' 'unsafe-inline'",
                            `connect-src 'self' https: wss: ${API_BASE}`,
                            "frame-ancestors 'self'",
                        ].join('; '),
                    },
                ],
            },
        ]
    },

    async rewrites() {
        // Reenvía todo /api/* al backend de Render (o al que uses)
        return [
            {
                source: '/api/:path*',
                destination: `${API_BASE}/api/:path*`,
            },
        ]
    },
}

module.exports = nextConfig
