'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { 
  FiSearch, FiUser, FiCalendar, FiActivity, FiPhone, 
  FiLoader, FiDatabase, FiFilter, FiX, FiChevronDown 
} from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
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

export default function ClientsPage() {
  const { token } = useAuth()
  const [clients, setClients] = useState<ClientData[]>([])
  const [loading, setLoading] = useState(true)
  
  // --- ESTADOS DE FILTRO ---
  const [search, setSearch] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterMonth, setFilterMonth] = useState('') // 0-11 string
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [showFilters, setShowFilters] = useState(false) // Toggle para móviles si quieres ocultar

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

  // --- LÓGICA DE COMPUTADOS ---

  // 1. Obtener años disponibles dinámicamente de la data
  const availableYears = useMemo(() => {
    const years = new Set<number>()
    clients.forEach(c => {
      if (c.lastProcedureDate) {
        years.add(new Date(c.lastProcedureDate).getFullYear())
      }
    })
    return Array.from(years).sort((a, b) => b - a) // Descendente
  }, [clients])

  // 2. Filtrado Maestro
  const filtered = useMemo(() => {
    return clients.filter(c => {
      // A. Filtro Texto (Buscador)
      const matchesSearch = 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.phone.includes(search)

      if (!matchesSearch) return false

      // Si no tiene fecha y estamos filtrando por fecha, lo descartamos
      if ((filterYear || filterMonth || dateStart || dateEnd) && !c.lastProcedureDate) {
        return false
      }

      if (!c.lastProcedureDate) return true // Si no hay filtros de fecha, pasa

      const pDate = new Date(c.lastProcedureDate)

      // B. Filtro Año
      if (filterYear && pDate.getFullYear().toString() !== filterYear) {
        return false
      }

      // C. Filtro Mes
      if (filterMonth && pDate.getMonth().toString() !== filterMonth) {
        return false
      }

      // D. Filtro Rango Exacto
      if (dateStart) {
        const start = new Date(dateStart)
        // Set start to beginning of day in local time for fair comparison
        start.setHours(0,0,0,0) 
        if (pDate < start) return false
      }
      if (dateEnd) {
        const end = new Date(dateEnd)
        // Set end to end of day
        end.setHours(23,59,59,999)
        if (pDate > end) return false
      }

      return true
    })
  }, [clients, search, filterYear, filterMonth, dateStart, dateEnd])

  // Limpiar filtros
  const clearFilters = () => {
    setFilterYear('')
    setFilterMonth('')
    setDateStart('')
    setDateEnd('')
    setSearch('')
  }

  const hasActiveFilters = filterYear || filterMonth || dateStart || dateEnd

  return (
    <div className="h-full w-full bg-zinc-950 text-white p-4 md:p-8 relative overflow-y-auto whatsapp-scroll">
      
      {/* 🔮 Fondo ambiental */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-pink-600/5 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6 pb-20">
        
        {/* --- HEADER SUPERIOR --- */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <FiDatabase className="text-pink-500" />
              Base de Pacientes
            </h1>
            <p className="text-zinc-400 mt-2 text-sm">
              Historial clínico y agenda. {filtered.length} registros encontrados.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Buscador Principal */}
            <div className="relative w-full sm:w-80 group">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-pink-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Buscar nombre o celular..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500/30 outline-none transition-all placeholder:text-zinc-600"
              />
            </div>
            
            {/* Toggle Filtros (Móvil/Desktop) */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm font-medium
                ${showFilters || hasActiveFilters 
                  ? 'bg-pink-500/10 border-pink-500/30 text-pink-400' 
                  : 'bg-zinc-900/50 border-white/10 text-zinc-400 hover:text-white'}`}
            >
              <FiFilter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
              {(hasActiveFilters) && <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />}
            </button>
          </div>
        </div>

        {/* --- BARRA DE FILTROS AVANZADOS (Colapsable/Animada) --- */}
        <AnimatePresence>
          {(showFilters || hasActiveFilters) && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-4 md:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                
                {/* 1. Año */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Año</label>
                  <div className="relative">
                    <select 
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      className="w-full appearance-none bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50"
                    >
                      <option value="">Todos los años</option>
                      {availableYears.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                {/* 2. Mes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Mes</label>
                  <div className="relative">
                    <select 
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                      className="w-full appearance-none bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50"
                    >
                      <option value="">Todos los meses</option>
                      {MONTHS.map((m, idx) => (
                        <option key={idx} value={idx.toString()}>{m}</option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                {/* 3. Desde */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Desde</label>
                  <input 
                    type="date" 
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 [color-scheme:dark]"
                  />
                </div>

                {/* 4. Hasta */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Hasta</label>
                  <input 
                    type="date" 
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 [color-scheme:dark]"
                  />
                </div>

                {/* 5. Botón Reset */}
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

        {/* --- GRID DE RESULTADOS --- */}
        {loading ? (
           <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <FiLoader className="animate-spin text-pink-500 w-10 h-10" />
              <span className="text-zinc-500 text-sm">Cargando base de datos...</span>
           </div>
        ) : filtered.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-white/5 rounded-3xl bg-white/5">
              <div className="p-4 rounded-full bg-zinc-800/50 mb-4">
                <FiUser className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-lg font-medium text-white">No se encontraron pacientes</h3>
              <p className="text-zinc-500 text-sm mt-1 max-w-xs mx-auto">
                No hay resultados que coincidan con los filtros de búsqueda seleccionados.
              </p>
              {hasActiveFilters && (
                <button 
                  onClick={clearFilters}
                  className="mt-4 text-pink-400 text-sm hover:underline"
                >
                  Borrar filtros
                </button>
              )}
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {filtered.map((client, i) => (
                <motion.div 
                  layout
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  className="group relative bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:bg-zinc-800/60 hover:border-pink-500/20 hover:shadow-2xl hover:shadow-pink-900/10 transition-all duration-300"
                >
                  {/* Cabecera Card */}
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

                  {/* Separador */}
                  <div className="h-px w-full bg-white/5 my-3" />

                  {/* Detalles Procedimiento */}
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
                  
                  {/* Notas */}
                  {client.notes && (
                      <div className="mt-4 p-3 rounded-xl bg-black/20 border border-white/5 text-xs text-zinc-400 italic">
                          "{client.notes}"
                      </div>
                  )}

                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}