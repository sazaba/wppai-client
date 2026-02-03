'use client'

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Clock, Users, Database, BrainCircuit, CalendarCheck, ChevronRight, FileText, CalendarDays, Zap, Wifi, Star, TrendingUp, ShieldCheck } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image'; 
import dynamic from 'next/dynamic';
import clsx from 'clsx';

// --- IMPORTS IMÁGENES ---
import visa from '../images/visa-logo.webp';
import amex from '../images/american-express.webp';
import mastercard from '../images/mastercard-logo.webp';

// --- LAZY LOADS OPTIMIZADOS (Skeletons) ---
const LoadingSkeleton = () => <div className="w-full h-[300px] bg-white/5 rounded-3xl animate-pulse" />;

const CalendarVisual = dynamic(() => import('./CalendarVisual'), { ssr: false, loading: LoadingSkeleton });
const AestheticChatAnimation = dynamic(() => import('./AestheticChatAnimation'), { ssr: false, loading: LoadingSkeleton });
const DentalChatAnimation = dynamic(() => import('./DentalChatAnimation'), { ssr: false, loading: LoadingSkeleton }); // Nuevo componente
const AnimatedGenericCard = dynamic(() => import('./AnimatedGenericCard'), { ssr: false, loading: () => <div className="w-full h-[200px] bg-white/5 rounded-2xl" /> });
const LandingFAQ = dynamic(() => import('./LandingFAQ'), { ssr: false });

// --- CONFIGURACIÓN DE CONTENIDO (DATA) ---
const CONTENT = {
  aesthetic: {
    themeColor: 'rose', // Para clases dinámicas
    accentGradient: 'from-rose-400 to-purple-500',
    buttonGradient: 'from-rose-700 to-purple-700',
    heroBadge: 'Gestión Clínica Inteligente',
    heroTitle: <>Automatiza tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-purple-500">Centro Estético</span> <br className="hidden md:block" /> Y Deja de Perder Pacientes</>,
    heroDesc: 'Elimina el caos administrativo. Centraliza citas, historias clínicas y ventas en una plataforma que trabaja mientras tú atiendes en consulta.',
    chatComponent: AestheticChatAnimation,
    feature1Title: <>Recepción Inteligente <br/><span className="text-rose-400">Sin Esperas</span></>,
    feature1Desc: 'Tu recepcionista no puede responder a las 11 PM. Nuestra IA sí. Filtra "curiosos", educa sobre tratamientos y agenda valoraciones automáticamente.',
    feature2Title: <>Agenda Blindada <br/><span className="text-purple-400">Control de Salas</span></>,
    pricingTitle: 'Plan Clínicas Pro',
    pricingDesc: 'Diseñado para centros estéticos que buscan escalar sin caos operativo.',
    pricingPrice: '250.000',
    pricingFeatures: ["Gestión de salas/consultorios", "Recordatorios automáticos", "Soporte Prioritario", "Sin cláusula de permanencia"],
    testimonials: [
      { name: "Dra. Valentina H.", role: "Directora Médica", text: "El problema no eran los precios, era la velocidad. Con la IA, el paciente recibe info al instante y agenda.", metric: "+40% Ingresos", avatar: "VH", color: "from-rose-600 to-pink-500" },
      { name: "Clínica Piel & Ser", role: "Gerencia", text: "La reactivación de base de datos es impresionante. El sistema trajo de vuelta pacientes inactivos.", metric: "+30% Retornos", avatar: "PS", color: "from-amber-600 to-orange-500" },
      { name: "Dr. Andrés Meza", role: "Cirujano", text: "Antes tenía huecos en la agenda y aparatología quieta. Ahora el sistema llena esos espacios.", metric: "Agenda Llena", avatar: "AM", color: "from-purple-600 to-indigo-500" }
    ],
    mockPatients: [
      { initials: "SC", name: "Sofía C.", procedure: "Toxina Botulínica", date: "Hoy, 11:00 AM", color: "bg-rose-500/20 text-rose-300" },
      { initials: "MA", name: "María A.", procedure: "Rinomodelación", date: "Ayer", color: "bg-purple-500/20 text-purple-300" },
      { initials: "JP", name: "Juliana P.", procedure: "Hydrafacial", date: "Hace 2d", color: "bg-cyan-500/20 text-cyan-300" },
      { initials: "CR", name: "Carolina R.", procedure: "Valoración Corporal", date: "1sem", color: "bg-emerald-500/20 text-emerald-300" },
    ]
  },
  dental: {
    themeColor: 'cyan',
    accentGradient: 'from-cyan-400 to-blue-500',
    buttonGradient: 'from-cyan-700 to-blue-700',
    heroBadge: 'Inteligencia Artificial Odontológica',
    heroTitle: <>Automatiza tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Clínica Dental</span> <br className="hidden md:block" /> Sin Perder el Toque Humano</>,
    heroDesc: 'La plataforma que agenda, confirma y organiza sus pacientes mientras usted se dedica a la odontología. Cero ausentismo, máximo control.',
    chatComponent: DentalChatAnimation,
    feature1Title: <>Tu Recepcionista Experta <br/><span className="text-cyan-400">Disponible 24/7</span></>,
    feature1Desc: 'Olvídate de responder lo mismo 100 veces. Nuestro asistente IA entiende términos como "endodoncia" y filtra pacientes reales de curiosos.',
    feature2Title: <>Agenda que Trabaja Sola <br/><span className="text-blue-400">Cero Ausentismo</span></>,
    pricingTitle: 'Plan Dental Premium',
    pricingDesc: 'Diseñado para clínicas odontológicas de alto flujo que no pueden perder ni un solo paciente.',
    pricingPrice: '250.000',
    pricingFeatures: ["Gestión multi-doctor", "Confirmación WhatsApp", "Bloqueo de sillones", "Sin contratos forzosos"],
    testimonials: [
      { name: "Dra. Beatriz Molina", role: "OdontoSpecial", text: "Dudé si una IA entendería términos clínicos. Me equivoqué. Hoy gestiona el 80% de mis citas.", metric: "+45 citas/mes", avatar: "BM", color: "from-blue-600 to-cyan-500" },
      { name: "Dr. Camilo Restrepo", role: "Ortodoncista", text: "Antes mi secretaria pasaba 3 horas llamando. Ahora el sistema confirma solo.", metric: "95% Asistencia", avatar: "CR", color: "from-purple-600 to-indigo-500" },
      { name: "Dental Sonrisas", role: "Admin", text: "El bot filtra a los que solo preguntan precio y nos pasa los pacientes listos para agendar.", metric: "-70% Carga", avatar: "DS", color: "from-emerald-600 to-teal-500" }
    ],
    mockPatients: [
      { initials: "LG", name: "Laura G.", procedure: "Control Ortodoncia", date: "Hoy, 10:30 AM", color: "bg-blue-500/20 text-blue-300" },
      { initials: "CR", name: "Carlos R.", procedure: "Implante Dental", date: "Ayer", color: "bg-cyan-500/20 text-cyan-300" },
      { initials: "MP", name: "María P.", procedure: "Blanqueamiento", date: "Hace 2d", color: "bg-purple-500/20 text-purple-300" },
      { initials: "JL", name: "Jorge L.", procedure: "Profilaxis", date: "1sem", color: "bg-emerald-500/20 text-emerald-300" },
    ]
  }
};

// Variants (Simplificados)
const fadeInUp: Variants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };
const staggerContainer: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const listContainer: Variants = { visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const listItem: Variants = { hidden: { opacity: 0, x: -5 }, visible: { opacity: 1, x: 0 } };

export default function HomePageContent() {
  const [industry, setIndustry] = useState<'aesthetic' | 'dental'>('aesthetic');
  const content = CONTENT[industry];
  const ChatComponent = content.chatComponent;

  // Renderizado
  return (
    <main className="min-h-screen bg-[#050505] text-slate-200 selection:bg-white/20 selection:text-white font-sans overflow-x-hidden relative">
      
      {/* Fondo Global */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[#050505]" />
         <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" style={{ backgroundSize: '30px 30px' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-32 pb-20 md:pb-32">
        
        {/* --- HERO --- */}
        <section className="text-center mb-16 md:mb-32">
           
           {/* SWITCH DE INDUSTRIA (EL TOGGLE) */}
           <div className="flex justify-center mb-10">
              <div className="p-1 bg-white/5 border border-white/10 rounded-full flex gap-1 backdrop-blur-sm">
                  <button 
                    onClick={() => setIndustry('aesthetic')}
                    className={clsx(
                        "px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2",
                        industry === 'aesthetic' ? "bg-rose-600 text-white shadow-lg shadow-rose-900/50" : "text-slate-400 hover:text-white"
                    )}
                  >
                    <Sparkles size={14} /> Estética
                  </button>
                  <button 
                    onClick={() => setIndustry('dental')}
                    className={clsx(
                        "px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2",
                        industry === 'dental' ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/50" : "text-slate-400 hover:text-white"
                    )}
                  >
                    <div className="rotate-45"><Zap size={14} /></div> Odontología
                  </button>
              </div>
           </div>

           {/* TEXTOS DINÁMICOS (Key para re-animar) */}
           <motion.div key={`${industry}-badge`} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-slate-300 text-[10px] uppercase tracking-widest font-bold mb-6">
                <ShieldCheck size={12} /> {content.heroBadge}
           </motion.div>
          
          <h1 key={`${industry}-title`} className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 tracking-tighter leading-[1.1] animate-fade-in-up [animation-delay:100ms] opacity-0 fill-mode-forwards">
            {content.heroTitle}
          </h1>
          
          <p key={`${industry}-desc`} className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed px-2 animate-fade-in-up [animation-delay:200ms] opacity-0 fill-mode-forwards">
            {content.heroDesc}
          </p>
        </section>

        {/* --- FEATURES (CHAT CAMALEÓNICO) --- */}
        <section id="features" className="relative scroll-mt-24 content-visibility-auto contain-paint">
            <motion.div 
              key={industry} // Re-render al cambiar
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "200px" }} variants={staggerContainer}
              className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32 md:mb-48"
            >
                <div className="order-2 lg:order-1 relative flex justify-center min-h-[650px] items-center">
                    <div className={clsx("absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] opacity-10", industry === 'aesthetic' ? "from-rose-500 via-transparent" : "from-cyan-500 via-transparent")} />
                    <div className="relative w-full max-w-[350px] md:max-w-none transform scale-100 lg:scale-110">
                        <ChatComponent />
                    </div>
                </div>
                <div className="order-1 lg:order-2 flex flex-col items-center text-center lg:items-center lg:text-center px-2">
                    <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 md:mb-8 shadow-lg", industry === 'aesthetic' ? "bg-rose-500/20 shadow-rose-500/30 text-rose-400" : "bg-cyan-500/20 shadow-cyan-500/30 text-cyan-400")}>
                        <BrainCircuit size={24} />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">{content.feature1Title}</h2>
                    <p className="text-slate-300 text-base md:text-lg mb-8 leading-relaxed max-w-lg">{content.feature1Desc}</p>
                    <ul className="space-y-4 md:space-y-5 text-left inline-block"> 
                        {["Respuesta inmediata 24/7", "Clasificación de leads", "Agendamiento automático", "Reducción de inasistencias"].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 md:gap-4 text-slate-300 text-sm md:text-base">
                                <div className={clsx("mt-0.5 p-1 rounded-full shrink-0", industry === 'aesthetic' ? "bg-rose-500/10 text-rose-500" : "bg-cyan-500/10 text-cyan-500")}><CheckCircle2 size={14} /></div><span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </motion.div>

            {/* Feature 2: Calendario (Genérico pero adaptable) */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "200px" }} variants={staggerContainer}
              className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32 md:mb-48"
            >
                <div className="order-1 flex flex-col items-center text-center px-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-6 text-white shadow-lg shadow-purple-500/30 mx-auto">
                        <Clock size={24} />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">{content.feature2Title}</h2>
                    <p className="text-slate-300 text-base md:text-lg mb-8 leading-relaxed max-w-lg">Evita cruces de horarios. Gestiona la disponibilidad de tus doctores, salas y equipos en tiempo real.</p>
                </div>
                <div className="order-2 relative w-full flex justify-center">
                      <div className="w-full max-w-[350px] md:max-w-xl">
                          {/* Pasamos el modo al calendario para que cambie colores si quieres, o déjalo genérico */}
                          <CalendarVisual mode={industry} /> 
                      </div>
                </div>
            </motion.div>
        </section>

        {/* --- HOW (Bento Grid Dinámico) --- */}
        <section id="how" className="relative scroll-mt-24 mb-32 md:mb-40 content-visibility-auto contain-paint">
            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 relative z-10 px-4">
                <div className="inline-block mb-4">
                      <span className={clsx("px-3 py-1 rounded-full border text-[10px] md:text-xs font-mono tracking-widest uppercase shadow-lg", industry === 'aesthetic' ? "border-rose-500/30 bg-rose-950/30 text-rose-300" : "border-cyan-500/30 bg-cyan-950/30 text-cyan-300")}>Software Médico v.2.0</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">El Cerebro Digital de tu Clínica</h2>
                <p className="text-slate-300 text-base md:text-lg px-2">Transformamos datos en <span className={industry === 'aesthetic' ? "text-rose-400 font-semibold" : "text-cyan-400 font-semibold"}>control total</span>.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 max-w-6xl mx-auto relative z-10">
                {/* CRM CARD */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className={clsx("lg:col-span-7 group relative rounded-[32px] overflow-hidden bg-white/[0.03] border border-white/10 transition-all duration-500 flex flex-col backdrop-blur-lg shadow-2xl", industry === 'aesthetic' ? "hover:border-rose-500/30" : "hover:border-cyan-500/30")}>
                    <div className="relative p-6 md:p-10 h-full flex flex-col">
                        <div className="flex items-start justify-between mb-6 md:mb-8">
                            <div className={clsx("p-2.5 rounded-2xl border", industry === 'aesthetic' ? "bg-rose-950/30 border-rose-500/20 text-rose-400" : "bg-cyan-950/30 border-cyan-500/20 text-cyan-400")}><Database size={24} /></div>
                        </div>
                        <div className="mb-6 md:mb-8">
                            <h3 className="text-xl md:text-3xl font-bold text-white mb-2 md:mb-3">CRM de Pacientes</h3>
                            <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-lg">Base de datos viva. Historial de tratamientos, fotos y evolución clínica en un solo lugar.</p>
                        </div>
                        <div className="mt-auto border-t border-white/5 pt-5 md:pt-6">
                            <motion.div key={industry} className="space-y-2 md:space-y-3" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={listContainer}>
                                {content.mockPatients.map((patient, i) => (
                                    <motion.div key={i} variants={listItem} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors">
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <div className={`w-8 h-8 rounded-full ${patient.color} flex items-center justify-center text-xs font-bold`}>{patient.initials}</div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-white">{patient.name}</span>
                                                <span className="text-[10px] text-slate-400">{patient.procedure}</span>
                                            </div>
                                        </div>
                                        <div className="hidden sm:flex text-slate-500 text-xs font-mono">{patient.date}</div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* CARDS LATERALES (Simplificadas para ahorrar espacio visual) */}
                <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="group relative rounded-[32px] p-6 md:p-8 bg-white/[0.03] border border-white/10 flex flex-col justify-between min-h-[200px]">
                        <div className="flex justify-between items-start">
                            <div><h3 className="text-lg font-bold text-white">Reactivación</h3><p className="text-xs text-emerald-400 font-semibold uppercase mt-1">Ingresos Pasivos</p></div>
                            <div className="p-2 rounded-lg bg-emerald-950/30 text-emerald-400"><TrendingUp size={20} /></div>
                        </div>
                        <p className="text-slate-400 text-xs mt-2">El sistema detecta pacientes inactivos y les escribe automáticamente para agendar control.</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="group relative rounded-[32px] p-6 md:p-8 bg-white/[0.03] border border-white/10 flex flex-col justify-between min-h-[200px]">
                        <div className="flex justify-between items-start">
                            <div><h3 className="text-lg font-bold text-white">Reportes</h3><p className="text-xs text-purple-400 font-semibold uppercase mt-1">Control Total</p></div>
                            <div className="p-2 rounded-lg bg-purple-950/30 text-purple-400"><CalendarCheck size={20} /></div>
                        </div>
                        <p className="text-slate-400 text-xs mt-2">Métricas de asistencia, tratamientos más vendidos y facturación en tiempo real.</p>
                    </motion.div>
                </div>
            </div>
        </section>

        {/* --- TESTIMONIOS (DINÁMICOS) --- */}
        <section className="mb-32 md:mb-48 relative px-4 content-visibility-auto contain-paint">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Historias de <span className={industry === 'aesthetic' ? "text-rose-400" : "text-cyan-400"}>Éxito Real</span>
            </h2>
            <p className="text-slate-300">Resultados tangibles en clínicas que priorizan el orden.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {content.testimonials.map((t, i) => (
              <motion.div
                key={`${industry}-${i}`} // Clave para cambiar suavemente
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 * i }}
                className="group relative"
              >
                <div className={`absolute -inset-2 bg-gradient-to-r ${t.color} rounded-[2rem] blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                <div className="relative bg-[#0a0a0a] border border-white/10 p-8 rounded-[2rem] h-full flex flex-col shadow-2xl overflow-hidden">
                  <div className="absolute top-6 right-6">
                    <div className={`px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-tighter`}>{t.metric}</div>
                  </div>
                  <p className="text-slate-300 text-lg leading-relaxed italic mb-8 relative z-10">"{t.text}"</p>
                  <div className="mt-auto flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center font-bold text-white shadow-lg`}>{t.avatar}</div>
                    <div><h4 className="text-white font-bold text-sm">{t.name}</h4><p className="text-slate-500 text-xs">{t.role}</p></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- PRICING (DINÁMICO) --- */}
        <section id="pricing" className="relative scroll-mt-24 mb-32 md:mb-40 max-w-4xl mx-auto px-2 content-visibility-auto contain-paint">
          <motion.div 
             key={industry}
             initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
             className={clsx("relative rounded-[32px] overflow-hidden border bg-[#080808] shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)] group p-5 md:p-12", industry === 'aesthetic' ? "border-fuchsia-500/30 shadow-rose-900/20" : "border-cyan-500/30 shadow-blue-900/20")}
          >
            <div className="relative flex flex-col items-center text-center z-10">
              <div className={clsx("inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-bold mb-8", industry === 'aesthetic' ? "bg-rose-950/30 border-rose-500/30 text-rose-200" : "bg-cyan-950/30 border-cyan-500/30 text-cyan-200")}>
                <Sparkles size={16} /> {content.pricingTitle}
              </div>

              <div className="flex items-start justify-center gap-1 mb-2">
                <span className={clsx("text-2xl md:text-3xl font-bold mt-2", industry === 'aesthetic' ? "text-rose-500" : "text-cyan-500")}>$</span>
                <h3 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-sm">{content.pricingPrice}</h3>
              </div>
              <p className="text-xl text-slate-400 font-normal mb-6">COP/mes</p>
              <p className="text-slate-300 mb-10 max-w-md mx-auto text-lg">{content.pricingDesc}</p>

              <div className={clsx("w-full max-w-2xl mb-12 text-left p-6 md:p-8 rounded-2xl border backdrop-blur-sm", industry === 'aesthetic' ? "bg-fuchsia-900/5 border-fuchsia-500/10" : "bg-cyan-900/5 border-cyan-500/10")}>
                <div className="grid gap-4">
                  {content.pricingFeatures.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-300 px-3">
                        <CheckCircle2 className={industry === 'aesthetic' ? "text-fuchsia-400" : "text-cyan-400"} size={18} />
                        <span className="text-sm md:text-base font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full pt-8 border-t border-white/5 flex flex-col items-center gap-8">
                <AnimatedGenericCard />
                <div className="flex gap-6 opacity-60 grayscale hover:grayscale-0 transition-all">
                    <Image src={visa} alt="Visa" height={24} width={40} unoptimized className="object-contain" />
                    <Image src={mastercard} alt="Mastercard" height={24} width={40} unoptimized className="object-contain" />
                    <Image src={amex} alt="Amex" height={24} width={40} unoptimized className="object-contain" />
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* --- CTA FINAL --- */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeInUp}
          className="relative py-20 md:py-32 group content-visibility-auto contain-paint"
        >
            <div className="relative z-10 max-w-3xl mx-auto text-center px-4 md:px-6">
                <div className="bg-white/[0.02] backdrop-blur-lg md:backdrop-blur-xl p-8 md:p-12 rounded-[24px] md:rounded-[32px] border border-white/10 shadow-xl shadow-black/30 relative overflow-hidden transition-all duration-500 hover:border-white/20 isolation-isolate">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight drop-shadow-sm">¿Lista para Ordenar <span className={clsx("text-transparent bg-clip-text bg-gradient-to-r", content.accentGradient)}>tu Clínica</span>?</h2>
                    <p className="text-slate-300 max-w-xl mx-auto mb-8 md:mb-10 text-base md:text-lg leading-relaxed font-medium">Deje que la tecnología maneje la parte operativa. Recupere su tiempo y enfoque su energía en sus pacientes.</p>
                    <Link href="/register" className="relative z-10 inline-block group/btn w-full md:w-auto">
                        <div className="relative">
                            <div className={clsx("absolute -inset-2 bg-gradient-to-r rounded-2xl blur-xl opacity-30 group-hover/btn:opacity-50 transition-opacity duration-500", content.buttonGradient)} />
                            <button className="relative w-full md:w-auto bg-white text-black font-bold text-base md:text-lg px-8 md:px-10 py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg flex items-center justify-center gap-2 mx-auto">
                                <Zap className={industry === 'aesthetic' ? "text-rose-500" : "text-cyan-600"} size={18} /> Iniciar Prueba Gratis <ChevronRight className={industry === 'aesthetic' ? "text-rose-600" : "text-cyan-600"} size={20} />
                            </button>
                        </div>
                    </Link>
                </div>
            </div>
        </motion.section>

        <section id="faqs" className="relative scroll-mt-24 mt-20 content-visibility-auto">
             <LandingFAQ industry={industry} />
        </section>

      </div>
    </main>
  );
}