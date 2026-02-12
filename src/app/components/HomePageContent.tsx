'use client'

import React, { useState, ReactNode, useEffect } from 'react';
import { 
  Sparkles, CheckCircle2, Clock, Users, Database, BrainCircuit, 
  CalendarCheck, ChevronRight, Zap, Wifi, 
  TrendingUp, ShieldCheck, Check, HelpCircle, XCircle, X
} from 'lucide-react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import Image from 'next/image'; 
import dynamic from 'next/dynamic';
import clsx from 'clsx';
// Importamos el nuevo calendario interno
import InternalBookingCalendar from './InternalBookingCalendar';

// --- IMPORTS IMÁGENES ---
import visa from '../images/visa-logo.webp';
import amex from '../images/american-express.webp';
import mastercard from '../images/mastercard-logo.webp';

// --- LAZY LOADS ---
const LoadingSkeleton = () => <div className="w-full h-[300px] bg-white/5 rounded-3xl animate-pulse" />;
const CalendarVisual = dynamic(() => import('./CalendarVisual'), { ssr: false, loading: LoadingSkeleton });
const AestheticChatAnimation = dynamic(() => import('./AestheticChatAnimation'), { ssr: false, loading: LoadingSkeleton });
const LandingFAQ = dynamic(() => import('./LandingFAQ'), { ssr: false });

// --- COPYWRITING (Estética + Identidad Azul) ---
const HERO_BADGE = "Sistema de Filtrado Inteligente";
const HERO_TITLE = <>Deja de Perder Pacientes por <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Demorarte en Responder</span></>;
const HERO_DESC = 'Tu publicidad atrae, pero tu velocidad vende. Filtra curiosos, califica pacientes estéticos reales y entrégalos listos para agendar a tu equipo.';

// Variants
const fadeInUp: Variants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };
const staggerContainer: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const listContainer: Variants = { visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const listItem: Variants = { hidden: { opacity: 0, x: -5 }, visible: { opacity: 1, x: 0 } };

// --- COMPONENTE MODAL DE AGENDAMIENTO ---
const BookingModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  // Previene scroll y maneja Safari top bar
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 h-[100dvh]" // 100dvh para Safari
        >
          {/* Backdrop con Webkit support para Safari */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" style={{ WebkitBackdropFilter: 'blur(12px)' }} onClick={onClose} />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl h-[600px] max-h-[90vh] bg-[#0F0F0F] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header Modal */}
            <div className="flex justify-between items-center p-5 border-b border-white/5 bg-[#141414]">
               <div className="flex items-center gap-3">
                 <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                 <span className="text-base font-bold text-slate-200">Agendar Auditoría de IA</span>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                 <X size={20} />
               </button>
            </div>

            {/* Custom Calendar Component */}
            <div className="flex-1 w-full bg-[#0F0F0F] p-4 md:p-8 overflow-hidden">
                <InternalBookingCalendar onComplete={() => setTimeout(onClose, 2500)} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function HomePageContent() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const handleOpenBooking = () => setIsBookingOpen(true);

  // Colores globales fijos (Azul/Cyan)
  const themeColor = "cyan";
  const accentText = "text-cyan-400";
  const buttonGradient = "from-cyan-600 to-blue-600";
  const buttonHover = "hover:from-cyan-700 hover:to-blue-700";
  const glowColor = "from-cyan-500 via-blue-500 to-indigo-500";

  return (
    // overflow-x-hidden crítico para Safari mobile
    <main className="min-h-[100dvh] bg-[#050505] text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-100 font-sans overflow-x-hidden relative">
      
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />

      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[#050505]" />
         <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" style={{ backgroundSize: '30px 30px' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-16 md:pb-24">
        
        {/* --- HERO --- */}
        <section className="text-center mb-16 md:mb-24 mt-8 md:mt-16">
           <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 text-[10px] uppercase tracking-widest font-bold mb-6 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                <ShieldCheck size={12} /> {HERO_BADGE}
           </motion.div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 tracking-tighter leading-[1.1] animate-fade-in-up [animation-delay:100ms] opacity-0 fill-mode-forwards max-w-5xl mx-auto">
            {HERO_TITLE}
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed px-2 animate-fade-in-up [animation-delay:200ms] opacity-0 fill-mode-forwards">
            {HERO_DESC}
          </p>

          <div className="mt-10 animate-fade-in-up [animation-delay:300ms] opacity-0 fill-mode-forwards">
            <button 
                onClick={handleOpenBooking}
                className={clsx(
                    "px-8 py-4 rounded-full text-lg font-bold text-white shadow-[0_10px_40px_-10px_rgba(6,182,212,0.5)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto bg-gradient-to-r",
                    buttonGradient, buttonHover
                )}
            >
                <CalendarCheck size={20} /> Agendar Demo Gratuita
            </button>
            <p className="mt-4 text-xs text-slate-500">Configuración incluida • Sin tarjeta de crédito</p>
          </div>
        </section>

        {/* --- FEATURES 1 --- */}
        <section className="relative content-visibility-auto contain-paint">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "100px" }} variants={staggerContainer}
              className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24 md:mb-32"
            >
                <div className="order-2 lg:order-1 relative flex justify-center min-h-[450px] md:min-h-[650px] items-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent opacity-40 blur-3xl" />
                    <div className="relative w-full max-w-[350px] md:max-w-none transform scale-100 lg:scale-110">
                        {/* Se mantiene la animación de estética, pero envuelta en glow azul */}
                         <div className="drop-shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                             <AestheticChatAnimation />
                         </div>
                    </div>
                </div>
                <div className="order-1 lg:order-2 flex flex-col items-center text-center lg:items-center lg:text-center px-2">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 md:mb-8 shadow-lg text-cyan-400">
                        <BrainCircuit size={24} />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">Recepción que <br/><span className="text-cyan-400">Sí Vende</span></h2>
                    <p className="text-slate-300 text-base md:text-lg mb-8 leading-relaxed max-w-lg">
                        Tu recepcionista no puede responder a las 11 PM. Nuestra IA sí. Filtra a quienes solo preguntan precio y prioriza a quienes ya quieren su procedimiento estético.
                    </p>
                    <ul className="space-y-4 md:space-y-5 text-left inline-block"> 
                        {["Respuesta inmediata 24/7", "Filtrado de pacientes reales", "Agendamiento organizado", "Reducción de inasistencias"].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 md:gap-4 text-slate-300 text-sm md:text-base">
                                <div className="mt-0.5 p-1 rounded-full shrink-0 bg-cyan-500/10 text-cyan-400"><CheckCircle2 size={14} /></div><span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </motion.div>

        {/* --- FEATURES 2 --- */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "100px" }} variants={staggerContainer}
              className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24 md:mb-32"
            >
                <div className="order-1 flex flex-col items-center text-center px-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mb-6 text-white shadow-lg shadow-blue-500/30 mx-auto">
                        <Clock size={24} />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">Agenda Organizada <br/><span className="text-blue-400">Sin Caos</span></h2>
                    <p className="text-slate-300 text-base md:text-lg mb-8 leading-relaxed max-w-lg">
                        El sistema etiqueta cada chat: "Confirmado", "Por Reagendar" o "Cancelado". Tu equipo deja de adivinar y se enfoca en llenar los espacios vacíos en cabina.
                    </p>
                </div>
                <div className="order-2 relative w-full flex justify-center">
                      <div className="w-full max-w-[350px] md:max-w-xl">
                          <CalendarVisual mode="aesthetic" /> 
                      </div>
                </div>
            </motion.div>
        </section>

        {/* --- COMPARATIVA --- */}
        <section className="mb-24 md:mb-32 relative px-4">
            <div className="text-center mb-12">
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">¿Por qué cambiar?</h2>
                <p className="text-slate-400">La matemática es simple.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="p-6 md:p-8 rounded-3xl border border-white/5 bg-white/[0.02] flex flex-col">
                    <div className="flex items-center gap-3 mb-6 opacity-70">
                        <Users className="text-slate-400" size={24} />
                        <h3 className="text-xl font-bold text-slate-300">Recepcionista Humana</h3>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-start gap-3 text-slate-400 text-sm"><XCircle className="text-red-900/50 shrink-0" size={18} /> Costo: $1.8M - $2.5M / mes</li>
                        <li className="flex items-start gap-3 text-slate-400 text-sm"><XCircle className="text-red-900/50 shrink-0" size={18} /> Horario: 8 horas (No fines de semana)</li>
                        <li className="flex items-start gap-3 text-slate-400 text-sm"><XCircle className="text-red-900/50 shrink-0" size={18} /> Se enferma, renuncia o se cansa.</li>
                        <li className="flex items-start gap-3 text-slate-400 text-sm"><XCircle className="text-red-900/50 shrink-0" size={18} /> Olvida hacer seguimiento.</li>
                    </ul>
                </div>

                <div className="p-6 md:p-8 rounded-3xl border border-cyan-500/30 bg-cyan-900/10 relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider bg-cyan-500 text-black">Opción Inteligente</div>
                    <div className="flex items-center gap-3 mb-6">
                        <Zap className="text-cyan-400" size={24} />
                        <h3 className="text-xl font-bold text-white">Tu IA Wasaaa</h3>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-start gap-3 text-white text-sm"><CheckCircle2 className="text-cyan-400 shrink-0" size={18} /> Costo: $250.000 / mes (Ahorras 90%)</li>
                        <li className="flex items-start gap-3 text-white text-sm"><CheckCircle2 className="text-cyan-400 shrink-0" size={18} /> Horario: 24/7 (Vende mientras duermes)</li>
                        <li className="flex items-start gap-3 text-white text-sm"><CheckCircle2 className="text-cyan-400 shrink-0" size={18} /> Siempre amable, nunca se cansa.</li>
                        <li className="flex items-start gap-3 text-white text-sm"><CheckCircle2 className="text-cyan-400 shrink-0" size={18} /> Filtra curiosos y cierra ventas.</li>
                    </ul>
                </div>
            </div>
        </section>

        {/* --- PRICING --- */}
        <section id="pricing" className="relative scroll-mt-24 mb-24 md:mb-32">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="relative max-w-5xl mx-auto"
          >
            <div className={`absolute -inset-1 bg-gradient-to-r ${glowColor} rounded-[2.5rem] blur-xl opacity-30 animate-pulse-slow`} />

            <div className="relative bg-[#080808]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-12 shadow-none md:shadow-2xl overflow-hidden">
                <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-20 bg-cyan-500`} />

                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                    
                    <div className="space-y-6 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                            <Sparkles className="w-4 h-4" /> Plan Clínicas Pro
                        </div>

                        <div>
                            <div className="flex items-baseline justify-center md:justify-start gap-1 flex-wrap">
                                <span className="text-sm font-medium text-slate-400 -mb-2 md:-mb-4">$</span>
                                <span className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight">250.000</span>
                                <span className="text-lg md:text-xl font-medium text-slate-400">COP/mes</span>
                            </div>
                            <p className="mt-4 text-slate-300 leading-relaxed text-sm md:text-base">
                                Agenda una demo para ver cómo recuperas la inversión con UN solo tratamiento.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button 
                                onClick={handleOpenBooking}
                                className={`w-full h-14 text-lg font-bold rounded-full bg-gradient-to-r ${buttonGradient} ${buttonHover} text-white shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2`}
                            >
                                <Zap size={20} /> Agendar Demo & Integración
                            </button>
                            <div className="flex justify-center md:justify-start gap-4 opacity-60 grayscale hover:grayscale-0 transition-all">
                                <Image src={visa} alt="Visa" height={20} width={35} unoptimized className="object-contain" />
                                <Image src={mastercard} alt="Mastercard" height={20} width={35} unoptimized className="object-contain" />
                                <Image src={amex} alt="Amex" height={20} width={35} unoptimized className="object-contain" />
                            </div>
                        </div>
                        
                        <p className="text-xs text-slate-500">Te ayudamos a configurar todo en la llamada.</p>
                    </div>

                    <div className="bg-white/5 rounded-3xl p-6 md:p-8 border border-white/5 text-left">
                        <h3 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                            Lo que incluye tu membresía:
                        </h3>
                        
                        <ul className="space-y-4">
                            {[
                                "300 Conversaciones Premium Mensuales", 
                                "Filtrado de pacientes cualificados", 
                                "Etiquetas de estado en agenda", 
                                "Base de datos de historial", 
                                "Soporte Prioritario"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mt-0.5">
                                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                                    </div>
                                    <span className="text-slate-300 text-sm font-medium pt-1">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </div>
          </motion.div>
        </section>

        {/* --- CTA FINAL --- */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeInUp}
          className="relative py-16 md:py-24 group content-visibility-auto contain-paint"
        >
            <div className="relative z-10 max-w-3xl mx-auto text-center px-2 md:px-6">
                <div className="bg-white/[0.02] backdrop-blur-lg md:backdrop-blur-xl p-6 md:p-10 rounded-[24px] md:rounded-[32px] border border-white/10 shadow-xl shadow-black/30 relative overflow-hidden transition-all duration-500 hover:border-white/20 isolation-isolate">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight drop-shadow-sm">¿Listos para Escalar <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">tu Clínica</span>?</h2>
                    <p className="text-slate-300 max-w-xl mx-auto mb-8 md:mb-10 text-base md:text-lg leading-relaxed font-medium">Deja de perder pacientes por no responder a tiempo. Automatiza tu agenda hoy mismo.</p>
                    <div className="relative z-10 inline-block group/btn w-full md:w-auto">
                        <div className="relative">
                            <div className={`absolute -inset-2 bg-gradient-to-r ${buttonGradient} rounded-2xl blur-xl opacity-30 group-hover/btn:opacity-50 transition-opacity duration-500`} />
                            <button 
                                onClick={handleOpenBooking}
                                className="relative w-full md:w-auto bg-white text-black font-bold text-base md:text-lg px-8 md:px-10 py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg flex items-center justify-center gap-2 mx-auto"
                            >
                                <Zap className="text-cyan-600" size={18} /> Solicitar Acceso Anticipado <ChevronRight className="text-cyan-600" size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>

        <section id="faqs" className="relative scroll-mt-24 mt-20 content-visibility-auto">
             {/* Enviamos 'dental' como prop solo para que cargue los estilos azules si el FAQ lo soporta, o simplemente 'aesthetic' si el texto es lo importante. Como pediste "todo azul", probablemente debas ajustar LandingFAQ también si tiene colores hardcodeados. Por ahora envio 'dental' para forzar azul si la logica interna lo usa. */}
             <LandingFAQ industry="dental" /> 
        </section>

      </div>
    </main>
  );
}