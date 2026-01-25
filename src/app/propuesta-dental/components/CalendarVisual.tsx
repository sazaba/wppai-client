'use client'

import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Users } from 'lucide-react';

export default function CalendarVisual() {
  // Datos simulados (Simplificados para renderizado visual)
  const days = [
    { day: 29, status: 'fuera', citas: 0 },
    { day: 30, status: 'fuera', citas: 0 },
    { day: 31, status: 'fuera', citas: 0 },
    { day: 1, status: 'active', citas: 0 },
    { day: 2, status: 'active', citas: 0 },
    { day: 3, status: 'active', citas: 0 },
    { day: 4, status: 'active', citas: 0 },
    { day: 5, status: 'active', citas: 0 },
    { day: 6, status: 'active', citas: 0 },
    { day: 7, status: 'active', citas: 0 },
    { day: 8, status: 'active', citas: 0 },
    { day: 9, status: 'active', citas: 0 },
    { day: 10, status: 'active', citas: 0 },
    { day: 11, status: 'active', citas: 0 },
    { day: 12, status: 'active', citas: 0 },
    { day: 13, status: 'active', citas: 0 },
    { day: 14, status: 'active', citas: 2, hasAppointment: true }, // Día con cita
    { day: 15, status: 'active', citas: 0 },
    { day: 16, status: 'active', citas: 0 },
    { day: 17, status: 'active', citas: 0 },
    { day: 18, status: 'active', citas: 0 },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
        {/* Contenedor Principal: w-full para adaptarse a la columna */}
        <div className="w-full bg-[#0F1115] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Header de la Agenda */}
            <div className="flex flex-col xl:flex-row justify-between items-center p-4 sm:p-6 border-b border-white/5 bg-[#14171F] gap-4">
                <div className="flex items-center gap-3 w-full xl:w-auto justify-between xl:justify-start">
                    <div className="flex items-center gap-1 bg-[#1E222B] rounded-lg p-1">
                        <button className="p-1 hover:bg-white/5 rounded text-gray-400"><ChevronLeft size={16}/></button>
                        <button className="p-1 hover:bg-white/5 rounded text-gray-400"><ChevronRight size={16}/></button>
                    </div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-white font-bold text-base sm:text-lg">Enero 2026</h3>
                        <span className="hidden sm:block px-2 py-0.5 bg-[#1E222B] rounded text-[10px] text-gray-400 font-medium border border-white/5">Hoy</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full xl:w-auto justify-between xl:justify-end overflow-x-auto scrollbar-hide">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#1E222B] rounded-lg text-xs text-gray-300 border border-white/5 whitespace-nowrap">
                        <Users size={12} /> Equipo
                    </div>
                    <div className="flex bg-[#1E222B] rounded-lg p-1 border border-white/5 shrink-0">
                        <button className="px-3 py-1 bg-purple-600 text-white rounded text-xs font-medium shadow-lg shadow-purple-500/20">Mes</button>
                        <button className="px-3 py-1 text-gray-400 hover:text-white text-xs transition">Sem</button>
                        <button className="px-3 py-1 text-gray-400 hover:text-white text-xs transition">Día</button>
                    </div>
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white text-xs font-bold shadow-lg hover:opacity-90 transition whitespace-nowrap shrink-0">
                        <Plus size={14} /> <span className="hidden sm:inline">Nueva</span>
                    </button>
                </div>
            </div>

            {/* Grid del Calendario */}
            <div className="p-3 sm:p-5 bg-[#0B0D11]">
                {/* Días de la semana */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-gray-500 text-[10px] font-medium uppercase tracking-wider text-center">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => <div key={d}>{d}</div>)}
                </div>

                {/* Días numéricos - Grid Fluido */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {days.map((d, i) => (
                        <div 
                            key={i} 
                            // aspect-square asegura que sean cuadrados perfectos sin importar el ancho
                            // min-h-[80px] evita que se aplasten demasiado en móviles
                            className={`
                                relative aspect-[4/5] sm:aspect-square p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition-all duration-300 group flex flex-col justify-between
                                ${d.hasAppointment 
                                    ? 'bg-[#111918] border-emerald-900/50 hover:border-emerald-500/50' 
                                    : 'bg-[#14171F] border-white/5 hover:border-white/10 hover:bg-[#1A1D26]'}
                                ${d.status === 'fuera' ? 'opacity-30' : 'opacity-100'}
                            `}
                        >
                            <div className="flex justify-between items-start">
                                <span className={`text-xs sm:text-sm font-bold ${d.hasAppointment ? 'text-emerald-400' : 'text-white'}`}>{d.day}</span>
                                {d.citas > 0 && (
                                    <span className="hidden sm:flex w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                                )}
                            </div>

                            {/* Contenido Central (Solo visible si hay espacio) */}
                            <div className="flex-1 flex flex-col justify-center gap-1">
                                {d.citas > 0 ? (
                                    <div className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] sm:text-[10px] font-medium truncate text-center">
                                        {d.citas} Citas
                                    </div>
                                ) : (
                                    <div className="hidden sm:block text-[9px] text-gray-700 text-center font-medium group-hover:text-gray-500">
                                        Libre
                                    </div>
                                )}
                            </div>
                            
                            {/* Texto inferior */}
                             <div className="text-[8px] sm:text-[9px] text-gray-600 font-medium text-center opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                                +
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  )
}