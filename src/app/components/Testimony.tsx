'use client'

import React from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Datos de reseñas (Doctores hablando del software)
const REVIEWS = [
  {
    name: "Dra. Camila Torres",
    role: "Medicina Estética",
    date: "Hace 2 días",
    rating: 5,
    text: "Al principio dudaba si mis pacientes hablarían con una IA, pero la respuesta ha sido increíble. Wasaaa ha recuperado pacientes que no venían hace 6 meses. ¡La agenda se llenó sola!",
    color: "bg-purple-600",
    initials: "CT"
  },
  {
    name: "Dr. Andrés Felipe",
    role: "Cirujano Plástico",
    date: "Hace 1 semana",
    rating: 5,
    text: "Filtra a los curiosos de maravilla. Antes mi recepcionista perdía horas respondiendo precios, ahora solo me llegan las citas confirmadas. Es como tener una secretaria 24/7.",
    color: "bg-orange-500",
    initials: "AF"
  },
  {
    name: "Odontología Vital",
    role: "Gerencia Clínica",
    date: "Hace 3 semanas",
    rating: 5,
    text: "La confirmación automática redujo el ausentismo a cero. Los pacientes reciben el recordatorio por WhatsApp y confirman ahí mismo. Indispensable.",
    color: "bg-blue-500",
    initials: "OV"
  },
  {
    name: "Dra. Sofia Mendez",
    role: "Dermatóloga",
    date: "Hace 1 mes",
    rating: 5,
    text: "La integración fue super rápida. En un día ya estaba contestando mensajes. Me encanta que puedo ver las conversaciones si quiero intervenir.",
    color: "bg-emerald-600",
    initials: "SM"
  }
];

export default function Testimony() {
  return (
    <section className="py-16 md:py-24 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Header de la sección */}
        <div className="text-center mb-12 md:mb-16">
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
            Nuestros clientes <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Confirman</span>
          </motion.h2>
        </div>

        {/* CONTENEDOR DEL CARRUSEL / GRID */}
        <div className="flex flex-row overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-4 px-4 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:pb-0 md:mx-0 md:px-0 scrollbar-hide">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative flex-shrink-0 w-[85vw] md:w-auto snap-center bg-white rounded-3xl p-6 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-white/10"
            >
              {/* Icono de Google pequeño arriba a la derecha */}
              <div className="absolute top-6 right-6 opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                 <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                 </svg>
              </div>

              {/* Header: Estrellas y Fecha */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" className="stroke-none" />)}
                </div>
                <span className="text-xs text-gray-400 font-medium">{review.date}</span>
              </div>

              {/* Texto de la reseña */}
              <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-6 font-medium">
                "{review.text}"
              </p>

              {/* Footer: Avatar e Info */}
              <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                {/* Avatar de Letras (Estilo Google) */}
                <div className={`w-10 h-10 rounded-full ${review.color} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                    {review.initials}
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{review.name}</h3>
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-gray-500">{review.role}</p>
                    <CheckCircle2 size={10} className="text-blue-500 fill-blue-500/10" />
                  </div>
                </div>
              </div>

            </motion.div>
          ))}
          
          {/* Spacer final para móvil */}
          <div className="w-2 md:hidden flex-shrink-0" />
        </div>

        {/* Indicador visual de scroll (Solo móvil) */}
        <div className="md:hidden flex justify-center mt-4 gap-1.5">
           <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
           <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
           <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        </div>

      </div>
      
      {/* CSS para ocultar la barra de scroll */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}