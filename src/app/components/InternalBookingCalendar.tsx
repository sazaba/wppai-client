'use client'

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, CheckCircle2, User, Mail, Phone, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import Swal from 'sweetalert2';

// --- UTILIDADES DE FECHA Y HORA ---

// Generar próximos 14 días (Excluyendo solo Domingos)
const getNextDays = (days: number) => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    // 0 = Domingo. Excluimos solo el Domingo.
    if (date.getDay() !== 0) { 
        dates.push(date);
    }
  }
  return dates;
};

// Generar horarios según el día seleccionado (DURACIÓN DE 1 HORA)
const getDailySlots = (date: Date | null) => {
  if (!date) return [];

  const day = date.getDay(); // 0 (Dom) - 6 (Sab)
  const isWeekend = day === 6; // Sábado

  if (isWeekend) {
    // Sábado: 8 AM a 1 PM (Sesiones de 1 hora)
    // Última sesión inicia a las 12:00 PM para terminar a la 1:00 PM
    return [
      "08:00 AM", 
      "09:00 AM", 
      "10:00 AM", 
      "11:00 AM", 
      "12:00 PM"
    ];
  } else {
    // Entre semana (Lun-Vie): 
    // Mañana: 8 AM a 10 AM -> Slots: 8:00, 9:00 (termina a las 10)
    // Tarde: 6 PM a 9 PM -> Slots: 6:00, 7:00, 8:00 (termina a las 9)
    return [
      // Mañana
      "08:00 AM", 
      "09:00 AM",
      // Tarde/Noche
      "06:00 PM", 
      "07:00 PM", 
      "08:00 PM"
    ];
  }
};

export default function InternalBookingCalendar({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  
  // Inicializamos fechas disponibles
  const [dates] = useState(getNextDays(14));
  
  // Slots dinámicos que cambian según la fecha
  const availableSlots = getDailySlots(selectedDate);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<number[]>([]);

  // --- LÓGICA DE BLOQUEO ---
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${API_URL}/api/demo-booking`);
        
        if (response.ok) {
          const data = await response.json();
          // Guardamos los timestamps de las citas agendadas
          const timestamps = data.map((booking: any) => new Date(booking.scheduledAt).getTime());
          setBookedSlots(timestamps);
        }
      } catch (error) {
        console.error("Error cargando disponibilidad:", error);
      }
    };

    fetchBookings();
  }, []);

  const isSlotBlocked = (date: Date, time: string) => {
    const checkDate = new Date(date);
    const [timeStr, modifier] = time.split(' ');
    let [hours, minutes] = timeStr.split(':');
    let hoursInt = parseInt(hours);
    
    if (hoursInt === 12) hoursInt = 0;
    if (modifier === 'PM') hoursInt += 12;
    
    checkDate.setHours(hoursInt, parseInt(minutes), 0, 0);
    return bookedSlots.includes(checkDate.getTime());
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setTimeout(() => setStep(2), 200);
  };

  // --- ALERTAS ---
  const showSuccessAlert = () => {
    Swal.fire({
      title: '<span class="text-white font-bold text-2xl">¡Cita Confirmada!</span>',
      html: `
        <div class="text-slate-300 text-sm">
          Hemos enviado el enlace de Google Meet a <strong>${formData.email}</strong>.<br/><br/>
          Te esperamos el <strong class="text-cyan-400">${selectedDate?.toLocaleDateString()}</strong> a las <strong class="text-cyan-400">${selectedTime}</strong>.<br/>
          <span class="text-xs text-slate-500 mt-2 block">(Duración: 1 hora)</span>
        </div>
      `,
      icon: 'success',
      iconColor: '#06b6d4',
      background: '#0F0F0F',
      confirmButtonText: 'Genial, continuar',
      confirmButtonColor: '#06b6d4',
      buttonsStyling: false,
      customClass: {
        popup: 'border border-white/10 rounded-[2rem] shadow-2xl font-sans',
        confirmButton: 'px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-lg hover:scale-105 transition-transform'
      }
    }).then(() => {
        if (onComplete) onComplete();
    });
  };

  const showErrorAlert = (msg: string) => {
    Swal.fire({
      title: '<span class="text-white font-bold">No pudimos agendar</span>',
      text: msg,
      icon: 'error',
      iconColor: '#ef4444',
      background: '#0F0F0F',
      confirmButtonText: 'Intentar otro horario',
      confirmButtonColor: '#333',
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

      const data = await response.json();

      if (response.ok) {
        // Bloqueo optimista local
        const justBookedDate = new Date(selectedDate);
        const [timeStr, modifier] = selectedTime.split(' ');
        let [hours, minutes] = timeStr.split(':');
        let hoursInt = parseInt(hours);
        if (hoursInt === 12) hoursInt = 0;
        if (modifier === 'PM') hoursInt += 12;
        justBookedDate.setHours(hoursInt, parseInt(minutes), 0, 0);
        
        setBookedSlots([...bookedSlots, justBookedDate.getTime()]);

        setStep(3);
        showSuccessAlert();
      } else {
        showErrorAlert(data.error || "Hubo un error al procesar tu solicitud.");
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

      {/* Columna Horas */}
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
            {availableSlots.length > 0 ? (
              availableSlots.map((time, i) => {
                const isBlocked = isSlotBlocked(selectedDate, time);
                return (
                  <button
                    key={i}
                    disabled={isBlocked}
                    onClick={() => handleTimeSelect(time)}
                    className={clsx(
                      "py-2 px-3 rounded-lg border text-sm font-mono text-center transition-all",
                      isBlocked 
                          ? "bg-red-500/10 border-red-500/20 text-red-500/50 cursor-not-allowed decoration-slice line-through" 
                          : "border-cyan-500/30 text-cyan-100 hover:bg-cyan-500 hover:text-white"
                    )}
                  >
                    {time}
                  </button>
                );
              })
            ) : (
                <div className="col-span-2 text-center text-slate-500 text-sm py-4">
                    No hay horarios disponibles para este día.
                </div>
            )}
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
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-cyan-900/40 transition-all transform active:scale-95 mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isSubmitting ? (
                <>
                    <Loader2 className="animate-spin h-5 w-5" /> Confirmando...
                </>
            ) : (
                "Confirmar Reserva"
            )}
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
            Te hemos enviado un correo con el enlace de acceso.
        </p>
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