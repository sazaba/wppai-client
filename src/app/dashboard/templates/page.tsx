'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Trash2, RefreshCw, CheckCircle, Clock, XCircle } from 'lucide-react'
import Swal from 'sweetalert2'

interface MessageTemplate {
  id: number
  nombre: string
  idioma: string
  categoria: string
  cuerpo: string
  estado: string
  variables: number
  createdAt: string
}

export default function TemplatesPage() {
  const [plantillas, setPlantillas] = useState<MessageTemplate[]>([])
  const [form, setForm] = useState({
    nombre: '',
    idioma: 'es',
    categoria: 'ALERT_UPDATE',
    cuerpo: ''
  })
  const [sendingId, setSendingId] = useState<number | null>(null)
  const [checkingId, setCheckingId] = useState<number | null>(null)

  const fetchTemplates = async () => {
    try {
      const res = await axios.get('/api/templates')
      setPlantillas(res.data)
    } catch (error) {
      console.error('Error al cargar plantillas', error)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post('/api/templates', form)
      await fetchTemplates()
      setForm({ nombre: '', idioma: 'es', categoria: 'ALERT_UPDATE', cuerpo: '' })
      Swal.fire('Éxito', 'Plantilla creada correctamente', 'success')
    } catch (error) {
      console.error(error)
      Swal.fire('Error', 'No se pudo crear la plantilla', 'error')
    }
  }

  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar plantilla?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    })

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`/api/templates/${id}`)
        await fetchTemplates()
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar la plantilla', 'error')
      }
    }
  }

  const enviarAMeta = async (id: number) => {
    const confirm = await Swal.fire({
      title: '¿Enviar esta plantilla a Meta?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar'
    })

    if (confirm.isConfirmed) {
      try {
        setSendingId(id)
        Swal.fire({ title: 'Enviando...', didOpen: () => Swal.showLoading(), allowOutsideClick: false })

        await axios.post(`/api/templates/${id}/enviar`)
        await fetchTemplates()
        Swal.close()
        Swal.fire('Enviado', 'La plantilla fue enviada a Meta', 'success')
      } catch (error: any) {
        console.error(error)
        Swal.close()
        Swal.fire('Error', 'Meta rechazó la plantilla', 'error')
      } finally {
        setSendingId(null)
      }
    }
  }

  const consultarEstado = async (id: number) => {
    try {
      setCheckingId(id)
      Swal.fire({ title: 'Consultando estado...', didOpen: () => Swal.showLoading(), allowOutsideClick: false })

      const res = await axios.get(`/api/templates/${id}/estado`)
      await fetchTemplates()
      Swal.close()

      Swal.fire('Estado actualizado', `Meta devolvió: ${res.data.estado}`, 'info')
    } catch (error) {
      console.error(error)
      Swal.close()
      Swal.fire('Error', 'No se pudo consultar el estado en Meta', 'error')
    } finally {
      setCheckingId(null)
    }
  }

  const renderEstado = (estado: string) => {
    const estadoLower = estado.toLowerCase()
    if (estadoLower.includes('approved')) {
      return <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle size={16} /> Aprobado</span>
    }
    if (estadoLower.includes('rejected')) {
      return <span className="flex items-center gap-1 text-red-600 text-sm"><XCircle size={16} /> Rechazado</span>
    }
    if (estadoLower.includes('in_review') || estadoLower.includes('pending')) {
      return <span className="flex items-center gap-1 text-yellow-500 text-sm"><Clock size={16} /> En revisión</span>
    }
    return <span className="text-gray-500 text-sm capitalize">{estado}</span>
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Plantillas de Mensaje</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
        <input
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          placeholder="Nombre interno"
          className="w-full border px-3 py-2 rounded"
          required
        />

        <select name="idioma" value={form.idioma} onChange={handleChange} className="w-full border px-3 py-2 rounded">
          <option value="es">Español</option>
          <option value="en">Inglés</option>
        </select>

        <select name="categoria" value={form.categoria} onChange={handleChange} className="w-full border px-3 py-2 rounded">
          <option value="ALERT_UPDATE">Alerta</option>
          <option value="TRANSACTIONAL">Transaccional</option>
          <option value="MARKETING">Marketing</option>
        </select>

        <textarea
          name="cuerpo"
          value={form.cuerpo}
          onChange={handleChange}
          placeholder="Ej: Hola {{1}}, tu pedido está listo"
          className="w-full border px-3 py-2 rounded"
          rows={3}
          required
        />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Crear Plantilla
        </button>
      </form>

      <hr className="my-6" />

      <div className="space-y-2">
        {plantillas.map((p) => (
          <div key={p.id} className="border p-3 rounded flex justify-between items-start bg-white shadow">
            <div>
              <p className="font-semibold">{p.nombre}</p>
              <p className="text-sm text-gray-500">{p.idioma} • {p.categoria}</p>
              <p className="text-sm mt-1">{p.cuerpo}</p>
              <div className="text-xs mt-1 text-gray-500 flex items-center gap-2">
                <span>Vars: {p.variables}</span>
                <span>•</span>
                {renderEstado(p.estado)}
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 text-sm">
                <Trash2 size={18} />
              </button>
              <button
                onClick={() => enviarAMeta(p.id)}
                disabled={sendingId === p.id}
                className="text-blue-600 hover:text-blue-800 text-sm underline disabled:opacity-50"
              >
                Enviar a Meta
              </button>
              <button
                onClick={() => consultarEstado(p.id)}
                disabled={checkingId === p.id}
                className="text-gray-600 hover:text-gray-800 text-sm underline disabled:opacity-50 flex items-center gap-1"
              >
                <RefreshCw size={14} /> Consultar estado
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
