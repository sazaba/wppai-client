'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  Search, Trash2, Calendar, Mail, Phone, Filter, 
  CheckCircle2, Clock, XCircle, UserPlus 
} from 'lucide-react'
import Swal from 'sweetalert2'
import axios from 'axios'
import clsx from 'clsx'

// --- INTERFAZ CORREGIDA ---
interface DemoBooking {
  id: number
  name: string
  email: string
  phone: string
  scheduledAt: string
  status: string 
  createdAt?: string // <--- ¡AQUÍ ESTABA EL FALTANTE! (Lo pongo opcional '?' por si acaso)
}

interface DemoTableProps {
  initialData: DemoBooking[]
}

const STATUS_OPTS = [
  { value: 'pending', label: 'Pendiente', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Clock },
  { value: 'contacted', label: 'Contactado', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: CheckCircle2 },
  { value: 'closed', label: 'Cerrado', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: XCircle }
]

export default function DemoTable({ initialData }: DemoTableProps) {
  const safeData = Array.isArray(initialData) ? initialData : []
  const [demos, setDemos] = useState<DemoBooking[]>(safeData)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredDemos = demos.filter(d => {
    const matchesSearch = 
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // --- CAMBIAR ESTADO ---
  const handleStatusChange = async (id: number, newStatus: string) => {
    const oldDemos = [...demos]
    setDemos(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d))

    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/demo-booking/${id}`, { status: newStatus })
      const Toast = Swal.mixin({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        background: '#0F0F0F', color: '#fff'
      })
      Toast.fire({ icon: 'success', title: 'Estado actualizado' })
    } catch (error) {
      setDemos(oldDemos) 
      console.error(error)
      Swal.fire({ title: 'Error', text: 'No se pudo actualizar', icon: 'error', background: '#0F0F0F', color: '#fff' })
    }
  }

  // --- BORRAR ---
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Eliminar lead?',
      text: "Se borrará permanentemente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#333',
      confirmButtonText: 'Sí, eliminar',
      background: '#0F0F0F', color: '#fff'
    })

    if (result.isConfirmed) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/demo-booking/${id}`)
        setDemos(prev => prev.filter(d => d.id !== id))
        Swal.fire({ title: 'Eliminado', icon: 'success', timer: 1500, showConfirmButton: false, background: '#0F0F0F', color: '#fff' })
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar', 'error')
      }
    }
  }

  return (
    <div className="space-y-6">
      
      {/* --- BARRA DE FILTROS --- */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-xl sticky top-0 z-10">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, email..." 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-zinc-500" />
          <select 
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            {STATUS_OPTS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>

      {/* --- VISTA MÓVIL (CARDS) --- */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredDemos.map((demo) => (
          <div key={demo.id} className="bg-zinc-900/80 border border-white/5 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            {/* Header Card */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                  {demo.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{demo.name}</h3>
                  <p className="text-xs text-zinc-500">ID: #{demo.id}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(demo.id)} className="p-2 text-zinc-600 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Info Body */}
            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-3 text-zinc-300 text-sm">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="capitalize">{format(new Date(demo.scheduledAt), "EEE d MMM, h:mm a", { locale: es })}</span>
              </div>
              
              <a href={`mailto:${demo.email}`} className="flex items-center gap-3 text-zinc-300 text-sm group active:scale-95 transition-transform">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-zinc-700">
                    <Mail className="w-4 h-4 text-zinc-400" />
                </div>
                <span className="truncate">{demo.email}</span>
              </a>

              {/* ACCIÓN DE TELÉFONO MÓVIL */}
              <a href={`tel:${demo.phone}`} className="flex items-center gap-3 text-zinc-300 text-sm group active:scale-95 transition-transform">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/30">
                    <Phone className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="font-mono">{demo.phone}</span>
                <span className="ml-auto text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">Llamar</span>
              </a>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <select 
                    value={demo.status}
                    onChange={(e) => handleStatusChange(demo.id, e.target.value)}
                    className={clsx(
                        "text-xs font-medium px-3 py-1.5 rounded-lg border bg-zinc-950 appearance-none outline-none focus:ring-1 focus:ring-white/20",
                        STATUS_OPTS.find(s => s.value === demo.status)?.color
                    )}
                >
                    {STATUS_OPTS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                
                <a href={`tel:${demo.phone}`} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white">
                    <UserPlus className="w-3 h-3" /> Guardar
                </a>
            </div>
          </div>
        ))}
      </div>

      {/* --- VISTA DESKTOP (TABLA) --- */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/30 shadow-xl">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-950/50 text-xs uppercase font-medium text-zinc-500">
            <tr>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Contacto</th>
              <th className="px-6 py-4">Cita Agendada</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredDemos.map((demo) => (
              <tr key={demo.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/20">
                      {demo.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-white">{demo.name}</p>
                      {/* Aquí usamos el createdAt opcional con un fallback a la fecha actual si no existe */}
                      <span className="text-xs text-zinc-600">Creado: {format(new Date(demo.createdAt || new Date()), "d MMM", { locale: es })}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5 text-xs">
                    <div className="flex items-center gap-2 group/link cursor-pointer" title="Copiar correo" onClick={() => navigator.clipboard.writeText(demo.email)}>
                        <Mail className="w-3.5 h-3.5 text-zinc-500 group-hover/link:text-zinc-300" /> 
                        <span className="group-hover/link:text-zinc-300 transition-colors">{demo.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-zinc-500" /> 
                        <span className="font-mono text-zinc-300">{demo.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-zinc-300 bg-zinc-800/40 px-3 py-1.5 rounded-lg w-fit border border-white/5">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span className="font-mono text-xs capitalize">
                      {format(new Date(demo.scheduledAt), "EEE d MMM, h:mm a", { locale: es })}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="relative">
                    <select 
                        value={demo.status}
                        onChange={(e) => handleStatusChange(demo.id, e.target.value)}
                        className={clsx(
                            "appearance-none pl-8 pr-8 py-1.5 rounded-full text-xs font-medium border cursor-pointer outline-none transition-all hover:brightness-110 focus:ring-2 focus:ring-white/10 bg-transparent",
                            STATUS_OPTS.find(s => s.value === demo.status)?.color || 'text-zinc-400 border-zinc-700'
                        )}
                    >
                        {STATUS_OPTS.map(opt => <option key={opt.value} value={opt.value} className="bg-zinc-900 text-zinc-300">{opt.label}</option>)}
                    </select>
                    {/* Icono absoluto sobre el select */}
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        {(() => {
                            const Icon = STATUS_OPTS.find(s => s.value === demo.status)?.icon || Clock;
                            return <Icon className={clsx("w-3.5 h-3.5", STATUS_OPTS.find(s => s.value === demo.status)?.color?.split(' ')[0])} />
                        })()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(demo.id)}
                    className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Eliminar Lead"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredDemos.length === 0 && (
            <div className="p-12 text-center text-zinc-500 text-sm flex flex-col items-center gap-2">
                <Search className="w-8 h-8 opacity-20" />
                <p>No se encontraron resultados</p>
            </div>
        )}
      </div>
    </div>
  )
}