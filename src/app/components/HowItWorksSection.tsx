'use client'

import { motion } from 'framer-motion'
import { UserPlus, Settings, MessageCircle, Rocket } from 'lucide-react'

const steps = [
  {
    title: '1. Crea tu cuenta',
    description: 'Regístrate gratis y accede al panel de control personalizado para tu negocio.',
    icon: UserPlus,
  },
  {
    title: '2. Configura tu IA',
    description: 'Agrega tus servicios, preguntas frecuentes, reglas de escalado y horarios de atención.',
    icon: Settings,
  },
  {
    title: '3. Conecta WhatsApp',
    description: 'Vincula tu cuenta de WhatsApp Business Cloud API con nuestra guía paso a paso.',
    icon: MessageCircle,
  },
  {
    title: '4. ¡Empieza a convertir!',
    description: 'Tus leads ahora son atendidos automáticamente y con inteligencia. 24/7.',
    icon: Rocket,
  },
]

export default function HowItWorksSection() {
  return (
    <section className="bg-white dark:bg-gray-950 py-24 px-4 sm:px-6 lg:px-8" id="como-funciona">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4"
        >
          ¿Cómo funciona?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg"
        >
          En solo 4 pasos puedes convertir tu WhatsApp en un canal automatizado y potente para captar y atender clientes.
        </motion.p>

        <div className="mt-16 grid gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center px-6"
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 mb-4">
                  <Icon className="h-8 w-8 text-indigo-600 dark:text-indigo-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">{step.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
