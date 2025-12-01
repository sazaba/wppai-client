'use client'

import { motion, Variants } from 'framer-motion' // <--- 1. Importa Variants
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
  // ... (tu lista de features sigue igual)
]

// 2. Agrega ": Variants" aquí abajo 👇
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
}

// 3. Y agrega ": Variants" aquí también 👇
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 50, damping: 20 } 
  }
}

export default function FeaturesSection() {
    // ... el resto del componente sigue igual
  return (
    // Quitamos bg-gradient sólido para dejar ver el Layout. Agregamos relative z-10.
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header de Sección */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight"
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

        {/* Grid de Tarjetas */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                // Estilos Glassmorphism Premium:
                // 1. bg-white/50 dark:bg-zinc-900/40 (Translucidez)
                // 2. backdrop-blur-md (Desenfoque del fondo)
                // 3. border-white/10 (Borde sutil)
                className="group relative bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/5 rounded-3xl p-6 hover:bg-white/80 dark:hover:bg-zinc-800/60 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1"
              >
                {/* Glow Effect en Hover (Luz interior) */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full">
                  {/* Icono con gradiente personalizado */}
                  <div className={`w-14 h-14 mb-6 rounded-2xl flex items-center justify-center bg-gradient-to-br ${feature.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
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