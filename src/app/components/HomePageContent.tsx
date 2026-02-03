'use client'

import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Clock, Users, Database, BrainCircuit, CalendarCheck, ChevronRight, FileText, CalendarDays, Zap, Wifi, Star, TrendingUp, ShieldCheck } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image'; 
import dynamic from 'next/dynamic';

// FAQ es pesado, lo cargamos solo cuando se necesite
const LandingFAQ = dynamic(() => import('./LandingFAQ'), { ssr: false });

import visa from '../images/visa-logo.webp';
import amex from '../images/american-express.webp';
import mastercard from '../images/mastercard-logo.webp';

// --- OPTIMIZACIÓN MÓVIL EXTREMA ---
const LoadingSkeleton = () => <div className="w-full h-[300px] bg-white/5 rounded-3xl animate-pulse" />;

const CalendarVisual = dynamic(() => import('./CalendarVisual'), {
  ssr: false,
  loading: LoadingSkeleton
});

const AestheticChatAnimation = dynamic(() => import('./AestheticChatAnimation'), {
  ssr: false,
  loading: () => <div className="w-[300px] h-[580px] bg-zinc-900 rounded-[3.5rem] opacity-50" />
});

const AnimatedGenericCard = dynamic(() => import('./AnimatedGenericCard'), {
  ssr: false,
  loading: () => <div className="w-full h-[200px] bg-white/5 rounded-2xl" />
});

const TESTIMONIALS = [
  { name: "Dra. Valentina H.", role: "Directora Médica", text: "El problema no eran los precios, era la velocidad. Con la IA, el paciente recibe info al instante y agenda. Mi facturación subió un 40%.", metric: "+40% Ingresos", avatar: "VH", color: "from-rose-600 to-pink-500", delay: 0.1 },
  { name: "Dr. Andrés Meza", role: "Cirujano Plástico", text: "Antes tenía huecos en la agenda y aparatología costosa quieta. Ahora el sistema llena esos espacios automáticamente.", metric: "Agenda Llena", avatar: "AM", color: "from-purple-600 to-indigo-500", delay: 0.2 },
  { name: "Clínica Piel & Ser", role: "Gerencia", text: "La reactivación de base de datos es impresionante. El sistema trajo de vuelta pacientes que no venían hace un año.", metric: "+30% Retornos", avatar: "PS", color: "from-amber-600 to-orange-500", delay: 0.3 }
];

const MOCK_PATIENTS = [
    { initials: "SC", name: "Sofía C.", procedure: "Toxina Botulínica", date: "Hoy, 11:00 AM", color: "bg-rose-500/20 text-rose-300 font-bold" },
    { initials: "MA", name: "María A.", procedure: "Rinomodelación", date: "Ayer", color: "bg-purple-500/20 text-purple-300 font-bold" },
    { initials: "JP", name: "Juliana P.", procedure: "Hydrafacial", date: "Hace 2d", color: "bg-cyan-500/20 text-cyan-300 font-bold" },
    { initials: "CR", name: "Carolina R.", procedure: "Valoración Corporal", date: "Hace 1sem", color: "bg-emerald-500/20 text-emerald-300 font-bold" },
];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const listContainer: Variants = { visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const listItem: Variants = { hidden: { opacity: 0, x: -5 }, visible: { opacity: 1, x: 0 } };


export default function HomePageContent() {
  return (
    <main className="min-h-screen bg-[#050505] text-slate-200 selection:bg-rose-500 selection:text-white font-sans overflow-x-hidden relative">
      
      {/* Fondo Global LIGERO */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[#050505]" />
         <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" style={{ backgroundSize: '30px 30px' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-32 pb-20 md:pb-32">
        
        {/* --- HERO --- */}
        <section className="text-center mb-24 md:mb-40">
           <motion.div 
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
             className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-rose-500/20 bg-rose-950/40 text-rose-300 text-[10px] uppercase tracking-widest font-bold mb-6 shadow-lg"
           >
            <ShieldCheck size={12} /> Gestión Clínica Inteligente
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }} // ✅ CORREGIDO: Se eliminó 'priority: true'
            className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 tracking-tighter leading-[1.1]"
          >
            Automatiza tu Centro Estético <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-purple-500">Y Deja de Perder Pacientes</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed px-2"
          >
            Elimina el caos administrativo. Centraliza citas, historias clínicas y ventas en una plataforma que trabaja mientras tú atiendes en consulta.
          </motion.p>
        </section>

        {/* --- FEATURES (Chat & Calendar) --- */}
        {/* ✅ CORREGIDO: Se eliminó 'contain-paint' para evitar el corte en móviles */}
        <section id="features" className="relative scroll-mt-24 content-visibility-auto">
            
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "200px" }} variants={staggerContainer}
              className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32 md:mb-48"
            >
                {/* ✅ CORREGIDO: Aumentamos altura mínima a 650px para evitar cortes */}
                <div className="order-2 lg:order-1 relative flex justify-center min-h-[650px] items-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.08)_0%,transparent_70%)]" />
                    <div className="relative w-full max-w-[350px] md:max-w-none transform scale-100 lg:scale-110">
                        <AestheticChatAnimation/>
                    </div>
                </div>
                <div className="order-1 lg:order-2 flex flex-col items-center text-center lg:items-center lg:text-center px-2">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center mb-6 md:mb-8 shadow-lg shadow-rose-500/30 mx-auto">
                        <BrainCircuit className="text-white" size={24} />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">Recepción Inteligente <br/><span className="text-rose-400">Sin Esperas</span></h2>
                    <p className="text-slate-300 text-base md:text-lg mb-8 leading-relaxed max-w-lg">Tu recepcionista no puede responder a las 11 PM. Nuestra IA sí. Filtra "curiosos", educa sobre tratamientos y agenda valoraciones automáticamente.</p>
                    <ul className="space-y-4 md:space-y-5 text-left inline-block"> 
                        {["Respuesta inmediata a precios y disponibilidad.", "Clasificación automática de leads cualificados.", "Agendamiento directo en tu sistema.", "Reducción drástica de inasistencias."].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 md:gap-4 text-slate-300 text-sm md:text-base">
                                <div className="mt-0.5 bg-rose-500/10 p-1 rounded-full shrink-0"><CheckCircle2 className="text-rose-500" size={14} /></div><span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </motion.div>

            {/* Feature 2: Calendario */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "200px" }} variants={staggerContainer}
              className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32 md:mb-48"
            >
                <div className="order-1 flex flex-col items-center text-center px-2">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-6 md:mb-8 shadow-lg shadow-purple-500/30 mx-auto">
                        <Clock className="text-white" size={24} />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">Agenda Blindada <br/><span className="text-purple-400">Control de Salas</span></h2>
                    <p className="text-slate-300 text-base md:text-lg mb-8 leading-relaxed max-w-lg">Evita cruces de horarios. Gestiona la disponibilidad de tus doctores, salas de procedimiento y aparatología en tiempo real.</p>
                    <ul className="space-y-4 md:space-y-5 text-left inline-block">
                        {["Confirmación automática vía WhatsApp.", "Asignación inteligente de box/consultorio.", "Control de uso de aparatología.", "Lista de espera automatizada para huecos libres."].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 md:gap-4 text-slate-300 text-sm md:text-base">
                                <div className="mt-0.5 bg-purple-500/10 p-1 rounded-full shrink-0"><CheckCircle2 className="text-purple-500" size={14} /></div><span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="order-2 relative w-full flex justify-center">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.08)_0%,transparent_70%)]" />
                      <div className="w-full max-w-[350px] md:max-w-xl"><CalendarVisual /></div>
                </div>
            </motion.div>
        </section>

        {/* --- HOW (Bento Grid) --- */}
        <section id="how" className="relative scroll-mt-24 mb-32 md:mb-40 content-visibility-auto">
            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 relative z-10 px-4">
                <div className="inline-block mb-4">
                      <span className="px-3 py-1 rounded-full border border-rose-500/30 bg-rose-950/30 text-rose-300 text-[10px] md:text-xs font-mono tracking-widest uppercase shadow-[0_0_15px_-3px_rgba(244,63,94,0.3)]">Software Médico v.2.0</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">El Cerebro Digital de tu Clínica</h2>
                <p className="text-slate-300 text-base md:text-lg px-2">Transformamos datos dispersos en <span className="text-rose-400 font-semibold">rentabilidad y control</span>.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 max-w-6xl mx-auto relative z-10">
                {/* CRM CARD */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="lg:col-span-7 group relative rounded-[24px] md:rounded-[32px] overflow-hidden bg-white/[0.03] border border-white/10 hover:border-rose-500/30 transition-all duration-500 flex flex-col backdrop-blur-lg md:backdrop-blur-xl shadow-2xl shadow-black/20 isolation-isolate transform-gpu translate-z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                    <div className="relative p-6 md:p-10 h-full flex flex-col">
                        <div className="flex items-start justify-between mb-6 md:mb-8">
                            <div className="p-2.5 md:p-3 rounded-2xl bg-rose-950/30 border border-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.1)]"><Database size={24} /></div>
                            <div className="flex gap-1 opacity-30"><div className="w-1 h-1 bg-white rounded-full" /><div className="w-1 h-1 bg-white rounded-full" /><div className="w-6 md:w-8 h-1 bg-white rounded-full" /></div>
                        </div>
                        <div className="mb-6 md:mb-8">
                            <h3 className="text-xl md:text-3xl font-bold text-white mb-2 md:mb-3">Historia Clínica Integrada</h3>
                            <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-lg">Centraliza la información de tus pacientes: consentimientos informados, fotos de evolución y plan de tratamiento en un solo lugar seguro.</p>
                        </div>
                        <div className="mt-auto border-t border-white/5 pt-5 md:pt-6">
                            <div className="flex justify-between items-center mb-3 md:mb-4 px-1">
                                <span className="text-[10px] md:text-xs font-mono text-slate-500 uppercase tracking-wider">Pacientes Recientes</span>
                                <span className="text-[10px] md:text-xs text-rose-400 hover:text-rose-300 cursor-pointer flex items-center gap-1 transition-colors">Ver Todo <ChevronRight size={12}/></span>
                            </div>
                            <motion.div className="space-y-2 md:space-y-3" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={listContainer}>
                                {MOCK_PATIENTS.map((patient, i) => (
                                    <motion.div key={i} variants={listItem} className="flex items-center justify-between p-2.5 md:p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors group/item transform-gpu translate-z-0">
                                        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                                            <div className={`w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full ${patient.color} flex items-center justify-center text-xs md:text-sm shadow-sm`}>{patient.initials}</div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-semibold text-slate-200 group-hover/item:text-white transition-colors truncate">{patient.name}</span>
                                                <div className="flex items-center gap-1.5 mt-0.5"><FileText size={10} className="text-slate-500 shrink-0" /><span className="text-[10px] md:text-xs text-slate-400 truncate">{patient.procedure}</span></div>
                                            </div>
                                        </div>
                                        <div className="hidden sm:flex items-center gap-2 text-slate-500 px-2 md:px-3 py-1 rounded-lg bg-black/20 shrink-0"><CalendarDays size={12} /><span className="text-[10px] md:text-xs font-mono">{patient.date}</span></div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6">
                    {/* REACTIVACIÓN */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.1 }} className="group relative rounded-[24px] md:rounded-[32px] overflow-hidden bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 transition-all duration-500 min-h-[200px] md:min-h-[240px] flex flex-col backdrop-blur-lg shadow-2xl shadow-black/20 transform-gpu translate-z-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <div className="relative p-6 md:p-8 h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <div><h3 className="text-lg md:text-xl font-bold text-white">Reactivación</h3><p className="text-[10px] md:text-xs text-emerald-400/80 uppercase tracking-wider mt-1 font-semibold">Fidelización</p></div>
                                <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-400"><Users className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" /></div>
                            </div>
                            <p className="text-slate-300 text-xs md:text-sm mt-2">Sistema automático: "Paciente X requiere retoque de Botox (6 meses)". Recupera ingresos sin esfuerzo.</p>
                            <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-emerald-500/70 bg-emerald-500/5 px-3 py-1.5 rounded-full w-fit border border-emerald-500/10">
                                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span> Oportunidades hoy
                            </div>
                        </div>
                    </motion.div>

                    {/* MÉTRICAS */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.2 }} className="group relative rounded-[24px] md:rounded-[32px] overflow-hidden bg-white/[0.03] border border-white/10 hover:border-purple-500/30 transition-all duration-500 min-h-[200px] md:min-h-[240px] flex flex-col backdrop-blur-lg shadow-2xl shadow-black/20 transform-gpu translate-z-0">
                         <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <div className="relative p-6 md:p-8 h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <div><h3 className="text-lg md:text-xl font-bold text-white">Rendimiento</h3><p className="text-[10px] md:text-xs text-purple-400/80 uppercase tracking-wider mt-1 font-semibold">Reportes</p></div>
                                <div className="p-2 rounded-lg bg-purple-950/30 border border-purple-500/20 text-purple-400"><CalendarCheck className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" /></div>
                            </div>
                            <p className="text-slate-300 text-xs md:text-sm mt-2 mb-4">Visualiza ocupación de salas, tratamientos más vendidos y facturación mensual.</p>
                            <div className="flex items-end gap-1 md:gap-1.5 h-8 md:h-10 w-full opacity-80 mt-auto">
                                <div className="w-full h-[30%] bg-white/5 rounded-t-[2px] hover:bg-purple-500/40 transition-colors duration-300" />
                                <div className="w-full h-[50%] bg-white/5 rounded-t-[2px] hover:bg-purple-500/40 transition-colors duration-300" />
                                <div className="w-full h-[40%] bg-white/5 rounded-t-[2px] hover:bg-purple-500/40 transition-colors duration-300" />
                                <div className="w-full h-[70%] bg-white/10 rounded-t-[2px] hover:bg-purple-500/60 transition-colors duration-300" />
                                <div className="w-full h-[90%] bg-gradient-to-t from-purple-600 to-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] rounded-t-[2px]" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>

        {/* ... Testimonios ... */}
        <section className="mb-32 md:mb-48 relative px-4 content-visibility-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Historias de <span className="text-rose-400">Éxito Real</span>
            </h2>
            <p className="text-slate-300">Resultados tangibles en clínicas que priorizan el orden.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: t.delay }}
                className="group relative"
              >
                <div className={`absolute -inset-2 bg-gradient-to-r ${t.color} rounded-[2rem] blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                <div className="relative bg-[#0a0a0a] border border-white/10 p-8 rounded-[2rem] h-full flex flex-col shadow-2xl overflow-hidden">
                  <div className="flex gap-1.5 mb-6">
                    <div className="w-2 h-2 rounded-full bg-red-500/50" /><div className="w-2 h-2 rounded-full bg-amber-500/50" /><div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                  </div>
                  <div className="absolute top-6 right-6">
                    <div className={`px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-rose-400 uppercase tracking-tighter`}>{t.metric}</div>
                  </div>
                  <p className="text-slate-300 text-lg leading-relaxed italic mb-8 relative z-10">"{t.text}"</p>
                  <div className="mt-auto flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center font-bold text-white shadow-lg`}>{t.avatar}</div>
                    <div><h4 className="text-white font-bold text-sm">{t.name}</h4><p className="text-slate-500 text-xs">{t.role}</p></div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 opacity-5"><Wifi size={100} className="rotate-45" /></div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ... Pricing (Rediseñado) ... */}
        <section id="pricing" className="relative scroll-mt-24 mb-32 md:mb-40 max-w-4xl mx-auto px-2 content-visibility-auto">
          <motion.div 
             initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
             className="relative rounded-[32px] overflow-hidden border border-fuchsia-500/30 bg-[#080808] shadow-[0_0_60px_-15px_rgba(236,72,153,0.15)] group p-5 md:p-12"
          >
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.1),transparent_50%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(236,72,153,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none" />
            
            <div className="relative flex flex-col items-center text-center z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-950/30 border border-rose-500/30 text-rose-200 text-sm font-bold mb-8 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                <Sparkles size={16} className="fill-rose-200 text-rose-400" /> Plan Clínicas Pro
              </div>

              <div className="flex items-start justify-center gap-1 mb-2">
                <span className="text-2xl md:text-3xl font-bold text-rose-500 mt-2">$</span>
                <h3 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-rose-200 via-fuchsia-400 to-rose-600 tracking-tight drop-shadow-sm">250.000</h3>
              </div>
              <p className="text-xl text-rose-200/60 font-normal mb-6">COP/mes</p>
              <p className="text-slate-300 mb-10 max-w-md mx-auto text-lg">Diseñado para <strong>centros estéticos</strong> que buscan escalar sin caos operativo.</p>

              <div className="w-full max-w-2xl mb-12 text-left p-6 md:p-8 rounded-2xl bg-fuchsia-900/5 border border-fuchsia-500/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Zap className="text-fuchsia-500 fill-fuchsia-500/20" size={20} />
                  <h4 className="text-lg font-bold text-white">Tu membresía incluye:</h4>
                </div>
                <div className="grid gap-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20">
                    <CheckCircle2 className="text-fuchsia-400 shrink-0 mt-0.5" size={20} />
                    <div><span className="text-base md:text-lg font-bold text-white block">300 Conversaciones Inteligentes</span><span className="text-sm text-slate-400">Entrenada para filtrar leads y agendar pacientes.</span></div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-fuchsia-500/5 border border-fuchsia-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-rose-500 to-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">AHORRO</div>
                    <CheckCircle2 className="text-fuchsia-400 shrink-0 mt-0.5" size={20} />
                    <div><span className="text-base md:text-lg font-bold text-white block">Recargas con 80% OFF</span><span className="text-sm text-slate-400">Escala campañas en fechas especiales sin miedo.</span></div>
                  </div>
                  {["Gestión de salas/consultorios", "Recordatorios automáticos", "Soporte Prioritario", "Actualizaciones mensuales", "Sin cláusula de permanencia"].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-300 px-3"><CheckCircle2 className="text-fuchsia-400 shrink-0" size={18} /><span className="text-sm md:text-base font-medium">{feature}</span></div>
                  ))}
                </div>
              </div>

              <div className="w-full pt-8 border-t border-white/5 flex flex-col items-center gap-8">
                <AnimatedGenericCard />
                <div className="w-full flex justify-center items-center gap-8 opacity-60 hover:opacity-100 transition-opacity duration-500">
                    <div className="h-8 w-auto relative">
                        <Image src={visa} alt="Visa" height={32} width={50} unoptimized className="object-contain w-auto h-full grayscale hover:grayscale-0 transition-all duration-300" />
                    </div>
                    <div className="h-8 w-auto relative">
                        <Image src={mastercard} alt="Mastercard" height={32} width={50} unoptimized className="object-contain w-auto h-full grayscale hover:grayscale-0 transition-all duration-300" />
                    </div>
                    <div className="h-8 w-auto relative">
                        <Image src={amex} alt="American Express" height={32} width={50} unoptimized className="object-contain w-auto h-full grayscale hover:grayscale-0 transition-all duration-300" />
                    </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ... CTA ... */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeInUp}
          className="relative py-20 md:py-32 group content-visibility-auto"
        >
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full md:w-[70%] h-[200px] md:h-[300px] bg-rose-900/10 blur-[80px] md:blur-[150px] rounded-full transform-gpu translate-z-0" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto text-center px-4 md:px-6">
                <div className="bg-white/[0.02] backdrop-blur-lg md:backdrop-blur-xl p-8 md:p-12 rounded-[24px] md:rounded-[32px] border border-white/10 shadow-xl shadow-black/30 relative overflow-hidden transition-all duration-500 hover:border-white/20 isolation-isolate">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight drop-shadow-sm">¿Lista para Ordenar <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-purple-300">tu Clínica</span>?</h2>
                    <p className="text-slate-300 max-w-xl mx-auto mb-8 md:mb-10 text-base md:text-lg leading-relaxed font-medium">Deje que la tecnología maneje la parte operativa. Recupere su tiempo y enfoque su energía en sus pacientes.</p>
                    <Link href="/register" className="relative z-10 inline-block group/btn w-full md:w-auto">
                        <div className="relative">
                            <div className="absolute -inset-2 bg-gradient-to-r from-rose-700 to-purple-700 rounded-2xl blur-xl opacity-30 group-hover/btn:opacity-50 transition-opacity duration-500" />
                            <button className="relative w-full md:w-auto bg-white text-black font-bold text-base md:text-lg px-8 md:px-10 py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2 mx-auto">
                                <Zap className="text-rose-500" size={18} /> Iniciar Prueba Gratis <ChevronRight className="group-hover/btn:translate-x-1 transition-transform text-rose-600" size={20} />
                            </button>
                        </div>
                    </Link>
                </div>
            </div>
        </motion.section>

        {/* ... FAQ (Lazy loaded por defecto porque es dynamic) ... */}
        <section id="faqs" className="relative scroll-mt-24 mt-20 content-visibility-auto">
             <LandingFAQ />
        </section>

      </div>
    </main>
  );
}