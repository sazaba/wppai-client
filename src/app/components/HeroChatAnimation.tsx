'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Sparkles, Send, Mic, Phone, Video, MoreVertical, ChevronLeft, Paperclip, Smile, Battery, Wifi, Signal } from 'lucide-react'

export default function HeroChatAnimation() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    // Tiempos ajustados para flujo rápido
    const timer1 = setTimeout(() => setStep(1), 800)
    const timer2 = setTimeout(() => setStep(2), 2500)
    const timer3 = setTimeout(() => setStep(3), 4000)
    const timer4 = setTimeout(() => setStep(4), 6000)
    const timer5 = setTimeout(() => setStep(5), 7500)
    const timer6 = setTimeout(() => setStep(6), 9500)

    return () => {
      clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3);
      clearTimeout(timer4); clearTimeout(timer5); clearTimeout(timer6);
    }
  }, [])

  return (
    // CAMBIO: Altura reducida en móvil (h-[480px]) para no invadir la pantalla
    <div className="relative mx-auto w-full max-w-[300px] xs:max-w-[320px] sm:max-w-[350px]">
      
      {/* Glow Ambiental Detrás */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/30 via-purple-500/30 to-pink-500/30 rounded-[4rem] blur-3xl opacity-50 animate-pulse-slow pointer-events-none" />
      
      {/* --- BOTONES FÍSICOS DEL IPHONE --- */}
      {/* Botón Silencio */}
      <div className="absolute top-24 -left-[10px] h-6 w-[10px] bg-zinc-800 rounded-l-md border-l border-zinc-700" />
      {/* Subir Volumen */}
      <div className="absolute top-36 -left-[10px] h-10 w-[10px] bg-zinc-800 rounded-l-md border-l border-zinc-700 shadow-sm" />
      {/* Bajar Volumen */}
      <div className="absolute top-52 -left-[10px] h-10 w-[10px] bg-zinc-800 rounded-l-md border-l border-zinc-700 shadow-sm" />
      {/* Botón Encendido */}
      <div className="absolute top-40 -right-[10px] h-16 w-[10px] bg-zinc-800 rounded-r-md border-r border-zinc-700 shadow-sm" />

      {/* --- CHASIS PRINCIPAL (Titanium Look) --- */}
      {/* Borde exterior brillante + Borde interior negro */}
      <div className="relative bg-black rounded-[3rem] shadow-2xl overflow-hidden h-[480px] md:h-[620px] flex flex-col ring-8 ring-zinc-900 ring-opacity-90 border-[4px] border-zinc-800 z-10 transition-all duration-500">
        
        {/* --- STATUS BAR (Hora y Batería) --- */}
        <div className="absolute top-0 w-full h-12 z-40 flex items-center justify-between px-6 pt-2 text-white">
            <span className="text-[12px] font-semibold">9:41</span>
            <div className="flex items-center gap-1.5">
                <Signal className="w-3.5 h-3.5 fill-current" />
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4 h-4" />
            </div>
        </div>

        {/* Dynamic Island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 h-7 w-28 bg-black rounded-full z-40 border border-zinc-800/50" />

        {/* --- HEADER CHAT --- */}
        <div className="bg-[#F4F5F7]/95 backdrop-blur-md pt-12 pb-3 px-3 flex items-center justify-between border-b border-gray-200/60 z-30 shadow-sm">
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-6 h-6 text-[#007AFF]" />
            <div className="relative">
              {/* Avatar Wasaaa */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm ring-2 ring-white">
                <Sparkles className="w-5 h-5 fill-white" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="ml-1.5 flex flex-col">
              <h3 className="text-[15px] font-semibold text-gray-900 leading-none">Clínica Estética IA</h3>
              <p className="text-[11px] text-[#007AFF] font-medium mt-0.5 animate-pulse">
                {(step === 2 || step === 5) ? 'Escribiendo...' : 'En línea'}
              </p>
            </div>
          </div>
          <div className="flex gap-4 text-[#007AFF] pr-2">
            <Video className="w-5 h-5" />
            <Phone className="w-5 h-5" />
          </div>
        </div>

        {/* --- BODY CHAT (Fondo WhatsApp Realista) --- */}
        <div className="flex-1 bg-[#EFEAE2] relative overflow-hidden flex flex-col">
          
          {/* Patrón de fondo (Doodles) con mix-blend correcto */}
          <div 
            className="absolute inset-0 opacity-[0.6]"
            style={{
                backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
                backgroundSize: "400px",
                mixBlendMode: "multiply" 
            }}
          />

          <div className="flex-1 overflow-y-auto p-3 space-y-4 relative z-10 scrollbar-hide pb-20">
            {/* Fecha */}
            <div className="flex justify-center sticky top-0 z-10 py-2">
                <span className="bg-[#E7E7ED]/90 backdrop-blur text-gray-500 text-[10px] px-2.5 py-1 rounded-lg font-medium shadow-sm">
                Hoy
                </span>
            </div>

            <ChatMessage 
                isUser={true} 
                show={step >= 1} 
                text="Hola, quisiera agendar una valoración facial." 
                time="09:42" 
            />

            {step === 2 && <TypingIndicator />}

            <ChatMessage 
                isUser={false} 
                show={step >= 3} 
                text="¡Hola! 👋 Claro que sí. Somos expertos en armonización. ¿Prefieres Sede Norte o Sur?" 
                time="09:42" 
            />

            <ChatMessage 
                isUser={true} 
                show={step >= 4} 
                text="Sede Norte. Mañana en la tarde si es posible." 
                time="09:43" 
            />

            {step === 5 && <TypingIndicator />}

            <ChatMessage 
                isUser={false} 
                show={step >= 6} 
                text="Perfecto. Tengo cupo a las 3:00 PM o 5:30 PM. 🗓️ ¿Cuál te reservo?" 
                time="09:43" 
            />
          </div>

          {/* --- FOOTER INPUT --- */}
          <div className="absolute bottom-0 w-full bg-[#F0F2F5] px-2 py-2 flex items-end gap-2 z-20 pb-6 border-t border-gray-200">
            <div className="p-2 text-[#007AFF]">
                <MoreVertical className="w-6 h-6" />
            </div>
            
            <div className="flex-1 bg-white rounded-[20px] min-h-[36px] px-3 py-2 flex items-center justify-between text-[15px] text-gray-400 border border-gray-100 shadow-sm">
                <span>Mensaje...</span>
                <div className="flex gap-3 text-gray-400">
                    <Paperclip className="w-5 h-5" />
                    <Smile className="w-5 h-5" />
                </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-[#00A884] flex items-center justify-center text-white shadow-md flex-shrink-0 mb-1">
                {step === 0 || step === 3 ? <Send className="w-5 h-5 ml-0.5" /> : <Mic className="w-5 h-5" />}
            </div>
          </div>
        
        </div>
        
        {/* Home Indicator */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-36 h-1 bg-black rounded-full z-50 opacity-90" />

      </div>
    </div>
  )
}

// --- BURBUJA DE MENSAJE (Ultra Premium) ---
function ChatMessage({ isUser, text, time, show }: { isUser: boolean, text: string, time: string, show: boolean }) {
  if (!show) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`flex w-full relative z-10 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`
        max-w-[85%] rounded-[18px] px-3 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.1)] text-[14px] leading-snug relative group
        ${isUser 
          ? 'bg-[#E7FFDB] text-[#111B21] rounded-tr-none' // Verde WhatsApp exacto
          : 'bg-white text-[#111B21] rounded-tl-none'}
      `}>
        {text}
        <div className="flex justify-end items-end gap-1 mt-0.5 select-none">
            <span className="text-[10px] text-gray-500 font-normal">{time}</span>
            {isUser && (
                <span className="text-[#53bdeb]">
                <svg viewBox="0 0 16 11" className="w-[14px] h-[10px] fill-current"><path d="M11.5 0L4.5 7L2.5 5L0 7.5L4.5 11L16 2L11.5 0Z"/></svg>
                </span>
            )}
        </div>
        
        {/* Cola de burbuja vectorial (SVG) para realismo máximo */}
        {isUser ? (
            <svg className="absolute top-0 -right-[8px] w-[8px] h-[13px] fill-[#E7FFDB]" viewBox="0 0 8 13">
                <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"/>
            </svg>
        ) : (
            <svg className="absolute top-0 -left-[8px] w-[8px] h-[13px] fill-white" viewBox="0 0 8 13">
                <path d="M-1.188 1H4v11.193l-6.467-8.625C-3.526 2.156 -2.958 1 -1.188 1z" transform="scale(-1, 1) translate(-4, 0)"/>
            </svg>
        )}
      </div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex justify-start w-full relative z-10 pl-2"
    >
      <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2.5 flex gap-1 items-center w-fit shadow-sm relative">
        {/* Cola blanca */}
        <svg className="absolute top-0 -left-[8px] w-[8px] h-[13px] fill-white" viewBox="0 0 8 13">
            <path d="M-1.188 1H4v11.193l-6.467-8.625C-3.526 2.156 -2.958 1 -1.188 1z" transform="scale(-1, 1) translate(-4, 0)"/>
        </svg>
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
      </div>
    </motion.div>
  )
}