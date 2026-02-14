'use client'

import React from 'react';
import { Star, CheckCircle2, Quote } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Datos de reseñas (Sector Estético/Dental)
const REVIEWS = [
  {
    name: "Dra. Camila Torres",
    role: "Dueña de Clínica Estética",
    image: "https://randomuser.me/api/portraits/women/44.jpg", // Puedes usar fotos reales si tienes
    date: "Hace 2 días",
    rating: 5,
    text: "Al principio dudaba si mis pacientes hablarían con una IA, pero la respuesta ha sido increíble. Wasaaa ha recuperado pacientes que no venían hace 6 meses solo enviando un mensaje de reactivación. ¡La agenda se llenó sola!"
  },
  {
    name: "Dr. Andrés Felipe",
    role: "Cirujano Plástico",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    date: "Hace 1 semana",
    rating: 5,
    text: "Lo mejor es que filtra a los curiosos. Antes mi recepcionista perdía horas respondiendo precios, ahora solo me llegan las citas confirmadas y pagas. Es como tener una secretaria que trabaja 24/7 sin quejarse."
  },
  {
    name: "Clínica Odontológica Vital",
    role: "Gerencia",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    date: "Hace 3 semanas",
    rating: 5,
    text: "La función de confirmación automática nos redujo el ausentismo casi a cero. Los pacientes reciben el recordatorio por WhatsApp y confirman ahí mismo. Una herramienta indispensable para cualquier consultorio moderno."
  }
];

export default function Testimony() {
  return (
    <section className="py-16 md:py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Header de la sección */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 text-yellow-500 text-xs font-bold uppercase tracking-widest mb-4"
          >
            <Star size={12} fill="currentColor" /> Resultados Reales
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-white tracking-tight"
          >
            Lo que dicen los <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Doctores</span>
          </motion.h2>
          <p className="text-slate-400 mt-4 max-w-xl mx-auto">
            No confíes solo en nuestra palabra. Mira cómo clínicas reales están automatizando su atención.
          </p>
        </div>

        {/* Grid de Reseñas */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-6 rounded-3xl bg-[#0F0F0F] border border-white/5 hover:border-white/10 transition-colors group"
            >
              {/* Comillas decorativas */}
              <div className="absolute top-6 right-6 text-white/5 group-hover:text-cyan-500/20 transition-colors">
                <Quote size={40} fill="currentColor" />
              </div>

              {/* Header de la Review (Google Style) */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10">
                  <Image 
                    src={review.image} 
                    alt={review.name} 
                    fill 
                    className="object-cover"
                    unoptimized // Usar esto si usas URLs externas como randomuser
                  />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{review.name}</h3>
                  <p className="text-xs text-slate-500">{review.role}</p>
                </div>
              </div>

              {/* Estrellas */}
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, starIndex) => (
                  <Star key={starIndex} size={14} className="text-yellow-500 fill-yellow-500" />
                ))}
                <span className="text-xs text-slate-500 ml-2">{review.date}</span>
              </div>

              {/* Texto */}
              <p className="text-slate-300 text-sm leading-relaxed">
                "{review.text}"
              </p>

              {/* Badge de Verificado */}
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-500" />
                <span className="text-xs font-medium text-slate-500">Cliente Verificado por Google</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Google Badge Footer */}
        <div className="mt-12 flex justify-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                 <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">G</div>
                 </div>
                 <div className="text-xs text-slate-300">
                    <span className="font-bold text-white">4.9/5</span> Valoración media en Google Reviews
                 </div>
            </div>
        </div>

      </div>
    </section>
  );
}