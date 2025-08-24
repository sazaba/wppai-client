/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'wppai-products.a9d4a6cfaa683e47a3f47ab28525f5f0.r2.cloudflarestorage.com',
                pathname: '/**',
            },
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
                            "img-src 'self' data: blob: https://wppai-products.a9d4a6cfaa683e47a3f47ab28525f5f0.r2.cloudflarestorage.com",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                            "style-src 'self' 'unsafe-inline'",
                            // 🔽 añade wss: y tu backend https
                            "connect-src 'self' https: wss: https://wppai-server.onrender.com",
                            "frame-ancestors 'self'",
                        ].join('; '),
                    },
                ],
            },
        ]
    },
    async rewrites() {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://wppai-server.onrender.com'
        return [
            { source: '/api/products/:id/images/:file*', destination: `${API_BASE}/api/products/:id/images/:file*` },
        ]
    },
}
module.exports = nextConfig
