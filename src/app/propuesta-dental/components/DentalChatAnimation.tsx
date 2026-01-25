'use client'

import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { Send, Mic, Phone, Video, MoreVertical, ChevronLeft, Paperclip, Smile, Battery, Wifi, Signal, Activity } from 'lucide-react'

export default function DentalChatAnimation() {
  const [step, setStep] = useState(0)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll hacia abajo cuando llegan mensajes nuevos
  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [step])

  // Secuencia de tiempos del chat (Guion Dental Ajustado a Estrategia)
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    
    timers.push(setTimeout(() => setStep(1), 1000))  // Usuario: Hola, tengo dolor...
    timers.push(setTimeout(() => setStep(2), 3000))  // AI Escribiendo...
    timers.push(setTimeout(() => setStep(3), 5000))  // AI: Entiendo, ¿es al frío/calor?
    timers.push(setTimeout(() => setStep(4), 7500))  // Usuario: Al tomar cosas frías...
    timers.push(setTimeout(() => setStep(5), 9500))  // AI Escribiendo...
    timers.push(setTimeout(() => setStep(6), 12000)) // AI: Podría ser sensibilidad... ¿10am o 4pm?
    timers.push(setTimeout(() => setStep(7), 14500)) // Usuario: 10am por favor.
    timers.push(setTimeout(() => setStep(8), 16500)) // AI Escribiendo...
    timers.push(setTimeout(() => setStep(9), 19000)) // AI: (MENSAJE NUEVO: Verificando disponibilidad...)

    return () => timers.forEach(t => clearTimeout(t))
  }, [])

  return (
    <div className="relative mx-auto w-full max-w-[290px] xs:max-w-[310px] sm:max-w-[330px] md:max-w-[350px]">
      
      {/* Glow Ambiental Dental (Tonos Cian/Azul) */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/30 via-blue-500/30 to-purple-500/20 rounded-[4rem] blur-3xl opacity-50 animate-pulse-slow pointer-events-none" />
      
      {/* --- BOTONES FÍSICOS DEL CELULAR --- */}
      <div className="absolute top-24 -left-[9px] h-6 w-[9px] bg-zinc-800 rounded-l-md border-l border-zinc-700" />
      <div className="absolute top-36 -left-[9px] h-10 w-[9px] bg-zinc-800 rounded-l-md border-l border-zinc-700 shadow-sm" />
      <div className="absolute top-52 -left-[9px] h-10 w-[9px] bg-zinc-800 rounded-l-md border-l border-zinc-700 shadow-sm" />
      <div className="absolute top-40 -right-[9px] h-16 w-[9px] bg-zinc-800 rounded-r-md border-r border-zinc-700 shadow-sm" />

      {/* --- CHASIS PRINCIPAL --- */}
      <div 
        className="relative bg-black rounded-[3.5rem] shadow-2xl overflow-hidden h-[580px] xs:h-[620px] sm:h-[680px] md:h-[720px] flex flex-col ring-8 ring-zinc-900 ring-opacity-90 border-[4px] border-zinc-800 z-10 transition-all duration-500 transform-gpu"
        style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }} 
      >
        
        {/* --- STATUS BAR --- */}
        <div className="absolute top-0 w-full h-12 z-40 flex items-center justify-between px-7 pt-3.5 text-white">
            <span className="text-[13px] font-semibold tracking-wide">10:09</span>
            <div className="flex items-center gap-1.5">
                <Signal className="w-3.5 h-3.5 fill-current" />
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4.5 h-4.5" />
            </div>
        </div>

        {/* Dynamic Island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 h-[26px] w-[90px] bg-black rounded-full z-40 border border-zinc-800/50" />

        {/* --- HEADER CHAT (Adaptado a Dental) --- */}
        <div className="bg-zinc-900/90 backdrop-blur-md pt-14 pb-3 px-4 flex items-center justify-between border-b border-white/5 z-30 shadow-sm">
          <div className="flex items-center gap-2.5">
            <ChevronLeft className="w-6 h-6 text-cyan-400 -ml-2" />
            <div className="relative">
              {/* Icono de "Actividad/Salud" */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm ring-2 ring-zinc-900">
                <Activity className="w-5 h-5" />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-zinc-900 rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <h3 className="text-[15px] font-semibold text-white leading-none tracking-tight">Asistente Dental 24/7</h3>
              <p className="text-[11px] text-cyan-400 font-medium mt-0.5 animate-pulse">
                {(step === 2 || step === 5 || step === 8) ? 'Escribiendo...' : 'En línea'}
              </p>
            </div>
          </div>
          <div className="flex gap-5 text-cyan-400 pr-1">
            <Video className="w-5 h-5" />
            <Phone className="w-5 h-5" />
          </div>
        </div>

        {/* --- BODY CHAT --- */}
        <div className="flex-1 bg-[#0B141A] relative overflow-hidden flex flex-col rounded-b-[3.2rem]">
          
          {/* Fondo sutil de WhatsApp */}
          <div 
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
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

            {/* --- GUION DENTAL --- */}

            <ChatMessage 
                isUser={true} 
                show={step >= 1} 
                text="Hola, necesito una cita urgente. Tengo dolor en una muela." 
                time="10:10" 
            />

            {step === 2 && <TypingIndicator />}

            <ChatMessage 
                isUser={false} 
                show={step >= 3} 
                text="¡Hola! 👋 Entiendo. Para ayudarte mejor, ¿el dolor es constante o aparece al comer/beber algo frío o caliente?" 
                time="10:10" 
            />

            <ChatMessage 
                isUser={true} 
                show={step >= 4} 
                text="Es más al tomar cosas frías. Es bastante molesto." 
                time="10:11" 
            />

            {step === 5 && <TypingIndicator />}

            <ChatMessage 
                isUser={false} 
                show={step >= 6} 
                text="Entendido, podría ser sensibilidad avanzada o una caries. 🦷 Necesitamos revisarlo pronto. ¿Te queda bien mañana a las 10:00 AM o a las 3:30 PM?" 
                time="10:11" 
            />
            
            <ChatMessage 
                isUser={true} 
                show={step >= 7} 
                text="A las 10:00 AM por favor." 
                time="10:12" 
            />

            {step === 8 && <TypingIndicator />}

            {/* MENSAJE FINAL MODIFICADO SEGÚN ESTRATEGIA */}
            <ChatMessage 
                isUser={false} 
                show={step >= 9} 
                text="Perfecto ✨, dame unos minutos mientras verifico la disponibilidad para ese horario y te confirmo por aquí. ⏳" 
                time="10:12" 
            />

          </div>

          {/* --- FOOTER INPUT --- */}
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
                <Mic className="w-5 h-5" />
            </div>
          </div>
        
        </div>
        
        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[120px] h-[4px] bg-white/20 rounded-full z-50 pointer-events-none" />

      </div>
    </div>
  )
}

// --- Subcomponentes (Mensaje y Typing) ---

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
                {/* Doble check azul */}
                <svg viewBox="0 0 16 11" className="w-[14px] h-[10px] fill-current"><path d="M11.5 0L4.5 7L2.5 5L0 7.5L4.5 11L16 2L11.5 0Z"/></svg>
                </span>
            )}
        </div>
        
        {/* Triangulitos de las burbujas */}
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