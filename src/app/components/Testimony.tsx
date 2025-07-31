'use client'

import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonios = [
  {
    nombre: "Laura Méndez",
    cargo: "CEO de White Skincare",
    mensaje: "Gracias a Wasaaa hemos automatizado más del 80% de nuestras consultas por WhatsApp. La IA responde como si fuera parte del equipo. ¡Un antes y un después en nuestro servicio!",
    imagen: "/avatars/laura.jpg"
  },
  {
    nombre: "Carlos Gómez",
    cargo: "Director Comercial en TecnoRed",
    mensaje: "Integrar el sistema fue rápido y fácil. La segmentación por estados nos ayudó a escalar solo los casos necesarios, mejorando la eficiencia del equipo humano.",
    imagen: "/avatars/carlos.jpg"
  },
  {
    nombre: "Sofía Ruiz",
    cargo: "Fundadora de NaturalFit",
    mensaje: "La prueba gratis me convenció. En menos de una semana, teníamos respuestas automáticas personalizadas y clientes felices.",
    imagen: "/avatars/sofia.jpg"
  },
]

export default function Testimonios() {
  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-20">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }} 
          className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-10"
        >
          Lo que dicen nuestros clientes
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonios.map((t, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 flex flex-col items-center text-center"
            >
              <Avatar className="w-16 h-16 mb-4">
                <AvatarImage src={t.imagen} alt={t.nombre} />
                <AvatarFallback>{t.nombre[0]}</AvatarFallback>
              </Avatar>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">{t.mensaje}</p>
              <h3 className="font-semibold text-gray-900 dark:text-white">{t.nombre}</h3>
              <span className="text-xs text-gray-500">{t.cargo}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
