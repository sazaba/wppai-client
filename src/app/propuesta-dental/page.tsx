'use client'

import React, { memo, useEffect, useState, useRef } from 'react';
import { Sparkles, CheckCircle2, Clock, Users, Database, BrainCircuit, CalendarCheck, ChevronRight, FileText, CalendarDays, Zap, Wifi } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image'; 
import dynamic from 'next/dynamic';

// --- IMPORTACIÓN DE IMÁGENES ---
import visa from '../images/visa-logo.webp';
import amex from '../images/american-express.webp';
import mastercard from '../images/mastercard-logo.webp';
import wasaaaLogo from '../images/Logo-Wasaaa.webp';

// --- COMPONENTES DINÁMICOS (LAZY LOAD) ---
const CalendarVisual = dynamic(() => import('./components/CalendarVisual'), {
  ssr: false,
  loading: () => <div className="w-full max-w-xl h-[350px] bg-white/5 border border-white/5 rounded-3xl animate-pulse mx-auto" />
});

const DentalChatAnimation = dynamic(() => import('./components/DentalChatAnimation'), {
  ssr: false,
  loading: () => <div className="w-[300px] h-[580px] bg-zinc-900 rounded-[3.5rem] border-4 border-zinc-800 animate-pulse mx-auto opacity-50" />
});

const AnimatedGenericCard = dynamic(() => import('./components/AnimatedGenericCard'), {
  ssr: false,
  loading: () => <div className="w-full max-w-[320px] aspect-[1.586/1] bg-white/5 rounded-2xl animate-pulse mx-auto border border-white/10" />
});

const DownloadButton = dynamic(() => import('./components/DownloadButton'), {
  ssr: false,
  loading: () => <span className="text-xs text-slate-500 animate-pulse">Cargando opción de descarga...</span>,
});

// --- HOOK PARA ANIMACIÓN AL SCROLL (Nativo, sin librerías pesadas) ---
const useScrollReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Solo animar una vez
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
};

// --- DATOS ESTÁTICOS ---
const TESTIMONIALS = [
  { name: "Dra. Beatriz Molina", role: "Directora en OdontoSpecial", text: "Al principio dudé, pero hoy gestiona el 80% de mis citas sin que yo toque el celular.", metric: "+45 citas/mes", avatar: "BM", color: "from-blue-600 to-cyan-500" },
  { name: "Dr. Camilo Restrepo", role: "Ortodoncista", text: "Es como tener un empleado extra que nunca se cansa. Confirma citas automáticamente.", metric: "95% Confirmación", avatar: "CR", color: "from-purple-600 to-indigo-500" },
  { name: "Clínica Dental Sonrisas", role: "Administración", text: "El bot filtra los 'curiosos' y solo nos pasa los pacientes reales. Paz mental absoluta.", metric: "-70% Carga", avatar: "DS", color: "from-emerald-600 to-teal-500" }
];

const MOCK_PATIENTS = [
    { initials: "LG", name: "Laura García", procedure: "Control Ortodoncia", date: "Hoy, 10:30 AM", color: "bg-purple-500/20 text-purple-300 font-bold" },
    { initials: "CR", name: "Carlos R.", procedure: "Implante Dental", date: "Ayer", color: "bg-blue-500/20 text-blue-300 font-bold" },
    { initials: "MP", name: "María Pérez", procedure: "Blanqueamiento", date: "Hace 2d", color: "bg-cyan-500/20 text-cyan-300 font-bold" },
    { initials: "JL", name: "Jorge López", procedure: "Profilaxis", date: "Hace 1sem", color: "bg-emerald-500/20 text-emerald-300 font-bold" },
];

export default function DentalProposal() {
  const [isMounted, setIsMounted] = useState(false);
  useScrollReveal(); // Activa las animaciones CSS

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <main className="min-h-screen text-slate-200 font-sans overflow-x-hidden relative">
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-28 md:pt-44 pb-20 md:pb-32">
        
        {/* --- HERO --- */}
        <section className="text-center mb-24 md:mb-40 pt-10">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/40 text-cyan-300 text-[10px] uppercase tracking-widest font-bold mb-6 shadow-lg animate-fade-in-up">
            <Sparkles size={12} /> Inteligencia Artificial Odontológica
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 tracking-tighter leading-[1.1] animate-fade-in-up [animation-delay:100ms] opacity-0 fill-mode-forwards">
            Automatiza tu Clínica <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Sin Perder el Toque Humano</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed px-2 animate-fade-in-up [animation-delay:200ms] opacity-0 fill-mode-forwards">
            La plataforma que agenda, confirma y organiza sus pacientes mientras usted se dedica a la odontología.
          </p>
        </section>

        {/* --- FEATURE 1 --- */}
        <section className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32 md:mb-48 content-visibility-auto">
            <div className="order-2 lg:order-1 relative flex justify-center min-h-[580px] reveal-on-scroll">
                <DentalChatAnimation/>
            </div>
            <div className="order-1 lg:order-2 text-center lg:text-left px-2 reveal-on-scroll delay-100">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 mx-auto lg:mx-0">
                    <BrainCircuit className="text-white" size={24} />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Tu Recepcionista Experta <br/><span className="text-indigo-400">Disponible 24/7</span></h2>
                <p className="text-slate-400 text-base md:text-lg mb-8 leading-relaxed max-w-lg">Olvídate de responder lo mismo 100 veces al día. Nuestro asistente IA está entrenado exclusivamente con <strong>terminología odontológica</strong>.</p>
                <ul className="space-y-4 text-left inline-block"> 
                    {["Responde precios, horarios y ubicación.", "Filtra curiosos: Solo notifica intención real.", "Optimizado para no hablar de temas externos.", "Ahorra el 90% del trabajo manual."].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                            <CheckCircle2 className="text-indigo-500 mt-0.5" size={16} /><span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>

        {/* --- FEATURE 2 --- */}
        <section className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32 md:mb-48 content-visibility-auto">
            <div className="order-1 flex flex-col items-center text-center px-2 reveal-on-scroll">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 mx-auto lg:mx-0">
                    <Clock className="text-white" size={24} />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Agenda que Trabaja Sola <br/><span className="text-purple-400">Cero Ausentismo</span></h2>
                <p className="text-slate-400 text-base md:text-lg mb-8 leading-relaxed max-w-lg">Control total sobre tus doctores, sillones y tiempos. Diseñado para clínicas de alto flujo.</p>
                <ul className="space-y-4 text-left inline-block">
                    {["Confirmación automática vía WhatsApp.", "Gestión multi-doctor y filtrado especialista.", "Alertas inmediatas de cancelación.", "Bloqueo inteligente de horarios."].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                            <CheckCircle2 className="text-purple-500 size-4 mt-0.5" /><span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="order-2 relative w-full flex justify-center reveal-on-scroll delay-100">
                  <div className="w-full max-w-[350px] md:max-w-xl"><CalendarVisual /></div>
            </div>
        </section>

        {/* --- BENTO GRID --- */}
        <section className="mb-32 md:mb-40 relative content-visibility-auto">
            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 relative z-10 px-4 reveal-on-scroll">
                <div className="inline-block mb-4">
                      <span className="px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-300 text-[10px] md:text-xs font-mono tracking-widest uppercase shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]">Core System v.2.0</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">El Cerebro Digital de tu Clínica</h2>
                <p className="text-slate-400 text-base md:text-lg px-2">Transformamos datos dispersos en <span className="text-cyan-400 font-semibold">control operativo</span> absoluto.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 max-w-6xl mx-auto relative z-10">
                <div className="lg:col-span-7 group relative rounded-[24px] bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 transition-all duration-500 p-6 md:p-10 reveal-on-scroll">
                    <div className="flex items-start justify-between mb-6 md:mb-8">
                        <div className="p-2.5 md:p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]"><Database size={24} /></div>
                        <div className="flex gap-1 opacity-30"><div className="w-1 h-1 bg-white rounded-full" /><div className="w-1 h-1 bg-white rounded-full" /><div className="w-6 md:w-8 h-1 bg-white rounded-full" /></div>
                    </div>
                    <div className="mb-6 md:mb-8">
                        <h3 className="text-xl md:text-3xl font-bold text-white mb-2">Historial Clínico</h3>
                        <p className="text-slate-400 text-sm md:text-base">Tu base de datos organizada y viva. Accede al perfil de cada paciente y toma decisiones basadas en datos reales.</p>
                    </div>
                    <div className="mt-auto border-t border-white/5 pt-5 md:pt-6">
                        <div className="flex justify-between items-center mb-3 md:mb-4 px-1">
                            <span className="text-[10px] md:text-xs font-mono text-slate-500 uppercase tracking-wider">Actividad Reciente</span>
                            <span className="text-[10px] md:text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1 transition-colors">Ver Todo <ChevronRight size={12}/></span>
                        </div>
                        <div className="space-y-2">
                            {MOCK_PATIENTS.map((patient, i) => (
                                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`w-8 h-8 shrink-0 rounded-full ${patient.color} flex items-center justify-center text-xs font-bold`}>{patient.initials}</div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-semibold text-slate-200 truncate">{patient.name}</span>
                                            <div className="flex items-center gap-1.5 mt-0.5"><FileText size={10} className="text-slate-500 shrink-0" /><span className="text-[10px] md:text-xs text-slate-400 truncate">{patient.procedure}</span></div>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-2 text-slate-500 px-2 py-1 rounded-lg bg-black/20 shrink-0"><CalendarDays size={12} /><span className="text-[10px] md:text-xs font-mono">{patient.date}</span></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6">
                    <div className="group relative rounded-[24px] bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 transition-all duration-500 p-6 md:p-8 flex flex-col justify-between reveal-on-scroll delay-100">
                        <div className="flex justify-between items-start mb-2">
                            <div><h3 className="text-lg md:text-xl font-bold text-white">Reactivación</h3><p className="text-[10px] md:text-xs text-emerald-400/80 uppercase tracking-wider mt-1 font-semibold">Gestión de Retorno</p></div>
                            <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-400"><Users className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" /></div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-emerald-500/70 bg-emerald-500/5 px-3 py-1.5 rounded-full w-fit border border-emerald-500/10">
                            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span> Oportunidades hoy
                        </div>
                    </div>

                    <div className="group relative rounded-[24px] bg-white/[0.03] border border-white/10 hover:border-blue-500/30 transition-all duration-500 p-6 md:p-8 reveal-on-scroll delay-200">
                        <div className="flex justify-between items-start mb-2">
                            <div><h3 className="text-lg md:text-xl font-bold text-white">Métricas de Citas</h3><p className="text-[10px] md:text-xs text-blue-400/80 uppercase tracking-wider mt-1 font-semibold">Dashboard CRM</p></div>
                            <div className="p-2 rounded-lg bg-blue-950/30 border border-blue-500/20 text-blue-400"><CalendarCheck className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" /></div>
                        </div>
                        <div className="flex items-end gap-1 h-12 w-full opacity-80 mt-6">
                            {[30, 50, 40, 70, 90, 60, 80].map((h, i) => (
                                <div key={i} className="flex-1 bg-blue-600/50 rounded-t-sm hover:bg-blue-500 transition-colors" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* --- TESTIMONIOS --- */}
        <section className="mb-32 md:mb-48 relative px-4 content-visibility-auto">
          <div className="text-center mb-16 reveal-on-scroll">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Historias de <span className="text-cyan-400">Éxito Real</span></h2>
            <p className="text-slate-400">Resultados tangibles en clínicas que ya dieron el salto.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={`relative bg-[#0a0a0a] border border-white/10 p-8 rounded-[2rem] shadow-2xl reveal-on-scroll ${i === 1 ? 'delay-100' : i === 2 ? 'delay-200' : ''}`}>
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${t.color} opacity-50`} />
                <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-cyan-400 uppercase">{t.metric}</div>
                <p className="text-slate-300 text-lg italic mb-8 relative z-10">"{t.text}"</p>
                <div className="mt-auto flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center font-bold text-white shadow-lg`}>{t.avatar}</div>
                  <div><h4 className="text-white font-bold text-sm">{t.name}</h4><p className="text-slate-500 text-xs">{t.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- MEMBRESÍA & DOWNLOAD --- */}
        <section className="relative mb-32 md:mb-40 max-w-4xl mx-auto px-2 content-visibility-auto reveal-on-scroll">
          <div className="relative rounded-[32px] overflow-hidden border border-amber-500/20 bg-[#080808] p-5 md:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.1),transparent_50%)] pointer-events-none" />
            <div className="relative flex flex-col items-center text-center z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/30 border border-amber-500/30 text-amber-200 text-sm font-bold mb-8">
                <Sparkles size={16} /> Plan Premium
              </div>
              <div className="flex items-start justify-center gap-1 mb-2">
                <span className="text-2xl md:text-3xl font-bold text-amber-500 mt-2">$</span>
                <h3 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600">250.000</h3>
              </div>
              <p className="text-xl text-amber-200/60 font-normal mb-6">COP/mes</p>
              
              <div className="w-full max-w-2xl mb-12 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left p-6 rounded-2xl bg-white/[0.03]">
                  {["300 Conversaciones IA", "Agenda Automatizada", "Soporte Prioritario", "Sin contratos"].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-300 text-sm"><CheckCircle2 size={16} className="text-amber-400 shrink-0"/> {f}</div>
                  ))}
              </div>

              <div className="w-full border-t border-white/5 pt-8 flex flex-col items-center gap-8">
                <AnimatedGenericCard />
                <div className="w-full flex justify-center items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all">
                    <div className="h-8 w-auto relative">
                        <Image src={visa} alt="Visa" height={32} width={50} sizes="(max-width: 768px) 50px, 60px" className="object-contain" />
                    </div>
                    <div className="h-8 w-auto relative">
                        <Image src={mastercard} alt="Mastercard" height={32} width={50} sizes="(max-width: 768px) 50px, 60px" className="object-contain" />
                    </div>
                    <div className="h-8 w-auto relative">
                        <Image src={amex} alt="American Express" height={32} width={50} sizes="(max-width: 768px) 50px, 60px" className="object-contain" />
                    </div>
                </div>
                
                {/* Accesibilidad Fix: Botón con ARIA label */}
                <div className="mt-10 min-h-[40px] w-full flex justify-center">
                    {isMounted && (
                      <DownloadButton logoSrc={wasaaaLogo.src} />
                    )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- CTA FINAL --- */}
        <section className="relative py-20 text-center content-visibility-auto reveal-on-scroll">
            <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[2rem] max-w-3xl mx-auto shadow-2xl">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">¿Listo para el Siguiente Nivel?</h2>
                <Link href="/register">
                    <button 
                      aria-label="Iniciar transformación digital"
                      className="bg-white text-black font-bold text-lg px-8 py-3 rounded-xl hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
                    >
                        <Zap className="text-amber-500" size={20} /> Iniciar Transformación
                    </button>
                </Link>
            </div>
        </section>

      </div>
    </main>
  );
}