/** @type {import('next').NextConfig} */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://wppai-server.onrender.com'

const nextConfig = {
   
    typescript: { ignoreBuildErrors: true },

    // 2. OPTIMIZACIÓN DE IMÁGENES (Vital para el puntaje Speed Insights)
    images: {
        // Formatos modernos (AVIF es 30% más ligero que WebP)
        formats: ['image/avif', 'image/webp'],
        // Tamaños optimizados para móvil
        deviceSizes: [320, 420, 768, 1024, 1200],
        imageSizes: [16, 32, 48, 64, 96],
        // Cache en navegador por 60 segundos mínimo
        minimumCacheTTL: 60,
        
        // Tus dominios permitidos
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
            {
                protocol: 'https',
                hostname: 'platform-lookaside.fbsbx.com', // Imágenes de perfil de FB comunes
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'scontent.xx.fbcdn.net', // CDN de Facebook
                pathname: '/**',
            }
        ],
    },

    // 3. TREE SHAKING AGRESIVO (Esto baja el peso del JS drásticamente)
    experimental: {
        optimizePackageImports: [
            'lucide-react', 
            'framer-motion', 
            '@react-pdf/renderer',
            'date-fns', 
            'clsx', 
            'tailwind-merge',
            '@headlessui/react'
        ],
    },

    // 4. CONFIGURACIÓN WEBPACK (Soluciona el error de compilación del PDF en cliente)
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.alias.canvas = false;
            config.resolve.alias.encoding = false;
        }
        return config;
    },

    // 5. SEGURIDAD (CSP headers que ya tenías, mantenidos intactos)
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            // Imágenes: R2, Cloudflare, FB CDNs
                            "img-src 'self' data: blob: https://*.r2.cloudflarestorage.com https://imagedelivery.net https://*.facebook.com https://*.fbcdn.net",
                            // Scripts: FB Connect, Wompi
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://cdn.wompi.co",
                            // Estilos
                            "style-src 'self' 'unsafe-inline'",
                            // Conexiones: API, WS, FB Graph, Wompi
                            `connect-src 'self' https: wss: ${API_BASE} https://graph.facebook.com https://*.facebook.com https://cdn.wompi.co`,
                            // Iframes: FB, Wompi
                            "frame-src 'self' https://*.facebook.com https://cdn.wompi.co",
                            // Permitir que te incrusten (si es necesario) o self
                            "frame-ancestors 'self'",
                        ].join('; '),
                    },
                    // Header extra para seguridad y SEO
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                ],
            },
        ]
    },

    // 6. REWRITES (Proxy al backend)
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