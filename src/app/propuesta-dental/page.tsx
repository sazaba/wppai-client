'use client'

import React from 'react';
import { Sparkles, CheckCircle2, Clock, Users, Database, BrainCircuit, CalendarCheck, ChevronRight, FileText, CalendarDays, Zap, Download } from 'lucide-react';
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
                Diseñado para clínicas estéticas y negocios de alto flujo que no pueden perder ni un solo cliente.
              </p>

              {/* Lista de Beneficios */}
              <div className="w-full max-w-2xl mb-12 text-left p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10">
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
                
                <div className="flex flex-wrap justify-center gap-4 md:gap-8 items-center opacity-80">
                   {/* Visa Official */}
                   <div className="group/icon relative grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110 cursor-pointer" title="Visa">
                      <svg className="h-6 md:h-8 w-auto" viewBox="0 0 78 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M33.598 0.435547L22.003 23.5625H10.92L0 0.435547H11.758L16.873 14.2765L22.16 0.435547H33.598ZM58.278 16.4666C58.278 10.1746 49.402 9.81555 49.452 7.05355C49.507 6.20955 50.312 5.28955 52.338 5.16355C53.348 5.10355 56.18 5.05855 59.428 6.55855L61.483 1.89355C58.705 0.873547 55.142 0.381547 51.608 0.430547C45.32 0.430547 40.862 3.76155 40.895 8.59955C40.963 12.2136 44.483 14.2386 47.185 15.5826C49.96 16.9516 50.888 17.8336 50.873 18.7936C50.845 20.2866 49.028 20.9636 47.35 21.0006C44.483 21.0856 41.148 20.1836 38.465 18.9686L36.348 23.7116C39.243 25.0266 44.603 25.7216 47.822 25.6516C54.467 25.6516 58.835 22.3666 58.822 17.3936L58.278 16.4666ZM75.747 0.435547H65.813C62.852 0.435547 60.65 2.24455 59.41 5.32155L36.42 56.1625H47.75L50.102 49.6525H63.045L64.192 56.1625H74.513L77.712 19.5865L77.877 19.2325C77.917 19.1316 78 18.9936 78 18.8566C78 18.4306 77.565 18.1126 77.155 18.1406L70.59 18.5506C70.18 18.5786 69.77 18.8006 69.632 19.2336L52.875 52.6666C53.515 52.6666 54.157 52.6666 54.802 52.6666C55.535 52.6666 56.23 52.7116 56.89 52.7666L57.747 43.1616H71.21L75.747 0.435547ZM66.198 37.3166L69.46 21.2666C69.46 21.2666 73.618 37.3166 74.018 37.3166H66.198Z" fill="white"/>
                      </svg>
                   </div>
                   
                   {/* Mastercard Official */}
                   <div className="group/icon relative grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110 cursor-pointer" title="Mastercard">
                       <svg className="h-8 md:h-10 w-auto" viewBox="0 0 36 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="11.6" cy="11" r="9" fill="#EB001B"/>
                          <circle cx="24.4" cy="11" r="9" fill="#F79E1B" style={{ mixBlendMode: 'multiply' }}/>
                       </svg>
                   </div>

                   {/* Amex Official */}
                   <div className="group/icon relative grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110 cursor-pointer" title="American Express">
                        <svg className="h-8 md:h-10 w-auto" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.61538 0H35.3846C37.9333 0 40 2.06667 40 4.61538V19.3846C40 21.9333 37.9333 24 35.3846 24H4.61538C2.06667 24 0 21.9333 0 19.3846V4.61538C0 2.06667 2.06667 0 4.61538 0Z" fill="#006FCF"/>
                            <path d="M11.344 11.8667L8.62533 6.28267H5.78267L10.072 14.4227L6.08267 20.6893H9.04267L11.8653 16.212L14.9053 20.6893H17.728L13.5653 14.6987L17.804 6.28267H14.8427L11.344 11.8667ZM22.2533 20.6893H17.8413L19.2947 17.7827H22.9947L22.3547 16.3333H20.0187L21.2067 13.9533H23.552L22.912 12.5H21.9307L23.6827 8.98267H25.9653L24.6173 6.28267H17.716L14.1533 20.6893H22.2533V20.6893ZM31.344 14.836H29.428L28.8707 17.1787H31.2053L30.5653 18.6293H28.148L27.2933 22.24H35.384V19.3333H32.4493L33.0053 16.992H30.6653L31.2213 15.5413H33.5627L34.1187 13.2H31.7773L32.3333 10.8587H34.6747L35.2307 8.51733H32.8893L33.4453 6.17467H25.3547L24.7973 8.51733H27.1387L26.5827 10.8587H24.2413L23.684 13.2H26.0253L25.468 15.5413H23.128L22.5707 17.8827H24.912L24.3547 20.2253H16.264V23.1333H36.7547V14.836H31.344Z" fill="white"/>
                        </svg>
                   </div>

                   {/* Bancolombia Official */}
                   <div className="group/icon relative grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110 cursor-pointer" title="Bancolombia">
                        <svg className="h-6 md:h-8 w-auto" viewBox="0 0 138 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M27.6 0H20.7V32H27.6V0Z" fill="#FDDA24"/>
                            <path d="M13.8 0H6.9V32H13.8V0Z" fill="#0033A0"/>
                            <path d="M0 0H6.9V32H0V0Z" fill="#EC1C24"/>
                            <path d="M51.592 22.456C51.592 24.216 50.936 25.712 49.624 26.944C48.328 28.16 46.632 28.768 44.536 28.768C42.712 28.768 41.096 28.328 39.688 27.448L40.728 23.976C41.96 24.68 43.272 25.032 44.664 25.032C45.656 25.032 46.424 24.784 46.968 24.288C47.528 23.792 47.808 23.168 47.808 22.416C47.808 21.68 47.584 21.072 47.136 20.592C46.704 20.096 45.968 19.68 44.928 19.344C43.264 18.8 42.048 18.296 41.28 17.832C40.528 17.368 39.96 16.816 39.576 16.176C39.192 15.52 39 14.76 39 13.896C39 12.232 39.64 10.792 40.92 9.576C42.216 8.344 43.864 7.728 45.864 7.728C47.56 7.728 49.056 8.104 50.352 8.856L49.36 12.28C48.24 11.672 47.08 11.368 45.88 11.368C44.984 11.368 44.288 11.592 43.792 12.04C43.312 12.488 43.072 13.048 43.072 13.72C43.072 14.36 43.264 14.912 43.648 15.376C44.048 15.824 44.752 16.24 45.76 16.624C47.44 17.264 48.664 17.8 49.432 18.232C50.216 18.664 50.816 19.208 51.232 19.864C51.648 20.52 51.856 21.384 51.856 22.456H51.592ZM59.968 28.768C58.4 28.768 57.04 28.208 55.888 27.088C54.752 25.952 54.184 24.504 54.184 22.744C54.184 20.968 54.752 19.512 55.888 18.376C57.04 17.24 58.4 16.672 59.968 16.672C61.536 16.672 62.896 17.24 64.048 18.376C65.2 19.512 65.776 20.968 65.776 22.744C65.776 24.504 65.2 25.952 64.048 27.088C62.896 28.208 61.536 28.768 59.968 28.768ZM59.968 25.664C60.832 25.664 61.536 25.344 62.08 24.704C62.624 24.048 62.896 23.216 62.896 22.208C62.896 21.2 62.624 20.384 62.08 19.76C61.536 19.136 60.832 18.824 59.968 18.824C59.104 18.824 58.4 19.136 57.856 19.76C57.328 20.384 57.064 21.2 57.064 22.208C57.064 23.216 57.328 24.048 57.856 24.704C58.4 25.344 59.104 25.664 59.968 25.664ZM73.712 28.768C72.048 28.768 70.68 28.208 69.608 27.088C68.552 25.952 68.024 24.504 68.024 22.744C68.024 20.968 68.552 19.512 69.608 18.376C70.68 17.24 72.048 16.672 73.712 16.672C75.344 16.672 76.672 17.24 77.696 18.376C78.736 19.512 79.256 20.968 79.256 22.744C79.256 24.504 78.736 25.952 77.696 27.088C76.672 28.208 75.344 28.768 73.712 28.768ZM73.712 25.664C74.544 25.664 75.232 25.344 75.776 24.704C76.32 24.048 76.592 23.216 76.592 22.208C76.592 21.2 76.32 20.384 75.776 19.76C75.232 19.136 74.544 18.824 73.712 18.824C72.88 18.824 72.192 19.136 71.648 19.76C71.12 20.384 70.856 21.2 70.856 22.208C70.856 23.216 71.12 24.048 71.648 24.704C72.192 25.344 72.88 25.664 73.712 25.664ZM86.368 28.768C84.8 28.768 83.44 28.208 82.288 27.088C81.152 25.952 80.584 24.504 80.584 22.744C80.584 20.968 81.152 19.512 82.288 18.376C83.44 17.24 84.8 16.672 86.368 16.672C87.936 16.672 89.296 17.24 90.448 18.376C91.6 19.512 92.176 20.968 92.176 22.744C92.176 24.504 91.6 25.952 90.448 27.088C89.296 28.208 87.936 28.768 86.368 28.768ZM86.368 25.664C87.232 25.664 87.936 25.344 88.48 24.704C89.024 24.048 89.296 23.216 89.296 22.208C89.296 21.2 89.024 20.384 88.48 19.76C87.936 19.136 87.232 18.824 86.368 18.824C85.504 18.824 84.8 19.136 84.256 19.76C83.728 20.384 83.464 21.2 83.464 22.208C83.464 23.216 83.728 24.048 84.256 24.704C84.8 25.344 85.504 25.664 86.368 25.664ZM99.648 28.768C98.08 28.768 96.72 28.208 95.568 27.088C94.432 25.952 93.864 24.504 93.864 22.744C93.864 20.968 94.432 19.512 95.568 18.376C96.72 17.24 98.08 16.672 99.648 16.672C101.216 16.672 102.576 17.24 103.728 18.376C104.88 19.512 105.456 20.968 105.456 22.744C105.456 24.504 104.88 25.952 103.728 27.088C102.576 28.208 101.216 28.768 99.648 28.768ZM99.648 25.664C100.512 25.664 101.216 25.344 101.76 24.704C102.304 24.048 102.576 23.216 102.576 22.208C102.576 21.2 102.304 20.384 101.76 19.76C101.216 19.136 100.512 18.824 99.648 18.824C98.784 18.824 98.08 19.136 97.536 19.76C97.008 20.384 96.744 21.2 96.744 22.208C96.744 23.216 97.008 24.048 97.536 24.704C98.08 25.344 98.784 25.664 99.648 25.664ZM114.368 28.768C112.8 28.768 111.44 28.208 110.288 27.088C109.152 25.952 108.584 24.504 108.584 22.744C108.584 20.968 109.152 19.512 110.288 18.376C111.44 17.24 112.8 16.672 114.368 16.672C115.936 16.672 117.296 17.24 118.448 18.376C119.6 19.512 120.176 20.968 120.176 22.744C120.176 24.504 119.6 25.952 118.448 27.088C117.296 28.208 115.936 28.768 114.368 28.768ZM114.368 25.664C115.232 25.664 115.936 25.344 116.48 24.704C117.024 24.048 117.296 23.216 117.296 22.208C117.296 21.2 117.024 20.384 116.48 19.76C115.936 19.136 115.232 18.824 114.368 18.824C113.504 18.824 112.8 19.136 112.256 19.76C111.728 20.384 111.464 21.2 111.464 22.208C111.464 23.216 111.728 24.048 112.256 24.704C112.8 25.344 113.504 25.664 114.368 25.664ZM127.648 28.768C125.984 28.768 124.616 28.208 123.544 27.088C122.488 25.952 121.96 24.504 121.96 22.744C121.96 20.968 122.488 19.512 123.544 18.376C124.616 17.24 125.984 16.672 127.648 16.672C129.28 16.672 130.608 17.24 131.632 18.376C132.672 19.512 133.192 20.968 133.192 22.744C133.192 24.504 132.672 25.952 131.632 27.088C130.608 28.208 129.28 28.768 127.648 28.768ZM127.648 25.664C128.48 25.664 129.168 25.344 129.712 24.704C130.256 24.048 130.528 23.216 130.528 22.208C130.528 21.2 130.256 20.384 129.712 19.76C129.168 19.136 128.48 18.824 127.648 18.824C126.816 18.824 126.128 19.136 125.584 19.76C125.056 20.384 124.792 21.2 124.792 22.208C124.792 23.216 125.056 24.048 125.584 24.704C126.128 25.344 126.816 25.664 127.648 25.664Z" fill="white"/>
                        </svg>
                   </div>

                   {/* Rappi Official */}
                   <div className="group/icon relative grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110 cursor-pointer" title="RappiCard">
                       <svg className="h-6 md:h-8 w-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#FF4343"/>
                           <path d="M11 7H13V17H11V7Z" fill="#FF4343"/>
                           <path d="M7 11H17V13H7V11Z" fill="#FF4343"/>
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