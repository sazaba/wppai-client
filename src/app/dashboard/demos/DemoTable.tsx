'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Search, Trash2, Calendar, Mail, Phone, Filter, CheckCircle2, Clock, XCircle } from 'lucide-react'
import Swal from 'sweetalert2'
import axios from 'axios'

interface DemoBooking {
  id: number
  name: string
  email: string
  phone: string
  scheduledAt: string
  status: string
  createdAt: string
}

interface DemoTableProps {
  initialData: DemoBooking[]
}

const STATUS_OPTS = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'contacted', label: 'Contactado' },
  { value: 'closed', label: 'Cerrado' }
]

export default function DemoTable({ initialData }: DemoTableProps) {
  const [demos, setDemos] = useState<DemoBooking[]>(initialData)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredDemos = demos.filter(d => {
    const matchesSearch = 
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Borrar cita?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#333',
      confirmButtonText: 'Sí, borrar',
      background: '#0F0F0F',
      color: '#fff'
    })

    if (result.isConfirmed) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/demo-booking/${id}`)
        setDemos(prev => prev.filter(d => d.id !== id))
        Swal.fire({
            title: 'Borrado',
            icon: 'success',
            background: '#0F0F0F',
            color: '#fff',
            confirmButtonColor: '#06b6d4',
            timer: 1500,
            showConfirmButton: false
        })
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar', 'error')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Buscar lead..." 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500" />
          <select 
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            {STATUS_OPTS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/30 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-950/50 text-xs uppercase font-medium text-zinc-500">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Datos</th>
                <th className="px-6 py-4">Fecha Cita</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredDemos.map((demo) => (
                <tr key={demo.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{demo.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="flex gap-2"><Mail className="w-3 h-3"/> {demo.email}</span>
                      <span className="flex gap-2"><Phone className="w-3 h-3"/> {demo.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-zinc-300 bg-zinc-800/50 px-3 py-1 rounded-lg w-fit border border-white/5">
                      <Calendar className="w-3 h-3 text-indigo-400" />
                      <span className="font-mono text-xs">
                        {format(new Date(demo.scheduledAt), "d MMM, h:mm a", { locale: es })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border ${
                        demo.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {demo.status === 'pending' ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      {demo.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(demo.id)} className="text-zinc-500 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}