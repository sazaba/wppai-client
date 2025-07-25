'use client'

import { motion } from 'framer-motion'
import { Zap, ShieldCheck, MessageCircle, Smile } from 'lucide-react'

const benefits = [
  {
    icon: <Zap className="h-6 w-6 text-indigo-600" />,
    title: 'Respuestas instantáneas 24/7',
    description: 'Atiende a tus clientes en cualquier momento sin intervención humana.',
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-indigo-600" />,
    title: 'Escalado inteligente',
    description: 'La IA sabe cuándo escalar a un agente humano si es necesario.',
  },
  {
    icon: <MessageCircle className="h-6 w-6 text-indigo-600" />,
    title: 'Entrenamiento personalizado',
    description: 'Cada negocio tiene sus propios productos, horarios y FAQs entrenados.',
  },
  {
    icon: <Smile className="h-6 w-6 text-indigo-600" />,
    title: 'Mejora la experiencia del cliente',
    description: 'Ofrece una atención más rápida, precisa y profesional.',
  },
]

export default function KeyBenefits() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          ¿Por qué usar WppAI en tu negocio?
        </motion.h2>

        <p className="text-gray-600 max-w-2xl mx-auto mb-12">
          Estas son algunas de las razones por las que nuestros clientes han mejorado su atención al cliente y aumentado sus ventas:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="bg-gray-50 p-6 rounded-2xl shadow-sm text-left"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="mb-4">{benefit.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
              <p className="text-gray-600 text-sm">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
