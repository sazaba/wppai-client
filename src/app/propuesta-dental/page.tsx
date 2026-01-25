'use client'

import React from 'react';
import { Sparkles, CheckCircle2, Clock, Users, Database, BrainCircuit, BarChart3, CalendarCheck, ChevronRight, FileText, CalendarDays, Zap } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

// IMPORTA TUS COMPONENTES VISUALES
import CalendarVisual from './components/CalendarVisual'; 
import DentalChatAnimation from './components/DentalChatAnimation';

// --- ANIMATION VARIANTS OPTIMIZADAS ---
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
            staggerChildren: 0.12
        }
    }
};

const listItem: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
};

// --- ANIMACIÓN DE FONDO PARA EL CTA ---
const pulseGradient: Variants = {
    animate: {
        scale: [1, 1.05, 1],
        opacity: [0.4, 0.6, 0.4],
        transition: {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

const rotateGradient: Variants = {
    animate: {
        rotate: [0, 360],
        transition: {
            duration: 20,
            repeat: Infinity,
            ease: "linear"
        }
    }
};

// --- DATOS FICTICIOS GENÉRICOS ---
const mockPatients = [
    { initials: "LG", name: "Laura García", procedure: "Control Ortodoncia", date: "Hoy, 10:30 AM", color: "bg-purple-500/20 text-purple-300 font-bold" },
    { initials: "CR", name: "Carlos Rodríguez", procedure: "Implante Dental", date: "Ayer", color: "bg-blue-500/20 text-blue-300 font-bold" },
    { initials: "MP", name: "María Pérez", procedure: "Blanqueamiento", date: "Hace 2 días", color: "bg-cyan-500/20 text-cyan-300 font-bold" },
    { initials: "JL", name: "Jorge López", procedure: "Profilaxis General", date: "Hace 1 semana", color: "bg-emerald-500/20 text-emerald-300 font-bold" },
];

export default function DentalProposal() {
  return (
    <main className="min-h-screen bg-[#050505] text-slate-200 selection:bg-cyan-500 selection:text-black font-sans overflow-x-hidden relative">
      
      {/* Navbar Background Fix */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-slate-900/90 via-[#050505] to-[#050505] z-0 pointer-events-none" />
      
      {/* Background Glows Globales */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[0%] w-[600px] h-[600px] bg-cyan-900/05 rounded-full blur-[120px] opacity-40 will-change-transform" />
        <div className="absolute bottom-[20%] right-[0%] w-[500px] h-[500px] bg-purple-900/05 rounded-full blur-[128px] opacity-40 will-change-transform" />
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
                <div className="absolute inset-0 bg-indigo-500/20 blur-[90px] rounded-full will-change-transform" />
                <div className="relative transform scale-95 sm:scale-100 lg:scale-110 transition-transform duration-700">
                    <DentalChatAnimation/>
                </div>
            </motion.div>
            
            {/* Columna Texto */}
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
            {/* Columna Texto */}
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


        {/* --- FEATURE 3: EL CEREBRO (BENTO GRID OPTIMIZADO) --- */}
        <section className="mb-40 relative px-6 md:px-0">
            
            {/* GLOWS TRASEROS */}
            <div className="absolute top-0 left-[-20%] w-[600px] h-[600px] bg-purple-600/20 blur-[130px] rounded-full -z-10 pointer-events-none mix-blend-screen will-change-transform" />
            <div className="absolute bottom-0 right-[-20%] w-[600px] h-[600px] bg-blue-500/20 blur-[130px] rounded-full -z-10 pointer-events-none mix-blend-screen will-change-transform" />


            {/* Título */}
            <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto relative z-10">
                
                {/* 1. MÓDULO CENTRAL (Database) */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="lg:col-span-7 group relative rounded-[32px] overflow-hidden bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 transition-all duration-500 flex flex-col backdrop-blur-xl shadow-2xl shadow-black/20 isolation-isolate transform-gpu"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                    
                    <div className="relative p-8 md:p-10 h-full flex flex-col">
                        <div className="flex items-start justify-between mb-8">
                            <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                                <Database size={28} />
                            </div>
                            <div className="flex gap-1 opacity-30">
                                <div className="w-1 h-1 bg-white rounded-full" />
                                <div className="w-1 h-1 bg-white rounded-full" />
                                <div className="w-8 h-1 bg-white rounded-full" />
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                                Historial Clínico de Marketing
                            </h3>
                            <p className="text-slate-400 text-base leading-relaxed max-w-lg">
                                Tu base de datos organizada y viva. Accede al perfil de cada paciente, visualiza su último procedimiento y toma decisiones basadas en datos reales.
                            </p>
                        </div>

                        {/* --- LISTA OPTIMIZADA --- */}
                        <div className="mt-auto border-t border-white/5 pt-6">
                            <div className="flex justify-between items-center mb-4 px-2">
                                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Actividad Reciente</span>
                                <span className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1 transition-colors">
                                    Ver DB Completa <ChevronRight size={12}/>
                                </span>
                            </div>

                            <motion.div 
                                className="space-y-3"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={listContainer}
                            >
                                {mockPatients.map((patient, i) => (
                                    <motion.div 
                                        key={i} 
                                        variants={listItem}
                                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors group/item transform-gpu translate-z-0"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full ${patient.color} flex items-center justify-center text-sm shadow-sm`}>
                                                {patient.initials}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-200 group-hover/item:text-white transition-colors">
                                                    {patient.name}
                                                </span>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <FileText size={10} className="text-slate-500" />
                                                    <span className="text-xs text-slate-400">
                                                        {patient.procedure}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 px-3 py-1 rounded-lg bg-black/20">
                                            <CalendarDays size={12} />
                                            <span className="text-xs font-mono">{patient.date}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* COLUMNA DERECHA */}
                <div className="lg:col-span-5 flex flex-col gap-6">

                    {/* 2. MÓDULO REACTIVACIÓN */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="group relative rounded-[32px] overflow-hidden bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 transition-all duration-500 min-h-[240px] flex flex-col backdrop-blur-xl shadow-2xl shadow-black/20 transform-gpu"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        
                        <div className="relative p-8 h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Motor de Reactivación</h3>
                                    <p className="text-xs text-emerald-400/80 uppercase tracking-wider mt-1 font-semibold">Gestión de Retorno</p>
                                </div>
                                <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-400">
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

                    {/* 3. MÓDULO METRICAS */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="group relative rounded-[32px] overflow-hidden bg-white/[0.03] border border-white/10 hover:border-blue-500/30 transition-all duration-500 min-h-[240px] flex flex-col backdrop-blur-xl shadow-2xl shadow-black/20 transform-gpu"
                    >
                         <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        <div className="relative p-8 h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Métricas de Citas</h3>
                                    <p className="text-xs text-blue-400/80 uppercase tracking-wider mt-1 font-semibold">Dashboard CRM</p>
                                </div>
                                <div className="p-2 rounded-lg bg-blue-950/30 border border-blue-500/20 text-blue-400">
                                    <CalendarCheck size={20} />
                                </div>
                            </div>

                            <p className="text-slate-400 text-sm mt-2 mb-4">
                                Visualiza el rendimiento mensual: Citas agendadas, pacientes nuevos vs. recurrentes y volumen de gestión.
                            </p>

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
        </section>

        {/* --- CTA FINAL DISRUPTIVO: NÚCLEO DE FUSIÓN --- */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          // Contenedor principal con overflow hidden para contener los efectos de plasma
          className="relative py-24 md:py-32 overflow-hidden rounded-[40px] mx-2 md:mx-0 group"
        >
            {/* --- FONDO DE PLASMA ANIMADO --- */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Ruido de fondo para textura */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
                
                {/* Gradiente Cian Giratorio */}
                <motion.div 
                    variants={rotateGradient}
                    animate="animate"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-conic-gradient from-cyan-500/40 via-transparent to-transparent blur-[100px] opacity-60" 
                />
                {/* Gradiente Morado Pulsante */}
                <motion.div 
                     variants={pulseGradient}
                     animate="animate"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/30 blur-[120px] rounded-full mix-blend-screen"
                />
                
                {/* Destellos de energía ascendentes */}
                <div className="absolute inset-0 flex justify-center items-center">
                    <Sparkles className="text-cyan-300 opacity-30 animate-pulse absolute top-1/4 left-1/3" size={20} />
                    <Zap className="text-purple-300 opacity-20 animate-bounce absolute bottom-1/4 right-1/3 duration-[2000ms]" size={16} />
                </div>
            </div>

            {/* --- CONTENIDO GLASSMORPHISM --- */}
            <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
                {/* Contenedor de Cristal */}
                <div className="bg-white/[0.03] backdrop-blur-2xl p-8 md:p-12 rounded-[32px] border border-white/10 shadow-2xl shadow-purple-500/10 relative overflow-hidden group-hover:border-white/20 transition-all duration-500">
                    
                    {/* Reflejo superior en el cristal */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50" />

                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
                        ¿Listo para el <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">Siguiente Nivel</span>?
                    </h2>
                    <p className="text-slate-300 max-w-xl mx-auto mb-10 text-lg md:text-xl leading-relaxed font-medium">
                        Deje que la IA maneje la rutina. Recupere su tiempo y enfóquese en lo que realmente importa: sus pacientes.
                    </p>
                    
                    {/* --- BOTÓN DE ENERGÍA "HALO" --- */}
                    <Link href="/register" className="relative z-10 inline-block group/btn">
                        <div className="relative">
                            {/* Halo de energía detrás del botón */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur-xl opacity-40 group-hover/btn:opacity-70 transition-opacity duration-500 animate-pulse" />
                            
                            {/* Botón Principal */}
                            <button className="relative bg-white text-black font-bold text-lg px-12 py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] flex items-center gap-2 mx-auto">
                                Iniciar Transformación
                                <ChevronRight className="group-hover/btn:translate-x-1 transition-transform" size={20} />
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