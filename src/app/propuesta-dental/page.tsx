import React from 'react';
import { Sparkles, ShieldCheck, BarChart3, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function DentalProposal() {
  return (
    // CONTENEDOR PRINCIPAL: Fuerza modo oscuro y fuente sans
    <main className="min-h-screen bg-[#050505] text-slate-200 selection:bg-cyan-500 selection:text-black font-sans overflow-x-hidden">
      
      {/* --- BACKGROUND FX (Luces ambientales) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-32">
        


        {/* --- HERO SECTION --- */}
        <section className="text-center mb-32">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 text-[10px] uppercase tracking-widest font-bold mb-6 backdrop-blur-sm">
            <Sparkles size={12} /> Tecnología Premium
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight leading-[1.1]">
            El Futuro de su <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              Clínica Dental
            </span>
          </h1>
          
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Hemos desarrollado una infraestructura digital exclusiva para automatizar la captación de pacientes sin perder el trato humano.
          </p>

          <div className="flex justify-center gap-4">
            <button className="group relative px-8 py-4 bg-white text-black font-bold rounded-xl overflow-hidden transition-all hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-blue-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                Iniciar Transformación <ChevronRight size={18} />
              </span>
            </button>
          </div>
        </section>

        {/* --- GLASS CARDS (Beneficios) --- */}
        <section className="grid md:grid-cols-3 gap-6 mb-32">
          {[
            {
              title: "Automatización IA",
              desc: "Agenda citas automáticamente 24/7 sin intervención humana.",
              icon: <Sparkles className="text-cyan-400" size={24} />
            },
            {
              title: "Retención de Pacientes",
              desc: "Sistema de reactivación inteligente para pacientes inactivos.",
              icon: <ShieldCheck className="text-purple-400" size={24} />
            },
            {
              title: "Analítica en Tiempo Real",
              desc: "Dashboard premium para visualizar el crecimiento de la clínica.",
              icon: <BarChart3 className="text-blue-400" size={24} />
            }
          ].map((item, i) => (
            <div key={i} className="group p-8 rounded-3xl border border-white/5 bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.07] hover:border-white/10 transition-all duration-500">
              <div className="mb-6 p-3 rounded-2xl bg-white/5 w-fit group-hover:scale-110 transition-transform duration-500">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </section>

        {/* --- PRICING / OFFER --- */}
        <section className="relative">
          {/* Borde degradado para la tarjeta principal */}
          <div className="absolute -inset-[1px] rounded-[32px] bg-gradient-to-b from-cyan-500/20 via-white/5 to-transparent opacity-50" />
          
          <div className="relative bg-[#0A0A0A] rounded-[32px] p-8 md:p-12 border border-white/5 overflow-hidden">
            {/* Efecto de luz interno */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />

            <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">Plan Clinical Growth</h2>
                <div className="space-y-4 mb-8">
                  {['Implementación en 48 horas', 'Soporte Técnico Dedicado', 'Chatbot Entrenado Médicamente', 'Reportes Semanales de ROI'].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-300">
                      <CheckCircle2 size={18} className="text-cyan-500" />
                      <span className="text-sm">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-center p-8 rounded-2xl bg-white/[0.02] border border-white/5">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Inversión Mensual</p>
                <div className="text-5xl font-bold text-white mb-2 tracking-tight">$XXX USD</div>
                <p className="text-sm text-cyan-400 mb-6">Precio especial lanzamiento</p>
                <button className="w-full py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-[0_0_20px_rgba(8,145,178,0.4)]">
                  Contratar Ahora
                </button>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-24 text-center text-slate-600 text-xs">
          © {new Date().getFullYear()} WPPAI Client. Todos los derechos reservados.
        </footer>

      </div>
    </main>
  );
}