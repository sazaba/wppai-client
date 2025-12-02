'use client'

import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { Sparkles, Send, Mic, Phone, Video, MoreVertical, ChevronLeft, Paperclip, Smile, Battery, Wifi, Signal } from 'lucide-react'

export default function HeroChatAnimation() {
  const [step, setStep] = useState(0)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [step])

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    
    timers.push(setTimeout(() => setStep(1), 800))   
    timers.push(setTimeout(() => setStep(2), 2500))  
    timers.push(setTimeout(() => setStep(3), 4000))  
    timers.push(setTimeout(() => setStep(4), 6000))  
    timers.push(setTimeout(() => setStep(5), 7500))  
    timers.push(setTimeout(() => setStep(6), 9500))  
    timers.push(setTimeout(() => setStep(7), 11500)) 
    timers.push(setTimeout(() => setStep(8), 13000)) 
    timers.push(setTimeout(() => setStep(9), 15000)) 
    timers.push(setTimeout(() => setStep(10), 17000)) 
    timers.push(setTimeout(() => setStep(11), 18500)) 
    timers.push(setTimeout(() => setStep(12), 20000)) 

    return () => timers.forEach(t => clearTimeout(t))
  }, [])

  return (
    <div className="relative mx-auto w-full max-w-[290px] xs:max-w-[310px] sm:max-w-[330px] md:max-w-[350px]">
      
      {/* Glow Ambiental Detrás */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/30 via-purple-500/30 to-pink-500/30 rounded-[4rem] blur-3xl opacity-50 animate-pulse-slow pointer-events-none" />
      
      {/* --- BOTONES FÍSICOS --- */}
      <div className="absolute top-24 -left-[9px] h-6 w-[9px] bg-zinc-800 rounded-l-md border-l border-zinc-700" />
      <div className="absolute top-36 -left-[9px] h-10 w-[9px] bg-zinc-800 rounded-l-md border-l border-zinc-700 shadow-sm" />
      <div className="absolute top-52 -left-[9px] h-10 w-[9px] bg-zinc-800 rounded-l-md border-l border-zinc-700 shadow-sm" />
      <div className="absolute top-40 -right-[9px] h-16 w-[9px] bg-zinc-800 rounded-r-md border-r border-zinc-700 shadow-sm" />

      {/* --- CHASIS PRINCIPAL --- */}
      {/* CORRECCIÓN 1: 'transform-gpu' para forzar renderizado estricto y el style WebkitMaskImage */}
      <div 
        className="relative bg-black rounded-[3.5rem] shadow-2xl overflow-hidden h-[580px] xs:h-[620px] sm:h-[680px] md:h-[720px] flex flex-col ring-8 ring-zinc-900 ring-opacity-90 border-[4px] border-zinc-800 z-10 transition-all duration-500 transform-gpu"
        style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }} 
      >
        
        {/* --- STATUS BAR --- */}
        <div className="absolute top-0 w-full h-12 z-40 flex items-center justify-between px-7 pt-3.5 text-white">
            <span className="text-[13px] font-semibold tracking-wide">9:41</span>
            <div className="flex items-center gap-1.5">
                <Signal className="w-3.5 h-3.5 fill-current" />
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4.5 h-4.5" />
            </div>
        </div>

        {/* Dynamic Island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 h-[26px] w-[90px] bg-black rounded-full z-40 border border-zinc-800/50" />

        {/* --- HEADER CHAT --- */}
        <div className="bg-zinc-900/90 backdrop-blur-md pt-14 pb-3 px-4 flex items-center justify-between border-b border-white/5 z-30 shadow-sm">
          <div className="flex items-center gap-2.5">
            <ChevronLeft className="w-6 h-6 text-indigo-400 -ml-2" />
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm ring-2 ring-zinc-900">
                <Sparkles className="w-5 h-5 fill-white" />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-zinc-900 rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <h3 className="text-[15px] font-semibold text-white leading-none tracking-tight">Clínica Estética IA</h3>
              <p className="text-[11px] text-indigo-400 font-medium mt-0.5 animate-pulse">
                {(step === 2 || step === 5 || step === 8 || step === 11) ? 'Escribiendo...' : 'En línea'}
              </p>
            </div>
          </div>
          <div className="flex gap-5 text-indigo-400 pr-1">
            <Video className="w-5 h-5" />
            <Phone className="w-5 h-5" />
          </div>
        </div>

        {/* --- BODY CHAT --- */}
        {/* CORRECCIÓN 2: Asegurar que este contenedor también tenga overflow-hidden y rounded para seguir la forma */}
        <div className="flex-1 bg-[#0B141A] relative overflow-hidden flex flex-col rounded-b-[3.2rem]">
          
          <div 
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
                backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
                backgroundSize: "400px",
            }}
          />

          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3 relative z-10 scrollbar-hide pb-20">
            
            <div className="flex justify-center py-2 mb-2">
                <span className="bg-zinc-800/80 backdrop-blur text-zinc-400 text-[10px] px-2.5 py-1 rounded-lg font-medium shadow-sm border border-white/5">
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
            
            <ChatMessage 
                isUser={true} 
                show={step >= 7} 
                text="5:30 PM me queda perfecto." 
                time="09:44" 
            />

            {step === 8 && <TypingIndicator />}

            <ChatMessage 
                isUser={false} 
                show={step >= 9} 
                text="¡Listo! ✅ Tu valoración quedó agendada para mañana a las 5:30 PM en Sede Norte. Te envié la confirmación a tu correo." 
                time="09:44" 
            />

            <ChatMessage 
                isUser={true} 
                show={step >= 10} 
                text="Excelente, muchas gracias!" 
                time="09:45" 
            />

            {step === 11 && <TypingIndicator />}

            <ChatMessage 
                isUser={false} 
                show={step >= 12} 
                text="¡A ti! Nos vemos mañana. ✨" 
                time="09:45" 
            />
            
          </div>

          {/* --- FOOTER INPUT --- */}
          {/* CORRECCIÓN 3: Agregado rounded-b-[3rem] para que la barra gris tenga físicamente la forma curva del celular */}
          <div className="absolute bottom-0 w-full bg-[#202C33] px-3 py-3 flex items-end gap-2.5 z-20 pb-7 border-t border-white/5 rounded-b-[3rem]">
            <div className="p-1.5 text-zinc-400">
                <MoreVertical className="w-6 h-6" />
            </div>
            
            <div className="flex-1 bg-[#2A3942] rounded-[24px] min-h-[40px] px-4 py-2 flex items-center justify-between text-[15px] text-zinc-400 border border-transparent">
                <span>Mensaje...</span>
                <div className="flex gap-3 text-zinc-400">
                    <Paperclip className="w-5 h-5" />
                    <Smile className="w-5 h-5" />
                </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-[#00A884] flex items-center justify-center text-white shadow-md flex-shrink-0 hover:bg-[#008f6f] transition-colors">
                {(step === 0 || step === 3 || step === 6 || step === 9 || step === 12) ? <Send className="w-5 h-5 ml-0.5" /> : <Mic className="w-5 h-5" />}
            </div>
          </div>
        
        </div>
        
        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[120px] h-[4px] bg-white/20 rounded-full z-50 pointer-events-none" />

      </div>
    </div>
  )
}

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
        max-w-[85%] rounded-[18px] px-3 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.2)] text-[14px] leading-snug relative group
        ${isUser 
          ? 'bg-[#005C4B] text-[#E9EDEF] rounded-tr-none' 
          : 'bg-[#202C33] text-[#E9EDEF] rounded-tl-none'} 
      `}>
        {text}
        <div className="flex justify-end items-end gap-1 mt-0.5 select-none">
            <span className="text-[10px] text-white/60 font-normal">{time}</span>
            {isUser && (
                <span className="text-[#53bdeb]">
                <svg viewBox="0 0 16 11" className="w-[14px] h-[10px] fill-current"><path d="M11.5 0L4.5 7L2.5 5L0 7.5L4.5 11L16 2L11.5 0Z"/></svg>
                </span>
            )}
        </div>
        
        {isUser ? (
            <svg className="absolute top-0 -right-[8px] w-[8px] h-[13px] fill-[#005C4B]" viewBox="0 0 8 13">
                <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"/>
            </svg>
        ) : (
            <svg className="absolute top-0 -left-[8px] w-[8px] h-[13px] fill-[#202C33]" viewBox="0 0 8 13">
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
      <div className="bg-[#202C33] rounded-[18px] rounded-tl-none px-4 py-3 flex gap-1 items-center w-fit shadow-sm relative">
        <svg className="absolute top-0 -left-[8px] w-[8px] h-[13px] fill-[#202C33]" viewBox="0 0 8 13">
            <path d="M-1.188 1H4v11.193l-6.467-8.625C-3.526 2.156 -2.958 1 -1.188 1z" transform="scale(-1, 1) translate(-4, 0)"/>
        </svg>
        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
      </div>
    </motion.div>
  )
}