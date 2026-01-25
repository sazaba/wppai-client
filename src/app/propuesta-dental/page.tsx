'use client'

import React from 'react';
import { Sparkles, CheckCircle2, Clock, Users, Database, BrainCircuit, CalendarCheck, ChevronRight, FileText, CalendarDays, Zap, Download, Stethoscope } from 'lucide-react';
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

// --- ICONO DENTAL PERSONALIZADO (SVG) ---
const ToothIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M19.5 4.5C17.5 2.5 15 2 12 2C9 2 6.5 2.5 4.5 4.5C2.5 6.5 2 9 2 12C2 15 3 17 4 19L6 21.5C6.5 22 7.5 22 8 21.5L9.5 20C10 19.5 10.5 19.5 11 20L12 21L13 20C13.5 19.5 14 19.5 14.5 20L16 21.5C16.5 22 17.5 22 18 21.5L20 19C21 17 22 15 22 12C22 9 21.5 6.5 19.5 4.5ZM8 14C7.45 14 7 13.55 7 13V11C7 10.45 7.45 10 8 10C8.55 10 9 10.45 9 11V13C9 13.55 8.55 14 8 14ZM16 14C15.45 14 15 13.55 15 13V11C15 10.45 15.45 10 16 10C16.55 10 17 10.45 17 11V13C17 13.55 16.55 14 16 14Z" />
  </svg>
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
      
      {/* Background Glows Globales */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[0%] w-[250px] md:w-[600px] h-[250px] md:h-[600px] bg-cyan-900/10 rounded-full blur-[60px] md:blur-[120px] opacity-40 transform-gpu translate-z-0" />
        <div className="absolute bottom-[20%] right-[0%] w-[200px] md:w-[500px] h-[200px] md:h-[500px] bg-purple-900/10 rounded-full blur-[60px] md:blur-[128px] opacity-40 transform-gpu translate-z-0" />
        {/* Decoración Dental sutil en fondo */}
        <div className="absolute top-[40%] right-[-5%] opacity-[0.03] rotate-12 scale-150 text-white">
            <ToothIcon className="w-96 h-96" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-28 md:pt-44 pb-20 md:pb-32">
        
        {/* --- HERO --- */}
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
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 tracking-tighter leading-[1.1]">
            Automatización Clínica <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Odontológica</span>
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


        {/* --- NUEVA SECCIÓN: MEMBRESÍA ÉLITE (REDESIGN) --- */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="relative mb-32 md:mb-40 max-w-4xl mx-auto px-2"
        >
          {/* Tarjeta de Membresía Estilo "Reference Card" */}
          <div className="relative rounded-[32px] overflow-hidden border border-purple-500/20 bg-[#080808] shadow-[0_0_50px_-10px_rgba(168,85,247,0.1)] group">
            
            {/* Efectos de fondo de la tarjeta */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_40%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none" />
            
            {/* Elemento Decorativo: Diente Grande en Fondo */}
            <div className="absolute -bottom-10 -right-10 text-purple-900/10 pointer-events-none">
                <ToothIcon className="w-64 h-64" />
            </div>
            
            <div className="relative p-8 md:p-12 flex flex-col items-center text-center">
              
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

              {/* Iconos de Pago Interactivos (SVG Reales) */}
              <div className="w-full pt-8 border-t border-white/5 flex flex-col items-center gap-6">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Métodos de Pago Aceptados</p>
                
                <div className="flex flex-wrap justify-center gap-6 md:gap-8 items-center opacity-80">
                   {/* Visa Official */}
                   <div className="group/icon relative grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110 cursor-pointer" title="Visa">
                      <svg className="h-6 md:h-7 w-auto" viewBox="0 0 48 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.8 0.4L12.4 15.6H8.2L5 3.5C4.8 2.7 4.6 2.5 4 2.1C3 1.6 1.4 1.1 0 0.8L0.1 0.4H6.9C7.8 0.4 8.6 1 8.8 2.1L10.5 11L14.7 0.4H18.8ZM35.3 10.5C35.4 6.6 30.1 6.4 30.1 4.6C30.2 4 30.7 3.4 31.9 3.3C32.5 3.2 34.2 3.2 36.1 4.1L37.4 1.1C35.7 0.5 33.6 0.1 31.5 0.2C27.6 0.2 24.8 2.3 24.8 5.4C24.8 7.7 26.9 8.9 28.5 9.7C30.2 10.5 30.8 11.1 30.8 11.7C30.8 12.7 29.6 13.1 28.6 13.1C26.7 13.1 24.7 12.6 23 11.8L21.7 14.8C23.5 15.7 26.9 16.1 28.9 16.1C33.2 16.1 35.8 14 35.8 10.9L35.3 10.5ZM45.8 0.4H42.1C40.9 0.4 40 0.9 39.5 2L33.7 15.6H38L38.9 13.3H44.8L45.3 15.6H49.1L45.8 0.4ZM40 10.2L42.1 4.4L44.2 10.2H40Z" fill="white"/>
                      </svg>
                   </div>
                   
                   {/* Mastercard Official */}
                   <div className="group/icon relative grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110 cursor-pointer" title="Mastercard">
                       <svg className="h-8 md:h-9 w-auto" viewBox="0 0 36 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="11.6" cy="11" r="9" fill="#EB001B"/>
                          <circle cx="24.4" cy="11" r="9" fill="#F79E1B" style={{ mixBlendMode: 'lighten' }}/>
                       </svg>
                   </div>

                   {/* Amex Official */}
                   <div className="group/icon relative grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110 cursor-pointer" title="American Express">
                        <svg className="h-8 md:h-9 w-auto" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.6 0H35.4C37.9 0 40 2.1 40 4.6V19.4C40 21.9 37.9 24 35.4 24H4.6C2.1 24 0 21.9 0 19.4V4.6C0 2.1 2.1 0 4.6 0Z" fill="#006FCF"/>
                            <path d="M11.3 11.9L8.6 6.3H5.8L10.1 14.4L6.1 20.7H9L11.9 16.2L14.9 20.7H17.7L13.6 14.7L17.8 6.3H14.8L11.3 11.9ZM22.3 20.7H17.8L19.3 17.8H23L22.4 16.3H20L21.2 14H23.6L22.9 12.5H21.9L23.7 9H26L24.6 6.3H17.7L14.2 20.7H22.3V20.7ZM31.3 14.8H29.4L28.9 17.2H31.2L30.6 18.6H28.1L27.3 22.2H35.4V19.3H32.4L33 17H30.7L31.2 15.5H33.6L34.1 13.2H31.8L32.3 10.9H34.7L35.2 8.5H32.9L33.4 6.2H25.4L24.8 8.5H27.1L26.6 10.9H24.2L23.7 13.2H26L25.5 15.5H23.1L22.6 17.9H24.9L24.4 20.2H16.3V23.1H36.8V14.8H31.3Z" fill="white"/>
                        </svg>
                   </div>

                   {/* Bancolombia Official */}
                   <div className="group/icon relative grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110 cursor-pointer" title="Bancolombia">
                        <svg className="h-6 md:h-8 w-auto" viewBox="0 0 138 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="138" height="32" fill="transparent"/>
                            <path d="M27.6 0H20.7V32H27.6V0Z" fill="#FDDA24"/>
                            <path d="M13.8 0H6.9V32H13.8V0Z" fill="#0033A0"/>
                            <path d="M0 0H6.9V32H0V0Z" fill="#EC1C24"/>
                            <path d="M51.6 22.5C51.6 24.2 50.9 25.7 49.6 26.9C48.3 28.2 46.6 28.8 44.5 28.8C42.7 28.8 41.1 28.3 39.7 27.4L40.7 24C42 24.7 43.3 25 44.7 25C45.7 25 46.4 24.8 47 24.3C47.5 23.8 47.8 23.2 47.8 22.4C47.8 21.7 47.6 21.1 47.1 20.6C46.7 20.1 46 19.7 44.9 19.3C43.3 18.8 42 18.3 41.3 17.8C40.5 17.4 40 16.8 39.6 16.2C39.2 15.5 39 14.8 39 13.9C39 12.2 39.6 10.8 40.9 9.6C42.2 8.3 43.9 7.7 45.9 7.7C47.6 7.7 49.1 8.1 50.4 8.9L49.4 12.3C48.2 11.7 47.1 11.4 45.9 11.4C45 11.4 44.3 11.6 43.8 12C43.3 12.5 43.1 13 43.1 13.7C43.1 14.4 43.3 14.9 43.6 15.4C44 15.8 44.8 16.2 45.8 16.6C47.4 17.3 48.7 17.8 49.4 18.2C50.2 18.7 50.8 19.2 51.2 19.9C51.6 20.5 51.9 21.4 51.9 22.5H51.6ZM127.6 28.8C126 28.8 124.6 28.2 123.5 27.1C122.5 26 122 24.5 122 22.7C122 21 122.5 19.5 123.5 18.4C124.6 17.2 126 16.7 127.6 16.7C129.3 16.7 130.6 17.2 131.6 18.4C132.7 19.5 133.2 21 133.2 22.7C133.2 24.5 132.7 26 131.6 27.1C130.6 28.2 129.3 28.8 127.6 28.8ZM127.6 25.7C128.5 25.7 129.2 25.3 129.7 24.7C130.3 24 130.5 23.2 130.5 22.2C130.5 21.2 130.3 20.4 129.7 19.8C129.2 19.1 128.5 18.8 127.6 18.8C126.8 18.8 126.1 19.1 125.6 19.8C125.1 20.4 124.8 21.2 124.8 22.2C124.8 23.2 125.1 24 125.6 24.7C126.1 25.3 126.8 25.7 127.6 25.7Z" fill="white"/>
                        </svg>
                   </div>

                   {/* Rappi Official */}
                   <div className="group/icon relative grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110 cursor-pointer" title="RappiCard">
                       <svg className="h-6 md:h-8 w-auto" viewBox="0 0 45 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.5 0C10.1 0 0 10.1 0 22.5C0 34.9 10.1 45 22.5 45C34.9 45 45 34.9 45 22.5C45 10.1 34.9 0 22.5 0Z" fill="#FF4343"/>
                            <path d="M12.4 22.5C12.4 24.4 15.6 24.4 15.6 22.5C15.6 20.6 12.4 20.6 12.4 22.5ZM29.4 22.5C29.4 24.4 32.6 24.4 32.6 22.5C32.6 20.6 29.4 20.6 29.4 22.5ZM10 27.5C10 27.5 15.6 27.5 18.1 25C20.6 27.5 25 27.5 25 27.5" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                            <path d="M11 25.5C11 25.5 18 29.5 22.5 25.5C27 29.5 34 25.5 34 25.5" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                       </svg>
                   </div>

                </div>
              </div>

              {/* Botón de Descarga PDF */}
              <div className="mt-8">
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