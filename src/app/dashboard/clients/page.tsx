'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { 
  FiSearch, FiUser, FiCalendar, FiActivity, FiPhone, 
  FiLoader, FiDatabase, FiFilter, FiX, FiChevronDown, 
  FiDownload, FiChevronLeft, FiChevronRight, FiUserPlus, FiSave 
} from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import * as XLSX from 'xlsx' 
import Swal from 'sweetalert2' // Asegúrate de tener sweetalert2 instalado
import { useAuth } from '../../context/AuthContext'

interface ClientData {
  id: number
  name: string
  phone: string
  lastProcedure: string | null
  lastProcedureDate: string
  notes: string | null
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const ITEMS_PER_PAGE = 9 

export default function ClientsPage() {
  const { token } = useAuth()
  const [clients, setClients] = useState<ClientData[]>([])
  const [loading, setLoading] = useState(true)
  
  // --- ESTADOS DE FILTRO ---
  const [search, setSearch] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterMonth, setFilterMonth] = useState('') 
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // --- ESTADO PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1)

  // --- ESTADO CREAR CLIENTE (NUEVO) ---
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    procedure: '',
    date: new Date().toISOString().split('T')[0], // Fecha de hoy por defecto
    notes: ''
  })

  // Cargar clientes
  useEffect(() => {
    if (!token) return
    const fetchClients = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/clients`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.ok) {
          setClients(data.data)
        }
      } catch (err) {
        console.error('Error cargando clientes:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchClients()
  }, [token])

  // --- COMPUTADOS ---
  const availableYears = useMemo(() => {
    const years = new Set<number>()
    clients.forEach(c => {
      if (c.lastProcedureDate) {
        years.add(new Date(c.lastProcedureDate).getFullYear())
      }
    })
    return Array.from(years).sort((a, b) => b - a)
  }, [clients])

  const filtered = useMemo(() => {
    return clients.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.phone.includes(search)

      if (!matchesSearch) return false

      if ((filterYear || filterMonth || dateStart || dateEnd) && !c.lastProcedureDate) {
        return false
      }

      if (!c.lastProcedureDate) return true

      const pDate = new Date(c.lastProcedureDate)

      if (filterYear && pDate.getFullYear().toString() !== filterYear) return false
      if (filterMonth && pDate.getMonth().toString() !== filterMonth) return false
      
      if (dateStart) {
        const start = new Date(dateStart)
        start.setHours(0,0,0,0) 
        if (pDate < start) return false
      }
      if (dateEnd) {
        const end = new Date(dateEnd)
        end.setHours(23,59,59,999)
        if (pDate > end) return false
      }

      return true
    })
  }, [clients, search, filterYear, filterMonth, dateStart, dateEnd])

  useEffect(() => {
    setCurrentPage(1)
  }, [filtered.length, search, filterYear, filterMonth, dateStart, dateEnd])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return filtered.slice(start, end)
  }, [filtered, currentPage])

  // --- FUNCIONES ---

  const clearFilters = () => {
    setFilterYear('')
    setFilterMonth('')
    setDateStart('')
    setDateEnd('')
    setSearch('')
  }

  const handleExportExcel = () => {
    if (filtered.length === 0) return
    const dataToExport = filtered.map(c => ({
      ID: c.id,
      Nombre: c.name,
      Teléfono: c.phone,
      'Último Procedimiento': c.lastProcedure || 'N/A',
      'Fecha Procedimiento': c.lastProcedureDate ? new Date(c.lastProcedureDate).toLocaleDateString('es-CO') : 'N/A',
      Notas: c.notes || ''
    }))
    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Pacientes")
    XLSX.writeFile(wb, `Pacientes_Export_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // --- FUNCIÓN CREAR CLIENTE ---
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    if (!newClient.name.trim() || !newClient.phone.trim()) {
        Swal.fire({
            icon: 'warning',
            title: 'Faltan datos',
            text: 'El nombre y el teléfono son obligatorios.',
            background: '#09090b',
            color: '#fff'
        })
        return
    }

    setCreating(true)
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/clients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newClient)
        })

        const data = await res.json()

        if (res.ok) {
            // Actualizar lista localmente (Optimistic update o usando la respuesta)
            // Asumimos que data.data o data devuelve el cliente creado con su ID
            const createdClient = data.data || data 
            
            // Agregamos al principio de la lista
            setClients(prev => [createdClient, ...prev])
            
            Swal.fire({
                icon: 'success',
                title: 'Guardado',
                text: 'El paciente ha sido registrado correctamente.',
                background: '#09090b',
                color: '#fff',
                timer: 2000,
                showConfirmButton: false
            })

            // Resetear y cerrar
            setNewClient({
                name: '',
                phone: '',
                procedure: '',
                date: new Date().toISOString().split('T')[0],
                notes: ''
            })
            setShowCreateModal(false)
        } else {
            throw new Error(data.message || 'Error al guardar')
        }

    } catch (error: any) {
        console.error(error)
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'No se pudo crear el paciente',
            background: '#09090b',
            color: '#fff'
        })
    } finally {
        setCreating(false)
    }
  }

  const hasActiveFilters = filterYear || filterMonth || dateStart || dateEnd

  return (
    <div className="h-full w-full bg-zinc-950 text-white p-4 md:p-8 relative overflow-y-auto whatsapp-scroll flex flex-col">
      
      {/* Fondo ambiental */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-pink-600/5 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6 w-full flex-1 flex flex-col">
        
        {/* HEADER SUPERIOR */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <FiDatabase className="text-pink-500" />
              Base de Pacientes
            </h1>
            <p className="text-zinc-400 mt-2 text-sm">
              Historial clínico y agenda. {filtered.length} registros encontrados.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
            {/* Buscador */}
            <div className="relative w-full sm:w-64 group">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-pink-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Buscar..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500/30 outline-none transition-all placeholder:text-zinc-600"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
                {/* Botón Filtros */}
                <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm font-medium flex-1 sm:flex-none
                    ${showFilters || hasActiveFilters 
                    ? 'bg-pink-500/10 border-pink-500/30 text-pink-400' 
                    : 'bg-zinc-900/50 border-white/10 text-zinc-400 hover:text-white'}`}
                >
                <FiFilter className="w-4 h-4" />
                <span className="hidden md:inline">Filtros</span>
                {(hasActiveFilters) && <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />}
                </button>

                {/* Botón Excel */}
                <button 
                onClick={handleExportExcel}
                disabled={filtered.length === 0}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
                >
                <FiDownload className="w-4 h-4" />
                <span className="hidden md:inline">Excel</span>
                </button>

                {/* BOTÓN NUEVO PACIENTE (NUEVO) */}
                <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 transition-all transform hover:-translate-y-0.5 text-sm font-bold flex-1 sm:flex-none"
                >
                <FiUserPlus className="w-4 h-4" />
                <span className="whitespace-nowrap">Nuevo Paciente</span>
                </button>
            </div>
          </div>
        </div>

        {/* BARRA DE FILTROS AVANZADOS */}
        <AnimatePresence>
          {(showFilters || hasActiveFilters) && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-4 md:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end mb-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Año</label>
                  <div className="relative">
                    <select 
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      className="w-full appearance-none bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50"
                    >
                      <option value="">Todos</option>
                      {availableYears.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Mes</label>
                  <div className="relative">
                    <select 
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                      className="w-full appearance-none bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50"
                    >
                      <option value="">Todos</option>
                      {MONTHS.map((m, idx) => (
                        <option key={idx} value={idx.toString()}>{m}</option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Desde</label>
                  <input 
                    type="date" 
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 [color-scheme:dark]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Hasta</label>
                  <input 
                    type="date" 
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 [color-scheme:dark]"
                  />
                </div>

                <button 
                  onClick={clearFilters}
                  disabled={!hasActiveFilters && !search}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-[42px]"
                >
                  <FiX className="w-4 h-4" />
                  <span className="text-sm">Limpiar</span>
                </button>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GRID DE RESULTADOS */}
        {loading ? (
           <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
              <FiLoader className="animate-spin text-pink-500 w-10 h-10" />
              <span className="text-zinc-500 text-sm">Cargando base de datos...</span>
           </div>
        ) : filtered.length === 0 ? (
           <div className="flex-1 flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/5 rounded-3xl bg-white/5">
              <div className="p-4 rounded-full bg-zinc-800/50 mb-4">
                <FiUser className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-lg font-medium text-white">No se encontraron pacientes</h3>
              <p className="text-zinc-500 text-sm mt-1 max-w-xs mx-auto">
                No hay resultados para esta búsqueda.
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="mt-4 text-pink-400 text-sm hover:underline">
                  Borrar filtros
                </button>
              )}
           </div>
        ) : (
          <div className="flex-1 flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 content-start">
                <AnimatePresence mode='wait'>
                {paginatedClients.map((client, i) => (
                    <motion.div 
                    layout
                    key={client.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                    className="group relative bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:bg-zinc-800/60 hover:border-pink-500/20 hover:shadow-2xl hover:shadow-pink-900/10 transition-all duration-300"
                    >
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-white/5 group-hover:border-pink-500/30 transition-colors">
                            <span className="text-sm font-bold text-zinc-300 group-hover:text-pink-400">
                                {client.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white leading-tight truncate max-w-[150px]" title={client.name}>
                                {client.name}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
                                <FiPhone className="w-3 h-3" />
                                <span className="font-mono tracking-wide">{client.phone}</span>
                            </div>
                        </div>
                        </div>
                    </div>

                    <div className="h-px w-full bg-white/5 my-3" />

                    <div className="space-y-3">
                        <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 p-1 rounded bg-pink-500/10 text-pink-400">
                            <FiActivity className="w-3 h-3" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Último Procedimiento</p>
                            <p className="text-sm text-zinc-200 font-medium line-clamp-1">
                                {client.lastProcedure || 'No registrado'}
                            </p>
                        </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                        <div className="p-1 rounded bg-zinc-800 text-zinc-400">
                            <FiCalendar className="w-3 h-3" />
                        </div>
                        <span className="text-xs text-zinc-400">
                            {client.lastProcedureDate 
                                ? new Date(client.lastProcedureDate).toLocaleDateString('es-CO', { 
                                    year: 'numeric', month: 'long', day: 'numeric' 
                                })
                                : 'Fecha desconocida'
                            }
                        </span>
                        </div>
                    </div>
                    
                    {client.notes && (
                        <div className="mt-4 p-3 rounded-xl bg-black/20 border border-white/5 text-xs text-zinc-400 italic">
                            "{client.notes}"
                        </div>
                    )}
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
                    Mostrando <span className="text-white font-medium">{paginatedClients.length}</span> de <span className="text-white font-medium">{filtered.length}</span> resultados
                </span>
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <FiChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center px-4 py-2 rounded-lg bg-zinc-900 border border-white/10 text-sm font-medium">
                        <span className="text-pink-400">{currentPage}</span>
                        <span className="mx-2 text-zinc-600">/</span>
                        <span className="text-zinc-400">{totalPages}</span>
                    </div>

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <FiChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )}

      </div>

      {/* --- MODAL CREAR CLIENTE (NUEVO) --- */}
      <AnimatePresence>
        {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowCreateModal(false)}
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                />
                
                {/* Modal Content */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative z-10 w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header Modal */}
                    <div className="flex items-center justify-between p-5 border-b border-white/5 bg-zinc-900/50">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <FiUserPlus className="text-indigo-500" />
                            Nuevo Paciente
                        </h3>
                        <button 
                            onClick={() => setShowCreateModal(false)}
                            className="text-zinc-400 hover:text-white transition-colors"
                        >
                            <FiX className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleCreateClient} className="p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Nombre Completo <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <input 
                                    type="text" 
                                    value={newClient.name}
                                    onChange={e => setNewClient({...newClient, name: e.target.value})}
                                    placeholder="Ej. Juan Pérez"
                                    className="w-full bg-zinc-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Teléfono <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <input 
                                    type="text" 
                                    value={newClient.phone}
                                    onChange={e => setNewClient({...newClient, phone: e.target.value})}
                                    placeholder="Ej. +57 300 123 4567"
                                    className="w-full bg-zinc-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Procedimiento</label>
                                <div className="relative">
                                    <FiActivity className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input 
                                        type="text" 
                                        value={newClient.procedure}
                                        onChange={e => setNewClient({...newClient, procedure: e.target.value})}
                                        placeholder="Ej. Botox"
                                        className="w-full bg-zinc-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Fecha</label>
                                <div className="relative">
                                    <input 
                                        type="date" 
                                        value={newClient.date}
                                        onChange={e => setNewClient({...newClient, date: e.target.value})}
                                        className="w-full bg-zinc-950/50 border border-white/10 rounded-xl pl-4 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 outline-none [color-scheme:dark]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Notas Adicionales</label>
                            <textarea 
                                rows={3}
                                value={newClient.notes}
                                onChange={e => setNewClient({...newClient, notes: e.target.value})}
                                placeholder="Detalles importantes del paciente..."
                                className="w-full bg-zinc-950/50 border border-white/10 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 outline-none resize-none"
                            />
                        </div>

                        <div className="pt-4 flex gap-3 justify-end">
                            <button 
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="px-5 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit"
                                disabled={creating}
                                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 transition-all text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {creating ? <FiLoader className="animate-spin" /> : <FiSave />}
                                {creating ? 'Guardando...' : 'Guardar Paciente'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  )
}