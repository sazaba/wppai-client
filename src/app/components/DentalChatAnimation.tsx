'use client'

import React, { useEffect, useState, useRef, memo } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Mic, ChevronLeft, Activity } from 'lucide-react'

// Subcomponentes memoizados (Igual que AestheticChat)
const ChatMessage = memo(({ isUser, text, time, show }: { isUser: boolean, text: string, time: string, show: boolean }) => {
  if (!show) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={`flex w-full relative z-10 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-[18px] px-3 py-1.5 shadow-sm text-[13px] leading-snug relative group ${isUser ? 'bg-cyan-600 text-white rounded-tr-none' : 'bg-[#202C33] text-[#E9EDEF] rounded-tl-none'}`}>
        {text}
        <div className="flex justify-end items-end gap-1 mt-0.5 select-none"><span className="text-[10px] text-white/60 font-normal">{time}</span></div>
      </div>
    </motion.div>
  )
});
ChatMessage.displayName = 'ChatMessage';

const TypingIndicator = memo(() => (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex justify-start w-full relative z-10 pl-2">
      <div className="bg-[#202C33] rounded-[18px] rounded-tl-none px-4 py-3 flex gap-1 items-center w-fit shadow-sm relative">
        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
      </div>
    </motion.div>
));
TypingIndicator.displayName = 'TypingIndicator';

export default function DentalChatAnimation() {
  const [step, setStep] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: "0px 0px -100px 0px" })

  useEffect(() => {
    if (!isInView) return;
    const sequence = [{ t: 500, s: 1 }, { t: 2000, s: 2 }, { t: 3500, s: 3 }, { t: 5500, s: 4 }, { t: 7000, s: 5 }, { t: 9000, s: 6 }, { t: 11000, s: 7 }, { t: 12500, s: 8 }, { t: 14500, s: 9 }];
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
            <div className="relative"><div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white"><Activity className="w-4 h-4" /></div><div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border-2 border-zinc-900 rounded-full"></div></div>
            <div className="flex flex-col"><h3 className="text-sm font-semibold text-white leading-none">Asistente Dental</h3><p className="text-[10px] text-cyan-400 font-medium mt-0.5">En línea</p></div>
          </div>
        </div>
        <div className="flex-1 bg-[#0B141A] relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-[length:300px_auto]" />
          <div className="flex-1 overflow-y-auto p-3 space-y-3 relative z-10 scrollbar-hide">
            <div className="flex justify-center py-2 mb-2"><span className="bg-zinc-800/80 text-zinc-400 text-[10px] px-2 py-0.5 rounded-md font-medium border border-white/5">Hoy</span></div>
            <ChatMessage isUser={true} show={step >= 1} text="Hola, necesito una cita urgente. Me duele una muela." time="10:10" />
            <AnimatePresence>{step === 2 && <TypingIndicator />}</AnimatePresence>
            <ChatMessage isUser={false} show={step >= 3} text="¡Hola! 👋 Entiendo. ¿El dolor es constante o al comer algo frío?" time="10:10" />
            <ChatMessage isUser={true} show={step >= 4} text="Es más al tomar cosas frías. Es bastante molesto." time="10:11" />
            <AnimatePresence>{step === 5 && <TypingIndicator />}</AnimatePresence>
            <ChatMessage isUser={false} show={step >= 6} text="Podría ser sensibilidad. ¿Te queda bien mañana a las 10:00 AM?" time="10:11" />
            <ChatMessage isUser={true} show={step >= 7} text="A las 10:00 AM por favor." time="10:12" />
            <AnimatePresence>{step === 8 && <TypingIndicator />}</AnimatePresence>
            <ChatMessage isUser={false} show={step >= 9} text="Perfecto ✨, agendado. Te envío la confirmación." time="10:12" />
          </div>
          <div className="bg-[#202C33] px-2 py-2 flex items-center gap-2 z-20 pb-6">
            <div className="flex-1 bg-[#2A3942] rounded-full h-9 px-4 flex items-center text-xs text-zinc-500">Mensaje...</div>
            <div className="w-9 h-9 rounded-full bg-cyan-600 flex items-center justify-center text-white"><Mic className="w-4 h-4" /></div>
          </div>
        </div>
      </div>
    </div>
  )
}