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

// --- LAZY LOADS (OPTIMIZACIÓN SAFARI) ---
// Usamos un esqueleto de carga simple para evitar saltos de layout (CLS)
const LoadingSkeleton = () => <div className="w-full h-[300px] bg-white/5 rounded-3xl animate-pulse" />;

const CalendarVisual = dynamic(() => import('./CalendarVisual'), { ssr: false, loading: LoadingSkeleton });
const AestheticChatAnimation = dynamic(() => import('./AestheticChatAnimation'), { ssr: false, loading: LoadingSkeleton });
const LandingFAQ = dynamic(() => import('./LandingFAQ'), { ssr: false });
// AQUI ESTÁ EL CAMBIO: Cargamos Testimony de forma dinámica
const Testimony = dynamic(() => import('./Testimony'), { ssr: false });

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
    <main className="min-h-[100dvh] bg-[#05080a] text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-100 font-sans overflow-x-hidden relative">
      
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />

      {/* --- BACKGROUND PREMIUM OPTIMIZADO (GPU LAYERS) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ transform: 'translate3d(0,0,0)' }}>
         
         {/* Base oscura profunda */}
         <div className="absolute inset-0 bg-[#020405]" />
         <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.04]" style={{ backgroundSize: '30px 30px' }}></div>

         {/* LUCES AMBIENTALES AJUSTADAS */}
         {/* 1. HERO GLOW (Top Left) */}
         <div 
            className="absolute -top-[10%] -left-[20%] w-[120vw] h-[100vw] md:w-[800px] md:h-[800px] bg-blue-900/30 md:bg-blue-600/40 rounded-full blur-[100px] md:blur-[160px] opacity-100 mix-blend-screen" 
            style={{ transform: 'translate3d(0,0,0)' }} 
         />

         {/* 2. MIDDLE GLOW (Derecha) */}
         <div 
            className="absolute top-[35%] -right-[30%] w-[120vw] h-[120vw] md:w-[800px] md:h-[800px] bg-indigo-950/20 md:bg-indigo-600/30 rounded-full blur-[100px] md:blur-[160px] opacity-100 mix-blend-screen" 
            style={{ transform: 'translate3d(0,0,0)' }} 
         />

         {/* 3. BOTTOM GLOW (Izquierda) */}
         <div 
            className="absolute bottom-[-10%] -left-[20%] w-[120vw] h-[100vw] md:w-[800px] md:h-[800px] bg-cyan-950/20 md:bg-cyan-600/30 rounded-full blur-[100px] md:blur-[160px] opacity-100 mix-blend-screen" 
            style={{ transform: 'translate3d(0,0,0)' }} 
         />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-16 md:pb-24">
        
        {/* --- HERO --- */}
        <section className="text-center mb-16 md:mb-24 mt-8 md:mt-16">
           <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-[10px] uppercase tracking-widest font-bold mb-6 shadow-[0_0_20px_rgba(6,182,212,0.2)] backdrop-blur-sm">
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
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-cyan-900/20 md:from-cyan-500/20 via-transparent to-transparent opacity-70 blur-3xl" />
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

        {/* --- CÓMO FUNCIONA --- */}
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

        {/* --- TESTIMONIOS (LAZY LOADED) --- */}
        <Testimony />

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

    {/* --- CTA FINAL REFACTORIZADO: MODO DARK & BORDE SUAVE --- */}
        {/* --- CTA FINAL REFACTORIZADO: MODO DARK & BORDE SUAVE --- */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeInUp}
          className="relative pb-12 md:pb-32 px-2 md:px-6"
        >
            <div className="relative z-10 max-w-5xl mx-auto rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#080808]/40 backdrop-blur-sm shadow-2xl">
                {/* Luces de fondo internas muy sutiles */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.08),transparent_60%)] z-0" />
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] z-0" style={{ backgroundSize: '40px 40px' }}></div>
                
                <div className="relative z-10 p-8 md:p-20 text-center flex flex-col items-center">
                    {/* Badge minimalista */}
                    <div className="flex items-center gap-2 mb-6 md:mb-8 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-slate-400 text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-medium">
                        <Sparkles size={10} className="text-cyan-500" /> Tecnología de Vanguardia
                    </div>

                    <h2 className="text-3xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
                        El futuro de tu clínica <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">empieza ahora.</span>
                    </h2>
                    
                    <p className="text-slate-500 max-w-xl mx-auto mb-10 text-sm md:text-lg font-medium leading-relaxed">
                        Deja atrás la gestión manual. Únete a los profesionales que ya están escalando sus resultados con inteligencia artificial.
                    </p>

                    {/* --- BOTÓN CORREGIDO AL ESTILO PRICING --- */}
                   <button 
    onClick={handleOpenBooking}
    className={`
        w-full md:w-auto 
        px-6 md:px-10               // Padding lateral ajustado
        py-4 md:py-0 md:h-14        // Mobile: Padding vertical (aire). Desktop: Altura fija (simetría)
        text-base md:text-lg        // Mobile: Texto legible. Desktop: Texto grande
        font-bold rounded-full 
        bg-gradient-to-r ${buttonGradient} ${buttonHover} 
        text-white shadow-xl shadow-cyan-500/20
        transition-all hover:scale-105 active:scale-95 
        flex items-center justify-center gap-2 md:gap-3
        border border-white/10
    `}
>
    {/* Icono ligeramente más pequeño en móvil para proporciones correctas */}
    <CalendarCheck className="w-5 h-5 md:w-[22px] md:h-[22px]" /> 
    Agendar Prueba Gratuita
</button>
                    {/* ----------------------------------------- */}
                    
                    <div className="mt-12 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 opacity-30">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            <ShieldCheck size={14} className="text-cyan-500" /> Privacidad Total
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            <Zap size={14} className="text-cyan-500" /> Setup en 24h
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            <Check size={14} className="text-cyan-500" /> Sin Contratos
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Resplandor ambiental externo muy suave */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/[0.03] blur-[150px] pointer-events-none -z-10" />
        </motion.section>
        {/* --- FAQs Wrapper --- */}
        <section id="faqs" className="relative scroll-mt-32 mt-0 md:mt-20 content-visibility-auto">
             <LandingFAQ industry="dental" /> 
        </section>

      </div>
    </main>
  );
}