'use client'

import { motion, Variants } from 'framer-motion'
import { UserPlus, Settings, MessageCircle, Rocket, LucideIcon } from 'lucide-react'

// Definimos la interfaz para evitar errores de tipo
interface Step {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

const steps: Step[] = [
  {
    id: '01',
    title: 'Crea tu cuenta',
    description: 'Regístrate gratis en segundos y accede a tu panel de control personalizado.',
    icon: UserPlus,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: '02',
    title: 'Configura tu IA',
    description: 'Define tus servicios, horarios y el tono de voz de tu asistente en simples pasos.',
    icon: Settings,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: '03',
    title: 'Conecta WhatsApp',
    description: 'Escanea el código QR o vincula la API oficial con nuestra guía segura.',
    icon: MessageCircle,
    color: 'from-emerald-400 to-green-500'
  },
  {
    id: '04',
    title: 'Empieza a vender',
    description: 'Tu IA atenderá a tus clientes 24/7. Relájate y mira cómo llegan las ventas.',
    icon: Rocket,
    color: 'from-orange-500 to-red-500'
  },
]

// Tipado correcto para Framer Motion
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 60, damping: 20 } 
  }
}

export default function HowItWorksSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10" id="como-funciona">
      <div className="max-w-7xl mx-auto">
        
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6"
          >
            Empieza en <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">4 simples pasos</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-gray-600 dark:text-gray-300 text-lg md:text-xl"
          >
            Sin configuraciones técnicas complejas. Convierte tu WhatsApp en una máquina de ventas hoy mismo.
          </motion.p>
        </div>

        {/* Contenedor de Pasos */}
        <div className="relative">
          
          {/* Línea conectora (Solo visible en desktop lg) */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent z-0" />

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10"
          >
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group relative flex flex-col items-center text-center"
                >
                  {/* Tarjeta Glassmorphism */}
                  <div className="w-full h-full p-8 rounded-3xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-gray-100 dark:border-white/5 hover:bg-white/60 dark:hover:bg-zinc-800/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-indigo-500/10">
                    
                    {/* Icono Flotante */}
                    <div className={`relative mx-auto mb-6 w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${step.color} shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                      
                      {/* Badge pequeño con el número (Decorativo) */}
                      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-sm font-bold text-gray-900 dark:text-white border border-gray-100 dark:border-zinc-700 shadow-sm">
                        {step.id}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {step.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {step.description}
                    </p>

                    {/* Número Gigante de Fondo (Watermark) */}
                    <span className="absolute bottom-2 right-4 text-6xl font-black text-gray-200/20 dark:text-white/5 select-none pointer-events-none transition-colors group-hover:text-indigo-500/10">
                      {step.id}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
        
      </div>
    </section>
  )
}