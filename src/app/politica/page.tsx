'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Politica() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-800 dark:text-white px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto"
      >
        {/* Breadcrumbs */}
        <nav className="text-sm mb-6 text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:underline hover:text-indigo-600 dark:hover:text-indigo-400">
            Inicio
          </Link>{' '}
          <span className="mx-2">/</span>
          <span className="text-gray-800 dark:text-gray-100 font-medium">Política de privacidad</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-indigo-600 dark:text-indigo-400">
          Política de Privacidad
        </h1>

        <p className="mb-6 text-base md:text-lg leading-relaxed">
          En <strong>Wasaaa</strong>, valoramos tu privacidad. Esta política describe cómo recopilamos,
          usamos y protegemos tu información al utilizar nuestra plataforma.
        </p>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">1. Información que recopilamos</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Nombre y correo electrónico al registrarte en nuestra plataforma.</li>
            <li>Mensajes recibidos por WhatsApp a través de tu cuenta conectada.</li>
            <li>Información del número de WhatsApp conectado (no accedemos a tu perfil personal).</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">2. Uso de la información</h2>
          <p className="text-base md:text-lg leading-relaxed">
            Utilizamos tu información exclusivamente para ofrecer el servicio de atención automatizada
            por WhatsApp con IA. No compartimos tu información con terceros sin tu consentimiento.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">3. Seguridad</h2>
          <p className="text-base md:text-lg leading-relaxed">
            Implementamos medidas técnicas y organizativas para proteger tus datos.
            El acceso a cuentas de WhatsApp se realiza mediante el API oficial de Meta.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">4. Cambios a esta política</h2>
          <p className="text-base md:text-lg leading-relaxed">
            Podemos actualizar esta política en cualquier momento. Te notificaremos mediante la app
            o vía email si hay cambios sustanciales.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">5. Contacto</h2>
          <p className="text-base md:text-lg leading-relaxed">
            Si tienes preguntas sobre esta política, contáctanos en:{' '}
            <strong>contacto@wasaaa.com</strong>
          </p>
        </section>
      </motion.div>
    </main>
  )
}
