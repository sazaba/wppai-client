'use client'

import { motion } from 'framer-motion'
import {
  Bot,
  Zap,
  ShieldCheck,
  CheckCircle
} from 'lucide-react'

const features = [
  {
    title: 'Respuestas automáticas con IA',
    description: 'Conversaciones en tiempo real que entienden al cliente gracias al entrenamiento personalizado.',
    icon: Bot,
  },
  {
    title: 'Escalado inteligente',
    description: 'Detecta dudas, quejas o frustración y transfiere la conversación a un agente humano.',
    icon: ShieldCheck,
  },
  {
    title: 'Integración con Facebook Ads',
    description: 'Conecta tu CRM con leads de campañas y responde de inmediato en WhatsApp.',
    icon: Zap,
  },
  {
    title: 'Entrenamiento por negocio',
    description: 'Configura tu IA con tus servicios, productos, horarios y preguntas frecuentes.',
    icon: CheckCircle,
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 py-5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4"
        >
          Automatiza sin perder el toque humano
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg"
        >
          Nuestro sistema inteligente se adapta a tu negocio y mejora la experiencia de tus clientes desde el primer mensaje.
        </motion.p>

        <div className="mt-16 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl p-6 text-left transition-all"
              >
                <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-indigo-100 dark:bg-indigo-900">
                  <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
