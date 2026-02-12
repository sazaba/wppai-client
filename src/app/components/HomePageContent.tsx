'use client'

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, CheckCircle2, Clock, Users, Database, BrainCircuit, 
  CalendarCheck, ChevronRight, Zap, ShieldCheck, Check, XCircle, X,
  ArrowRight,
  TrendingUp
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

// --- COPYWRITING AUDITADO (PERSUASIÓN ALTA) ---
const HERO_BADGE = "IA Especializada en Cierre de Ventas Estéticas";
const HERO_TITLE = <>Convierte tus Leads de Facebook en <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Citas Pagadas en Automático</span></>;
const HERO_DESC = 'Tu equipo pierde horas respondiendo "precio" a curiosos. Wasaaa filtra, cualifica y agenda solo a los pacientes que tienen el dinero en mano.';

// Variants (Sin cambios, funcionan bien)
const fadeInUp: Variants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };
const staggerContainer: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

// --- COMPONENTE MODAL DE AGENDAMIENTO ---
const BookingModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 h-[100dvh]"
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" style={{ WebkitBackdropFilter: 'blur(12px)' }} onClick={onClose} />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl h-[600px] max-h-[90vh] bg-[#0F0F0F] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-center p-5 border-b border-white/5 bg-[#141414]">
               <div className="flex items-center gap-3">
                 <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                 <span className="text-base font-bold text-slate-200">Reserva tu Auditoría de IA</span>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                 <X size={20} />
               </button>
            </div>
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
  const buttonGradient = "from-cyan-600 to-blue-600";
  const buttonHover = "hover:from-cyan-700 hover:to-blue-700";
  const glowColor = "from-cyan-500 via-blue-500 to-indigo-500";

  return (
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
                <CalendarCheck size={20} /> Reservar Auditoría de Ventas
            </button>
            <p className="mt-4 text-xs text-slate-500 flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> 
                Solo 4 cupos de integración disponibles esta semana
            </p>
          </div>
        </section>

        {/* --- FEATURES 1: FILTRADO --- */}
        <section className="relative content-visibility-auto contain-paint">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "100px" }} variants={staggerContainer}
              className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24 md:mb-32"
            >
                <div className="order-2 lg:order-1 relative flex justify-center min-h-[450px] md:min-h-[650px] items-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent opacity-40 blur-3xl" />
                    <div className="relative w-full max-w-[350px] md:max-w-none transform scale-100 lg:scale-110">
                         <div className="drop-shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                             <AestheticChatAnimation />
                         </div>
                    </div>
                </div>
                <div className="order-1 lg:order-2 flex flex-col items-center text-center lg:items-center lg:text-center px-2">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 md:mb-8 shadow-lg text-cyan-400">
                        <BrainCircuit size={24} />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">
                        Deja de Hablar con <br/><span className="text-cyan-400">Curiosos sin Dinero</span>
                    </h2>
                    <p className="text-slate-300 text-base md:text-lg mb-8 leading-relaxed max-w-lg">
                        Facebook Ads trae leads, pero el 80% solo pregunta "precio". Nuestra IA los detecta, les responde amablemente y <strong>solo pasa a tu equipo a quienes quieren agendar ya.</strong>
                    </p>
                    <ul className="space-y-4 md:space-y-5 text-left inline-block"> 
                        {[
                            "Detecta intención de compra real", 
                            "Cualificación automática 24/7", 
                            "Respuesta en < 5 segundos", 
                            "Prioriza pacientes de tratamientos costosos"
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 md:gap-4 text-slate-300 text-sm md:text-base">
                                <div className="mt-0.5 p-1 rounded-full shrink-0 bg-cyan-500/10 text-cyan-400"><CheckCircle2 size={14} /></div><span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </motion.div>

        {/* --- FEATURES 2: AGENDA --- */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "100px" }} variants={staggerContainer}
              className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24 md:mb-32"
            >
                <div className="order-1 flex flex-col items-center text-center px-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mb-6 text-white shadow-lg shadow-blue-500/30 mx-auto">
                        <Clock size={24} />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">
                        Llenamos los Huecos <br/><span className="text-blue-400">de tu Agenda</span>
                    </h2>
                    <p className="text-slate-300 text-base md:text-lg mb-8 leading-relaxed max-w-lg">
                        Una silla vacía es dinero perdido. El sistema confirma asistencias por WhatsApp y rellena cancelaciones automáticamente.
                    </p>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left max-w-sm mx-auto">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="text-green-400" size={20} />
                            <span className="font-bold text-white">ROI Inmediato</span>
                        </div>
                        <p className="text-sm text-slate-400">Con recuperar solo 2 pacientes que iban a cancelar, el software se paga solo.</p>
                    </div>
                </div>
                <div className="order-2 relative w-full flex justify-center">
                      <div className="w-full max-w-[350px] md:max-w-xl">
                          <CalendarVisual mode="aesthetic" /> 
                      </div>
                </div>
            </motion.div>
        </section>

        {/* --- COMPARATIVA DE VALOR --- */}
        <section className="mb-24 md:mb-32 relative px-4">
            <div className="text-center mb-12">
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">La Realidad de tu Clínica</h2>
                <p className="text-slate-400">¿Sigues dependiendo de procesos manuales?</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="p-6 md:p-8 rounded-3xl border border-white/5 bg-white/[0.02] flex flex-col opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-3 mb-6 opacity-70">
                        <Users className="text-slate-400" size={24} />
                        <h3 className="text-xl font-bold text-slate-300">Gestión Manual (Actual)</h3>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-start gap-3 text-slate-400 text-sm"><XCircle className="text-red-900/50 shrink-0" size={18} /> Pierdes leads por responder horas tarde.</li>
                        <li className="flex items-start gap-3 text-slate-400 text-sm"><XCircle className="text-red-900/50 shrink-0" size={18} /> Tu recepcionista se satura de mensajes.</li>
                        <li className="flex items-start gap-3 text-slate-400 text-sm"><XCircle className="text-red-900/50 shrink-0" size={18} /> No hay seguimiento a pacientes antiguos.</li>
                        <li className="flex items-start gap-3 text-slate-400 text-sm"><XCircle className="text-red-900/50 shrink-0" size={18} /> <strong>Costo oculto: +$2M en ventas perdidas.</strong></li>
                    </ul>
                </div>

                <div className="p-6 md:p-8 rounded-3xl border border-cyan-500/30 bg-cyan-900/10 relative overflow-hidden flex flex-col shadow-2xl shadow-cyan-900/20">
                    <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider bg-cyan-500 text-black">La Solución Wasaaa</div>
                    <div className="flex items-center gap-3 mb-6">
                        <Zap className="text-cyan-400" size={24} />
                        <h3 className="text-xl font-bold text-white">Automatización IA</h3>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-start gap-3 text-white text-sm"><CheckCircle2 className="text-cyan-400 shrink-0" size={18} /> Respuesta inmediata (0 fugas de clientes).</li>
                        <li className="flex items-start gap-3 text-white text-sm"><CheckCircle2 className="text-cyan-400 shrink-0" size={18} /> Cualificación automática de pacientes.</li>
                        <li className="flex items-start gap-3 text-white text-sm"><CheckCircle2 className="text-cyan-400 shrink-0" size={18} /> Base de datos organizada automáticamente.</li>
                        <li className="flex items-start gap-3 text-white text-sm"><CheckCircle2 className="text-cyan-400 shrink-0" size={18} /> <strong>Inversión: Menor a una consulta médica.</strong></li>
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
                            <p className="mt-4 text-slate-300 leading-relaxed text-sm md:text-base font-medium">
                                ¿Cuánto cuesta una sesión de Botox o Ácido Hialurónico? Con solo <span className="text-cyan-400 font-bold">UNA</span> cita agendada, el software te sale gratis.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button 
                                onClick={handleOpenBooking}
                                className={`w-full h-14 text-lg font-bold rounded-full bg-gradient-to-r ${buttonGradient} ${buttonHover} text-white shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2`}
                            >
                                <Zap size={20} /> Quiero Probar el Sistema
                            </button>
                            <div className="flex justify-center md:justify-start gap-4 opacity-60 grayscale hover:grayscale-0 transition-all">
                                <Image src={visa} alt="Visa" height={20} width={35} unoptimized className="object-contain" />
                                <Image src={mastercard} alt="Mastercard" height={20} width={35} unoptimized className="object-contain" />
                                <Image src={amex} alt="Amex" height={20} width={35} unoptimized className="object-contain" />
                            </div>
                        </div>
                        
                        <p className="text-xs text-slate-500">Garantía de Satisfacción. Te ayudamos con la integración.</p>
                    </div>

                    <div className="bg-white/5 rounded-3xl p-6 md:p-8 border border-white/5 text-left">
                        <h3 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-500" />
                            Todo incluido para vender más:
                        </h3>
                        
                        <ul className="space-y-4">
                            {[
                                "300 Conversaciones de Venta (IA)", 
                                "Filtrado Anti-Curiosos", 
                                "Gestión de Agenda Automatizada", 
                                "Base de Datos de Pacientes (CRM)", 
                                "Soporte Técnico WhatsApp"
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
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight drop-shadow-sm">Tu competencia ya está <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">automatizando</span></h2>
                    <p className="text-slate-300 max-w-xl mx-auto mb-8 md:mb-10 text-base md:text-lg leading-relaxed font-medium">
                        No dejes que otro lead se enfríe en tu WhatsApp. Activa tu recepcionista inteligente hoy.
                    </p>
                    <div className="relative z-10 inline-block group/btn w-full md:w-auto">
                        <div className="relative">
                            <div className={`absolute -inset-2 bg-gradient-to-r ${buttonGradient} rounded-2xl blur-xl opacity-30 group-hover/btn:opacity-50 transition-opacity duration-500`} />
                            <button 
                                onClick={handleOpenBooking}
                                className="relative w-full md:w-auto bg-white text-black font-bold text-base md:text-lg px-8 md:px-10 py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg flex items-center justify-center gap-2 mx-auto"
                            >
                                <Zap className="text-cyan-600" size={18} /> Iniciar Transformación <ArrowRight className="text-cyan-600" size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>

        <section id="faqs" className="relative scroll-mt-24 mt-20 content-visibility-auto">
             <LandingFAQ industry="dental" /> 
        </section>

      </div>
    </main>
  );
}