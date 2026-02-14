'use client'

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, CheckCircle2, Users, Database, BrainCircuit, 
  CalendarCheck, Zap, ShieldCheck, Check, XCircle, X,
  ArrowRight, TrendingUp, AlertTriangle
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

// --- COPYWRITING ---
const HERO_BADGE = "Tu Recepcionista IA 24/7";
const HERO_TITLE = <>El Sistema que <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Confirma Citas</span> y Llena tu Agenda Automáticamente</>;
const HERO_DESC = 'No más "vistos" sin respuesta. Wasaaa atiende al instante, cualifica pacientes reales y agenda citas mientras tu equipo descansa.';

// Variants
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
                 <span className="text-base font-bold text-slate-200">Reserva tu Auditoría</span>
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

  // Colores globales
  const buttonGradient = "from-cyan-600 to-blue-600";
  const buttonHover = "hover:from-cyan-700 hover:to-blue-700";
  const glowColor = "from-cyan-500 via-blue-500 to-indigo-500";

  return (
    <main className="min-h-[100dvh] bg-[#050505] text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-100 font-sans overflow-x-hidden relative">
      
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />

      {/* --- BACKGROUND PREMIUM OPTIMIZADO (GPU LAYERS) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         {/* Base oscura pero no negra pura para reducir fatiga visual */}
         <div className="absolute inset-0 bg-[#050505]" />
         
         {/* Grid pattern muy sutil */}
         <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" style={{ backgroundSize: '30px 30px' }}></div>

         {/* Luz Ambiental 1: Top Izquierda (Cyan/Azul) - Hero glow */}
         <div 
            className="absolute -top-[10%] -left-[10%] w-[80vw] h-[80vw] md:w-[600px] md:h-[600px] bg-blue-600/10 rounded-full blur-[80px] md:blur-[128px] opacity-60 mix-blend-screen" 
            style={{ transform: 'translate3d(0,0,0)', willChange: 'transform' }} // Safari Hardware Accel
         />

         {/* Luz Ambiental 2: Medio Derecha (Indigo) - Features glow */}
         <div 
            className="absolute top-[40%] -right-[20%] w-[70vw] h-[70vw] md:w-[500px] md:h-[500px] bg-indigo-600/10 rounded-full blur-[80px] md:blur-[128px] opacity-40 mix-blend-screen" 
            style={{ transform: 'translate3d(0,0,0)', willChange: 'transform' }} 
         />

         {/* Luz Ambiental 3: Fondo Izquierda (Cyan) - CTA glow */}
         <div 
            className="absolute bottom-0 -left-[10%] w-[80vw] h-[80vw] md:w-[600px] md:h-[600px] bg-cyan-600/10 rounded-full blur-[80px] md:blur-[128px] opacity-30 mix-blend-screen" 
            style={{ transform: 'translate3d(0,0,0)', willChange: 'transform' }} 
         />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-16 md:pb-24">
        
        {/* --- HERO --- */}
        <section className="text-center mb-16 md:mb-24 mt-8 md:mt-16">
           <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 text-[10px] uppercase tracking-widest font-bold mb-6 shadow-[0_0_20px_rgba(6,182,212,0.1)] backdrop-blur-sm">
                <ShieldCheck size={12} /> {HERO_BADGE}
           </motion.div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 tracking-tighter leading-[1.1] animate-fade-in-up [animation-delay:100ms] opacity-0 fill-mode-forwards max-w-5xl mx-auto drop-shadow-2xl">
            {HERO_TITLE}
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed px-2 animate-fade-in-up [animation-delay:200ms] opacity-0 fill-mode-forwards">
            {HERO_DESC}
          </p>

          <div className="mt-10 animate-fade-in-up [animation-delay:300ms] opacity-0 fill-mode-forwards">
            <button 
                onClick={handleOpenBooking}
                className={clsx(
                    "px-8 py-4 rounded-full text-lg font-bold text-white shadow-[0_10px_40px_-10px_rgba(6,182,212,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto bg-gradient-to-r border border-white/10",
                    buttonGradient, buttonHover
                )}
            >
                <CalendarCheck size={20} /> Auditar Mi Clínica Gratis
            </button>
            <p className="mt-4 text-xs text-slate-500 flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> 
                Ver demo en vivo (Sin compromiso)
            </p>
          </div>
        </section>

        {/* --- FEATURES 1 --- */}
        <section id="features" className="relative content-visibility-auto contain-paint scroll-mt-32">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "100px" }} variants={staggerContainer}
              className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24 md:mb-32"
            >
                <div className="order-2 lg:order-1 relative flex justify-center min-h-[450px] md:min-h-[650px] items-center">
                    {/* Glow específico del feature para resaltar la imagen */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent opacity-60 blur-3xl" />
                    <div className="relative w-full max-w-[350px] md:max-w-none transform scale-100 lg:scale-110">
                          <div className="drop-shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                             <AestheticChatAnimation />
                          </div>
                    </div>
                </div>
                <div className="order-1 lg:order-2 flex flex-col items-center text-center lg:items-center lg:text-center px-2">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 md:mb-8 shadow-lg text-cyan-400 backdrop-blur-md">
                        <BrainCircuit size={24} />
                    </div>
                    
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">
                        No es un "Bot", es <br/><span className="text-cyan-400">Inteligencia Real</span>
                    </h2>
                    <p className="text-slate-300 text-base md:text-lg mb-8 leading-relaxed max-w-lg">
                        Tus pacientes odian hablar con máquinas tontas. Wasaaa entiende, empatiza y vende como tu mejor recepcionista.
                    </p>
                    <ul className="space-y-4 md:space-y-5 text-left inline-block"> 
                        {[
                            "Conversación fluida y humana", 
                            "Manejo de objeciones de venta", 
                            "Cualifica pacientes (No curiosos)",
                            "Atención inmediata 24/7"
                        ].map((item, i) => (
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
                        <Database size={24} />
                    </div>
                    
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">
                        Confirmación Automática <br/><span className="text-blue-400">& Reactivación</span>
                    </h2>
                    <p className="text-slate-300 text-base md:text-lg mb-8 leading-relaxed max-w-lg">
                        Reduce el ausentismo confirmando citas automáticamente y reactiva pacientes antiguos para llenar huecos libres.
                    </p>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left max-w-sm mx-auto backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="text-green-400" size={20} />
                            <span className="font-bold text-white">Ingresos Pasivos</span>
                        </div>
                        <p className="text-sm text-slate-400">Genera ventas sin gastar un peso en publicidad recuperando tu base de datos.</p>
                    </div>
                </div>
                <div className="order-2 relative w-full flex justify-center">
                      <div className="w-full max-w-[350px] md:max-w-xl">
                          <CalendarVisual mode="aesthetic" /> 
                      </div>
                </div>
            </motion.div>
        </section>

        {/* --- CÓMO FUNCIONA (Con Glassmorphism mejorado) --- */}
        <section id="how" className="mb-24 md:mb-32 relative px-4 scroll-mt-32">
            <div className="text-center mb-12">
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">La Realidad de tu Clínica</h2>
                <p className="text-slate-400">¿Sigues dependiendo de procesos manuales?</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* TARJETA MANUAL */}
                <div className="relative p-6 md:p-8 rounded-3xl border border-red-500/20 bg-[#120808]/80 backdrop-blur-md flex flex-col shadow-lg">
                    <div className="absolute top-4 right-4 text-red-500/40">
                        <AlertTriangle size={20} />
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                        <Users className="text-red-400" size={24} />
                        <h3 className="text-xl font-bold text-white">Gestión Manual</h3>
                    </div>
                    <ul className="space-y-5 flex-1">
                        <li className="flex items-start gap-3 text-slate-200 text-sm">
                            <div className="mt-0.5 bg-red-500/10 p-1 rounded text-red-500"><X size={14} strokeWidth={3} /></div>
                            <span>Pierdes horas confirmando citas una por una.</span>
                        </li>
                        <li className="flex items-start gap-3 text-slate-200 text-sm">
                            <div className="mt-0.5 bg-red-500/10 p-1 rounded text-red-500"><X size={14} strokeWidth={3} /></div>
                            <span>Si la recepcionista se ocupa, el chat se detiene.</span>
                        </li>
                        <li className="flex items-start gap-3 text-slate-200 text-sm">
                            <div className="mt-0.5 bg-red-500/10 p-1 rounded text-red-500"><X size={14} strokeWidth={3} /></div>
                            <span>Base de datos en Excel o papel (Inutilizable).</span>
                        </li>
                        <li className="flex items-start gap-3 text-white font-semibold text-sm bg-red-950/40 p-2 rounded-lg border border-red-900/30">
                             <div className="mt-0.5 text-red-400"><XCircle size={14} /></div>
                             Resultado: +20% de Citas Perdidas.
                        </li>
                    </ul>
                </div>

                {/* TARJETA WASAAA */}
                <div className="p-6 md:p-8 rounded-3xl border border-cyan-500/30 bg-cyan-950/20 backdrop-blur-md relative overflow-hidden flex flex-col shadow-[0_0_40px_-10px_rgba(6,182,212,0.15)]">
                    <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[11px] font-black uppercase tracking-wider bg-cyan-500 text-black">La Solución Wasaaa</div>
                    <div className="flex items-center gap-3 mb-6">
                        <Zap className="text-cyan-400 fill-cyan-400" size={24} />
                        <h3 className="text-xl font-bold text-white">IA Avanzada</h3>
                    </div>
                    <ul className="space-y-5 mb-2 flex-1">
                        <li className="flex items-start gap-3 text-white text-sm">
                            <CheckCircle2 className="text-cyan-400 shrink-0" size={18} /> 
                            <span>Lenguaje natural, indistinguible de un humano.</span>
                        </li>
                        <li className="flex items-start gap-3 text-white text-sm">
                            <CheckCircle2 className="text-cyan-400 shrink-0" size={18} /> 
                            <span>Confirmación y Agendamiento 100% Automático.</span>
                        </li>
                        <li className="flex items-start gap-3 text-white text-sm">
                            <CheckCircle2 className="text-cyan-400 shrink-0" size={18} /> 
                            <span>Historial de pacientes organizado al instante.</span>
                        </li>
                        <li className="flex items-start gap-3 text-white font-semibold text-sm bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
                            <CheckCircle2 className="text-cyan-400 shrink-0" size={18} /> 
                            Inversión: Menor a una consulta médica.
                        </li>
                    </ul>
                </div>
            </div>
        </section>

        {/* --- PRICING --- */}
        <section id="pricing" className="relative scroll-mt-32 mb-24 md:mb-32">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="relative max-w-5xl mx-auto"
          >
            <div className={`absolute -inset-1 bg-gradient-to-r ${glowColor} rounded-[2.5rem] blur-xl opacity-30 animate-pulse-slow`} />

            {/* Fondo con backdrop-blur aumentado para mejor contraste */}
            <div className="relative bg-[#080808]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 md:p-12 shadow-none md:shadow-2xl overflow-hidden">
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
                                ¿Cuánto cuesta una sesión de Botox? Con solo <span className="text-cyan-400 font-bold">UNA</span> cita agendada, el software te sale gratis.
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
                        <p className="text-xs text-slate-500">Sin contratos forzosos. Te ayudamos a integrar todo.</p>
                    </div>
                    <div className="bg-white/5 rounded-3xl p-6 md:p-8 border border-white/5 text-left">
                        <h3 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-500" />
                            Todo incluido:
                        </h3>
                        <ul className="space-y-4">
                            {[
                                "300 Conversaciones de Venta (IA)", 
                                "Confirmación de Citas Automática", 
                                "Gestión de Agenda Inteligente", 
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

        {/* --- CTA FINAL (Ajustado pb-12 para móvil) --- */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeInUp}
          className="relative pb-12 md:pb-24 group content-visibility-auto contain-paint px-2"
        >
            <div className="relative z-10 max-w-4xl mx-auto rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a] z-0" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.15),transparent_50%)] z-0" />
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.05] z-0" style={{ backgroundSize: '40px 40px' }}></div>
                
                <div className="relative z-10 p-8 md:p-14 text-center flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-cyan-500/30">
                         <TrendingUp size={32} />
                      </div>

                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
                        Tu competencia ya está <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">automatizando su clínica</span>
                    </h2>
                    
                    <p className="text-slate-300 max-w-lg mx-auto mb-8 text-base md:text-lg font-medium leading-relaxed">
                        No dejes que otro paciente se pierda por falta de atención. Organiza tu clínica, vende más y trabaja menos hoy mismo.
                    </p>

                    <button 
                        onClick={handleOpenBooking}
                        className="w-full md:w-auto bg-white text-black font-extrabold text-lg px-8 py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2"
                    >
                        <Zap className="text-cyan-600 fill-cyan-600" size={20} /> INICIAR TRANSFORMACIÓN <ArrowRight className="text-cyan-600" size={22} />
                    </button>
                    
                    <p className="mt-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Oferta limitada para primeras 10 clínicas</p>
                </div>
            </div>
        </motion.section>

        {/* --- FAQs Wrapper (Ajustado mt-0 para móvil) --- */}
        <section id="faqs" className="relative scroll-mt-32 mt-0 md:mt-20 content-visibility-auto">
             <LandingFAQ industry="dental" /> 
        </section>

      </div>
    </main>
  );
}