'use client'

import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Users, Calendar as CalendarIcon } from 'lucide-react';

export default function CalendarVisual() {
  // Datos simulados para recrear tu imagen
  const days = [
    { day: 29, month: 'Ene', status: 'fuera', citas: 0 },
    { day: 30, month: 'Ene', status: 'fuera', citas: 0 },
    { day: 31, month: 'Ene', status: 'fuera', citas: 0 },
    { day: 1, month: 'Feb', status: 'active', citas: 0 },
    { day: 2, month: 'Feb', status: 'active', citas: 0 },
    { day: 3, month: 'Feb', status: 'active', citas: 0 },
    { day: 4, month: 'Feb', status: 'active', citas: 0 },
    { day: 5, month: 'Feb', status: 'active', citas: 0 },
    { day: 6, month: 'Feb', status: 'active', citas: 0 },
    { day: 7, month: 'Feb', status: 'active', citas: 0 },
    { day: 8, month: 'Feb', status: 'active', citas: 0 },
    { day: 9, month: 'Feb', status: 'active', citas: 0 },
    { day: 10, month: 'Feb', status: 'active', citas: 0 },
    { day: 11, month: 'Feb', status: 'active', citas: 0 },
    { day: 12, month: 'Feb', status: 'active', citas: 0 },
    { day: 13, month: 'Feb', status: 'active', citas: 0 },
    { day: 14, month: 'Feb', status: 'active', citas: 2, hasAppointment: true }, // Día con cita
    { day: 15, month: 'Feb', status: 'active', citas: 0 },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-1">
        {/* Contenedor con efecto Glass/Glow */}
        <div className="relative bg-[#0F1115] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            
            {/* Header de la Agenda */}
            <div className="flex flex-col md:flex-row justify-between items-center p-6 border-b border-white/5 bg-[#14171F]">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="flex items-center gap-1 bg-[#1E222B] rounded-lg p-1">
                        <button className="p-1 hover:bg-white/5 rounded text-gray-400"><ChevronLeft size={18}/></button>
                        <button className="p-1 hover:bg-white/5 rounded text-gray-400"><ChevronRight size={18}/></button>
                    </div>
                    <h3 className="text-white font-bold text-lg">Enero de 2026</h3>
                    <span className="px-3 py-1 bg-[#1E222B] rounded-md text-xs text-gray-400 font-medium">Hoy</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-[#1E222B] rounded-lg text-sm text-gray-300 border border-white/5">
                        <Users size={14} /> Todo el equipo
                    </div>
                    <div className="flex bg-[#1E222B] rounded-lg p-1 border border-white/5">
                        <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm font-medium shadow-lg shadow-purple-500/20">Mes</button>
                        <button className="px-3 py-1 text-gray-400 hover:text-white text-sm transition">Semana</button>
                        <button className="px-3 py-1 text-gray-400 hover:text-white text-sm transition">Día</button>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white text-sm font-bold shadow-lg hover:opacity-90 transition">
                        <Plus size={16} /> Nueva cita
                    </button>
                </div>
            </div>

            {/* Grid del Calendario */}
            <div className="p-6 bg-[#0B0D11]">
                {/* Días de la semana */}
                <div className="grid grid-cols-7 gap-2 mb-2 text-gray-500 text-xs font-medium uppercase tracking-wider">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => <div key={d}>{d}</div>)}
                </div>

                {/* Días numéricos */}
                <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                    {days.map((d, i) => (
                        <div 
                            key={i} 
                            className={`
                                relative min-h-[100px] p-3 rounded-xl border transition-all duration-300 group
                                ${d.hasAppointment 
                                    ? 'bg-[#111918] border-emerald-900/50 hover:border-emerald-500/50' 
                                    : 'bg-[#14171F] border-white/5 hover:border-white/10 hover:bg-[#1A1D26]'}
                                ${d.status === 'fuera' ? 'opacity-40' : 'opacity-100'}
                            `}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-lg font-bold ${d.hasAppointment ? 'text-emerald-400' : 'text-white'}`}>{d.day}</span>
                                {d.citas > 0 ? (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                        {d.citas} citas
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 text-gray-600 group-hover:text-gray-400 text-[10px] font-medium transition-colors">
                                        0 citas
                                    </span>
                                )}
                            </div>

                            {/* Placeholder de "Doble click" */}
                            <div className="text-[10px] text-gray-600 font-medium mt-auto group-hover:text-purple-400 transition-colors">
                                {d.hasAppointment ? (
                                    <div className="flex items-center gap-1 text-emerald-500">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
                                        Confirmado
                                    </div>
                                ) : 'Doble click para agendar'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  )
}