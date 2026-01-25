import React from 'react';
import { Sparkles, ShieldCheck, BarChart3, ChevronRight, CheckCircle2, Clock, Users, Database, BrainCircuit } from 'lucide-react';
// IMPORTA TUS COMPONENTES VISUALES

import CalendarVisual from './components/CalendarVisual'; // Asegúrate de la ruta
import DentalChatAnimation from './components/DentalChatAnimation';


export default function DentalProposal() {
  return (
    <main className="min-h-screen bg-[#050505] text-slate-200 selection:bg-cyan-500 selection:text-black font-sans overflow-x-hidden relative">
      
      {/* Navbar Background Fix */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-slate-900/80 via-[#050505] to-[#050505] z-0 pointer-events-none" />
      
      {/* Background Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[0%] w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[0%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 md:pt-44 pb-32">
        
        {/* --- HERO (Simplificado para dar paso a las features) --- */}
        <section className="text-center mb-40">
           {/* ... (Puedes mantener el Hero que hicimos antes aquí) ... */}
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/40 text-cyan-300 text-[10px] uppercase tracking-widest font-bold mb-8 backdrop-blur-md">
            <Sparkles size={12} /> Inteligencia Artificial Odontológica
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tighter">
            Automatización Clínica <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Sin Perder el Toque Humano</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            La plataforma que agenda, confirma y reactiva pacientes mientras usted se dedica a la odontología.
          </p>
        </section>


        {/* --- FEATURE 1: ASISTENTE VIRTUAL (Chat) --- */}
        <section className="grid lg:grid-cols-2 gap-16 items-center mb-48">
            <div className="order-2 lg:order-1 relative">
                {/* Glow detrás del celular */}
                <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full" />
                {/* TU COMPONENTE DE CHAT */}
                <div className="relative transform scale-90 sm:scale-100 lg:scale-110 origin-center">
                    <DentalChatAnimation/>
                </div>
            </div>
            
            <div className="order-1 lg:order-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
                    <BrainCircuit className="text-white" size={24} />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Tu Recepcionista Experta <br/>
                    <span className="text-indigo-400">Disponible 24/7</span>
                </h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                    Olvídate de responder lo mismo 100 veces al día. Nuestro asistente IA está entrenado exclusivamente con <strong>terminología odontológica</strong>.
                </p>
                <ul className="space-y-4">
                    {[
                        "Responde precios, horarios y ubicación al instante.",
                        "Filtra curiosos: Solo te notifica cuando hay intención real.",
                        "Optimizado para no alucinar ni hablar de temas externos.",
                        "Ahorra el 90% del trabajo manual de agendamiento."
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-300">
                            <CheckCircle2 className="text-indigo-500 shrink-0 mt-1" size={18} />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>


        {/* --- FEATURE 2: AGENDA INTELIGENTE (Calendar) --- */}
        <section className="grid lg:grid-cols-2 gap-16 items-center mb-48">
            <div className="order-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30">
                    <Clock className="text-white" size={24} />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Agenda que Trabaja Sola <br/>
                    <span className="text-purple-400">Cero Ausentismo</span>
                </h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                    Un sistema de gestión de citas diseñado para clínicas de alto flujo. Control total sobre tus doctores, sillones y tiempos.
                </p>
                <ul className="space-y-4">
                    {[
                        "Confirmación automática vía WhatsApp 24h antes.",
                        "Gestión multi-doctor y filtrado por especialista.",
                        "Alertas inmediatas de cancelación o reprogramación.",
                        "Bloqueo inteligente de horarios no disponibles."
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-300">
                            <CheckCircle2 className="text-purple-500 shrink-0 mt-1" size={18} />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="order-2 relative">
                 {/* Glow detrás del calendario */}
                 <div className="absolute inset-0 bg-purple-500/10 blur-[100px] rounded-full" />
                 {/* TU COMPONENTE VISUAL DE CALENDARIO */}
                 <CalendarVisual />
            </div>
        </section>


        {/* --- FEATURE 3: DATA & DASHBOARD (Grid) --- */}
        <section className="mb-32">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    El Cerebro de tu Clínica
                </h2>
                <p className="text-slate-400 text-lg">
                    No solo agendamos, construimos el activo más valioso de tu negocio: <span className="text-white font-medium">Tu Base de Datos.</span>
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Card 1: Base de Datos */}
                <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 hover:border-cyan-500/30 transition duration-300 group">
                    <div className="mb-6 w-12 h-12 rounded-xl bg-cyan-900/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
                        <Database size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Historial Clínico de Marketing</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Guarda automáticamente cada interacción. Sabrás cuándo fue su última cita y qué procedimiento se realizó para campañas futuras.
                    </p>
                </div>

                {/* Card 2: Reactivación */}
                <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 hover:border-emerald-500/30 transition duration-300 group">
                    <div className="mb-6 w-12 h-12 rounded-xl bg-emerald-900/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
                        <Users size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Motor de Reactivación</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Detecta pacientes inactivos y envía mensajes personalizados para traerlos de vuelta a consulta automáticamente.
                    </p>
                </div>

                {/* Card 3: Métricas */}
                <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 hover:border-blue-500/30 transition duration-300 group">
                    <div className="mb-6 w-12 h-12 rounded-xl bg-blue-900/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition">
                        <BarChart3 size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Dashboard ROI Real</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Visualiza en tiempo real chats activos, citas concretadas y dinero generado. Mide la efectividad exacta de la App.
                    </p>
                </div>
            </div>
        </section>

        {/* --- CTA FINAL --- */}
        <section className="relative p-[1px] rounded-3xl bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-blue-500/50">
            <div className="bg-[#050505] rounded-[23px] px-6 py-20 text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 relative z-10">
                    ¿Listo para modernizar su clínica?
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto mb-10 text-lg relative z-10">
                    Deje de perder pacientes por demoras en respuesta. Implemente la IA hoy mismo.
                </p>
                <button className="relative z-10 px-10 py-4 bg-white text-black font-bold rounded-xl hover:scale-105 transition shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)]">
                    Agendar Demo Personalizada
                </button>
            </div>
        </section>

      </div>
    </main>
  );
}