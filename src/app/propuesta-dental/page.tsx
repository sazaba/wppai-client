'use client'

import React from 'react';
import { Sparkles, CheckCircle2, Clock, Users, Database, BrainCircuit, BarChart3 } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

// IMPORTA TUS COMPONENTES VISUALES
// Asegúrate de que las rutas sean correctas según tu estructura de carpetas
import CalendarVisual from './components/CalendarVisual'; 
import DentalChatAnimation from './components/DentalChatAnimation';

// Variantes de animación
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function DentalProposal() {
  return (
    <main className="min-h-screen bg-[#050505] text-slate-200 selection:bg-cyan-500 selection:text-black font-sans overflow-x-hidden relative">
      
      {/* Navbar Background Fix */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-slate-900/90 via-[#050505] to-[#050505] z-0 pointer-events-none" />
      
      {/* Background Glows Globales */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[0%] w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[20%] right-[0%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[128px] opacity-60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 md:pt-44 pb-32">
        
        {/* --- HERO --- */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-40"
        >
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/40 text-cyan-300 text-[10px] uppercase tracking-widest font-bold mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <Sparkles size={12} /> Inteligencia Artificial Odontológica
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tighter leading-tight">
            Automatización Clínica <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Sin Perder el Toque Humano</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            La plataforma que agenda, confirma y reactiva pacientes mientras usted se dedica a la odontología.
          </p>
        </motion.section>


        {/* --- FEATURE 1: ASISTENTE VIRTUAL (Chat) --- */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-48"
        >
            {/* Columna Visual */}
            <motion.div variants={fadeInUp} className="order-2 lg:order-1 relative flex justify-center">
                <div className="absolute inset-0 bg-indigo-500/20 blur-[90px] rounded-full" />
                <div className="relative transform scale-95 sm:scale-100 lg:scale-110 transition-transform duration-700">
                    <DentalChatAnimation/>
                </div>
            </motion.div>
            
            {/* Columna Texto (CENTRADA) */}
            <motion.div variants={fadeInUp} className="order-1 lg:order-2 flex flex-col items-center text-center lg:items-center lg:text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-8 shadow-lg shadow-indigo-500/30 mx-auto">
                    <BrainCircuit className="text-white" size={28} />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                    Tu Recepcionista Experta <br/>
                    <span className="text-indigo-400">Disponible 24/7</span>
                </h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-lg">
                    Olvídate de responder lo mismo 100 veces al día. Nuestro asistente IA está entrenado exclusivamente con <strong>terminología odontológica</strong>.
                </p>
                <ul className="space-y-5 text-left inline-block"> 
                    {[
                        "Responde precios, horarios y ubicación al instante.",
                        "Filtra curiosos: Solo te notifica intención real.",
                        "Optimizado para no 'alucinar' ni hablar de temas externos.",
                        "Ahorra el 90% del trabajo manual de agendamiento."
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-4 text-slate-300">
                            <div className="mt-1 bg-indigo-500/10 p-1 rounded-full">
                              <CheckCircle2 className="text-indigo-500" size={16} />
                            </div>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </motion.div>
        </motion.section>


        {/* --- FEATURE 2: AGENDA INTELIGENTE (Calendar) --- */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-48"
        >
            {/* Columna Texto (CENTRADA) */}
            <motion.div variants={fadeInUp} className="order-1 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-8 shadow-lg shadow-purple-500/30 mx-auto">
                    <Clock className="text-white" size={28} />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                    Agenda que Trabaja Sola <br/>
                    <span className="text-purple-400">Cero Ausentismo</span>
                </h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-lg">
                    Un sistema de gestión de citas diseñado para clínicas de alto flujo. Control total sobre tus doctores, sillones y tiempos.
                </p>
                <ul className="space-y-5 text-left inline-block">
                    {[
                        "Confirmación automática vía WhatsApp 24h antes.",
                        "Gestión multi-doctor y filtrado por especialista.",
                        "Alertas inmediatas de cancelación o reprogramación.",
                        "Bloqueo inteligente de horarios no disponibles."
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-4 text-slate-300">
                            <div className="mt-1 bg-purple-500/10 p-1 rounded-full">
                                <CheckCircle2 className="text-purple-500" size={16} />
                            </div>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </motion.div>

            <motion.div variants={fadeInUp} className="order-2 relative w-full flex justify-center">
                 <div className="absolute inset-0 bg-purple-500/10 blur-[90px] rounded-full" />
                 <div className="w-full max-w-xl">
                    <CalendarVisual />
                 </div>
            </motion.div>
        </motion.section>


        {/* --- FEATURE 3: EL CEREBRO (DISEÑO BENTO GRID NEURAL) --- */}
        <section className="mb-40 relative px-4 md:px-0">
            {/* Título de Sección */}
            <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="inline-block mb-4"
                >
                     <span className="px-3 py-1 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono tracking-widest uppercase">
                        Core System v.2.0
                     </span>
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                    El Cerebro Digital de tu Clínica
                </h2>
                <p className="text-slate-400 text-lg">
                    Transformamos datos estáticos en un <span className="text-cyan-400 font-semibold">activo viviente</span>.
                </p>
            </div>

            {/* BENTO GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto relative z-10">
                
                {/* 1. MÓDULO CENTRAL (Database) - Ocupa 7 columnas */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="lg:col-span-7 group relative rounded-[32px] overflow-hidden border border-white/10 bg-[#0A0A0A]"
                >
                    {/* Background Effects */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
                    
                    <div className="relative p-8 md:p-10 h-full flex flex-col justify-between min-h-[320px]">
                        <div className="flex justify-between items-start">
                            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                                <Database size={32} />
                            </div>
                            {/* Abstract Decor: Lines */}
                            <div className="flex gap-1">
                                <div className="w-1 h-6 bg-cyan-800/40 rounded-full animate-pulse" />
                                <div className="w-1 h-4 bg-cyan-800/40 rounded-full" />
                                <div className="w-1 h-8 bg-cyan-500/40 rounded-full animate-pulse delay-75" />
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-3xl font-bold text-white mb-4">
                                Historial Clínico de Marketing
                            </h3>
                            <p className="text-slate-400 text-base leading-relaxed max-w-md">
                                No es solo una lista de nombres. Es un registro vivo de cada interacción, procedimiento y tiempo de espera. 
                                <span className="block mt-2 text-cyan-200/80 text-sm border-l-2 border-cyan-500/30 pl-3">
                                    "Paciente X: Última profilaxis hace 6 meses → <span className="text-cyan-400">Activar Protocolo Retorno</span>"
                                </span>
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* COLUMNA DERECHA - Ocupa 5 columnas */}
                <div className="lg:col-span-5 flex flex-col gap-6">

                    {/* 2. MÓDULO REACTIVACIÓN (Top Right) */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="group relative rounded-[32px] overflow-hidden border border-white/10 bg-[#0A0A0A] h-full"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        
                        <div className="relative p-8 h-full">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                    <Users size={24} />
                                </div>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-emerald-500/30 to-transparent" />
                            </div>
                            
                            <h3 className="text-xl font-bold text-white mb-2">Motor de Reactivación</h3>
                            <p className="text-slate-400 text-sm">
                                Detecta inactividad y dispara campañas ultra-personalizadas automáticamente.
                            </p>
                            
                            {/* Visual Stats Simulation */}
                            <div className="mt-6 flex items-center gap-3 text-xs font-mono text-emerald-300/70">
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Scanning DB...
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* 3. MÓDULO ROI (Bottom Right) */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="group relative rounded-[32px] overflow-hidden border border-white/10 bg-[#0A0A0A] h-full"
                    >
                         <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="relative p-8 h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Dashboard ROI</h3>
                                    <p className="text-xs text-blue-300/60 uppercase tracking-wider mt-1">Tiempo Real</p>
                                </div>
                                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                    <BarChart3 size={20} />
                                </div>
                            </div>

                            <p className="text-slate-400 text-sm mb-6">
                                Visualiza dinero generado, no solo likes. Mide la efectividad exacta de cada peso invertido.
                            </p>

                            {/* Mini Chart Abstract */}
                            <div className="flex items-end gap-2 h-12 w-full opacity-60">
                                <div className="w-1/4 h-[40%] bg-slate-700 rounded-t-sm" />
                                <div className="w-1/4 h-[60%] bg-slate-600 rounded-t-sm" />
                                <div className="w-1/4 h-[45%] bg-slate-700 rounded-t-sm" />
                                <div className="w-1/4 h-[90%] bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] rounded-t-sm" />
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>

        {/* --- CTA FINAL --- */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="relative p-[1px] rounded-3xl bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-blue-500/30"
        >
            <div className="bg-[#050505] rounded-[23px] px-6 py-20 text-center relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 relative z-10">
                    ¿Listo para modernizar su clínica?
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto mb-10 text-lg relative z-10">
                    Deje de perder pacientes por demoras en respuesta. Implemente la IA hoy mismo.
                </p>
                
                {/* Botón CTA */}
                <Link href="/register" className="relative z-10 inline-block">
                    <button className="px-10 py-4 bg-white text-black font-bold rounded-xl hover:scale-105 transition shadow-[0_0_50px_-10px_rgba(255,255,255,0.2)]">
                        Registrar Empresa
                    </button>
                </Link>
            </div>
        </motion.section>

      </div>
    </main>
  );
}