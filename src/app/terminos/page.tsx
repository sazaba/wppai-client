'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Terminos() {
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
          <span className="text-gray-800 dark:text-gray-100 font-medium">Términos y condiciones</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-indigo-600 dark:text-indigo-400">
          Términos y Condiciones de Uso
        </h1>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">1. Aceptación</h2>
          <p className="text-base md:text-lg leading-relaxed">
            Al registrarte y utilizar <strong>Wasaaa</strong>, aceptas los presentes términos y condiciones de uso.
            Si no estás de acuerdo, no debes utilizar la plataforma.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">2. Uso adecuado</h2>
          <p className="text-base md:text-lg leading-relaxed">
            Te comprometes a usar la plataforma de forma legal y respetuosa, sin infringir derechos de terceros
            ni realizar actividades fraudulentas.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">3. Servicios ofrecidos</h2>
          <p className="text-base md:text-lg leading-relaxed">
            Wasaaa permite gestionar mensajes de WhatsApp automatizados con inteligencia artificial
            personalizada según el negocio. Nos reservamos el derecho de modificar o suspender servicios
            sin previo aviso.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">4. Propiedad intelectual</h2>
          <p className="text-base md:text-lg leading-relaxed">
            El contenido, marca, código fuente y diseño de la plataforma son propiedad de <strong>Wasaaa</strong>,
            actualmente en fase de desarrollo como marca comercial de uso exclusivo por su creador. Todos los derechos
            de propiedad intelectual sobre esta aplicación están reservados.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">5. Responsabilidad</h2>
          <p className="text-base md:text-lg leading-relaxed">
            No nos responsabilizamos por interrupciones del servicio, pérdida de datos o uso indebido de la plataforma
            por parte de los usuarios.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">6. Integración con servicios de terceros</h2>
          <p className="text-base md:text-lg leading-relaxed">
            Wasaaa utiliza la API oficial de WhatsApp Cloud (Meta Platforms, Inc.) para la automatización de respuestas.
            El uso del servicio implica aceptar también las políticas de privacidad y términos de uso de Meta.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">7. Cambios</h2>
          <p className="text-base md:text-lg leading-relaxed">
            Podemos modificar estos términos en cualquier momento. Se informará a los usuarios por correo o dentro
            de la plataforma.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">8. Jurisdicción</h2>
          <p className="text-base md:text-lg leading-relaxed">
            Estos términos se regirán por las leyes de Colombia. Cualquier disputa será resuelta en los tribunales de Medellín.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">9. Política de privacidad</h2>
          <p className="text-base md:text-lg leading-relaxed">
            Para más información sobre cómo manejamos tus datos, consulta nuestra{' '}
            <Link href="/politica" className="text-indigo-600 hover:underline">
              Política de Privacidad
            </Link>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">10. Contacto</h2>
          <p className="text-base md:text-lg leading-relaxed">
            Si tienes dudas o sugerencias, puedes escribirnos a{' '}
            <strong>contacto@wasaaa.com</strong>.
          </p>
        </section>
      </motion.div>
    </main>
  )
}
