/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },

    // Por si vuelves a usar <Image> de next
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'wppai-products.a9d4a6cfaa683e47a3f47ab28525f5f0.r2.cloudflarestorage.com',
                pathname: '/**',
            },
        ],
        // Si el optimizer te diera problemas con URLs firmadas, activa esto:
        // unoptimized: true,
    },

    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    // Permite cargar imágenes externas desde tu bucket R2 y data: (para el placeholder)
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "img-src 'self' data: blob: https://wppai-products.a9d4a6cfaa683e47a3f47ab28525f5f0.r2.cloudflarestorage.com",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                            "style-src 'self' 'unsafe-inline'",
                            "connect-src 'self' https:",
                            "frame-ancestors 'self'",
                        ].join('; '),
                    },
                    // (Opcional) para diagnósticos en dev
                    // { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
