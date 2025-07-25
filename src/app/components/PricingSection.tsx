'use client'

import { CheckCircle2, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

const plans = [
  {
    name: 'Gratis',
    price: '0',
    description: 'Ideal para probar el sistema sin compromiso.',
    features: [
      '100 conversaciones al mes',
      '1 usuario administrador',
      'IA básica por negocio',
      'Clasificación automática de chats',
      'Acceso a panel de control',
    ],
    cta: 'Comenzar gratis',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '29',
    description: 'Perfecto para negocios en crecimiento.',
    features: [
      'Conversaciones ilimitadas',
      'Hasta 5 usuarios',
      'IA avanzada + escalamiento',
      'Conexión con WhatsApp Cloud API',
      'Soporte prioritario',
    ],
    cta: 'Actualizar a Pro',
    highlight: true,
  },
  {
    name: 'Empresarial',
    price: '79',
    description: 'Soluciones a medida para empresas.',
    features: [
      'Todo lo del plan Pro',
      'Soporte para múltiples números',
      'Entrenamiento personalizado',
      'Integración con CRM / APIs externas',
      'Cuenta manager dedicado',
    ],
    cta: 'Solicitar demo',
    highlight: false,
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-4 text-gray-900"
        >
          Planes que se ajustan a tu negocio
        </motion.h2>
        <p className="text-gray-600 mb-16 max-w-2xl mx-auto">
          Escoge el plan que mejor se adapte a tus necesidades. Puedes empezar gratis y escalar cuando tu negocio crezca.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
              className={`rounded-2xl p-8 shadow-md border transition-all ${plan.highlight ? 'bg-indigo-700 text-white border-indigo-700 scale-105 shadow-xl' : 'bg-white'}`}
            >
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-sm mb-4 opacity-80">{plan.description}</p>
              <div className="text-5xl font-bold mb-6">
                {plan.price === '0' ? 'Gratis' : `$${plan.price}`}<span className="text-lg font-medium">/mes</span>
              </div>
              <ul className="text-left space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className={`w-4 h-4 ${plan.highlight ? 'text-white' : 'text-indigo-600'}`} />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className={`w-full rounded-full ${plan.highlight ? 'bg-white text-indigo-700 hover:bg-gray-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                {plan.highlight && <Sparkles className="mr-2 w-4 h-4" />}
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
