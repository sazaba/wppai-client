'use client'

import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Clock, Users, Database, BrainCircuit, CalendarCheck, ChevronRight, FileText, CalendarDays, Zap, Wifi } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image'; 
import dynamic from 'next/dynamic';

// --- IMPORTACIÓN DE IMÁGENES ---
import visa from '../images/visa-logo.webp';
import amex from '../images/american-express.webp';
import mastercard from '../images/mastercard-logo.webp';
import wasaaaLogo from '../images/Logo-Wasaaa.webp';

// --- IMPORTACIÓN DINÁMICA (LA CLAVE PARA SAFARI) ---
// Estos componentes pesados no se cargan hasta que el navegador está listo.

const CalendarVisual = dynamic(() => import('./components/CalendarVisual'), {
  ssr: false,
  loading: () => <div className="w-full max-w-xl h-[350px] bg-white/5 border border-white/5 rounded-3xl animate-pulse mx-auto" />
});

const DentalChatAnimation = dynamic(() => import('./components/DentalChatAnimation'), {
  ssr: false,
  loading: () => <div className="w-[300px] h-[580px] bg-zinc-900 rounded-[3.5rem] border-4 border-zinc-800 animate-pulse mx-auto opacity-50" />
});

// AQUI ESTÁ EL FIX: Importamos la tarjeta dinámicamente en lugar de definirla aquí
const AnimatedGenericCard = dynamic(() => import('./components/AnimatedGenericCard'), {
  ssr: false,
  loading: () => (
    // Placeholder del tamaño exacto de la tarjeta para evitar saltos
    <div className="w-full max-w-[320px] aspect-[1.586/1] bg-white/5 rounded-2xl border border-white/10 animate-pulse mx-auto" />
  )
});

const DownloadButton = dynamic(() => import('./components/DownloadButton'), {
  ssr: false,
  loading: () => <span className="text-xs text-slate-500 animate-pulse">Cargando opción de descarga...</span>,
});

// --- CONSTANTES ---
const TESTIMONIALS = [
  { name: "Dra. Beatriz Molina", role: "Directora en OdontoSpecial", text: "Al principio dudé de si una IA entendería términos como 'endodoncia birradicular'. Me equivoqué. Hoy gestiona el 80% de mis citas.", metric: "+45 citas/mes", avatar: "BM", color: "from-blue-600 to-cyan-500", delay: 0.1 },
  { name: "Dr. Camilo Restrepo", role: "Ortodoncista", text: "Antes, mi secretaria pasaba 3 horas al día llamando. Ahora, el sistema envía recordatorios y procesa confirmaciones solo.", metric: "95% Confirmación", avatar: "CR", color: "from-purple-600 to-indigo-500", delay: 0.2 },
  { name: "Clínica Dental Sonrisas", role: "Administración", text: "La recepcionista ya no vive estresada. El bot filtra los 'curiosos' y solo nos pasa los pacientes que ya saben precios.", metric: "-70% Carga", avatar: "DS", color: "from-emerald-600 to-teal-500", delay: 0.3 }
];

const MOCK_PATIENTS = [
    { initials: "LG", name: "Laura García", procedure: "Control Ortodoncia", date: "Hoy, 10:30 AM", color: "bg-purple-500/20 text-purple-300 font-bold" },
    { initials: "CR", name: "Carlos R.", procedure: "Implante Dental", date: "Ayer", color: "bg-blue-500/20 text-blue-300 font-bold" },
    { initials: "MP", name: "María Pérez", procedure: "Blanqueamiento", date: "Hace 2d", color: "bg-cyan-500/20 text-cyan-300 font-bold" },
    { initials: "JL", name: "Jorge López", procedure: "Profilaxis", date: "Hace 1sem", color: "bg-emerald-500/20 text-emerald-300 font-bold" },
];

// --- VARIANTES FRAMER MOTION ---
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

export default function DentalProposal() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  return (
    <main className="min-h-screen bg-[#050505] text-slate-200 selection:bg-cyan-500 selection:text-black font-sans overflow-x-hidden relative transform-gpu">
      
      {/* Background Glows (Optimizados con will-change para Safari) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden will-change-transform translate-z-0">
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-slate-900/90 via-[#050505] to-[#050505]" />
        <div className="absolute top-[10%] left-[0%] w-[250px] md:w-[600px] h-[250px] md:h-[600px] bg-cyan-900/10 rounded-full blur-[80px] opacity-40 mix-blend-screen" />
        <div className="absolute bottom-[20%] right-[0%] w-[200px] md:w-[500px] h-[200px] md:h-[500px] bg-purple-900/10 rounded-full blur-[80px] opacity-40 mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-28 md:pt-44 pb-20 md:pb-32">
        
        {/* --- HERO (CSS PURO = Carga Inmediata) --- */}
        <section className="text-center mb-24 md:mb-40 pt-10">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/40 text-cyan-300 text-[10px] uppercase tracking-widest font-bold mb-6 md:mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.1)] animate-fade-in-up">
            <Sparkles size={12} /> Inteligencia Artificial Odontológica
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 tracking-tighter leading-[1.1] animate-fade-in-up [animation-delay:100ms] opacity-0 fill-mode-forwards">
            Automatiza tu Clínica <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Sin Perder el Toque Humano</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed px-2 animate-fade-in-up [animation-delay:200ms] opacity-0 fill-mode-forwards">
            La plataforma que agenda, confirma y organiza sus pacientes mientras usted se dedica a la odontología.
          </p>
        </section>

        {/* --- FEATURE 1 (Chat Lazy Loaded) --- */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
          className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32 md:mb-48 content-visibility-auto"
        >
            <motion.div variants={fadeInUp} className="order-2 lg:order-1 relative flex justify-center transform-gpu min-h-[580px]">
                <div className="absolute inset-0 bg-indigo-500/10 blur-[50px] md:blur-[90px] rounded-full" />
                <div className="relative w-full max-w-[350px] md:max-w-none transform scale-100 lg:scale-110 transition-transform duration-700">
                    <DentalChatAnimation/>
                </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="order-1 lg:order-2 flex flex-col items-center text-center lg:items-center lg:text-center px-2">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 md:mb-8 shadow-lg shadow-indigo-500/30 mx-auto">
                    <BrainCircuit className="text-white" size={24} />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">Tu Recepcionista Experta <br/><span className="text-indigo-400">Disponible 24/7</span></h2>
                <p className="text-slate-400 text-base md:text-lg mb-8 leading-relaxed max-w-lg">Olvídate de responder lo mismo 100 veces al día. Nuestro asistente IA está entrenado exclusivamente con <strong>terminología odontológica</strong>.</p>
                <ul className="space-y-4 md:space-y-5 text-left inline-block"> 
                    {["Responde precios, horarios y ubicación.", "Filtra curiosos: Solo notifica intención real.", "Optimizado para no hablar de temas externos.", "Ahorra el 90% del trabajo manual."].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 md:gap-4 text-slate-300 text-sm md:text-base">
                            <div className="mt-0.5 bg-indigo-500/10 p-1 rounded-full shrink-0"><CheckCircle2 className="text-indigo-500" size={14} /></div><span>{item}</span>
                        </li>
                    ))}
                </ul>
            </motion.div>
        </motion.section>

        {/* --- FEATURE 2 (Calendar Lazy Loaded) --- */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
          className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32 md:mb-48 content-visibility-auto"
        >
            <motion.div variants={fadeInUp} className="order-1 flex flex-col items-center text-center px-2">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 md:mb-8 shadow-lg shadow-purple-500/30 mx-auto">
                    <Clock className="text-white" size={24} />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">Agenda que Trabaja Sola <br/><span className="text-purple-400">Cero Ausentismo</span></h2>
                <p className="text-slate-400 text-base md:text-lg mb-8 leading-relaxed max-w-lg">Control total sobre tus doctores, sillones y tiempos. Diseñado para clínicas de alto flujo.</p>
                <ul className="space-y-4 md:space-y-5 text-left inline-block">
                    {["Confirmación automática vía WhatsApp.", "Gestión multi-doctor y filtrado especialista.", "Alertas inmediatas de cancelación.", "Bloqueo inteligente de horarios."].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 md:gap-4 text-slate-300 text-sm md:text-base">
                            <div className="mt-0.5 bg-purple-500/10 p-1 rounded-full shrink-0"><CheckCircle2 className="text-purple-500" size={14} /></div><span>{item}</span>
                        </li>
                    ))}
                </ul>
            </motion.div>
            <motion.div variants={fadeInUp} className="order-2 relative w-full flex justify-center transform-gpu">
                  <div className="absolute inset-0 bg-purple-500/10 blur-[50px] md:blur-[90px] rounded-full" />
                  <div className="w-full max-w-[350px] md:max-w-xl"><CalendarVisual /></div>
            </motion.div>
        </motion.section>

        {/* --- FEATURE 3 (BENTO GRID) --- */}
        <section className="mb-32 md:mb-40 relative content-visibility-auto">
            <div className="absolute top-0 left-[-20%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-600/10 blur-[80px] md:blur-[130px] rounded-full -z-10 pointer-events-none transform-gpu translate-z-0" />
            <div className="absolute bottom-0 right-[-20%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-500/10 blur-[80px] md:blur-[130px] rounded-full -z-10 pointer-events-none transform-gpu translate-z-0" />

            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 relative z-10 px-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="inline-block mb-4">
                      <span className="px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-300 text-[10px] md:text-xs font-mono tracking-widest uppercase shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]">Core System v.2.0</span>
                </motion.div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">El Cerebro Digital de tu Clínica</h2>
                <p className="text-slate-400 text-base md:text-lg px-2">Transformamos datos dispersos en <span className="text-cyan-400 font-semibold">control operativo</span> absoluto.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 max-w-6xl mx-auto relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="lg:col-span-7 group relative rounded-[24px] md:rounded-[32px] overflow-hidden bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 transition-all duration-500 flex flex-col backdrop-blur-lg md:backdrop-blur-xl shadow-2xl shadow-black/20 isolation-isolate transform-gpu translate-z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                    <div className="relative p-6 md:p-10 h-full flex flex-col">
                        <div className="flex items-start justify-between mb-6 md:mb-8">
                            <div className="p-2.5 md:p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]"><Database size={24} /></div>
                            <div className="flex gap-1 opacity-30"><div className="w-1 h-1 bg-white rounded-full" /><div className="w-1 h-1 bg-white rounded-full" /><div className="w-6 md:w-8 h-1 bg-white rounded-full" /></div>
                        </div>
                        <div className="mb-6 md:mb-8">
                            <h3 className="text-xl md:text-3xl font-bold text-white mb-2 md:mb-3">Historial Clínico de Marketing</h3>
                            <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-lg">Tu base de datos organizada y viva. Accede al perfil de cada paciente y toma decisiones basadas en datos reales.</p>
                        </div>
                        <div className="mt-auto border-t border-white/5 pt-5 md:pt-6">
                            <div className="flex justify-between items-center mb-3 md:mb-4 px-1">
                                <span className="text-[10px] md:text-xs font-mono text-slate-500 uppercase tracking-wider">Actividad Reciente</span>
                                <span className="text-[10px] md:text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1 transition-colors">Ver Todo <ChevronRight size={12}/></span>
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
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.1 }} className="group relative rounded-[24px] md:rounded-[32px] overflow-hidden bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 transition-all duration-500 min-h-[200px] md:min-h-[240px] flex flex-col backdrop-blur-lg md:backdrop-blur-xl shadow-2xl shadow-black/20 transform-gpu translate-z-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <div className="relative p-6 md:p-8 h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <div><h3 className="text-lg md:text-xl font-bold text-white">Motor de Reactivación</h3><p className="text-[10px] md:text-xs text-emerald-400/80 uppercase tracking-wider mt-1 font-semibold">Gestión de Retorno</p></div>
                                <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-400"><Users className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" /></div>
                            </div>
                            <p className="text-slate-400 text-xs md:text-sm mt-2">Identifica oportunidades. La plataforma resalta quiénes son tus pacientes inactivos.</p>
                            <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-emerald-500/70 bg-emerald-500/5 px-3 py-1.5 rounded-full w-fit border border-emerald-500/10">
                                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span> Oportunidades hoy
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.2 }} className="group relative rounded-[24px] md:rounded-[32px] overflow-hidden bg-white/[0.03] border border-white/10 hover:border-blue-500/30 transition-all duration-500 min-h-[200px] md:min-h-[240px] flex flex-col backdrop-blur-lg md:backdrop-blur-xl shadow-2xl shadow-black/20 transform-gpu translate-z-0">
                         <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <div className="relative p-6 md:p-8 h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <div><h3 className="text-lg md:text-xl font-bold text-white">Métricas de Citas</h3><p className="text-[10px] md:text-xs text-blue-400/80 uppercase tracking-wider mt-1 font-semibold">Dashboard CRM</p></div>
                                <div className="p-2 rounded-lg bg-blue-950/30 border border-blue-500/20 text-blue-400"><CalendarCheck className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" /></div>
                            </div>
                            <p className="text-slate-400 text-xs md:text-sm mt-2 mb-4">Visualiza el rendimiento mensual: Citas agendadas y pacientes nuevos.</p>
                            <div className="flex items-end gap-1 md:gap-1.5 h-8 md:h-10 w-full opacity-80 mt-auto">
                                <div className="w-full h-[30%] bg-white/5 rounded-t-[2px] hover:bg-blue-500/40 transition-colors duration-300" />
                                <div className="w-full h-[50%] bg-white/5 rounded-t-[2px] hover:bg-blue-500/40 transition-colors duration-300" />
                                <div className="w-full h-[40%] bg-white/5 rounded-t-[2px] hover:bg-blue-500/40 transition-colors duration-300" />
                                <div className="w-full h-[70%] bg-white/10 rounded-t-[2px] hover:bg-blue-500/60 transition-colors duration-300" />
                                <div className="w-full h-[90%] bg-gradient-to-t from-blue-600 to-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] rounded-t-[2px]" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>

        {/* --- TESTIMONIOS DISRUPTIVOS --- */}
        <section className="mb-32 md:mb-48 relative px-4 content-visibility-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Historias de <span className="text-cyan-400">Éxito Real</span>
            </h2>
            <p className="text-slate-400">Resultados tangibles en clínicas que ya dieron el salto.</p>
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
                    <div className={`px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-cyan-400 uppercase tracking-tighter`}>{t.metric}</div>
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

        {/* --- NUEVA SECCIÓN: MEMBRESÍA ÉLITE --- */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
          className="relative mb-32 md:mb-40 max-w-4xl mx-auto px-2 content-visibility-auto"
        >
          <div className="relative rounded-[32px] overflow-hidden border border-amber-500/20 bg-[#080808] shadow-[0_0_60px_-15px_rgba(217,119,6,0.15)] group p-5 md:p-12">
            
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.1),transparent_50%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(251,191,36,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none" />
            
            <div className="relative flex flex-col items-center text-center z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/30 border border-amber-500/30 text-amber-200 text-sm font-bold mb-8 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                <Sparkles size={16} className="fill-amber-200 text-amber-400" /> Plan Premium Todo Incluido
              </div>

              <div className="flex items-start justify-center gap-1 mb-2">
                <span className="text-2xl md:text-3xl font-bold text-amber-500 mt-2">$</span>
                <h3 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 tracking-tight drop-shadow-sm">250.000</h3>
              </div>
              <p className="text-xl text-amber-200/60 font-normal mb-6">COP/mes</p>
              <p className="text-slate-300 mb-10 max-w-md mx-auto text-lg">Diseñado para <strong>clínicas odontológicas</strong> y negocios de alto flujo que no pueden perder ni un solo paciente.</p>

              {/* Lista de Beneficios */}
              <div className="w-full max-w-2xl mb-12 text-left p-6 md:p-8 rounded-2xl bg-amber-900/5 border border-amber-500/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Zap className="text-amber-500 fill-amber-500/20" size={20} />
                  <h4 className="text-lg font-bold text-white">Lo que incluye tu membresía:</h4>
                </div>
                <div className="grid gap-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <CheckCircle2 className="text-amber-400 shrink-0 mt-0.5" size={20} />
                    <div><span className="text-base md:text-lg font-bold text-white block">300 Conversaciones Premium</span><span className="text-sm text-slate-400">Incluidas cada mes con IA avanzada.</span></div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">AHORRO</div>
                    <CheckCircle2 className="text-amber-400 shrink-0 mt-0.5" size={20} />
                    <div><span className="text-base md:text-lg font-bold text-white block">Recargas con 80% OFF</span><span className="text-sm text-slate-400">Si necesitas más, paga una fracción del costo.</span></div>
                  </div>
                  {["Dashboard de métricas avanzado", "Agenda y confirmación de citas", "Soporte técnico prioritario", "Actualizaciones Semanales", "Sin contratos forzosos"].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-300 px-3"><CheckCircle2 className="text-amber-400 shrink-0" size={18} /><span className="text-sm md:text-base font-medium">{feature}</span></div>
                  ))}
                </div>
              </div>

              {/* SECCIÓN PAGO: Tarjeta Genérica + Logos IMAGENES REALES */}
              <div className="w-full pt-8 border-t border-white/5 flex flex-col items-center gap-8">
                {/* 🚀 COMPONENTE IMPORTADO DINÁMICAMENTE PARA NO BLOQUEAR SAFARI */}
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

              {/* Botón de Descarga PDF (AISLADO PARA SAFARI) */}
              <div className="mt-10 min-h-[40px] w-full flex justify-center">
                  {isMounted && (
                    <DownloadButton logoSrc={wasaaaLogo.src} />
                  )}
              </div>

            </div>
          </div>
        </motion.section>

        {/* --- CTA FINAL --- */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeInUp}
          className="relative py-20 md:py-32 group content-visibility-auto"
        >
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full md:w-[70%] h-[200px] md:h-[300px] bg-blue-900/10 blur-[80px] md:blur-[150px] rounded-full transform-gpu translate-z-0" />
                <motion.div variants={pulseDeep} animate="animate" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full md:w-[80%] h-full md:h-[80%] bg-indigo-900/05 blur-[100px] md:blur-[180px] rounded-full opacity-60 transform-gpu translate-z-0"/>
            </div>

            <div className="relative z-10 max-w-3xl mx-auto text-center px-4 md:px-6">
                <div className="bg-white/[0.02] backdrop-blur-lg md:backdrop-blur-2xl p-8 md:p-12 rounded-[24px] md:rounded-[32px] border border-white/10 shadow-xl shadow-black/30 relative overflow-hidden transition-all duration-500 hover:border-white/20 isolation-isolate">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight drop-shadow-sm">¿Listo para el <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Siguiente Nivel</span>?</h2>
                    <p className="text-slate-400 max-w-xl mx-auto mb-8 md:mb-10 text-base md:text-lg leading-relaxed font-medium">Deje que la IA maneje la rutina con precisión. Recupere su tiempo y enfóquese en la excelencia clínica.</p>
                    <Link href="/register" className="relative z-10 inline-block group/btn w-full md:w-auto">
                        <div className="relative">
                            <div className="absolute -inset-2 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl blur-xl opacity-30 group-hover/btn:opacity-50 transition-opacity duration-500" />
                            <button className="relative w-full md:w-auto bg-white text-black font-bold text-base md:text-lg px-8 md:px-10 py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 mx-auto">
                                <Zap className="text-amber-500" size={18} /> Iniciar Transformación <ChevronRight className="group-hover/btn:translate-x-1 transition-transform text-blue-600" size={20} />
                            </button>
                        </div>
                    </Link>
                </div>
            </div>
        </motion.section>

      </div>
    </main>
  );
}