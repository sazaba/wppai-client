'use client'

import { motion, Variants } from 'framer-motion'
import { Zap, ShieldCheck, MessageCircle, Smile, LucideIcon } from 'lucide-react'

// Definimos la interfaz para TypeScript
interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  shadowColor: string;
}

const benefits: Benefit[] = [
  {
    icon: Zap,
    title: 'Velocidad Relámpago',
    description: 'Responde en milisegundos. Tus clientes sentirán que están chateando en tiempo real, sin esperas frustrantes.',
    color: 'text-amber-500',
    shadowColor: 'shadow-amber-500/20',
  },
  {
    icon: ShieldCheck,
    title: 'Inteligencia de Escalado',
    description: 'El sistema detecta frustración o temas complejos y alerta a tu equipo humano al instante. Cero fricción.',
    color: 'text-emerald-500',
    shadowColor: 'shadow-emerald-500/20',
  },
  {
    icon: MessageCircle,
    title: 'Entrenamiento a Medida',
    description: 'No es un bot genérico. Aprende tu menú, tus precios y tus reglas de negocio específicas.',
    color: 'text-blue-500',
    shadowColor: 'shadow-blue-500/20',
  },
  {
    icon: Smile,
    title: 'Experiencia 5 Estrellas',
    description: 'La consistencia en la atención genera confianza. Convierte visitantes en fans leales de tu marca.',
    color: 'text-pink-500',
    shadowColor: 'shadow-pink-500/20',
  },
]

// Animaciones optimizadas
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
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  }
}

export default function KeyBenefits() {
  return (
    // Fondo transparente para usar el ambiente global
    <section className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6 text-center">
        
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
        >
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
              ¿Por qué los negocios aman <span className="text-indigo-600 dark:text-indigo-400">Wasaaa</span>?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Más allá de la automatización, te damos las herramientas para construir relaciones duraderas y rentables.
            </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                // Diseño Card Minimalista & Premium
                className="group relative bg-white/50 dark:bg-zinc-900/50 backdrop-blur-lg border border-gray-100 dark:border-white/5 rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300"
              >
                {/* Fondo sutil al hacer hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center">
                  {/* Contenedor del Icono con Sombra de Color */}
                  <div className={`mb-6 p-4 rounded-2xl bg-white dark:bg-zinc-800 shadow-xl ${benefit.shadowColor} group-hover:scale-110 transition-transform duration-300 ring-1 ring-gray-100 dark:ring-white/10`}>
                    <Icon className={`h-8 w-8 ${benefit.color}`} />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {benefit.description}
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