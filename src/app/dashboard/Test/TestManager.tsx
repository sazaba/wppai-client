"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { 
  FlaskConical, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Loader2 
} from "lucide-react"

// URL base (debe coincidir con tu .env)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

interface TestItem {
  id: number
  nombre: string
  createdAt: string
}

export default function TestManager() {
  const [items, setItems] = useState<TestItem[]>([])
  const [newName, setNewName] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Helper para obtener headers con token
  const getHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : ""
    return { Authorization: `Bearer ${token}` }
  }

  // 1. Listar (GET)
  const fetchItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API_URL}/api/test`, { headers: getHeaders() })
      setItems(res.data)
    } catch (err: any) {
      console.error(err)
      setError("Error cargando datos. Revisa la consola.")
    } finally {
      setLoading(false)
    }
  }

  // 2. Crear (POST)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      await axios.post(
        `${API_URL}/api/test`, 
        { nombre: newName }, 
        { headers: getHeaders() }
      )
      setNewName("")
      fetchItems() // Recargar lista
    } catch (err: any) {
      console.error(err)
      setError("Error al crear. ¿Estás logueado?")
    } finally {
      setSubmitting(false)
    }
  }

  // 3. Eliminar (DELETE)
  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que quieres borrar este test?")) return

    try {
      await axios.delete(`${API_URL}/api/test/${id}`, { headers: getHeaders() })
      setItems(prev => prev.filter(item => item.id !== id))
    } catch (err: any) {
      console.error(err)
      alert("Error al eliminar")
    }
  }

  // Cargar al inicio
  useEffect(() => {
    fetchItems()
  }, [])

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-white/10 pb-6">
        <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
          <FlaskConical className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Zona de Pruebas</h1>
          <p className="text-zinc-400">Prueba de conexión Prisma + MySQL</p>
        </div>
        <button 
          onClick={fetchItems}
          className="ml-auto p-2 text-zinc-500 hover:text-white bg-white/5 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Formulario de Creación */}
      <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input 
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Escribe un nombre para el test..."
            className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button 
            type="submit" 
            disabled={submitting || !newName}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            <span>Crear</span>
          </button>
        </form>
        {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <XCircle className="w-4 h-4" /> {error}
            </div>
        )}
      </div>

      {/* Lista de Items */}
      <div className="space-y-3">
        {items.length === 0 && !loading && (
            <div className="text-center py-12 text-zinc-500">
                No hay registros creados aún.
            </div>
        )}

        {items.map((item) => (
          <div 
            key={item.id} 
            className="group flex items-center justify-between p-4 bg-zinc-900/30 hover:bg-zinc-800/50 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-xs font-mono">
                {item.id}
              </div>
              <div>
                <h3 className="text-white font-medium">{item.nombre}</h3>
                <p className="text-xs text-zinc-500">
                    {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <button 
              onClick={() => handleDelete(item.id)}
              className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}