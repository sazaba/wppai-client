'use client'

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, CheckCircle2, User, Mail, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

// Utilería simple para generar fechas (simulación de próximos 14 días)
const getNextDays = (days: number) => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    // Saltar fines de semana si quieres (opcional)
    if (date.getDay() !== 0 && date.getDay() !== 6) { 
        dates.push(date);
    }
  }
  return dates;
};

// Horarios disponibles simulados
const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "11:00 AM", 
  "02:00 PM", "03:30 PM", "04:00 PM", "05:00 PM"
];

interface BookingData {
  date: Date | null;
  time: string | null;
  name: string;
  email: string;
  phone: string;
}

export default function InternalBookingCalendar({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Fecha/Hora, 2: Datos, 3: Éxito
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [dates] = useState(getNextDays(14));

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    // Pequeño delay para UX
    setTimeout(() => setStep(2), 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // AQUÍ CONECTAREMOS EL BACKEND MÁS ADELANTE
    console.log("Datos listos para enviar a DB:", { date: selectedDate, time: selectedTime, ...formData });
    setStep(3);
    if (onComplete) setTimeout(onComplete, 3000); // Cerrar automático opcional
  };

  // --- RENDERIZADO DE PASOS ---

  // Paso 1: Selector de Fecha y Hora
  const renderStep1 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col md:flex-row gap-6 h-full">
      {/* Columna Fechas */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2 sticky top-0 bg-[#111] py-2 z-10">
          <CalendarIcon size={18} className="text-cyan-400" /> Selecciona un día
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {dates.map((date, i) => (
            <button
              key={i}
              onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
              className={clsx(
                "p-3 rounded-xl border text-left transition-all flex justify-between items-center group",
                selectedDate?.toDateString() === date.toDateString()
                  ? "bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-900/50"
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
              )}
            >
              <span className="font-medium">
                {date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
              <ChevronRight size={16} className={clsx("opacity-0 group-hover:opacity-100 transition-opacity", selectedDate === date && "opacity-100")} />
            </button>
          ))}
        </div>
      </div>

      {/* Columna Horas (Aparece al seleccionar fecha) */}
      <div className="flex-1 border-t md:border-t-0 md:border-l border-white/10 md:pl-6 pt-4 md:pt-0 flex flex-col">
        <h3 className={clsx("font-bold mb-4 flex items-center gap-2 transition-colors", selectedDate ? "text-white" : "text-slate-600")}>
          <Clock size={18} className={selectedDate ? "text-cyan-400" : "text-slate-600"} /> Horarios disponibles
        </h3>
        
        {!selectedDate ? (
          <div className="flex-1 flex items-center justify-center text-slate-600 text-sm italic">
            Selecciona una fecha primero
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 overflow-y-auto custom-scrollbar">
            {TIME_SLOTS.map((time, i) => (
              <button
                key={i}
                onClick={() => handleTimeSelect(time)}
                className="py-2 px-3 rounded-lg border border-cyan-500/30 text-cyan-100 hover:bg-cyan-500 hover:text-white transition-all text-sm font-mono text-center"
              >
                {time}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  // Paso 2: Formulario de Datos
  const renderStep2 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-md mx-auto w-full">
      <div className="mb-6 bg-cyan-950/30 border border-cyan-500/20 p-4 rounded-xl flex items-center gap-4">
        <div className="bg-cyan-500/20 p-2 rounded-lg text-cyan-400">
            <CalendarIcon size={20} />
        </div>
        <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Tu sesión</p>
            <p className="text-white font-medium">
                {selectedDate?.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' })} • {selectedTime}
            </p>
        </div>
        <button onClick={() => setStep(1)} className="ml-auto text-xs text-slate-500 hover:text-white underline">Cambiar</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label className="block text-slate-400 text-sm mb-1 ml-1">Nombre Completo</label>
            <div className="relative">
                <User className="absolute left-3 top-3 text-slate-500" size={18} />
                <input 
                    required 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    placeholder="Dra. María..."
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
            </div>
        </div>
        <div>
            <label className="block text-slate-400 text-sm mb-1 ml-1">Correo Electrónico</label>
            <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
                <input 
                    required 
                    type="email" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    placeholder="contacto@clinica.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
            </div>
        </div>
        <div>
            <label className="block text-slate-400 text-sm mb-1 ml-1">WhatsApp / Celular</label>
            <div className="relative">
                <Phone className="absolute left-3 top-3 text-slate-500" size={18} />
                <input 
                    required 
                    type="tel" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    placeholder="+57 300..."
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
            </div>
        </div>

        <button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-cyan-900/40 transition-all transform active:scale-95 mt-4">
            Confirmar Reserva
        </button>
      </form>
    </motion.div>
  );

  // Paso 3: Confirmación
  const renderStep3 = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} 
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-900/50"
        >
            <CheckCircle2 size={40} className="text-white" />
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-2">¡Agenda Confirmada!</h3>
        <p className="text-slate-300 max-w-xs mx-auto mb-6">
            Te hemos enviado un correo con los detalles. Nos vemos el <span className="text-cyan-400 font-semibold">{selectedDate?.toLocaleDateString()}</span> a las <span className="text-cyan-400 font-semibold">{selectedTime}</span>.
        </p>
        <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-sm text-slate-400">
            Pronto un experto de Wasaaa te contactará para la configuración.
        </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
        {step !== 3 && (
            <div className="mb-4 flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">Paso {step} de 2</span>
                {step === 2 && (
                    <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft size={14} /> Volver
                    </button>
                )}
            </div>
        )}
        
        <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="wait">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </AnimatePresence>
        </div>
    </div>
  );
}