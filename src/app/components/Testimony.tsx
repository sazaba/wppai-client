'use client'

import { motion, Variants } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Quote } from 'lucide-react'

const testimonios = [
  {
    nombre: "Laura Méndez",
    cargo: "CEO de White Skincare",
    mensaje: "Gracias a Wasaaa hemos automatizado más del 80% de nuestras consultas. La IA responde con una naturalidad impresionante, como si fuera parte del equipo humano.",
    imagen: "/avatars/laura.jpg",
    rating: 5
  },
  {
    nombre: "Carlos Gómez",
    cargo: "Director Comercial en TecnoRed",
    mensaje: "Integrar el sistema fue rápido y sin código. La segmentación por estados nos ayudó a escalar solo los casos necesarios, disparando nuestra eficiencia.",
    imagen: "/avatars/carlos.jpg",
    rating: 5
  },
  {
    nombre: "Sofía Ruiz",
    cargo: "Fundadora de NaturalFit",
    mensaje: "La prueba gratis me convenció. En menos de una semana, pasamos de perder leads por no responder a tiempo, a tener una agenda llena automáticamente.",
    imagen: "/avatars/sofia.jpg",
    rating: 5
  },
]

// Tipado para evitar errores de TS
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

export default function Testimonios() {
  return (
    // Quitamos bg sólido para usar el ambiente global
    <section className="py-24 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.5 }}
             className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-semibold border border-indigo-500/20 mb-2"
          >
            <Star className="w-4 h-4 fill-indigo-500/20" />
            Clientes Felices
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            transition={{ duration: 0.6 }} 
            className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white"
          >
            Ellos ya escalaron sus ventas
          </motion.h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Cientos de negocios confían en Wasaaa para gestionar sus chats.
          </p>
        </div>

        {/* Grid de Testimonios */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {testimonios.map((t, i) => (
            <motion.div 
              key={i}
              variants={itemVariants}
              // Card Glassmorphism Premium
              className="relative group bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-gray-200/50 dark:border-white/5 p-8 rounded-3xl hover:bg-white/80 dark:hover:bg-zinc-800/80 transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-gray-200/20 dark:shadow-none"
            >
              {/* Icono de Comilla Decorativo (Fondo) */}
              <Quote className="absolute top-6 right-6 w-12 h-12 text-indigo-500/10 dark:text-indigo-500/20 rotate-180" />

              {/* Estrellas */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, index) => (
                  <Star key={index} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Mensaje */}
              <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-8 relative z-10">
                "{t.mensaje}"
              </p>

              {/* Usuario */}
              <div className="flex items-center gap-4 border-t border-gray-100 dark:border-white/5 pt-6 mt-auto">
                <Avatar className="w-12 h-12 ring-2 ring-indigo-500/20 dark:ring-indigo-500/30">
                  <AvatarImage src={t.imagen} alt={t.nombre} className="object-cover" />
                  <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                    {t.nombre[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">{t.nombre}</h3>
                  <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{t.cargo}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}