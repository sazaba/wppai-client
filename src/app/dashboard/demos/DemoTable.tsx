'use client'

import React, { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  Search, Trash2, Calendar, Mail, Phone, Filter, 
  CheckCircle2, Clock, XCircle, UserPlus, ChevronDown, Check
} from 'lucide-react'
import Swal from 'sweetalert2'
import axios from 'axios'
import clsx from 'clsx'

// --- INTERFACES ---
interface DemoBooking {
  id: number
  name: string
  email: string
  phone: string
  scheduledAt: string
  status: string 
  createdAt?: string
}

interface DemoTableProps {
  initialData: DemoBooking[]
}

// Configuración de estilos
const STATUS_STYLES: Record<string, { label: string, color: string, icon: any }> = {
  pending: { 
    label: 'Pendiente', 
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', 
    icon: Clock 
  },
  contacted: { 
    label: 'Contactado', 
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', 
    icon: CheckCircle2 
  },
  closed: { 
    label: 'Cerrado', 
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', 
    icon: XCircle 
  }
}

// --- COMPONENTE: DROPDOWN PERSONALIZADO (Para reemplazar el <select> feo) ---
const CustomSelect = ({ 
  value, 
  options, 
  onChange, 
  className = "", 
  align = "left" 
}: { 
  value: string, 
  options: { value: string, label: string, icon?: any, color?: string }[], 
  onChange: (val: string) => void,
  className?: string,
  align?: "left" | "right"
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [ref])

  const selectedOption = options.find(o => o.value === value) || options[0]
  const Icon = selectedOption.icon

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all duration-200 outline-none w-full min-w-[140px]",
          className,
          isOpen && "ring-2 ring-white/10 bg-zinc-800"
        )}
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
          <span>{selectedOption.label}</span>
        </div>
        <ChevronDown className={clsx("w-3.5 h-3.5 transition-transform duration-200 shrink-0", isOpen && "rotate-180")} />
      </button>

      {/* Menú Flotante */}
      {isOpen && (
        <div className={clsx(
          "absolute z-50 mt-2 w-48 p-1.5 bg-[#09090b] border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100",
          align === "right" ? "right-0" : "left-0"
        )}>
          <div className="flex flex-col gap-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors w-full text-left",
                  value === opt.value 
                    ? "bg-zinc-800 text-white" 
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                )}
              >
                {opt.icon && <opt.icon className={clsx("w-3.5 h-3.5", opt.color?.split(' ')[0])} />}
                <span className="flex-1">{opt.label}</span>
                {value === opt.value && <Check className="w-3 h-3 text-indigo-400" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// --- COMPONENTE PRINCIPAL ---
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

  // --- HANDLER: CAMBIAR ESTADO ---
  const handleStatusChange = async (id: number, newStatus: string) => {
    const oldDemos = [...demos]
    setDemos(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d))

    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/demo-booking/${id}`, { status: newStatus })
      const Toast = Swal.mixin({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        background: '#09090b', color: '#e4e4e7'
      })
      Toast.fire({ icon: 'success', title: 'Estado actualizado' })
    } catch (error) {
      setDemos(oldDemos) 
      console.error(error)
    }
  }

  // --- HANDLER: BORRAR ---
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Eliminar lead?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      background: '#09090b', 
      color: '#e4e4e7',
      iconColor: '#ef4444',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#27272a',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-2xl border border-white/10',
        confirmButton: 'rounded-xl',
        cancelButton: 'rounded-xl'
      }
    })

    if (result.isConfirmed) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/demo-booking/${id}`)
        setDemos(prev => prev.filter(d => d.id !== id))
        Swal.fire({ 
            title: 'Eliminado', 
            icon: 'success', 
            timer: 1500, 
            showConfirmButton: false, 
            background: '#09090b', 
            color: '#e4e4e7',
            iconColor: '#10b981'
        })
      } catch (error) {
        console.error(error)
        Swal.fire({ title: 'Error', text: 'No se pudo eliminar', icon: 'error', background: '#09090b', color: '#e4e4e7' })
      }
    }
  }

  // Opciones formateadas para los dropdowns
  const statusOptions = Object.keys(STATUS_STYLES).map(key => ({
    value: key,
    label: STATUS_STYLES[key].label,
    icon: STATUS_STYLES[key].icon,
    color: STATUS_STYLES[key].color
  }))

  const filterOptions = [
    { value: 'all', label: 'Todos los estados' },
    ...statusOptions
  ]

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      
      {/* Luces ambientales */}
      <div className="absolute top-[-10%] left-[-5%] w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="space-y-6 relative z-10">
      
        {/* --- HEADER & FILTROS --- */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-900/60 p-2 rounded-2xl border border-white/5 backdrop-blur-xl sticky top-2 z-20 shadow-2xl">
          
          {/* Buscador */}
          <div className="relative w-full sm:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Buscar por nombre, email..." 
              className="block w-full pl-10 pr-3 py-2.5 bg-zinc-950/50 border border-white/5 rounded-xl text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Filtro Estado (CUSTOM) */}
          <div className="w-full sm:w-auto">
            <CustomSelect 
              value={filterStatus}
              onChange={setFilterStatus}
              options={filterOptions}
              className="w-full sm:w-48 bg-zinc-950/50 border-white/5 text-zinc-300"
              align="right"
            />
          </div>
        </div>

        {/* --- VISTA MÓVIL (CARDS) --- */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {filteredDemos.map((demo) => (
            <div key={demo.id} className="bg-zinc-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-lg relative overflow-visible group">
              {/* Highlight lateral */}
              <div className={clsx("absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl", STATUS_STYLES[demo.status]?.color.split(' ')[1].replace('/10',''))} />

              <div className="flex justify-between items-start mb-4 pl-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
                    {demo.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-white text-lg leading-tight truncate">{demo.name}</h3>
                    <p className="text-xs text-zinc-500 font-mono">ID: {demo.id}</p>
                  </div>
                </div>
                
                <button onClick={() => handleDelete(demo.id)} className="p-2 rounded-lg bg-zinc-800/50 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-white/5 shrink-0">
                    <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid gap-3 mb-5 pl-3">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400"><Calendar className="w-4 h-4" /></div>
                    <div>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Fecha Cita</p>
                        <p className="text-sm text-zinc-200 capitalize">{format(new Date(demo.scheduledAt), "EEE d MMM, h:mm a", { locale: es })}</p>
                    </div>
                </div>
                <div className="flex flex-col gap-2 overflow-hidden">
                     <a href={`mailto:${demo.email}`} className="flex items-center gap-3 text-zinc-400 text-sm hover:text-white transition-colors truncate"><Mail className="w-4 h-4 opacity-50 shrink-0" /> {demo.email}</a>
                     <a href={`tel:${demo.phone}`} className="flex items-center gap-3 text-zinc-400 text-sm hover:text-emerald-400 transition-colors"><Phone className="w-4 h-4 opacity-50 shrink-0" /> {demo.phone}</a>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5 pl-3 gap-2">
                  {/* Custom Dropdown Móvil */}
                  <div className="flex-1 min-w-0">
                    <CustomSelect 
                        value={demo.status}
                        onChange={(val) => handleStatusChange(demo.id, val)}
                        options={statusOptions}
                        className={STATUS_STYLES[demo.status]?.color}
                    />
                  </div>
                  
                  <a href={`tel:${demo.phone}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider hover:bg-emerald-500/20 transition-all shrink-0">
                      <UserPlus className="w-3 h-3" /> Llamar
                  </a>
              </div>
            </div>
          ))}
        </div>

        {/* --- VISTA DESKTOP (TABLA) --- */}
        <div className="hidden md:block bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-[2rem] shadow-2xl min-h-[400px]">
          <div className="overflow-visible"> 
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-900/50">
                  <th className="p-6">Lead / Cliente</th>
                  <th className="p-6">Contacto</th>
                  <th className="p-6">Cita Agendada</th>
                  <th className="p-6">Estado</th>
                  <th className="p-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredDemos.length === 0 ? (
                    <tr><td colSpan={5} className="p-12 text-center text-zinc-500">No se encontraron citas.</td></tr>
                ) : (
                    filteredDemos.map((demo) => (
                    <tr key={demo.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">{demo.name.charAt(0).toUpperCase()}</div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-white text-base">{demo.name}</span>
                                    <span className="text-xs text-zinc-500 font-mono">ID: {demo.id}</span>
                                </div>
                            </div>
                        </td>
                        <td className="p-6">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-zinc-400 hover:text-white cursor-pointer group/copy" onClick={() => navigator.clipboard.writeText(demo.email)} title="Copiar"><Mail className="w-3.5 h-3.5 opacity-50" /><span className="text-xs">{demo.email}</span></div>
                                <div className="flex items-center gap-2 text-zinc-400"><Phone className="w-3.5 h-3.5 opacity-50" /><span className="text-xs font-mono">{demo.phone}</span></div>
                            </div>
                        </td>
                        <td className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400 border border-white/5"><Calendar className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-zinc-200 capitalize font-medium">{format(new Date(demo.scheduledAt), "EEEE d MMMM", { locale: es })}</p>
                                    <p className="text-xs text-indigo-400 font-bold mt-0.5">{format(new Date(demo.scheduledAt), "h:mm a", { locale: es })}</p>
                                </div>
                            </div>
                        </td>
                        <td className="p-6">
                            {/* CUSTOM DROPDOWN DESKTOP */}
                            <CustomSelect 
                                value={demo.status}
                                onChange={(val) => handleStatusChange(demo.id, val)}
                                options={statusOptions}
                                className={STATUS_STYLES[demo.status]?.color}
                            />
                        </td>
                        <td className="p-6 text-right">
                            <button onClick={() => handleDelete(demo.id)} className="p-2.5 rounded-xl bg-zinc-800/50 text-zinc-500 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all group/del">
                                <Trash2 className="w-4 h-4 group-hover/del:scale-110 transition-transform" />
                            </button>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}