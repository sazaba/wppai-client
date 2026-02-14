'use client'

import React from 'react'
import { Check, Sparkles, Zap, HelpCircle, CalendarCheck, ShieldCheck } from 'lucide-react'
import { motion, Variants } from 'framer-motion'
import Image from 'next/image'
import clsx from 'clsx'

// --- IMPORTS IMÁGENES (Asegúrate de tener estas rutas correctas) ---
import visa from '../images/visa-logo.webp';
import amex from '../images/american-express.webp';
import mastercard from '../images/mastercard-logo.webp';

const fadeInUp: Variants = { 
  hidden: { opacity: 0, y: 15 }, 
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } 
};

export default function PricingSection({ handleOpenBooking }: { handleOpenBooking?: () => void }) {
  return (
    <section id="pricing" className="py-16 md:py-24 relative z-10 overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-slate-400 text-[10px] uppercase tracking-[0.3em] font-medium mb-4"
          >
            <Sparkles size={10} className="text-cyan-500" /> Inversión Inteligente
          </motion.div>
          
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="text-3xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight"
          >
            Un plan simple, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">resultados masivos.</span>
          </motion.h2>
        </div>

        {/* Tarjeta de Precio Único */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
          className="relative max-w-5xl mx-auto"
        >
          {/* Resplandor ambiental externo (Glow) sutil */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 rounded-2xl md:rounded-[2.5rem] blur-2xl opacity-30 pointer-events-none" />

          {/* Tarjeta Principal Dark */}
          <div className="relative bg-[#080808]/60 backdrop-blur-xl border border-white/5 rounded-2xl md:rounded-[2.5rem] p-8 md:p-14 shadow-2xl overflow-hidden">
            
            {/* Decoración de fondo interna */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />

            <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
              
              {/* Columna Izquierda: Precio y Acción */}
              <div className="space-y-8 text-center lg:text-left">
                <div className="space-y-4">
                  <div className="flex items-baseline justify-center lg:justify-start gap-2 flex-wrap">
                    <span className="text-lg font-bold text-slate-500">$</span>
                    <span className="text-6xl md:text-8xl font-black text-white tracking-tighter">250.000</span>
                    <span className="text-lg font-medium text-slate-500">COP/mes</span>
                  </div>
                  <p className="text-slate-400 text-sm md:text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
                    Diseñado para clínicas estéticas que buscan automatizar el 100% de su agendamiento sin errores humanos.
                  </p>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={handleOpenBooking}
                    className="w-full h-16 text-lg font-bold rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xl shadow-cyan-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/10 flex items-center justify-center gap-3 uppercase tracking-wider"
                  >
                    <Zap size={20} className="fill-white" /> Probar Sistema Ahora
                  </button>
                  
                  {/* Pasarelas de Pago */}
                  <div className="flex justify-center lg:justify-start gap-6 opacity-30 grayscale contrast-125">
                      <Image src={visa} alt="Visa" height={22} width={40} unoptimized className="object-contain" />
                      <Image src={mastercard} alt="Mastercard" height={22} width={40} unoptimized className="object-contain" />
                      <Image src={amex} alt="Amex" height={22} width={40} unoptimized className="object-contain" />
                  </div>
                </div>
                
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                  Sin contratos permanentes • Cancela en cualquier momento
                </p>
              </div>

              {/* Columna Derecha: Beneficios List */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-10 text-left backdrop-blur-sm">
                <h3 className="font-bold text-lg text-white mb-8 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-cyan-500" />
                  El paquete Pro incluye:
                </h3>
                
                <ul className="space-y-6">
                  {[
                    { 
                      title: "300 Mensajes Premium IA", 
                      desc: "IA avanzada con lenguaje natural humano.",
                      highlight: true 
                    },
                    { 
                      title: "Confirmación Automática", 
                      desc: "Reduce el ausentismo sin mover un dedo.",
                    },
                    { 
                      title: "Gestión de Agenda 24/7", 
                      desc: "Tus pacientes agendan mientras tú descansas.",
                    },
                    { 
                      title: "Dashboard de Métricas", 
                      desc: "Control total de tus leads y ventas.",
                    }
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center mt-1">
                        <Check className="w-3.5 h-3.5 text-cyan-400" strokeWidth={3} />
                      </div>
                      <div>
                        <span className={clsx("font-bold text-slate-200", item.highlight && "text-white")}>
                          {item.title}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </motion.div>
        
        {/* Enterprise Trigger */}
        <div className="text-center mt-12">
            <p className="text-[11px] md:text-xs text-slate-500 flex items-center justify-center gap-2 uppercase tracking-widest font-bold">
                <HelpCircle className="w-3 h-3 text-cyan-500" />
                ¿Necesitas un plan a medida? 
                <a href="#contact" className="text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-4">
                  Consultar plan Enterprise
                </a>
            </p>
        </div>

      </div>
    </section>
  )
}