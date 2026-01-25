'use client'

import React from 'react';
import { Sparkles, CheckCircle2, Clock, Users, Database, BrainCircuit, BarChart3 } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link'; // Importante para la navegación al registro

// IMPORTA TUS COMPONENTES VISUALES
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
      
      {/* Background Glows */}
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
                {/* Nota: Mantenemos el 'text-left' dentro del 'ul' para que los items se lean bien, 
                    pero el bloque entero está centrado gracias a 'inline-block' y el padre flex-col items-center */}
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


        {/* --- FEATURE 3: DATA & DASHBOARD (CARDS CENTRADAS) --- */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
          className="mb-32"
        >
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    El Cerebro de tu Clínica
                </h2>
                <p className="text-slate-400 text-lg">
                    No solo agendamos, construimos el activo más valioso de tu negocio: <span className="text-white font-medium">Tu Base de Datos.</span>
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Card 1 */}
                <motion.div whileHover={{ y: -5 }} className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 hover:border-cyan-500/30 transition duration-300 group shadow-lg flex flex-col items-center text-center">
                    <div className="mb-6 w-12 h-12 rounded-xl bg-cyan-900/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-900/40 transition">
                        <Database size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Historial Clínico de Marketing</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Guarda automáticamente cada interacción. Sabrás cuándo fue su última cita y qué procedimiento se realizó.
                    </p>
                </motion.div>

                {/* Card 2 */}
                <motion.div whileHover={{ y: -5 }} className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 hover:border-emerald-500/30 transition duration-300 group shadow-lg flex flex-col items-center text-center">
                    <div className="mb-6 w-12 h-12 rounded-xl bg-emerald-900/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-900/40 transition">
                        <Users size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Motor de Reactivación</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Detecta pacientes inactivos y envía mensajes personalizados para traerlos de vuelta automáticamente.
                    </p>
                </motion.div>

                {/* Card 3 */}
                <motion.div whileHover={{ y: -5 }} className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 hover:border-blue-500/30 transition duration-300 group shadow-lg flex flex-col items-center text-center">
                    <div className="mb-6 w-12 h-12 rounded-xl bg-blue-900/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-900/40 transition">
                        <BarChart3 size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Dashboard ROI Real</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Visualiza en tiempo real chats activos, citas concretadas y dinero generado. Mide la efectividad exacta.
                    </p>
                </motion.div>
            </div>
        </motion.section>

        {/* --- CTA FINAL (BOTÓN ACTUALIZADO) --- */}
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
                
                {/* Botón Actualizado con Link */}
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