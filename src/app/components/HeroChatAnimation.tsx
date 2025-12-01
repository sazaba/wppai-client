'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Sparkles, Send, Mic, Phone, Video, MoreVertical, ChevronLeft } from 'lucide-react'
// Asegúrate de tener estos componentes o quita la importación si no usas Avatar en el header
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function HeroChatAnimation() {
  // Estado para controlar la secuencia de mensajes
  const [step, setStep] = useState(0)

  // Secuencia de animación automática (Tiempos ajustados para lectura en español)
  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 1000) // Aparece mensaje usuario 1
    const timer2 = setTimeout(() => setStep(2), 2800) // Escribiendo...
    const timer3 = setTimeout(() => setStep(3), 4500) // Aparece respuesta IA
    const timer4 = setTimeout(() => setStep(4), 6500) // Aparece mensaje usuario 2
    const timer5 = setTimeout(() => setStep(5), 8500) // Escribiendo...
    const timer6 = setTimeout(() => setStep(6), 10500) // Aparece respuesta IA final

    return () => {
      clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3);
      clearTimeout(timer4); clearTimeout(timer5); clearTimeout(timer6);
    }
  }, [])

  return (
    <div className="relative mx-auto w-full max-w-[320px] sm:max-w-[350px]">
      
      {/* --- EFECTOS DE FONDO (Glow) --- */}
      <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-[3rem] blur-2xl opacity-40 animate-pulse-slow" />
      
      {/* --- CONTENEDOR DEL TELÉFONO --- */}
      <div className="relative bg-zinc-950 border-[6px] border-zinc-900 rounded-[2.5rem] shadow-2xl overflow-hidden h-[600px] flex flex-col ring-1 ring-white/10">
        
        {/* Dynamic Island / Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-24 bg-zinc-900 rounded-b-xl z-20" />

        {/* --- HEADER DEL CHAT (WhatsApp Style Dark) --- */}
        <div className="bg-zinc-900/90 backdrop-blur-md p-4 pt-10 flex items-center justify-between border-b border-white/5 z-10">
          <div className="flex items-center gap-3">
            <ChevronLeft className="w-5 h-5 text-indigo-400" />
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5 fill-white" />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-zinc-900 rounded-full"></div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white leading-none">Clínica Estética IA</h3>
              <p className="text-xs text-indigo-400 font-medium mt-0.5">
                {/* Traducción del estado */}
                {(step === 2 || step === 5) ? 'Escribiendo...' : 'En línea 24/7'}
              </p>
            </div>
          </div>
          <div className="flex gap-4 text-zinc-400">
            <Video className="w-5 h-5" />
            <Phone className="w-5 h-5" />
          </div>
        </div>

        {/* --- CUERPO DEL CHAT --- */}
        <div className="flex-1 bg-zinc-950/50 p-4 space-y-4 overflow-y-auto relative">
          {/* Fondo de patrón de chat sutil */}
          <div className="absolute inset-0 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] opacity-[0.03] pointer-events-none" />

          {/* Fecha traducida */}
          <div className="flex justify-center">
            <span className="bg-zinc-800/50 text-zinc-400 text-[10px] px-2 py-1 rounded-full uppercase tracking-wide font-medium">Hoy</span>
          </div>

          {/* Mensaje 1: Usuario */}
          <ChatMessage 
            isUser={true} 
            show={step >= 1} 
            text="Hola, quisiera agendar una valoración para un tratamiento facial." 
            time="10:42 AM" 
          />

          {/* Indicador Escribiendo 1 */}
          {step === 2 && <TypingIndicator />}

          {/* Mensaje 2: IA */}
          <ChatMessage 
            isUser={false} 
            show={step >= 3} 
            text="¡Hola! 👋 Claro que sí, será un gusto atenderte. Somos expertos en armonización facial. ¿Para qué sede te gustaría agendar: Norte o Sur?" 
            time="10:42 AM" 
          />

          {/* Mensaje 3: Usuario */}
          <ChatMessage 
            isUser={true} 
            show={step >= 4} 
            text="En la Sede Norte, por favor. Preferiblemente mañana en la tarde." 
            time="10:43 AM" 
          />

          {/* Indicador Escribiendo 2 */}
          {step === 5 && <TypingIndicator />}

          {/* Mensaje 4: IA - Cierre de venta */}
          <ChatMessage 
            isUser={false} 
            show={step >= 6} 
            text="Perfecto. Para mañana en Sede Norte tengo estos cupos disponibles: 3:00 PM o 5:30 PM. 🗓️ ¿Cuál horario prefieres para asegurar tu cita?" 
            time="10:44 AM" 
          />

        </div>

        {/* --- FOOTER DEL CHAT --- */}
        <div className="p-3 bg-zinc-900 border-t border-white/5 flex items-center gap-3 z-10">
          <div className="p-2 rounded-full bg-zinc-800 text-zinc-400">
            <MoreVertical className="w-5 h-5" />
          </div>
          {/* Placeholder traducido */}
          <div className="flex-1 bg-zinc-800 rounded-full h-9 px-4 flex items-center text-sm text-zinc-500">
            Escribe un mensaje...
          </div>
          <div className="p-2 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
            {step === 0 || step === 3 ? <Send className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </div>
        </div>
        
        {/* Barra de Inicio (Home Indicator) */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-20" />

      </div>
    </div>
  )
}

// Componente para burbujas de chat (Sin cambios, funciona igual)
function ChatMessage({ isUser, text, time, show }: { isUser: boolean, text: string, time: string, show: boolean }) {
  if (!show) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`
        max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-sm leading-relaxed relative
        ${isUser 
          ? 'bg-emerald-600 text-white rounded-tr-none' 
          : 'bg-zinc-800 text-zinc-100 rounded-tl-none border border-white/5'}
      `}>
        {text}
        <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isUser ? 'text-emerald-100/70' : 'text-zinc-500'}`}>
          {time}
          {isUser && (
            <span className="flex">
               {/* Doble check simulado */}
               <svg viewBox="0 0 16 11" className="w-3 h-3 fill-current"><path d="M11.5 0L4.5 7L2.5 5L0 7.5L4.5 11L16 2L11.5 0Z"/></svg>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Componente para los 3 puntos escribiendo (Sin cambios)
function TypingIndicator() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start w-full"
    >
      <div className="bg-zinc-800 border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center w-fit">
        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
      </div>
    </motion.div>
  )
}