'use client'

import React, { useEffect, useState, useMemo, useRef } from 'react'
import { 
  Search, User, Calendar, Phone, Loader2, Database, 
  Filter, X, ChevronDown, Download, ChevronLeft, ChevronRight, 
  Mail, Trash2, CheckCircle2, Clock, XCircle, RefreshCw, MoreHorizontal, Check
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import * as XLSX from 'xlsx' 
import Swal from 'sweetalert2' 
import axios from 'axios'
import clsx from 'clsx'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// --- INTERFAZ DE DATOS ---
interface DemoBooking {
  id: number
  name: string
  email: string
  phone: string
  scheduledAt: string
  status: string 
  createdAt?: string
}

// Configuración de estilos por estado
const STATUS_STYLES: Record<string, { label: string, color: string, icon: any }> = {
  pending: { label: 'Pendiente', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Clock },
  contacted: { label: 'Contactado', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: CheckCircle2 },
  closed: { label: 'Cerrado', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: XCircle }
}

const ITEMS_PER_PAGE = 9 

// --- COMPONENTE INTERNO: SELECTOR PERSONALIZADO ---
const StatusSelect = ({ value, onChange, className }: { value: string, onChange: (val: string) => void, className?: string }) => {
    const [isOpen, setIsOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
  
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false)
      }
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [ref])
  
    const currentStyle = STATUS_STYLES[value] || STATUS_STYLES.pending
    const Icon = currentStyle.icon
  
    return (
      <div className="relative" ref={ref}>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }}
          className={clsx(
            "flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all duration-200 outline-none w-full min-w-[130px]",
            currentStyle.color,
            className,
            isOpen && "ring-2 ring-white/10 brightness-110"
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span>{currentStyle.label}</span>
          </div>
          <ChevronDown className={clsx("w-3.5 h-3.5 transition-transform duration-200 shrink-0", isOpen && "rotate-180")} />
        </button>
  
        <AnimatePresence>
            {isOpen && (
            <motion.div 
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 5 }} exit={{ opacity: 0, y: -5 }}
                className="absolute left-0 z-50 w-40 p-1.5 bg-[#09090b] border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl"
            >
                <div className="flex flex-col gap-1">
                {Object.entries(STATUS_STYLES).map(([key, style]) => (
                    <button
                    key={key}
                    onClick={(e) => { e.stopPropagation(); onChange(key); setIsOpen(false) }}
                    className={clsx(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors w-full text-left",
                        value === key ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                    )}
                    >
                    <style.icon className={clsx("w-3.5 h-3.5", style.color.split(' ')[0])} />
                    <span className="flex-1">{style.label}</span>
                    {value === key && <Check className="w-3 h-3 text-indigo-400" />}
                    </button>
                ))}
                </div>
            </motion.div>
            )}
        </AnimatePresence>
      </div>
    )
}

// ============================================================================
// COMPONENTE PRINCIPAL (PÁGINA)
// ============================================================================

export default function DemosPage() {
  const [data, setData] = useState<DemoBooking[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filtros y Estados
  const [search, setSearch] = useState('')
  const [viewTab, setViewTab] = useState('all') // 'all', 'pending', 'contacted', 'closed'
  const [currentPage, setCurrentPage] = useState(1)

  // --- CARGA DE DATOS ---
  const fetchData = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/demo-booking`)
      setData(res.data)
    } catch (error) {
      console.error('Error cargando demos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // --- LÓGICA DE FILTRADO ---
  const filtered = useMemo(() => {
    return data.filter(item => {
      // 1. Filtro por Pestaña (Status)
      if (viewTab !== 'all' && item.status !== viewTab) return false

      // 2. Filtro por Texto
      const text = search.toLowerCase()
      const matchesSearch = 
        item.name.toLowerCase().includes(text) || 
        item.email.toLowerCase().includes(text) ||
        item.phone.includes(text)

      if (!matchesSearch) return false

      return true
    })
  }, [data, search, viewTab])

  // Reset de página al filtrar
  useEffect(() => { setCurrentPage(1) }, [filtered.length, viewTab])

  // Paginación
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

  // --- ACTIONS ---

  const handleStatusChange = async (id: number, newStatus: string) => {
    // Optimistic Update
    const originalData = [...data]
    setData(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d))

    try {
        await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/demo-booking/${id}`, { status: newStatus })
        const Toast = Swal.mixin({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
            background: '#09090b', color: '#fff'
        })
        Toast.fire({ icon: 'success', title: 'Estado actualizado' })
    } catch (error) {
        setData(originalData) // Revertir
        console.error(error)
        Swal.fire({ title: 'Error', text: 'No se pudo actualizar', icon: 'error', background: '#09090b', color: '#fff' })
    }
  }

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
        title: '¿Eliminar lead?',
        text: "Se borrará permanentemente de la base de datos.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#27272a',
        confirmButtonText: 'Sí, eliminar',
        background: '#09090b', color: '#fff'
    })

    if (result.isConfirmed) {
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/demo-booking/${id}`)
            setData(prev => prev.filter(d => d.id !== id))
            Swal.fire({ title: 'Eliminado', icon: 'success', timer: 1500, showConfirmButton: false, background: '#09090b', color: '#fff' })
        } catch (error) {
            Swal.fire('Error', 'No se pudo eliminar', 'error')
        }
    }
  }

  const handleExportExcel = () => {
    if (filtered.length === 0) return
    const dataToExport = filtered.map(c => ({
      ID: c.id,
      Nombre: c.name,
      Email: c.email,
      Teléfono: c.phone,
      'Fecha Cita': format(new Date(c.scheduledAt), "dd/MM/yyyy HH:mm"),
      Estado: STATUS_STYLES[c.status]?.label || c.status,
      'Fecha Registro': c.createdAt ? format(new Date(c.createdAt), "dd/MM/yyyy") : '-'
    }))
    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Leads")
    XLSX.writeFile(wb, `Leads_Wasaaa_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // --- RENDER ---
  return (
    <div className="h-full w-full bg-zinc-950 text-white p-4 md:p-8 relative overflow-y-auto whatsapp-scroll flex flex-col">
      
      {/* Fondo ambiental */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6 w-full flex-1 flex flex-col">
        
        {/* HEADER SUPERIOR */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Database className="text-indigo-500" />
              Gestión de Leads
            </h1>
            
            {/* TABS DE ESTADO (Filtros rápidos) */}
            <div className="flex items-center gap-6 mt-4 overflow-x-auto scrollbar-hide w-full">
                <button onClick={() => setViewTab('all')} className={`text-sm font-medium pb-1 border-b-2 transition-all whitespace-nowrap ${viewTab === 'all' ? 'text-white border-indigo-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>
                    Todos
                </button>
                <button onClick={() => setViewTab('pending')} className={`text-sm font-medium pb-1 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${viewTab === 'pending' ? 'text-amber-400 border-amber-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>
                    <Clock className="w-3.5 h-3.5" /> Pendientes
                </button>
                <button onClick={() => setViewTab('contacted')} className={`text-sm font-medium pb-1 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${viewTab === 'contacted' ? 'text-blue-400 border-blue-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Contactados
                </button>
                <button onClick={() => setViewTab('closed')} className={`text-sm font-medium pb-1 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${viewTab === 'closed' ? 'text-emerald-400 border-emerald-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>
                    <XCircle className="w-3.5 h-3.5" /> Cerrados
                </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
            {/* Buscador */}
            <div className="relative w-full sm:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-500 transition-colors w-4 h-4" />
              <input 
                type="text" 
                placeholder="Buscar lead..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 outline-none transition-all placeholder:text-zinc-600"
              />
            </div>
            
            <div className="flex gap-2">
                <button 
                    onClick={fetchData}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                    title="Recargar datos"
                >
                    <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
                </button>

                <button 
                    onClick={handleExportExcel}
                    disabled={filtered.length === 0}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
                >
                    <Download className="w-4 h-4" />
                    <span className="hidden md:inline">Excel</span>
                </button>
            </div>
          </div>
        </div>

        {/* GRID DE RESULTADOS */}
        {loading ? (
           <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
              <span className="text-zinc-500 text-sm">Sincronizando agenda...</span>
           </div>
        ) : filtered.length === 0 ? (
           <div className="flex-1 flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/5 rounded-3xl bg-white/5">
              <div className="p-4 rounded-full bg-zinc-800/50 mb-4">
                <User className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-lg font-medium text-white">No se encontraron leads</h3>
              <p className="text-zinc-500 text-sm mt-1 max-w-xs mx-auto">
                 Intenta ajustar los filtros de búsqueda.
              </p>
              {search && (
                <button onClick={() => setSearch('')} className="mt-4 text-indigo-400 text-sm hover:underline">
                  Borrar búsqueda
                </button>
              )}
           </div>
        ) : (
          <div className="flex-1 flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 content-start">
                <AnimatePresence mode='popLayout'>
                {paginatedData.map((demo, i) => (
                    <motion.div 
                        layout
                        key={demo.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: i * 0.05, duration: 0.2 }}
                        className="group relative backdrop-blur-md border rounded-2xl p-5 transition-all duration-300 bg-zinc-900/40 border-white/5 hover:bg-zinc-800/60 hover:border-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-900/10"
                    >
                        {/* Indicador lateral de estado */}
                        <div className={clsx("absolute left-0 top-4 bottom-4 w-1 rounded-r-full opacity-50", STATUS_STYLES[demo.status]?.color.split(' ')[0].replace('text-', 'bg-'))} />

                        {/* Header Card */}
                        <div className="flex justify-between items-start mb-4 pl-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
                                    {demo.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className="text-base font-bold text-white leading-tight truncate max-w-[150px]" title={demo.name}>
                                        {demo.name}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
                                        <span className="font-mono tracking-wide">ID: {demo.id}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Botón Borrar */}
                            <button
                                onClick={() => handleDelete(demo.id)}
                                className="p-2 rounded-lg bg-zinc-800 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                title="Eliminar"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="h-px w-full bg-white/5 my-3" />

                        <div className="space-y-3 pl-3">
                            {/* Fecha */}
                            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                                <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400">
                                    <Calendar className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Fecha Cita</p>
                                    <p className="text-sm text-zinc-200 capitalize">
                                        {format(new Date(demo.scheduledAt), "EEE d MMM, h:mm a", { locale: es })}
                                    </p>
                                </div>
                            </div>

                            {/* Contacto */}
                            <div className="flex flex-col gap-2 text-sm">
                                <a href={`mailto:${demo.email}`} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors truncate">
                                    <Mail className="w-3.5 h-3.5 shrink-0" /> {demo.email}
                                </a>
                                <a href={`tel:${demo.phone}`} className="flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors">
                                    <Phone className="w-3.5 h-3.5 shrink-0" /> {demo.phone}
                                </a>
                            </div>
                        </div>
                        
                        {/* Footer Actions */}
                        <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/5 pl-3 gap-3">
                            <div className="flex-1">
                                <StatusSelect 
                                    value={demo.status} 
                                    onChange={(val) => handleStatusChange(demo.id, val)}
                                />
                            </div>
                            {/* Botón Llamar en Móvil y Desktop */}
                            <a href={`tel:${demo.phone}`} className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all" title="Llamar">
                                <Phone className="w-4 h-4" />
                            </a>
                        </div>
                    </motion.div>
                ))}
                </AnimatePresence>
              </div>
          </div>
        )}

        {/* PAGINACIÓN */}
        {filtered.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-white/5 mt-auto">
                <span className="text-xs text-zinc-500">
                    Mostrando <span className="text-white font-medium">{paginatedData.length}</span> de <span className="text-white font-medium">{filtered.length}</span> leads
                </span>
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center px-4 py-2 rounded-lg bg-zinc-900 border border-white/10 text-sm font-medium">
                        <span className="text-indigo-400">{currentPage}</span>
                        <span className="mx-2 text-zinc-600">/</span>
                        <span className="text-zinc-400">{totalPages}</span>
                    </div>

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  )
}