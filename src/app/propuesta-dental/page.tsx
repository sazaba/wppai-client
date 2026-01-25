'use client'

import React from 'react';
import { Sparkles, CheckCircle2, Clock, Users, Database, BrainCircuit, CalendarCheck, ChevronRight, FileText, CalendarDays, CreditCard, Download, Star, ShieldCheck, Zap } from 'lucide-react';
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
    // Asegúrate de poner tu archivo "propuesta.pdf" en la carpeta /public de tu proyecto Next.js
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


        {/* --- NUEVA SECCIÓN: MEMBRESÍA ÉLITE (DISRUPTIVE BLACK CARD) --- */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="relative mb-32 md:mb-40 max-w-4xl mx-auto px-2"
        >
          {/* Tarjeta de Membresía Estilo "Black Card" */}
          <div className="relative rounded-[32px] overflow-hidden border border-amber-500/20 bg-[#080808] shadow-[0_0_50px_-10px_rgba(245,158,11,0.1)] group">
            
            {/* Efectos de fondo de la tarjeta */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_40%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none" />
            
            <div className="relative p-8 md:p-12 flex flex-col items-center text-center">
              
              {/* Badge Superior */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs font-bold uppercase tracking-widest mb-8">
                <Star size={12} className="fill-amber-200" /> Plan Premium All-Inclusive
              </div>

              {/* Precio y Título */}
              <h3 className="text-3xl md:text-5xl font-bold text-white mb-2 font-mono tracking-tight">
                $250.000 <span className="text-xl text-slate-500 font-sans font-normal">COP / Mes</span>
              </h3>
              <p className="text-slate-400 mb-10 max-w-md mx-auto">
                Acceso total a la suite de inteligencia artificial. Sin cláusulas de permanencia.
              </p>

              {/* Lista de Beneficios */}
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-4 text-left w-full max-w-2xl mb-12">
                {[
                  "300 Conversaciones Premium",
                  "Recargas con 80% Descuento",
                  "Soporte Técnico Prioritario",
                  "Acceso a Dashboard ROI",
                  "Actualizaciones Semanales",
                  "Cancelación en cualquier momento"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 className="text-amber-400 shrink-0" size={18} />
                    <span className="text-sm md:text-base font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Iconos de Pago Interactivos (SVG Manuales) */}
              <div className="w-full pt-8 border-t border-white/5 flex flex-col items-center gap-6">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Métodos de Pago Aceptados</p>
                
                <div className="flex flex-wrap justify-center gap-4 md:gap-8 items-center opacity-80">
                   {/* Visa */}
                   <div className="group/icon relative grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110 cursor-pointer" title="Visa">
                      <svg className="h-8 md:h-10 w-auto" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                         <path d="M19.7 7.6H13.6L9.8 30.6H15.9L19.7 7.6ZM34.2 7.9C33.6 7.7 32.5 7.5 31.2 7.5C27.9 7.5 25.6 9.2 25.5 12.6C25.5 15 27.7 16.4 29.3 17.2C31 18 31.6 18.5 31.6 19.3C31.6 20.5 30.1 21.1 28.7 21.1C27.3 21.1 26.5 20.9 25.9 20.6L25 24.6C26 25.1 27.9 25.5 29.8 25.5C33.4 25.5 35.8 23.7 35.8 20.1C35.8 17.9 34.5 16.3 32.2 15.2C31.1 14.6 30.4 14.2 30.4 13.5C30.4 12.8 31.3 12.1 32.4 12.1C33.3 12.1 34 12.3 34.6 12.6L34.2 7.9ZM43.4 7.6H39.3C38 7.6 37 8.3 36.5 9.6L31.2 30.6H37.3L38.5 25.6H44.1L44.6 30.6H49.9L46.6 7.6H43.4ZM39.6 21.2L41.5 11.8H41.6L43.8 21.2H39.6ZM7.7 7.6H2.6C2.3 7.6 1.8 7.7 1.7 8.1L0.1 16.4C0.1 16.4 3.7 17.1 7.6 21.7L11.5 7.6H7.7V7.6Z" fill="currentColor" className="text-white group-hover/icon:text-[#1434CB]"/>
                      </svg>
                   </div>
                   
                   {/* Mastercard */}
                   <div className="group/icon relative grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110 cursor-pointer" title="Mastercard">
                       <svg className="h-8 md:h-10 w-auto" viewBox="0 0 36 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="2.6" width="31" height="22" rx="2" fill="transparent"/>
                          <circle cx="11.6" cy="11" r="9" fill="currentColor" className="text-white group-hover/icon:text-[#EB001B]"/>
                          <circle cx="24.4" cy="11" r="9" fill="currentColor" className="text-white group-hover/icon:text-[#F79E1B] mix-blend-screen group-hover/icon:mix-blend-normal"/>
                       </svg>
                   </div>

                   {/* Amex */}
                   <div className="group/icon relative grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110 cursor-pointer" title="American Express">
                        <svg className="h-8 md:h-10 w-auto" viewBox="0 0 40 24" fill="none">
                            <rect width="40" height="24" rx="3" fill="currentColor" className="text-slate-700 group-hover/icon:text-[#006fcf]"/>
                            <path d="M7 16H4L6 11L4 6H10L9 8H7L6.5 11L7.5 13H10L9 16H7ZM11 16L12 11L11 6H16L17 9H15L14 13L15 16H11ZM22 16H17L18 13H21L20 11H18L18.5 9H21L22 6H16L15 16H22V16ZM23 16H26L27 13L29 16H32L28 11L32 6H29L26 9L25 6H22L25.5 11L23 16ZM34 16H38L39 6H34L35 9L38 9L37.5 11L35 11L34.5 13L38 13L37 16H34Z" fill="white"/>
                        </svg>
                   </div>

                   {/* Bancolombia (Simulado) */}
                   <div className="group/icon flex items-center gap-1 font-bold text-white grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110 cursor-pointer bg-slate-800/50 px-2 py-1 rounded" title="Bancolombia">
                       <div className="w-2 h-6 bg-yellow-400"></div>
                       <div className="w-2 h-6 bg-blue-600"></div>
                       <div className="w-2 h-6 bg-red-600"></div>
                       <span className="text-[10px] tracking-tighter hidden md:block">Bancolombia</span>
                   </div>

                   {/* Rappi (Simulado) */}
                   <div className="group/icon relative grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110 cursor-pointer" title="RappiCard">
                       <svg className="h-7 md:h-9 w-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0" fillRule="evenodd">
                           <path d="M5.3 4C6.5 2.8 8.1 2 10 2H19V11C19 16 15 20 10 20C8.1 20 6.5 19.2 5.3 18" stroke="currentColor" className="text-white group-hover/icon:text-[#ff4343]" strokeWidth="2.5" strokeLinecap="round"/>
                           <path d="M5.3 18L3 21" stroke="currentColor" className="text-white group-hover/icon:text-[#ff4343]" strokeWidth="2.5" strokeLinecap="round"/>
                           <path d="M12 9H14" stroke="currentColor" className="text-white" strokeWidth="2.5" strokeLinecap="round"/>
                       </svg>
                   </div>

                </div>
              </div>

              {/* Botón de Descarga PDF */}
              <div className="mt-8">
                  <button 
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-amber-400 transition-colors py-2 border-b border-transparent hover:border-amber-400/50"
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