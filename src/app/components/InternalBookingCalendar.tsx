'use client'

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, CheckCircle2, User, Mail, Phone, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
// Importamos SweetAlert2
import Swal from 'sweetalert2';

// Utilería simple para generar fechas
const getNextDays = (days: number) => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    if (date.getDay() !== 0 && date.getDay() !== 6) { 
        dates.push(date);
    }
  }
  return dates;
};

const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "11:00 AM", 
  "02:00 PM", "03:30 PM", "04:00 PM", "05:00 PM"
];

export default function InternalBookingCalendar({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [dates] = useState(getNextDays(14));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setTimeout(() => setStep(2), 200);
  };

  // --- CONFIGURACIÓN DE ALERTAS PREMIUM ---
  const showSuccessAlert = () => {
    Swal.fire({
      title: '<span class="text-white font-bold text-2xl">¡Cita Confirmada!</span>',
      html: `
        <div class="text-slate-300 text-sm">
          Hemos agendado tu auditoría para el <br/>
          <strong class="text-cyan-400 text-lg">${selectedDate?.toLocaleDateString()}</strong> a las <strong class="text-cyan-400 text-lg">${selectedTime}</strong>.
        </div>
      `,
      icon: 'success',
      iconColor: '#06b6d4', // Cyan 500
      background: '#0F0F0F', // Fondo Dark Premium
      confirmButtonText: 'Genial, continuar',
      confirmButtonColor: '#06b6d4', // Botón Cyan
      buttonsStyling: false,
      customClass: {
        popup: 'border border-white/10 rounded-[2rem] shadow-2xl font-sans',
        confirmButton: 'px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-lg hover:scale-105 transition-transform'
      }
    }).then(() => {
        // Al cerrar la alerta, ejecutamos la acción final
        if (onComplete) onComplete();
    });
  };

  const showErrorAlert = (msg: string) => {
    Swal.fire({
      title: '<span class="text-white font-bold">Ups, algo pasó</span>',
      text: msg,
      icon: 'error',
      iconColor: '#ef4444', // Red 500
      background: '#0F0F0F',
      confirmButtonColor: '#333',
      confirmButtonText: 'Intentar de nuevo',
      customClass: {
        popup: 'border border-white/10 rounded-[2rem] shadow-2xl font-sans'
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    setIsSubmitting(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

      const response = await fetch(`${API_URL}/api/demo-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        }),
      });

      if (response.ok) {
        setStep(3); // Mostramos pantalla final interna
        showSuccessAlert(); // Disparamos SweetAlert Premium
      } else {
        const errorData = await response.json();
        showErrorAlert(errorData.error || "No pudimos agendar tu cita. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error de red:", error);
      showErrorAlert("Error de conexión. Verifica tu internet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDERIZADO ---

  const renderStep1 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col md:flex-row gap-6 h-full">
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

        <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-cyan-900/40 transition-all transform active:scale-95 mt-4 flex items-center justify-center gap-2"
        >
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Confirmar Reserva"}
        </button>
      </form>
    </motion.div>
  );

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
            Te hemos enviado un correo con los detalles.
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