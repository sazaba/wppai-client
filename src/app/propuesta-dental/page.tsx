'use client'

import React from 'react';
import { Sparkles, CheckCircle2, Clock, Users, Database, BrainCircuit, BarChart3, Search, CalendarCheck, Activity, ChevronRight, AlertCircle } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

// IMPORTA TUS COMPONENTES VISUALES
import CalendarVisual from './components/CalendarVisual'; 
import DentalChatAnimation from './components/DentalChatAnimation';

// --- ANIMATION VARIANTS ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
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
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const listContainer: Variants = {
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const listItem: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
};

// --- DATOS FICTICIOS PARA LA LISTA ANIMADA ---
const mockPatients = [
    { name: "Juan P.", action: "Profilaxis (6m)", status: "Reactivar", color: "text-amber-400", bg: "bg-amber-500/10", icon: AlertCircle },
    { name: "Andrea M.", action: "Ortodoncia (15d)", status: "En Curso", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: Activity },
    { name: "Carlos R.", action: "Valoración (1a)", status: "Inactivo", color: "text-rose-400", bg: "bg-rose-500/10", icon: Users },
    { name: "Sofia L.", action: "Blanqueamiento", status: "Seguimiento", color: "text-blue-400", bg: "bg-blue-500/10", icon: CheckCircle2 },
];

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
            La plataforma que agenda, confirma y organiza sus pacientes mientras usted se dedica a la odontología.
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


        {/* --- FEATURE 3: EL CEREBRO (BENTO GRID - DISEÑO DISRUPTIVO + LISTA) --- */}
        <section className="mb-40 relative">
            
            {/* FONDO DISRUPTIVO DEL CONTENEDOR (Cyber Grid) */}
            <div className="absolute inset-0 -mx-[50vw] left-[50%] w-[100vw] h-full bg-[#080808] border-y border-white/5 z-0">
                {/* Patrón de rejilla CSS sutil */}
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                {/* Máscara radial para desvanecer bordes */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_50%,transparent,black)]"></div>
            </div>

            <div className="relative z-10 px-6 md:px-0 max-w-7xl mx-auto py-20">
                
                {/* Título de Sección */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-block mb-4"
                    >
                         <span className="px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-300 text-xs font-mono tracking-widest uppercase shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]">
                            Core System v.2.0
                         </span>
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        El Cerebro Digital de tu Clínica
                    </h2>
                    <p className="text-slate-400 text-lg">
                        Transformamos datos dispersos en <span className="text-cyan-400 font-semibold">control operativo</span> absoluto.
                    </p>
                </div>

                {/* BENTO GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto">
                    
                    {/* 1. MÓDULO CENTRAL (Database) - ENFOQUE: LISTA DINÁMICA */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-7 group relative rounded-[32px] overflow-hidden bg-[#0c0c0c] border border-white/10 hover:border-cyan-500/30 transition-colors duration-500 flex flex-col"
                    >
                        {/* Efecto Glow en Hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        
                        <div className="relative p-8 md:p-10 h-full flex flex-col">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-8">
                                <div className="p-3 rounded-2xl bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                                    <Database size={28} />
                                </div>
                                <div className="flex gap-1.5 opacity-40">
                                    <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" />
                                    <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse delay-75" />
                                    <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse delay-150" />
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                                    Historial Clínico de Marketing
                                </h3>
                                <p className="text-slate-400 text-base leading-relaxed max-w-lg">
                                    Tu base de datos organizada y viva. Accede al perfil de cada paciente para revisar su historial y tomar decisiones de seguimiento.
                                </p>
                            </div>

                            {/* --- LISTA ANIMADA DE PACIENTES --- */}
                            <div className="mt-auto bg-black/40 rounded-2xl border border-white/5 overflow-hidden backdrop-blur-sm">
                                {/* Header de la "Tabla" */}
                                <div className="px-5 py-3 border-b border-white/5 flex justify-between text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                                    <span>Paciente / Acción</span>
                                    <span>Estado</span>
                                </div>
                                {/* Lista con Framer Motion */}
                                <motion.div 
                                    className="p-2 space-y-1"
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={listContainer}
                                >
                                    {mockPatients.map((patient, i) => (
                                        <motion.div 
                                            key={i} 
                                            variants={listItem}
                                            className="group/item flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-default"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full ${patient.bg} flex items-center justify-center ${patient.color}`}>
                                                    <patient.icon size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-200">{patient.name}</p>
                                                    <p className="text-xs text-slate-500">{patient.action}</p>
                                                </div>
                                            </div>
                                            <div className={`text-xs px-2 py-1 rounded-md border border-white/5 bg-black/50 ${patient.color} font-medium`}>
                                                {patient.status}
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
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
                            className="group relative rounded-[32px] overflow-hidden bg-[#0c0c0c] border border-white/10 hover:border-emerald-500/30 transition-colors duration-500 min-h-[240px] flex flex-col"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            
                            <div className="relative p-8 h-full flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Motor de Reactivación</h3>
                                        <p className="text-xs text-emerald-400/80 uppercase tracking-wider mt-1 font-semibold">Gestión de Retorno</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-emerald-950/50 border border-emerald-500/20 text-emerald-400">
                                        <Users size={20} />
                                    </div>
                                </div>
                                
                                <p className="text-slate-400 text-sm mt-2">
                                    Identifica oportunidades. La plataforma resalta quiénes son tus pacientes inactivos para que gestiones su retorno efectivamente.
                                </p>
                                
                                <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-emerald-500/70 bg-emerald-500/5 px-3 py-1.5 rounded-full w-fit border border-emerald-500/10">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    Oportunidades detectadas hoy
                                </div>
                            </div>
                        </motion.div>

                        {/* 3. MÓDULO METRICAS (Bottom Right) */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="group relative rounded-[32px] overflow-hidden bg-[#0c0c0c] border border-white/10 hover:border-blue-500/30 transition-colors duration-500 min-h-[240px] flex flex-col"
                        >
                             <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                            <div className="relative p-8 h-full flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Métricas de Citas</h3>
                                        <p className="text-xs text-blue-400/80 uppercase tracking-wider mt-1 font-semibold">Dashboard CRM</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-blue-950/50 border border-blue-500/20 text-blue-400">
                                        <CalendarCheck size={20} />
                                    </div>
                                </div>

                                <p className="text-slate-400 text-sm mt-2 mb-4">
                                    Visualiza el rendimiento mensual: Citas agendadas, pacientes nuevos vs. recurrentes y volumen de gestión.
                                </p>

                                {/* Mini Chart Abstract */}
                                <div className="flex items-end gap-1.5 h-10 w-full opacity-80 mt-auto">
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