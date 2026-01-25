'use client'

import React from 'react';
import { Sparkles, CheckCircle2, Clock, Users, Database, BrainCircuit, CalendarCheck, ChevronRight, FileText, CalendarDays, Zap, Download, CreditCard, Wifi } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

// IMPORTA TUS COMPONENTES VISUALES
// Asegúrate de que las rutas sean correctas
import CalendarVisual from './components/CalendarVisual'; 
import DentalChatAnimation from './components/DentalChatAnimation';

// --- ANIMATION VARIANTS (Safari Optimized) ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const listContainer: Variants = {
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08
        }
    }
};

const listItem: Variants = {
    hidden: { opacity: 0, x: -5 },
    visible: { opacity: 1, x: 0 }
};

// Animación de fondo optimizada
const pulseDeep: Variants = {
    animate: {
        opacity: [0.3, 0.45, 0.3],
        scale: [1, 1.02, 1],
        transition: {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

// --- NUEVOS ICONOS DE AMBIENTACIÓN DENTAL (Sutiles) ---
const DentalToolsBg = () => (
  <>
    {/* Espejo Dental - Arriba Izquierda */}
    <svg className="absolute top-[5%] left-[2%] w-32 h-32 text-cyan-900/20 rotate-45 blur-[2px] pointer-events-none opacity-40" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9C5 11.38 6.19 13.47 8 14.74V17C8 17.55 8.45 18 9 18H11V20H13V18H15C15.55 18 16 17.55 16 17V14.74C17.81 13.47 19 11.38 19 9C19 5.13 15.87 2 12 2ZM12 4C14.76 4 17 6.24 17 9C17 11.76 14.76 14 12 14C9.24 14 7 11.76 7 9C7 6.24 9.24 4 12 4Z" />
    </svg>
    {/* Sonda Exploradora - Centro Derecha */}
    <svg className="absolute top-[45%] right-[5%] w-40 h-40 text-purple-900/20 -rotate-12 blur-[3px] pointer-events-none opacity-30" viewBox="0 0 24 24" fill="currentColor">
       <path d="M6.1,7.19L8.4,12.04C8.58,12.42 8.43,12.87 8.06,13.07L5,14.64L7.59,20.36L6,21.09L2.15,12.64L5.56,10.87C5.94,10.68 6.1,10.23 5.9,9.85L3.74,5.3L6.1,7.19M19.14,8.97L15.56,10.6C15.19,10.77 14.76,10.59 14.59,10.21L10.64,1.5L12.24,0.77L15.84,8.68L18.43,7.5L19.14,8.97Z" />
    </svg>
    {/* Muela Estilizada Pequeña - Abajo Izquierda */}
    <svg className="absolute bottom-[15%] left-[8%] w-24 h-24 text-blue-900/20rotate-[30deg] blur-[1px] pointer-events-none opacity-25" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17,2H7C4.79,2 3,3.79 3,6V18C3,20.21 4.79,22 7,22H17C19.21,22 21,20.21 21,18V6C21,3.79 19.21,2 17,2M11,6H13V10H17V12H13V18H11V12H7V10H11V6Z" /> 
    </svg>
  </>
);


// --- NUEVA TARJETA DE CRÉDITO GENÉRICA (SVG AUTOMATIZADO) ---
const GenericPaymentCard = () => (
  <div className="w-full max-w-[320px] md:max-w-[360px] mx-auto relative group/card perspective-1000">
    <div className="relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 transform-gpu group-hover/card:scale-[1.02] group-hover/card:rotate-y-[5deg]">
      {/* Fondo Gradiente de la Tarjeta */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black" />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_20%,rgba(255,255,255,0.05)_40%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.05)_60%,transparent_80%)] bg-[length:200%_200%] animate-shimmer-slow pointer-events-none" />
      
      {/* Bordes Brillantes */}
      <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover/card:border-purple-500/30 transition-colors duration-500" />
      
      <div className="relative p-6 h-full flex flex-col justify-between z-10">
        {/* Top Row: Chip y Contactless */}
        <div className="flex justify-between items-start">
          <div className="w-12 h-9 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 rounded-md border border-amber-500/50 flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 opacity-50 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#000_2px,#000_4px)]" />
              <div className="absolute inset-0 opacity-50 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#000_2px,#000_4px)]" />
          </div>
          <Wifi className="text-white/70 rotate-90" size={24} />
        </div>

        {/* Middle Row: Texto Principal */}
        <div className="text-center my-auto pt-4">
           <p className="text-xs text-purple-300 uppercase tracking-[0.2em] mb-1 font-semibold">Método de Pago Universal</p>
           <h4 className="text-xl md:text-2xl font-bold text-white tracking-wider bg-clip-text bg-gradient-to-r from-white via-purple-100 to-white drop-shadow-sm">
             TODAS LAS TARJETAS
           </h4>
           <p className="text-sm text-slate-400 uppercase tracking-widest font-medium mt-1">DÉBITO Y CRÉDITO</p>
        </div>

        {/* Bottom Row: Indicadores Estilizados */}
        <div className="flex justify-between items-center pt-4 opacity-80">
            <div className="flex gap-2 items-center">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
                <span className="text-[10px] font-mono text-slate-300 uppercase">Aceptación Global</span>
            </div>
            {/* Simulación de logos abstractos */}
             <div className="flex -space-x-2 opacity-70 grayscale group-hover/card:grayscale-0 transition-all duration-500">
                <div className="w-8 h-8 rounded-full bg-red-500/80 border-2 border-white/10 shrink-0" />
                <div className="w-8 h-8 rounded-full bg-yellow-500/80 border-2 border-white/10 shrink-0" />
                <div className="w-8 h-8 rounded-full bg-blue-500/80 border-2 border-white/10 shrink-0" />
            </div>
        </div>
      </div>
    </div>
  </div>
);


// --- DATOS BENTO GRID ---
const mockPatients = [
    { initials: "LG", name: "Laura García", procedure: "Control Ortodoncia", date: "Hoy, 10:30 AM", color: "bg-purple-500/20 text-purple-300 font-bold" },
    { initials: "CR", name: "Carlos R.", procedure: "Implante Dental", date: "Ayer", color: "bg-blue-500/20 text-blue-300 font-bold" },
    { initials: "MP", name: "María Pérez", procedure: "Blanqueamiento", date: "Hace 2d", color: "bg-cyan-500/20 text-cyan-300 font-bold" },
    { initials: "JL", name: "Jorge López", procedure: "Profilaxis", date: "Hace 1sem", color: "bg-emerald-500/20 text-emerald-300 font-bold" },
];

export default function DentalProposal() {
  
  // Función simulada para descargar el PDF
  const handleDownloadPDF = () => {
    const pdfUrl = '/propuesta.pdf';
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'Propuesta_Comercial_DentalIA.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-slate-200 selection:bg-cyan-500 selection:text-black font-sans overflow-x-hidden relative transform-gpu">
      
      {/* Navbar Background Fix */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-slate-900/90 via-[#050505] to-[#050505] z-0 pointer-events-none" />
      
      {/* Background Glows & Dental Ambient Globales */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[0%] w-[250px] md:w-[600px] h-[250px] md:h-[600px] bg-cyan-900/10 rounded-full blur-[60px] md:blur-[120px] opacity-40 transform-gpu translate-z-0" />
        <div className="absolute bottom-[20%] right-[0%] w-[200px] md:w-[500px] h-[200px] md:h-[500px] bg-purple-900/10 rounded-full blur-[60px] md:blur-[128px] opacity-40 transform-gpu translate-z-0" />
        
        {/* NUEVA Ambientación Dental Sutil */}
        <DentalToolsBg />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-28 md:pt-44 pb-20 md:pb-32">
        
        {/* --- HERO (TÍTULO CORREGIDO) --- */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="text-center mb-24 md:mb-40"
        >
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/40 text-cyan-300 text-[10px] uppercase tracking-widest font-bold mb-6 md:mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <Sparkles size={12} /> Inteligencia Artificial Odontológica
          </div>
          
          {/* TÍTULO EXACTO SOLICITADO */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 tracking-tighter leading-[1.1]">
            Automatiza tu Clinica Odontologica <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Sin Perder el Toque Humano</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed px-2">
            La plataforma que agenda, confirma y organiza sus pacientes mientras usted se dedica a la odontología.
          </p>
        </motion.section>


        {/* --- FEATURE 1: ASISTENTE VIRTUAL --- */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32 md:mb-48"
        >
            <motion.div variants={fadeInUp} className="order-2 lg:order-1 relative flex justify-center transform-gpu">
                <div className="absolute inset-0 bg-indigo-500/10 blur-[50px] md:blur-[90px] rounded-full" />
                <div className="relative w-full max-w-[350px] md:max-w-none transform scale-100 lg:scale-110 transition-transform duration-700">
                    <DentalChatAnimation/>
                </div>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="order-1 lg:order-2 flex flex-col items-center text-center lg:items-center lg:text-center px-2">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 md:mb-8 shadow-lg shadow-indigo-500/30 mx-auto">
                    <BrainCircuit className="text-white" size={24} />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">
                    Tu Recepcionista Experta <br/>
                    <span className="text-indigo-400">Disponible 24/7</span>
                </h2>
                <p className="text-slate-400 text-base md:text-lg mb-8 leading-relaxed max-w-lg">
                    Olvídate de responder lo mismo 100 veces al día. Nuestro asistente IA está entrenado exclusivamente con <strong>terminología odontológica</strong>.
                </p>
                <ul className="space-y-4 md:space-y-5 text-left inline-block"> 
                    {[
                        "Responde precios, horarios y ubicación.",
                        "Filtra curiosos: Solo notifica intención real.",
                        "Optimizado para no hablar de temas externos.",
                        "Ahorra el 90% del trabajo manual."
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 md:gap-4 text-slate-300 text-sm md:text-base">
                            <div className="mt-0.5 bg-indigo-500/10 p-1 rounded-full shrink-0">
                              <CheckCircle2 className="text-indigo-500" size={14} />
                            </div>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </motion.div>
        </motion.section>


        {/* --- FEATURE 2: AGENDA INTELIGENTE --- */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32 md:mb-48"
        >
            <motion.div variants={fadeInUp} className="order-1 flex flex-col items-center text-center px-2">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 md:mb-8 shadow-lg shadow-purple-500/30 mx-auto">
                    <Clock className="text-white" size={24} />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">
                    Agenda que Trabaja Sola <br/>
                    <span className="text-purple-400">Cero Ausentismo</span>
                </h2>
                <p className="text-slate-400 text-base md:text-lg mb-8 leading-relaxed max-w-lg">
                    Control total sobre tus doctores, sillones y tiempos. Diseñado para clínicas de alto flujo.
                </p>
                <ul className="space-y-4 md:space-y-5 text-left inline-block">
                    {[
                        "Confirmación automática vía WhatsApp.",
                        "Gestión multi-doctor y filtrado especialista.",
                        "Alertas inmediatas de cancelación.",
                        "Bloqueo inteligente de horarios."
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 md:gap-4 text-slate-300 text-sm md:text-base">
                            <div className="mt-0.5 bg-purple-500/10 p-1 rounded-full shrink-0">
                                <CheckCircle2 className="text-purple-500" size={14} />
                            </div>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </motion.div>

            <motion.div variants={fadeInUp} className="order-2 relative w-full flex justify-center transform-gpu">
                 <div className="absolute inset-0 bg-purple-500/10 blur-[50px] md:blur-[90px] rounded-full" />
                 <div className="w-full max-w-[350px] md:max-w-xl">
                    <CalendarVisual />
                 </div>
            </motion.div>
        </motion.section>


        {/* --- FEATURE 3: EL CEREBRO (BENTO GRID) --- */}
        <section className="mb-32 md:mb-40 relative">
            <div className="absolute top-0 left-[-20%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-600/10 blur-[80px] md:blur-[130px] rounded-full -z-10 pointer-events-none transform-gpu translate-z-0" />
            <div className="absolute bottom-0 right-[-20%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-500/10 blur-[80px] md:blur-[130px] rounded-full -z-10 pointer-events-none transform-gpu translate-z-0" />

            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 relative z-10 px-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-block mb-4"
                >
                     <span className="px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-300 text-[10px] md:text-xs font-mono tracking-widest uppercase shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]">
                       Core System v.2.0
                     </span>
                </motion.div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">
                    El Cerebro Digital de tu Clínica
                </h2>
                <p className="text-slate-400 text-base md:text-lg px-2">
                    Transformamos datos dispersos en <span className="text-cyan-400 font-semibold">control operativo</span> absoluto.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 max-w-6xl mx-auto relative z-10">
                {/* 1. MÓDULO CENTRAL */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    className="lg:col-span-7 group relative rounded-[24px] md:rounded-[32px] overflow-hidden bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 transition-all duration-500 flex flex-col backdrop-blur-lg md:backdrop-blur-xl shadow-2xl shadow-black/20 isolation-isolate transform-gpu translate-z-0"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                    
                    <div className="relative p-6 md:p-10 h-full flex flex-col">
                        <div className="flex items-start justify-between mb-6 md:mb-8">
                            <div className="p-2.5 md:p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                                <Database size={24} />
                            </div>
                            <div className="flex gap-1 opacity-30">
                                <div className="w-1 h-1 bg-white rounded-full" />
                                <div className="w-1 h-1 bg-white rounded-full" />
                                <div className="w-6 md:w-8 h-1 bg-white rounded-full" />
                            </div>
                        </div>

                        <div className="mb-6 md:mb-8">
                            <h3 className="text-xl md:text-3xl font-bold text-white mb-2 md:mb-3">
                                Historial Clínico de Marketing
                            </h3>
                            <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-lg">
                                Tu base de datos organizada y viva. Accede al perfil de cada paciente y toma decisiones basadas en datos reales.
                            </p>
                        </div>

                        <div className="mt-auto border-t border-white/5 pt-5 md:pt-6">
                            <div className="flex justify-between items-center mb-3 md:mb-4 px-1">
                                <span className="text-[10px] md:text-xs font-mono text-slate-500 uppercase tracking-wider">Actividad Reciente</span>
                                <span className="text-[10px] md:text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1 transition-colors">
                                    Ver Todo <ChevronRight size={12}/>
                                </span>
                            </div>

                            <motion.div 
                                className="space-y-2 md:space-y-3"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={listContainer}
                            >
                                {mockPatients.map((patient, i) => (
                                    <motion.div 
                                        key={i} 
                                        variants={listItem}
                                        className="flex items-center justify-between p-2.5 md:p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors group/item transform-gpu translate-z-0"
                                    >
                                        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                                            <div className={`w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full ${patient.color} flex items-center justify-center text-xs md:text-sm shadow-sm`}>
                                                {patient.initials}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-semibold text-slate-200 group-hover/item:text-white transition-colors truncate">
                                                    {patient.name}
                                                </span>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <FileText size={10} className="text-slate-500 shrink-0" />
                                                    <span className="text-[10px] md:text-xs text-slate-400 truncate">
                                                        {patient.procedure}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="hidden sm:flex items-center gap-2 text-slate-500 px-2 md:px-3 py-1 rounded-lg bg-black/20 shrink-0">
                                            <CalendarDays size={12} />
                                            <span className="text-[10px] md:text-xs font-mono">{patient.date}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. REACTIVACIÓN & 3. MÉTRICAS */}
                <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ delay: 0.1 }}
                        className="group relative rounded-[24px] md:rounded-[32px] overflow-hidden bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 transition-all duration-500 min-h-[200px] md:min-h-[240px] flex flex-col backdrop-blur-lg md:backdrop-blur-xl shadow-2xl shadow-black/20 transform-gpu translate-z-0"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <div className="relative p-6 md:p-8 h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold text-white">Motor de Reactivación</h3>
                                    <p className="text-[10px] md:text-xs text-emerald-400/80 uppercase tracking-wider mt-1 font-semibold">Gestión de Retorno</p>
                                </div>
                                <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-400">
                                    <Users className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
                                </div>
                            </div>
                            <p className="text-slate-400 text-xs md:text-sm mt-2">
                                Identifica oportunidades. La plataforma resalta quiénes son tus pacientes inactivos.
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-emerald-500/70 bg-emerald-500/5 px-3 py-1.5 rounded-full w-fit border border-emerald-500/10">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Oportunidades hoy
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ delay: 0.2 }}
                        className="group relative rounded-[24px] md:rounded-[32px] overflow-hidden bg-white/[0.03] border border-white/10 hover:border-blue-500/30 transition-all duration-500 min-h-[200px] md:min-h-[240px] flex flex-col backdrop-blur-lg md:backdrop-blur-xl shadow-2xl shadow-black/20 transform-gpu translate-z-0"
                    >
                         <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <div className="relative p-6 md:p-8 h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold text-white">Métricas de Citas</h3>
                                    <p className="text-[10px] md:text-xs text-blue-400/80 uppercase tracking-wider mt-1 font-semibold">Dashboard CRM</p>
                                </div>
                                <div className="p-2 rounded-lg bg-blue-950/30 border border-blue-500/20 text-blue-400">
                                    <CalendarCheck className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
                                </div>
                            </div>
                            <p className="text-slate-400 text-xs md:text-sm mt-2 mb-4">
                                Visualiza el rendimiento mensual: Citas agendadas y pacientes nuevos.
                            </p>
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


        {/* --- NUEVA SECCIÓN: MEMBRESÍA ÉLITE (REDESIGN CON CORRECCIONES) --- */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="relative mb-32 md:mb-40 max-w-4xl mx-auto px-2"
        >
          {/* Tarjeta de Membresía Estilo "Reference Card" */}
          {/* PADDING RESPONSIVE AJUSTADO AQUÍ: p-5 en móvil, md:p-12 en escritorio */}
          <div className="relative rounded-[32px] overflow-hidden border border-purple-500/20 bg-[#080808] shadow-[0_0_50px_-10px_rgba(168,85,247,0.1)] group p-5 md:p-12">
            
            {/* Efectos de fondo de la tarjeta */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_40%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none" />
            
            {/* SE ELIMINÓ LA MUELA FANTASMA GRANDE DEL FONDO AQUÍ */}
            
            <div className="relative flex flex-col items-center text-center z-10">
              
              {/* Badge Superior */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/30 border border-purple-500/30 text-purple-200 text-sm font-bold mb-8">
                <Sparkles size={16} className="fill-purple-200" /> Plan Premium Todo Incluido
              </div>

              {/* Precio y Título */}
              <div className="flex items-start justify-center gap-1 mb-2">
                <span className="text-2xl md:text-3xl font-bold text-white mt-2">$</span>
                <h3 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
                  250.000
                </h3>
              </div>
              <p className="text-xl text-slate-400 font-normal mb-6">COP/mes</p>
              
              <p className="text-slate-300 mb-10 max-w-md mx-auto text-lg">
                Diseñado para <strong>clínicas odontológicas</strong> y negocios de alto flujo que no pueden perder ni un solo paciente.
              </p>

              {/* Lista de Beneficios */}
              <div className="w-full max-w-2xl mb-12 text-left p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Zap className="text-amber-500" size={20} />
                  <h4 className="text-lg font-bold text-white">Lo que incluye tu membresía:</h4>
                </div>
                <div className="grid gap-4">
                  
                  {/* Beneficio Destacado 1 */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <CheckCircle2 className="text-purple-400 shrink-0 mt-0.5" size={20} />
                    <div>
                      <span className="text-base md:text-lg font-bold text-white block">300 Conversaciones Premium</span>
                      <span className="text-sm text-slate-400">Incluidas cada mes con IA avanzada.</span>
                    </div>
                  </div>
                  
                  {/* Beneficio Destacado 2 con Badge */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">AHORRO</div>
                    <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={20} />
                    <div>
                      <span className="text-base md:text-lg font-bold text-white block">Recargas con 80% OFF</span>
                      <span className="text-sm text-slate-400">Si necesitas más, paga una fracción del costo.</span>
                    </div>
                  </div>

                  {[
                    "Dashboard de métricas avanzado",
                    "Agenda y confirmación de citas",
                    "Soporte técnico prioritario",
                    "Actualizaciones Semanales",
                    "Sin contratos forzosos. Cancela cuando quieras."
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-300 px-3">
                      <CheckCircle2 className="text-purple-400 shrink-0" size={18} />
                      <span className="text-sm md:text-base font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* NUEVA SECCIÓN DE PAGO CON TARJETA GENÉRICA AUTOMATIZADA */}
              <div className="w-full pt-8 border-t border-white/5 flex flex-col items-center gap-8">
                <GenericPaymentCard />
              </div>

              {/* Botón de Descarga PDF */}
              <div className="mt-10">
                  <button 
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-purple-400 transition-colors py-2 border-b border-transparent hover:border-purple-400/50"
                  >
                      <Download size={16} />
                      Descargar Propuesta Económica & Comercial (.pdf)
                  </button>
              </div>

            </div>
          </div>
        </motion.section>


        {/* --- CTA FINAL (SAFARI SAFE) --- */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="relative py-20 md:py-32 group"
        >
            {/* Fondo ambiental */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full md:w-[70%] h-[200px] md:h-[300px] bg-blue-900/10 blur-[80px] md:blur-[150px] rounded-full transform-gpu translate-z-0" />
                 
                <motion.div 
                     variants={pulseDeep}
                     animate="animate"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full md:w-[80%] h-full md:h-[80%] bg-indigo-900/05 blur-[100px] md:blur-[180px] rounded-full opacity-60 transform-gpu translate-z-0"
                />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto text-center px-4 md:px-6">
                <div className="bg-white/[0.02] backdrop-blur-lg md:backdrop-blur-2xl p-8 md:p-12 rounded-[24px] md:rounded-[32px] border border-white/10 shadow-xl shadow-black/30 relative overflow-hidden transition-all duration-500 hover:border-white/20 isolation-isolate">
                    
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight drop-shadow-sm">
                        ¿Listo para el <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Siguiente Nivel</span>?
                    </h2>
                    <p className="text-slate-400 max-w-xl mx-auto mb-8 md:mb-10 text-base md:text-lg leading-relaxed font-medium">
                        Deje que la IA maneje la rutina con precisión. Recupere su tiempo y enfóquese en la excelencia clínica.
                    </p>
                    
                    <Link href="/register" className="relative z-10 inline-block group/btn w-full md:w-auto">
                        <div className="relative">
                            <div className="absolute -inset-2 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl blur-xl opacity-30 group-hover/btn:opacity-50 transition-opacity duration-500" />
                            
                            <button className="relative w-full md:w-auto bg-white text-black font-bold text-base md:text-lg px-8 md:px-10 py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 mx-auto">
                                <Zap className="text-amber-500" size={18} />
                                Iniciar Transformación
                                <ChevronRight className="group-hover/btn:translate-x-1 transition-transform text-blue-600" size={20} />
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