'use client'

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, CheckCircle2, User, Mail, Phone, Loader2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import Swal from 'sweetalert2';

// --- UTILIDADES ---
const getNextDays = (days: number) => {
  const dates = [];
  const today = new Date();
  
  // CAMBIO AQUÍ: Empezamos en i = 1 (Mañana) en vez de i = 0 (Hoy)
  // Así tienes al menos 24h para organizarte.
  for (let i = 1; i <= days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Opcional: Si quieres saltarte los domingos (día 0), mantén esto.
    if (date.getDay() !== 0) { 
        dates.push(date);
    }
  }
  return dates;
};

const getDailySlots = (date: Date | null) => {
  if (!date) return [];
  const day = date.getDay();
  const isWeekend = day === 6; // Sábado

  if (isWeekend) {
    return ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM"];
  } else {
    return ["08:00 AM", "09:00 AM", "06:00 PM", "07:00 PM", "08:00 PM"];
  }
};

export default function InternalBookingCalendar({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  
  const [dates] = useState(getNextDays(14));
  const availableSlots = getDailySlots(selectedDate);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedSignatures, setBookedSignatures] = useState<string[]>([]);

  // --- LÓGICA DE BLOQUEO ---
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${API_URL}/api/demo-booking?t=${Date.now()}`);
        
        if (response.ok) {
          const data = await response.json();
          const signatures = data.map((booking: any) => {
            const rawString = String(booking.scheduledAt).replace('Z', ''); 
            const d = new Date(rawString);
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
          });
          setBookedSignatures(signatures);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
    fetchBookings();
  }, []);

  const isSlotBlocked = (date: Date, time: string) => {
    const d = new Date(date);
    const [timeStr, modifier] = time.split(' ');
    let [hours] = timeStr.split(':');
    let hoursInt = parseInt(hours);
    
    if (hoursInt === 12) hoursInt = 0;
    if (modifier === 'PM') hoursInt += 12;
    
    const slotSignature = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${hoursInt}`;
    return bookedSignatures.includes(slotSignature);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setTimeout(() => setStep(2), 200);
  };

  const showSuccessAlert = () => {
    Swal.fire({
      title: '<span class="text-white font-bold text-xl">¡Cita Confirmada!</span>',
      html: `
        <div class="text-slate-300 text-xs">
          Enlace enviado a <strong>${formData.email}</strong>.<br/><br/>
          Fecha: <strong class="text-cyan-400">${selectedDate?.toLocaleDateString()}</strong><br/>
          Hora: <strong class="text-cyan-400">${selectedTime}</strong>
        </div>
      `,
      icon: 'success',
      iconColor: '#06b6d4',
      background: '#0F0F0F',
      confirmButtonText: 'Genial, continuar',
      confirmButtonColor: '#06b6d4',
      customClass: {
        popup: 'border border-white/10 rounded-2xl shadow-2xl font-sans',
        confirmButton: 'px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-sm'
      }
    }).then(() => {
        if (onComplete) onComplete();
    });
  };

  const showErrorAlert = (msg: string) => {
    Swal.fire({
      title: '<span class="text-white font-bold text-lg">No pudimos agendar</span>',
      text: msg,
      icon: 'error',
      iconColor: '#ef4444',
      background: '#0F0F0F',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#333',
      customClass: { popup: 'border border-white/10 rounded-2xl' }
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

      const data = await response.json();

      if (response.ok) {
        const d = new Date(selectedDate);
        const [timeStr, modifier] = selectedTime.split(' ');
        let [hours] = timeStr.split(':');
        let hoursInt = parseInt(hours);
        if (hoursInt === 12) hoursInt = 0;
        if (modifier === 'PM') hoursInt += 12;
        
        const newSignature = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${hoursInt}`;
        setBookedSignatures([...bookedSignatures, newSignature]);

        setStep(3);
        showSuccessAlert();
      } else {
        showErrorAlert(data.error || "Hubo un error al procesar tu solicitud.");
      }
    } catch (error) {
      console.error("Error:", error);
      showErrorAlert("Error de conexión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDERIZADO COMPACTO ---
  const renderStep1 = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      className="flex flex-col md:flex-row gap-4 h-full overflow-hidden"
    >
      
      {/* COLUMNA IZQUIERDA: DÍAS */}
      <div className={clsx(
        "flex-1 overflow-y-auto no-scrollbar transition-all",
        selectedDate ? "hidden md:block" : "block"
      )}>
        <h3 className="text-white text-sm font-bold mb-3 flex items-center gap-2 sticky top-0 bg-[#0F0F0F] py-2 z-10 border-b border-white/5 md:border-none">
          <CalendarIcon size={16} className="text-cyan-400" /> Selecciona un día
        </h3>
        <div className="grid grid-cols-1 gap-2 pb-16 md:pb-0">
          {dates.map((date, i) => (
            <button
              key={i}
              onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
              className={clsx(
                "p-3 rounded-xl border text-left transition-all flex justify-between items-center group relative overflow-hidden",
                selectedDate?.toDateString() === date.toDateString()
                  ? "bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-900/50"
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
              )}
            >
              <div>
                <span className="block text-[10px] uppercase tracking-wider opacity-70 mb-0.5">
                    {date.toLocaleDateString('es-CO', { month: 'long' })}
                </span>
                <span className="text-sm font-bold capitalize">
                    {date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric' })}
                </span>
              </div>
              <ChevronRight size={16} className={clsx("transition-transform", selectedDate === date ? "translate-x-1" : "opacity-50 group-hover:opacity-100")} />
            </button>
          ))}
        </div>
      </div>

      {/* COLUMNA DERECHA: HORAS */}
      <div className={clsx(
        "flex-1 md:border-l border-white/10 md:pl-4 h-full",
        !selectedDate 
            ? "hidden md:flex md:flex-col" 
            : "flex flex-col"
      )}>
        
        {/* Header Móvil Compacto */}
        <div className="md:hidden mb-3 flex items-center gap-3 pb-3 border-b border-white/10">
            <button 
                onClick={() => setSelectedDate(null)} 
                className="p-1.5 rounded-full bg-white/5 text-slate-300 hover:text-white"
            >
                <ArrowLeft size={16} />
            </button>
            <div>
                <p className="text-[10px] text-slate-500 uppercase">Día seleccionado</p>
                <p className="font-bold text-white text-sm capitalize">
                    {selectedDate?.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric' })}
                </p>
            </div>
        </div>

        <h3 className={clsx(
            "text-sm font-bold mb-3 items-center gap-2 hidden md:flex", 
            selectedDate ? "text-white" : "text-slate-600"
        )}>
          <Clock size={16} className={selectedDate ? "text-cyan-400" : "text-slate-600"} /> Horarios disponibles
        </h3>
        
        {!selectedDate ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-xs italic h-full">
            <CalendarIcon size={32} className="mb-2 opacity-20" />
            <p>Selecciona una fecha para ver horarios</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
            <p className="md:hidden text-xs text-slate-400 mb-2 flex items-center gap-2">
                <Clock size={12} className="text-cyan-400"/> Selecciona una hora:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {availableSlots.length > 0 ? (
                availableSlots.map((time, i) => {
                  const isBlocked = isSlotBlocked(selectedDate, time);
                  return (
                    <button
                      key={i}
                      disabled={isBlocked}
                      onClick={() => handleTimeSelect(time)}
                      className={clsx(
                        "py-2 px-3 rounded-lg border text-xs font-medium text-center transition-all relative",
                        isBlocked 
                          ? "bg-red-900/10 border-red-500/10 text-red-500/30 cursor-not-allowed decoration-slice line-through" 
                          : "bg-white/5 border-white/10 text-cyan-100 hover:bg-cyan-600 hover:border-cyan-500 hover:text-white hover:shadow-lg hover:shadow-cyan-500/20"
                      )}
                    >
                      {time}
                    </button>
                  );
                })
              ) : (
                <div className="col-span-2 text-center text-slate-500 text-xs py-8 bg-white/5 rounded-lg border border-dashed border-white/10">
                    No hay horarios disponibles.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full overflow-y-auto no-scrollbar">
      <div className="max-w-md mx-auto w-full pt-1">
          <div className="mb-6 bg-gradient-to-br from-cyan-950/40 to-blue-950/40 border border-cyan-500/20 p-4 rounded-xl flex items-center gap-4">
            <div className="bg-cyan-500/20 w-10 h-10 rounded-lg flex items-center justify-center text-cyan-400 shrink-0">
                <CalendarIcon size={20} />
            </div>
            <div>
                <p className="text-slate-400 text-[9px] uppercase tracking-widest font-bold mb-0.5">Tu Reserva</p>
                <p className="text-white font-bold text-sm capitalize leading-tight">
                    {selectedDate?.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric' })}
                </p>
                <p className="text-cyan-300 text-xs font-medium">
                    A las {selectedTime}
                </p>
            </div>
            <button onClick={() => setStep(1)} className="ml-auto text-[10px] text-slate-400 hover:text-white underline p-1">Editar</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-slate-300 text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-1">Nombre Completo</label>
                <div className="relative group">
                    <User className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={16} />
                    <input required type="text" className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="Ej. Juan Pérez" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
            </div>
            <div>
                <label className="block text-slate-300 text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-1">Correo Electrónico</label>
                <div className="relative group">
                    <Mail className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={16} />
                    <input required type="email" className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="juan@gmail.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
            </div>
            <div>
                <label className="block text-slate-300 text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-1">WhatsApp</label>
                <div className="relative group">
                    <Phone className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={16} />
                    <input required type="tel" className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="+57 300 123 4567" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-cyan-900/40 transition-all transform active:scale-[0.98] mt-4 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? <><Loader2 className="animate-spin h-4 w-4" /> Confirmando...</> : "Confirmar Reserva Gratuita"}
            </button>
          </form>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(34,197,94,0.3)] border border-green-500/20">
            <CheckCircle2 size={40} className="text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">¡Agenda Lista!</h3>
        <p className="text-slate-400 text-sm max-w-xs mx-auto mb-6 leading-relaxed">
            Hemos enviado los detalles a tu correo. <br/>
            <span className="text-cyan-400">¡Nos vemos pronto!</span>
        </p>
        <button onClick={() => { if(onComplete) onComplete() }} className="text-xs text-slate-500 hover:text-white underline">
            Cerrar ventana
        </button>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#0F0F0F]"> 
        {/* CSS INYECTADO PARA QUITAR SCROLLBAR */}
        <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>

        {step !== 3 && (
            <div className="mb-2 flex items-center justify-between px-1 shrink-0">
                <span className="text-[9px] font-bold text-slate-500 tracking-[0.2em] uppercase bg-white/5 px-2 py-1 rounded">
                    {step === 1 
                        ? (selectedDate ? "Paso 1.5: Horario" : "Paso 1: Fecha") 
                        : "Paso 2: Tus Datos"
                    }
                </span>
                
                {step === 2 && (
                    <button onClick={() => setStep(1)} className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors py-2">
                        <ChevronLeft size={12} /> Volver
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