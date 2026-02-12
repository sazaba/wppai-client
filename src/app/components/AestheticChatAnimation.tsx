'use client'

import React, { useEffect, useState, useRef, memo } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Mic, ChevronLeft, Sparkles } from 'lucide-react'

// Subcomponentes memoizados
const ChatMessage = memo(({ isUser, text, time, show }: { isUser: boolean, text: string, time: string, show: boolean }) => {
  if (!show) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={`flex w-full relative z-10 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-[18px] px-3 py-1.5 shadow-sm text-[13px] leading-snug relative group ${isUser ? 'bg-cyan-600 text-white rounded-tr-none' : 'bg-[#202C33] text-[#E9EDEF] rounded-tl-none border border-white/5'}`}>
        {text}
        <div className="flex justify-end items-end gap-1 mt-0.5 select-none"><span className="text-[10px] text-white/60 font-normal">{time}</span></div>
      </div>
    </motion.div>
  )
});
ChatMessage.displayName = 'ChatMessage';

const TypingIndicator = memo(() => (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex justify-start w-full relative z-10 pl-2">
      <div className="bg-[#202C33] rounded-[18px] rounded-tl-none px-4 py-3 flex gap-1 items-center w-fit shadow-sm relative border border-white/5">
        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
      </div>
    </motion.div>
));
TypingIndicator.displayName = 'TypingIndicator';

export default function AestheticChatAnimation() {
  const [step, setStep] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: "0px 0px -100px 0px" })

  useEffect(() => {
    if (!isInView) return;

    // --- SECUENCIA DE TIEMPO AJUSTADA ---
    const sequence = [
        { t: 100, s: 1 },  // User: "Precio Botox"
        { t: 400, s: 3 },  // Bot: "Hola... promo Full Face" (Venta)
        { t: 600, s: 4 },  // User: "Me interesa la promo..."
        { t: 800, s: 6 },  // Bot: "Perfecto, incluye retoque..." (Valor)
        
        // --- PAUSA LECTURA (Usuario lee la oferta) ---
        { t: 2500, s: 7 }, // User: "Lo quiero. ¿Hay cita hoy?" -> EN VIVO
        { t: 3200, s: 8 }, // Typing...
        { t: 5000, s: 9 }  // Bot: "Tengo un cupo a las 5pm..." (Cierre)
    ];

    const timers = sequence.map(({ t, s }) => setTimeout(() => setStep(s), t));
    return () => timers.forEach(clearTimeout);
  }, [isInView])

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-[280px] xs:max-w-[300px] md:max-w-[340px] transform-gpu will-change-transform">
      <div className="absolute top-24 -left-[2px] h-6 w-[3px] bg-zinc-800 rounded-l-md" /><div className="absolute top-36 -left-[2px] h-10 w-[3px] bg-zinc-800 rounded-l-md" /><div className="absolute top-40 -right-[2px] h-16 w-[3px] bg-zinc-800 rounded-r-md" />
      <div className="relative bg-black rounded-[2.5rem] shadow-2xl overflow-hidden h-[550px] flex flex-col ring-4 ring-zinc-900 border border-zinc-800 z-10">
        <div className="bg-zinc-900/95 pt-10 pb-3 px-4 flex items-center justify-between border-b border-white/5 z-30">
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-5 h-5 text-cyan-400 -ml-2" />
            <div className="relative"><div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white"><Sparkles className="w-4 h-4" /></div><div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border-2 border-zinc-900 rounded-full"></div></div>
            <div className="flex flex-col"><h3 className="text-sm font-semibold text-white leading-none">Clínica Estética</h3><p className="text-[10px] text-cyan-400 font-medium mt-0.5">En línea</p></div>
          </div>
        </div>
        <div className="flex-1 bg-[#0B141A] relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-[length:300px_auto]" />
          <div className="flex-1 overflow-y-auto p-3 space-y-3 relative z-10 scrollbar-hide">
            <div className="flex justify-center py-2 mb-2"><span className="bg-zinc-800/80 text-zinc-400 text-[10px] px-2 py-0.5 rounded-md font-medium border border-white/5">Hoy</span></div>
            
            {/* GUION DE VENTAS MEJORADO */}
            <ChatMessage isUser={true} show={step >= 1} text="Hola, precio del Botox." time="10:10" />
            
            <AnimatePresence>{step === 2 && <TypingIndicator />}</AnimatePresence>
            {/* Bot no da precio suelto, ofrece paquete y valor */}
            <ChatMessage isUser={false} show={step >= 3} text="¡Hola! 👋 El vial normal está en $900k, pero hoy tengo el paquete 'Full Face' con 20% OFF. ¿Te gustaría ver fotos?" time="10:10" />
            
            <ChatMessage isUser={true} show={step >= 4} text="Sí, me interesa el descuento. ¿Incluye frente?" time="10:11" />
            
            <AnimatePresence>{step === 5 && <TypingIndicator />}</AnimatePresence>
            {/* Bot confirma y cierra objeciones */}
            <ChatMessage isUser={false} show={step >= 6} text="Sí, incluye frente, entrecejo y patas de gallo + retoque gratis en 15 días ✨." time="10:11" />
            
            {/* Interacción en vivo: Cierre por urgencia */}
            <ChatMessage isUser={true} show={step >= 7} text="Lo quiero. ¿Tienen cita para hoy mismo?" time="10:12" />
            
            <AnimatePresence>{step === 8 && <TypingIndicator />}</AnimatePresence>
            {/* Bot da escasez real */}
            <ChatMessage isUser={false} show={step >= 9} text="Me queda un último cupo a las 5:00 PM con la Dra. Sofía. ¿Te lo reservo ya? 📅" time="10:12" />
          </div>
          <div className="bg-[#202C33] px-2 py-2 flex items-center gap-2 z-20 pb-6">
            <div className="flex-1 bg-[#2A3942] rounded-full h-9 px-4 flex items-center text-xs text-zinc-500">Sí, resérvalo...</div>
            <div className="w-9 h-9 rounded-full bg-cyan-600 flex items-center justify-center text-white shadow-lg shadow-cyan-900/40"><Mic className="w-4 h-4" /></div>
          </div>
        </div>
      </div>
    </div>
  )
}