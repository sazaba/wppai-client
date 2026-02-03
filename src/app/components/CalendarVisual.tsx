'use client'

import React, { memo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Users } from 'lucide-react';
import clsx from 'clsx';

const DAYS_DATA = [
  { day: 29, status: 'fuera', citas: 0 }, { day: 30, status: 'fuera', citas: 0 }, { day: 31, status: 'fuera', citas: 0 },
  { day: 1, status: 'active', citas: 0 }, { day: 2, status: 'active', citas: 0 }, { day: 3, status: 'active', citas: 0 },
  { day: 4, status: 'active', citas: 0 }, { day: 5, status: 'active', citas: 0 }, { day: 6, status: 'active', citas: 0 },
  { day: 7, status: 'active', citas: 0 }, { day: 8, status: 'active', citas: 0 }, { day: 9, status: 'active', citas: 0 },
  { day: 10, status: 'active', citas: 0 }, { day: 11, status: 'active', citas: 0 }, { day: 12, status: 'active', citas: 0 },
  { day: 13, status: 'active', citas: 0 }, { day: 14, status: 'active', citas: 3, hasAppointment: true },
  { day: 15, status: 'active', citas: 0 }, { day: 16, status: 'active', citas: 0 }, { day: 17, status: 'active', citas: 0 },
  { day: 18, status: 'active', citas: 0 },
];

const CalendarVisual = memo(({ mode = 'aesthetic' }: { mode?: 'aesthetic' | 'dental' }) => {
  const accentColor = mode === 'aesthetic' ? 'text-rose-400 border-rose-500/50 bg-rose-500/10' : 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10';
  const buttonGradient = mode === 'aesthetic' ? 'from-rose-600 to-purple-600' : 'from-cyan-600 to-blue-600';

  return (
    <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 transform-gpu">
        <div className="w-full bg-[#0F1115] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex flex-col xl:flex-row justify-between items-center p-4 sm:p-6 border-b border-white/5 bg-[#14171F] gap-4">
                <div className="flex items-center gap-3 w-full xl:w-auto justify-between xl:justify-start">
                    <div className="flex items-center gap-1 bg-[#1E222B] rounded-lg p-1">
                        <button className="p-1 hover:bg-white/5 rounded text-gray-400"><ChevronLeft size={16}/></button>
                        <button className="p-1 hover:bg-white/5 rounded text-gray-400"><ChevronRight size={16}/></button>
                    </div>
                    <div className="flex items-center gap-2"><h3 className="text-white font-bold text-base sm:text-lg">Enero 2026</h3></div>
                </div>
                <div className="flex items-center gap-2 w-full xl:w-auto justify-between xl:justify-end">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#1E222B] rounded-lg text-xs text-gray-300 border border-white/5 whitespace-nowrap"><Users size={12} /> Equipo</div>
                    <button className={clsx("flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r rounded-lg text-white text-xs font-bold shadow-lg hover:opacity-90 transition whitespace-nowrap shrink-0", buttonGradient)}>
                        <Plus size={14} /> <span className="hidden sm:inline">Nueva</span>
                    </button>
                </div>
            </div>
            <div className="p-3 sm:p-5 bg-[#0B0D11]">
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {DAYS_DATA.map((d, i) => (
                        <div key={i} className={`relative aspect-[4/5] sm:aspect-square p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition-all duration-300 group flex flex-col justify-between ${d.hasAppointment ? `bg-[#1a1216] ${accentColor}` : 'bg-[#14171F] border-white/5'} ${d.status === 'fuera' ? 'opacity-30' : 'opacity-100'}`}>
                            <div className="flex justify-between items-start"><span className={`text-xs sm:text-sm font-bold ${d.hasAppointment ? (mode === 'aesthetic' ? 'text-rose-400' : 'text-cyan-400') : 'text-white'}`}>{d.day}</span></div>
                            <div className="flex-1 flex flex-col justify-center gap-1">{d.citas > 0 ? <div className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-medium truncate text-center ${accentColor}`}>{d.citas} Citas</div> : null}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  )
});

CalendarVisual.displayName = 'CalendarVisual';
export default CalendarVisual;