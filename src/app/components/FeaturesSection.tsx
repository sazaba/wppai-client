'use client'

import { motion, Variants } from 'framer-motion'
import {
  Bot,
  Zap,
  ShieldCheck,
  CheckCircle,
  LucideIcon
} from 'lucide-react'

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

const features: Feature[] = [
  {
    title: 'Respuestas automáticas con IA',
    description: 'Conversaciones en tiempo real que entienden al cliente gracias al entrenamiento personalizado.',
    icon: Bot,
    color: "from-blue-500 to-indigo-500"
  },
  {
    title: 'Escalado inteligente',
    description: 'Detecta dudas, quejas o frustración y transfiere la conversación a un agente humano al instante.',
    icon: ShieldCheck,
    color: "from-emerald-400 to-teal-500"
  },
  {
    title: 'Integración con Facebook Ads',
    description: 'Conecta tu CRM con leads de campañas y responde de inmediato para aumentar la conversión.',
    icon: Zap,
    color: "from-amber-400 to-orange-500"
  },
  {
    title: 'Entrenamiento por negocio',
    description: 'Configura tu IA con tus servicios, productos, horarios y preguntas frecuentes específicas.',
    icon: CheckCircle,
    color: "from-purple-500 to-pink-500"
  },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 50, damping: 20 } 
  }
}

export default function FeaturesSection() {
  return (
    // CAMBIO: py-24 a py-12 md:py-16 (Menos altura vertical)
    <section id="features" className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto">
        
        {/* CAMBIO: mb-20 a mb-10 (Acercamos el título a las tarjetas) */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight"
          >
            Automatiza sin perder el <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">toque humano</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
            className="text-gray-600 dark:text-gray-300 text-lg md:text-xl leading-relaxed"
          >
            Nuestro sistema inteligente se adapta a tu negocio y mejora la experiencia de tus clientes desde el primer mensaje, 24/7.
          </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/5 rounded-3xl p-6 hover:bg-white/80 dark:hover:bg-zinc-800/60 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className={`w-12 h-12 mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br ${feature.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}