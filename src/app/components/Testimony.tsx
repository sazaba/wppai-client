'use client'

import React from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const REVIEWS = [
  {
    name: "Dra. Camila Torres",
    role: "Medicina Estética",
    date: "Hace 2 días",
    text: "Al principio dudaba si mis pacientes hablarían con una IA, pero la respuesta ha sido increíble. Wasaaa ha recuperado pacientes que no venían hace 6 meses. ¡La agenda se llenó sola!",
    color: "bg-purple-600",
    initials: "CT"
  },
  {
    name: "Dr. Andrés Felipe",
    role: "Cirujano Plástico",
    date: "Hace 1 semana",
    text: "Filtra a los curiosos de maravilla. Antes mi recepcionista perdía horas respondiendo precios, ahora solo me llegan las citas confirmadas. Es como tener una secretaria 24/7.",
    color: "bg-orange-500",
    initials: "AF"
  },
  {
    name: "Odontología Vital",
    role: "Gerencia Clínica",
    date: "Hace 3 semanas",
    text: "La confirmación automática redujo el ausentismo a cero. Los pacientes reciben el recordatorio por WhatsApp y confirman ahí mismo. Indispensable.",
    color: "bg-blue-500",
    initials: "OV"
  },
  {
    name: "Dra. Sofia Mendez",
    role: "Dermatóloga",
    date: "Hace 1 mes",
    text: "La integración fue super rápida. En un día ya estaba contestando mensajes. Me encanta que puedo ver las conversaciones si quiero intervenir.",
    color: "bg-emerald-600",
    initials: "SM"
  }
];

// Triplicamos para asegurar que el scroll infinito no tenga saltos visuales
const INFINITE_REVIEWS = [...REVIEWS, ...REVIEWS, ...REVIEWS];

export default function Testimony() {
  return (
    <section className="py-16 md:py-24 relative z-10 overflow-hidden bg-transparent" id="testimonios">
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-12 text-center">
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
            className="text-3xl md:text-5xl font-bold text-white tracking-tight"
          >
            Casos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Éxito Real</span>
          </motion.h2>
      </div>

      {/* MÁSCARA DE DESVANECIMIENTO: 
          Esto hace que las tarjetas 'aparezcan' y 'desaparezcan' suavemente 
          al entrar/salir de los bordes laterales sin usar fondos sólidos.
      */}
      <div className="relative w-full overflow-hidden py-10 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <motion.div 
          className="flex gap-6 md:gap-8 flex-nowrap"
          animate={{ x: ["0%", "-33.33%"] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40, 
              ease: "linear",
            },
          }}
          style={{ width: "fit-content" }}
        >
          {INFINITE_REVIEWS.map((review, i) => (
            <div
              key={i}
              className="relative flex-shrink-0 w-[85vw] md:w-[400px] bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl"
              style={{ transform: 'translate3d(0,0,0)' }}
            >
              {/* Logo G de Google con Colores */}
              <div className="absolute top-6 right-8">
                 <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                 </svg>
              </div>

              {/* Estrellas */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, idx) => <Star key={idx} size={14} fill="currentColor" className="stroke-none" />)}
                </div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{review.date}</span>
              </div>

              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8 italic">
                "{review.text}"
              </p>

              <div className="flex items-center gap-4 border-t border-white/5 pt-6">
                <div className={`w-11 h-11 rounded-full ${review.color} flex items-center justify-center text-white font-black text-sm shadow-lg`}>
                    {review.initials}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{review.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs text-slate-500 font-medium">{review.role}</p>
                    <CheckCircle2 size={12} className="text-cyan-500 fill-cyan-500/10" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}