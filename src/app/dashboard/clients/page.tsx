'use client'

import React, { useEffect, useState } from 'react'
import { FiSearch, FiUser, FiCalendar, FiActivity, FiPhone, FiLoader, FiDatabase } from 'react-icons/fi'
import { motion } from 'framer-motion'

import { useAuth } from '../../context/AuthContext' 


interface ClientData {
  id: number
  name: string
  phone: string
  lastProcedure: string | null
  lastProcedureDate: string
  notes: string | null
}

export default function ClientsPage() {
  const { token } = useAuth()
  const [clients, setClients] = useState<ClientData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Cargar clientes al montar el componente
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

  // Lógica de filtrado (Nombre o Teléfono)
  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  )

  return (
    <div className="h-full w-full bg-zinc-950 text-white p-6 md:p-10 relative overflow-y-auto whatsapp-scroll">
      
      {/* 🔮 Fondo ambiental */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 fixed">
         <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-pink-600/5 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8 pb-20">
        
        {/* Header y Buscador */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <FiDatabase className="text-pink-500" />
              Base de Pacientes
            </h1>
            <p className="text-zinc-400 mt-2 text-sm">
              Gestión histórica de procedimientos y datos de contacto.
            </p>
          </div>
          
          <div className="relative w-full md:w-80 group">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-pink-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o celular..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500/30 outline-none transition-all placeholder:text-zinc-600"
            />
          </div>
        </div>

        {/* Grid de Resultados */}
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
              <p className="text-zinc-500 text-sm mt-1">Intenta con otro término de búsqueda.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((client, i) => (
              <motion.div 
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
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
                
                {/* Notas si existen */}
                {client.notes && (
                    <div className="mt-4 p-3 rounded-xl bg-black/20 border border-white/5 text-xs text-zinc-400 italic">
                        "{client.notes}"
                    </div>
                )}

              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}