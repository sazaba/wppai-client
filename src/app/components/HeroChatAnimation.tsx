'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Sparkles, Send, Mic, Phone, Video, MoreVertical, ChevronLeft, Paperclip, Smile } from 'lucide-react'

export default function HeroChatAnimation() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 1000)
    const timer2 = setTimeout(() => setStep(2), 2800)
    const timer3 = setTimeout(() => setStep(3), 4500)
    const timer4 = setTimeout(() => setStep(4), 6500)
    const timer5 = setTimeout(() => setStep(5), 8500)
    const timer6 = setTimeout(() => setStep(6), 10500)

    return () => {
      clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3);
      clearTimeout(timer4); clearTimeout(timer5); clearTimeout(timer6);
    }
  }, [])

  return (
    <div className="relative mx-auto w-full max-w-[320px] sm:max-w-[350px]">
      
      {/* --- EFECTOS DE FONDO (Glow) --- */}
      <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-[3rem] blur-2xl opacity-40 animate-pulse-slow" />
      
      {/* --- CONTENEDOR FÍSICO DEL TELÉFONO (Marco Negro Premium) --- */}
      <div className="relative bg-black border-[6px] border-zinc-900 rounded-[2.5rem] shadow-2xl overflow-hidden h-[600px] flex flex-col ring-1 ring-white/20">
        
        {/* Dynamic Island / Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-28 bg-black rounded-b-xl z-30" />

        {/* --- HEADER (Estilo WhatsApp Light) --- */}
        <div className="bg-[#F0F2F5]/90 backdrop-blur-md p-4 pt-10 flex items-center justify-between border-b border-gray-200 z-20">
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-6 h-6 text-blue-500" />
            <div className="relative">
              {/* Avatar con gradiente */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-5 h-5 fill-white" />
              </div>
              {/* Punto verde de conexión */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#F0F2F5] rounded-full"></div>
            </div>
            <div className="ml-1">
              <h3 className="text-sm font-bold text-gray-900 leading-none">Clínica Estética IA</h3>
              <p className="text-xs text-indigo-600 font-medium mt-0.5">
                {(step === 2 || step === 5) ? 'Escribiendo...' : 'En línea 24/7'}
              </p>
            </div>
          </div>
          <div className="flex gap-4 text-blue-500">
            <Video className="w-6 h-6" />
            <Phone className="w-6 h-6" />
          </div>
        </div>

        {/* --- CUERPO DEL CHAT (Fondo Claro) --- */}
        <div className="flex-1 bg-[#EFEAE2] p-4 space-y-4 overflow-y-auto relative scrollbar-hide">
          
          {/* Patrón de fondo sutil de WhatsApp */}
          <div className="absolute inset-0 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] opacity-[0.4] pointer-events-none mix-blend-multiply" />

          {/* Fecha */}
          <div className="flex justify-center relative z-10">
            <span className="bg-[#FFF] shadow-sm text-gray-600 text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wide font-medium border border-gray-100">
              Hoy
            </span>
          </div>

          <ChatMessage 
            isUser={true} 
            show={step >= 1} 
            text="Hola, quisiera agendar una valoración para un tratamiento facial." 
            time="10:42 AM" 
          />

          {step === 2 && <TypingIndicator />}

          <ChatMessage 
            isUser={false} 
            show={step >= 3} 
            text="¡Hola! 👋 Claro que sí, será un gusto atenderte. Somos expertos en armonización facial. ¿Para qué sede te gustaría agendar: Norte o Sur?" 
            time="10:42 AM" 
          />

          <ChatMessage 
            isUser={true} 
            show={step >= 4} 
            text="En la Sede Norte, por favor. Preferiblemente mañana en la tarde." 
            time="10:43 AM" 
          />

          {step === 5 && <TypingIndicator />}

          <ChatMessage 
            isUser={false} 
            show={step >= 6} 
            text="Perfecto. Para mañana en Sede Norte tengo estos cupos disponibles: 3:00 PM o 5:30 PM. 🗓️ ¿Cuál horario prefieres para asegurar tu cita?" 
            time="10:44 AM" 
          />

        </div>

        {/* --- FOOTER DEL CHAT --- */}
        <div className="p-2 pb-5 bg-[#F0F2F5] border-t border-gray-200 flex items-center gap-2 z-20">
          <div className="p-2 text-blue-500">
             <MoreVertical className="w-6 h-6" />
          </div>
          
          <div className="flex-1 bg-white rounded-2xl h-10 px-4 flex items-center justify-between text-sm text-gray-400 border border-gray-200 shadow-sm">
            <span>Escribe un mensaje...</span>
            <div className="flex gap-2">
                <Paperclip className="w-5 h-5 text-gray-400" />
                <Smile className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="p-2.5 rounded-full bg-[#00A884] text-white shadow-md hover:bg-[#008f6f] transition-colors">
            {step === 0 || step === 3 ? <Send className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </div>
        </div>
        
        {/* Barra de Inicio (Home Indicator) - Negra sobre fondo claro o blanca sobre oscuro, aquí el fondo es claro */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/20 rounded-full z-30" />

      </div>
    </div>
  )
}

// --- BURBUJA DE MENSAJE (Adaptada a Light Mode) ---
function ChatMessage({ isUser, text, time, show }: { isUser: boolean, text: string, time: string, show: boolean }) {
  if (!show) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex w-full relative z-10 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`
        max-w-[85%] rounded-lg px-3 py-2 shadow-sm text-[14px] leading-snug relative
        ${isUser 
          ? 'bg-[#D9FDD3] text-gray-900 rounded-tr-none'  // Verde WhatsApp Light
          : 'bg-white text-gray-900 rounded-tl-none'} // Blanco puro
      `}>
        {text}
        <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isUser ? 'text-gray-500' : 'text-gray-400'}`}>
          {time}
          {isUser && (
            <span className="flex text-[#53bdeb]">
               {/* Doble check azul clásico */}
               <svg viewBox="0 0 16 11" className="w-4 h-4 fill-current"><path d="M11.5 0L4.5 7L2.5 5L0 7.5L4.5 11L16 2L11.5 0Z"/></svg>
            </span>
          )}
        </div>
        
        {/* Triangulito de la burbuja (Tail) */}
        {isUser ? (
             <div className="absolute top-0 -right-2 w-0 h-0 border-[8px] border-t-[#D9FDD3] border-r-transparent border-b-transparent border-l-transparent transform rotate-0" />
        ) : (
             <div className="absolute top-0 -left-2 w-0 h-0 border-[8px] border-t-white border-l-transparent border-b-transparent border-r-transparent transform rotate-0" />
        )}
      </div>
    </motion.div>
  )
}

// --- INDICADOR DE ESCRIBIENDO (Light Mode) ---
function TypingIndicator() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start w-full relative z-10"
    >
      <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center w-fit shadow-sm">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
      </div>
    </motion.div>
  )
}