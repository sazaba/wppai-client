// import HeroSection from "./components/HeroSection"
// import FeaturesSection from "./components/FeaturesSection"
// import HowItWorksSection from "./components/HowItWorksSection"
// import PricingSection from "./components/PricingSection"
// import Testimony from "./components/Testimony"
// import KeyBenefits from "./components/KeyBenefits"
// import LandingFAQ from "./components/LandingFAQ"

// export default function HomePage() {
//   return (
//     // CAMBIO: Redujimos gap-12/gap-24 a gap-8/gap-16
//     <div className="w-full flex flex-col gap-8 md:gap-16 pb-16 overflow-x-hidden"> 
      
//       <HeroSection />

//       <section id="features" className="relative scroll-mt-20">
//         <FeaturesSection />
//       </section>

//       <section id="how" className="relative scroll-mt-20">
//         <HowItWorksSection />
//       </section>

//       <section id="pricing" className="relative scroll-mt-20">
//         <PricingSection />
//       </section>

//       <Testimony />
      
//       <KeyBenefits />

//       <section id="faqs" className="relative scroll-mt-20">
//         <LandingFAQ />
//       </section>
//     </div>
//   )
// }


'use client'

import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Clock, Users, Database, BrainCircuit, CalendarCheck, ChevronRight, FileText, CalendarDays, Zap, Wifi, Star } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image'; 
import dynamic from 'next/dynamic';

// --- IMPORTAMOS TU COMPONENTE DE FAQ ORIGINAL ---
// (Asegúrate de que la ruta sea correcta)
import LandingFAQ from "./components/LandingFAQ"; 

// --- IMPORTACIÓN DE IMÁGENES ---
import visa from './images/visa-logo.webp';
import amex from './images/american-express.webp';
import mastercard from './images/mastercard-logo.webp';

// --- IMPORTACIÓN DINÁMICA DE LOS COMPONENTES NUEVOS ---
const CalendarVisual = dynamic(() => import('./components/CalendarVisual'), {
  ssr: false,
  loading: () => <div className="w-full max-w-xl h-[350px] bg-white/5 border border-white/5 rounded-3xl animate-pulse mx-auto" />
});

const AestheticChatAnimation = dynamic(() => import('./components/AestheticChatAnimation'), {
  ssr: false,
  loading: () => <div className="w-[300px] h-[580px] bg-zinc-900 rounded-[3.5rem] border-4 border-zinc-800 animate-pulse mx-auto opacity-50" />
});

const AnimatedGenericCard = dynamic(() => import('./components/AnimatedGenericCard'), {
  ssr: false,
  loading: () => <div className="w-full max-w-[320px] aspect-[1.586/1] bg-white/5 rounded-2xl animate-pulse mx-auto border border-white/10" />
});

// --- DATOS Y CONFIGURACIÓN ---
const TESTIMONIALS = [
  { name: "Dra. Valentina H.", role: "CEO Eternal Beauty", text: "Mis pacientes preguntan mucho por precios de Botox. La IA contesta, filtra y solo me agenda los que van en serio. Impresionante.", metric: "+50 citas/mes", avatar: "VH", color: "from-rose-600 to-pink-500", delay: 0.1 },
  { name: "Dr. Andrés Meza", role: "Cirujano Plástico", text: "La gestión de las cabinas era un caos. Ahora el sistema sabe qué esteticista y qué máquina están libres. Cero errores.", metric: "98% Ocupación", avatar: "AM", color: "from-purple-600 to-indigo-500", delay: 0.2 },
  { name: "Clínica Piel & Ser", role: "Gerencia", text: "El motor de reactivación es oro. El sistema contacta solo a pacientes que necesitan retoque de ácido hialurónico.", metric: "+30% Retornos", avatar: "PS", color: "from-amber-600 to-orange-500", delay: 0.3 }
];

const MOCK_PATIENTS = [
    { initials: "SC", name: "Sofía C.", procedure: "Toxina Botulínica", date: "Hoy, 11:00 AM", color: "bg-rose-500/20 text-rose-300 font-bold" },
    { initials: "MA", name: "María A.", procedure: "Rinomodelación", date: "Ayer", color: "bg-purple-500/20 text-purple-300 font-bold" },
    { initials: "JP", name: "Juliana P.", procedure: "Hydrafacial", date: "Hace 2d", color: "bg-cyan-500/20 text-cyan-300 font-bold" },
    { initials: "CR", name: "Carolina R.", procedure: "Valoración Corporal", date: "Hace 1sem", color: "bg-emerald-500/20 text-emerald-300 font-bold" },
];

// --- FRAMER MOTION VARIANTS ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const listContainer: Variants = { visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const listItem: Variants = { hidden: { opacity: 0, x: -5 }, visible: { opacity: 1, x: 0 } };
const pulseDeep: Variants = { animate: { opacity: [0.3, 0.45, 0.3], scale: [1, 1.02, 1], transition: { duration: 8, repeat: Infinity, ease: "easeInOut" } } };

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  return (
    <main className="min-h-screen bg-[#050505] text-slate-200 selection:bg-rose-500 selection:text-white font-sans overflow-x-hidden relative">
      
      {/* === FONDO GLOBAL === */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.10)_0%,transparent_70%)] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.15)_0%,transparent_70%)] translate-x-1/3 translate-y-1/3" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" style={{ backgroundSize: '30px 30px' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-20 md:pb-32">
        
    {/* --- HERO --- */}
<section className="text-center mb-24 md:mb-40 pt-10">
   <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-rose-500/20 bg-rose-950/40 text-rose-300 text-[10px] uppercase tracking-widest font-bold mb-6 shadow-lg animate-fade-in-up">
    <Sparkles size={12} /> Inteligencia Artificial para Clínicas
  </div>
  <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 tracking-tighter leading-[1.1] animate-fade-in-up [animation-delay:100ms] opacity-0 fill-mode-forwards">
    Automatiza tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-purple-500">Clínica Estética</span> <br className="hidden md:block" />
    <span className="text-white">Sin Perder el Glamour</span>
  </h1>
  <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed px-2 animate-fade-in-up [animation-delay:200ms] opacity-0 fill-mode-forwards">
    La plataforma que gestiona pacientes, cabinas y recordatorios de tu centro estético mientras tú te enfocas en realizar tratamientos.
  </p>
</section>


        {/* ================= ID: FEATURES (CHAT + CALENDAR) ================= */}
        <section id="features" className="relative scroll-mt-24">
            
            {/* FEATURE 1: CHAT */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
              className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32 md:mb-48 content-visibility-auto"
            >
                <motion.div variants={fadeInUp} className="order-2 lg:order-1 relative flex justify-center min-h-[580px]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.1)_0%,transparent_70%)]" />
                    <div className="relative w-full max-w-[350px] md:max-w-none transform scale-100 lg:scale-110 transition-transform duration-700">
                        <AestheticChatAnimation/>
                    </div>
                </motion.div>
                <motion.div variants={fadeInUp} className="order-1 lg:order-2 flex flex-col items-center text-center lg:items-center lg:text-center px-2">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center mb-6 md:mb-8 shadow-lg shadow-rose-500/30 mx-auto">
                        <BrainCircuit className="text-white" size={24} />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">Tu Asistente Estética <br/><span className="text-rose-400">Disponible 24/7</span></h2>
                    <p className="text-slate-400 text-base md:text-lg mb-8 leading-relaxed max-w-lg">Olvídate de responder precios de Botox todo el día. Nuestra IA conoce tus tratamientos y <strong>vende por ti</strong>.</p>
                    <ul className="space-y-4 md:space-y-5 text-left inline-block"> 
                        {["Responde costos y duración de tratamientos.", "Filtra curiosos vs. pacientes reales.", "Agenda valoraciones automáticamente.", "Reduce el ausentismo en cabina."].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 md:gap-4 text-slate-300 text-sm md:text-base">
                                <div className="mt-0.5 bg-rose-500/10 p-1 rounded-full shrink-0"><CheckCircle2 className="text-rose-500" size={14} /></div><span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            </motion.div>

            {/* FEATURE 2: CALENDARIO */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
              className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32 md:mb-48 content-visibility-auto"
            >
                <motion.div variants={fadeInUp} className="order-1 flex flex-col items-center text-center px-2">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-6 md:mb-8 shadow-lg shadow-purple-500/30 mx-auto">
                        <Clock className="text-white" size={24} />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">Agenda Inteligente <br/><span className="text-purple-400">Control de Cabinas</span></h2>
                    <p className="text-slate-400 text-base md:text-lg mb-8 leading-relaxed max-w-lg">Coordina doctores, aparatología y salas de procedimiento sin cruces de horarios.</p>
                    <ul className="space-y-4 md:space-y-5 text-left inline-block">
                        {["Confirmación vía WhatsApp (menos inasistencias).", "Gestión de especialistas y aparatología.", "Recordatorios de retoques (ej. Botox cada 6 meses).", "Lista de espera automatizada."].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 md:gap-4 text-slate-300 text-sm md:text-base">
                                <div className="mt-0.5 bg-purple-500/10 p-1 rounded-full shrink-0"><CheckCircle2 className="text-purple-500" size={14} /></div><span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
                <motion.div variants={fadeInUp} className="order-2 relative w-full flex justify-center">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0%,transparent_70%)]" />
                      <div className="w-full max-w-[350px] md:max-w-xl"><CalendarVisual /></div>
                </motion.div>
            </motion.div>

        </section>


        {/* ================= ID: HOW (BENTO GRID - CÓMO FUNCIONA/BENEFICIOS) ================= */}
        <section id="how" className="relative scroll-mt-24 mb-32 md:mb-40 content-visibility-auto">
            <div className="absolute top-0 left-[-20%] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.05)_0%,transparent_70%)] pointer-events-none" />
            
            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 relative z-10 px-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="inline-block mb-4">
                      <span className="px-3 py-1 rounded-full border border-rose-500/30 bg-rose-950/30 text-rose-300 text-[10px] md:text-xs font-mono tracking-widest uppercase shadow-[0_0_15px_-3px_rgba(244,63,94,0.3)]">Beauty OS v.2.0</span>
                </motion.div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">El Cerebro Digital de tu Clínica</h2>
                <p className="text-slate-400 text-base md:text-lg px-2">Transformamos datos en <span className="text-rose-400 font-semibold">belleza y rentabilidad</span>.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 max-w-6xl mx-auto relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="lg:col-span-7 group relative rounded-[24px] md:rounded-[32px] overflow-hidden bg-white/[0.03] border border-white/10 hover:border-rose-500/30 transition-all duration-500 flex flex-col backdrop-blur-lg md:backdrop-blur-xl shadow-2xl shadow-black/20 isolation-isolate transform-gpu translate-z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                    <div className="relative p-6 md:p-10 h-full flex flex-col">
                        <div className="flex items-start justify-between mb-6 md:mb-8">
                            <div className="p-2.5 md:p-3 rounded-2xl bg-rose-950/30 border border-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.1)]"><Database size={24} /></div>
                            <div className="flex gap-1 opacity-30"><div className="w-1 h-1 bg-white rounded-full" /><div className="w-1 h-1 bg-white rounded-full" /><div className="w-6 md:w-8 h-1 bg-white rounded-full" /></div>
                        </div>
                        <div className="mb-6 md:mb-8">
                            <h3 className="text-xl md:text-3xl font-bold text-white mb-2 md:mb-3">CRM Estético</h3>
                            <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-lg">Historial de tratamientos, fotos de antes/después y preferencias de cada paciente en un solo lugar.</p>
                        </div>
                        <div className="mt-auto border-t border-white/5 pt-5 md:pt-6">
                            <div className="flex justify-between items-center mb-3 md:mb-4 px-1">
                                <span className="text-[10px] md:text-xs font-mono text-slate-500 uppercase tracking-wider">Últimos Pacientes</span>
                                <span className="text-[10px] md:text-xs text-rose-400 hover:text-rose-300 cursor-pointer flex items-center gap-1 transition-colors">Ver Todo <ChevronRight size={12}/></span>
                            </div>
                            <motion.div className="space-y-2 md:space-y-3" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={listContainer}>
                                {MOCK_PATIENTS.map((patient, i) => (
                                    <motion.div key={i} variants={listItem} className="flex items-center justify-between p-2.5 md:p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors group/item transform-gpu translate-z-0">
                                        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                                            <div className={`w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full ${patient.color} flex items-center justify-center text-xs md:text-sm shadow-sm`}>{patient.initials}</div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-semibold text-slate-200 group-hover/item:text-white transition-colors truncate">{patient.name}</span>
                                                <div className="flex items-center gap-1.5 mt-0.5"><Star size={10} className="text-slate-500 shrink-0" /><span className="text-[10px] md:text-xs text-slate-400 truncate">{patient.procedure}</span></div>
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
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.1 }} className="group relative rounded-[24px] md:rounded-[32px] overflow-hidden bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 transition-all duration-500 min-h-[200px] md:min-h-[240px] flex flex-col backdrop-blur-lg md:backdrop-blur-xl shadow-2xl shadow-black/20 transform-gpu translate-z-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <div className="relative p-6 md:p-8 h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <div><h3 className="text-lg md:text-xl font-bold text-white">Reactivación</h3><p className="text-[10px] md:text-xs text-emerald-400/80 uppercase tracking-wider mt-1 font-semibold">Ciclo de Vida</p></div>
                                <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-400"><Users className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" /></div>
                            </div>
                            <p className="text-slate-400 text-xs md:text-sm mt-2">Alerta automática: "Paciente X requiere retoque de Botox (6 meses)". Recupera ventas pasadas.</p>
                            <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-emerald-500/70 bg-emerald-500/5 px-3 py-1.5 rounded-full w-fit border border-emerald-500/10">
                                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span> Oportunidades hoy
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.2 }} className="group relative rounded-[24px] md:rounded-[32px] overflow-hidden bg-white/[0.03] border border-white/10 hover:border-purple-500/30 transition-all duration-500 min-h-[200px] md:min-h-[240px] flex flex-col backdrop-blur-lg md:backdrop-blur-xl shadow-2xl shadow-black/20 transform-gpu translate-z-0">
                         <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <div className="relative p-6 md:p-8 h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <div><h3 className="text-lg md:text-xl font-bold text-white">Métricas Clave</h3><p className="text-[10px] md:text-xs text-purple-400/80 uppercase tracking-wider mt-1 font-semibold">Dashboard</p></div>
                                <div className="p-2 rounded-lg bg-purple-950/30 border border-purple-500/20 text-purple-400"><CalendarCheck className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" /></div>
                            </div>
                            <p className="text-slate-400 text-xs md:text-sm mt-2 mb-4">Citas agendadas, cancelaciones y tasa de conversión.</p>
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


        {/* ================= TESTIMONIOS (SIN ID ESPECÍFICO) ================= */}
        <section className="mb-32 md:mb-48 relative px-4 content-visibility-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Historias de <span className="text-rose-400">Éxito Real</span>
            </h2>
            <p className="text-slate-400">Resultados tangibles en centros estéticos líderes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: t.delay }}
                className="group relative"
              >
                <div className={`absolute -inset-2 bg-gradient-to-r ${t.color} rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
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


        {/* ================= ID: PRICING (MEMBRESÍA ÉLITE) ================= */}
        <section id="pricing" className="relative scroll-mt-24 mb-32 md:mb-40 max-w-4xl mx-auto px-2 content-visibility-auto">
          <motion.div 
             initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
             className="relative rounded-[32px] overflow-hidden border border-amber-500/20 bg-[#080808] shadow-[0_0_60px_-15px_rgba(217,119,6,0.15)] group p-5 md:p-12"
          >
            
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.1),transparent_50%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(251,191,36,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none" />
            
            <div className="relative flex flex-col items-center text-center z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/30 border border-amber-500/30 text-amber-200 text-sm font-bold mb-8 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                <Sparkles size={16} className="fill-amber-200 text-amber-400" /> Plan Gold Estético
              </div>

              <div className="flex items-start justify-center gap-1 mb-2">
                <span className="text-2xl md:text-3xl font-bold text-amber-500 mt-2">$</span>
                <h3 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 tracking-tight drop-shadow-sm">250.000</h3>
              </div>
              <p className="text-xl text-amber-200/60 font-normal mb-6">COP/mes</p>
              <p className="text-slate-300 mb-10 max-w-md mx-auto text-lg">Diseñado para <strong>clínicas estéticas y spas</strong> que necesitan llenar su agenda sin esfuerzo.</p>

              {/* Lista de Beneficios */}
              <div className="w-full max-w-2xl mb-12 text-left p-6 md:p-8 rounded-2xl bg-amber-900/5 border border-amber-500/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Zap className="text-amber-500 fill-amber-500/20" size={20} />
                  <h4 className="text-lg font-bold text-white">Tu membresía incluye:</h4>
                </div>
                <div className="grid gap-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <CheckCircle2 className="text-amber-400 shrink-0 mt-0.5" size={20} />
                    <div><span className="text-base md:text-lg font-bold text-white block">300 Conversaciones IA</span><span className="text-sm text-slate-400">Entrenada para vender Botox y aparatología.</span></div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">AHORRO</div>
                    <CheckCircle2 className="text-amber-400 shrink-0 mt-0.5" size={20} />
                    <div><span className="text-base md:text-lg font-bold text-white block">Recargas con 80% OFF</span><span className="text-sm text-slate-400">Escala tu campaña publicitaria sin miedo.</span></div>
                  </div>
                  {["Dashboard de pacientes", "Agenda multicabina", "Soporte VIP", "Actualizaciones de tratamientos", "Sin permanencia"].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-300 px-3"><CheckCircle2 className="text-amber-400 shrink-0" size={18} /><span className="text-sm md:text-base font-medium">{feature}</span></div>
                  ))}
                </div>
              </div>

              {/* SECCIÓN PAGO: Tarjeta Genérica + Logos */}
              <div className="w-full pt-8 border-t border-white/5 flex flex-col items-center gap-8">
                <AnimatedGenericCard />
                <div className="w-full flex justify-center items-center gap-8 opacity-60 hover:opacity-100 transition-opacity duration-500">
                    <div className="h-8 w-auto relative">
                        <Image src={visa} alt="Visa" height={32} width={50} sizes="(max-width: 768px) 50px, 60px" className="object-contain w-auto h-full grayscale hover:grayscale-0 transition-all duration-300" />
                    </div>
                    <div className="h-8 w-auto relative">
                        <Image src={mastercard} alt="Mastercard" height={32} width={50} sizes="(max-width: 768px) 50px, 60px" className="object-contain w-auto h-full grayscale hover:grayscale-0 transition-all duration-300" />
                    </div>
                    <div className="h-8 w-auto relative">
                        <Image src={amex} alt="American Express" height={32} width={50} sizes="(max-width: 768px) 50px, 60px" className="object-contain w-auto h-full grayscale hover:grayscale-0 transition-all duration-300" />
                    </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>


        {/* ================= CTA FINAL ================= */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeInUp}
          className="relative py-20 md:py-32 group content-visibility-auto"
        >
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full md:w-[70%] h-[200px] md:h-[300px] bg-rose-900/10 blur-[80px] md:blur-[150px] rounded-full transform-gpu translate-z-0" />
                <motion.div variants={pulseDeep} animate="animate" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full md:w-[80%] h-full md:h-[80%] bg-purple-900/05 blur-[100px] md:blur-[180px] rounded-full opacity-60 transform-gpu translate-z-0"/>
            </div>

            <div className="relative z-10 max-w-3xl mx-auto text-center px-4 md:px-6">
                <div className="bg-white/[0.02] backdrop-blur-lg md:backdrop-blur-2xl p-8 md:p-12 rounded-[24px] md:rounded-[32px] border border-white/10 shadow-xl shadow-black/30 relative overflow-hidden transition-all duration-500 hover:border-white/20 isolation-isolate">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight drop-shadow-sm">¿Lista para el <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-purple-300">Siguiente Nivel</span>?</h2>
                    <p className="text-slate-400 max-w-xl mx-auto mb-8 md:mb-10 text-base md:text-lg leading-relaxed font-medium">Deje que la IA maneje su agenda. Recupere su tiempo y enfoque su energía en resaltar la belleza de sus pacientes.</p>
                    <Link href="/register" className="relative z-10 inline-block group/btn w-full md:w-auto">
                        <div className="relative">
                            <div className="absolute -inset-2 bg-gradient-to-r from-rose-700 to-purple-700 rounded-2xl blur-xl opacity-30 group-hover/btn:opacity-50 transition-opacity duration-500" />
                            <button className="relative w-full md:w-auto bg-white text-black font-bold text-base md:text-lg px-8 md:px-10 py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2 mx-auto">
                                <Zap className="text-amber-500" size={18} /> Iniciar Transformación <ChevronRight className="group-hover/btn:translate-x-1 transition-transform text-rose-600" size={20} />
                            </button>
                        </div>
                    </Link>
                </div>
            </div>
        </motion.section>


        {/* ================= ID: FAQS (COMPONENTE ORIGINAL) ================= */}
        {/* Mantenemos tu componente de FAQ original para que el link del Navbar funcione */}
        <section id="faqs" className="relative scroll-mt-24 mt-20">
             <LandingFAQ />
        </section>

      </div>
    </main>
  );
}