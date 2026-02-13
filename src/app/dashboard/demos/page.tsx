'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import DemoTable from './DemoTable'

export default function DemosPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtenemos los datos frescos
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/demo-booking`)
        setData(res.data)
      } catch (error) {
        console.error("Error cargando demos:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center text-zinc-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm">Cargando agenda...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">Leads & Demos 📅</h1>
        <p className="text-zinc-400 text-sm">
          Solicitudes de auditoría agendadas desde la Landing Page.
        </p>
      </div>
      <DemoTable initialData={data} />
    </div>
  )
}