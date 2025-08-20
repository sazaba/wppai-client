'use client'

import { useState, useEffect } from 'react'
import { Sparkles, RotateCw } from 'lucide-react'
import axios from 'axios'
import ModalEntrenamiento from './components/ModalEntrenamiento'
import WhatsappConfig from './components/WhatsappConfig'

const API_URL = process.env.NEXT_PUBLIC_API_URL as string

type BusinessType = 'servicios' | 'productos'

interface ConfigForm {
  id?: number
  nombre: string
  descripcion: string
  servicios: string
  faq: string
  horarios: string
  businessType?: BusinessType
  disclaimers?: string
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function SettingsPage() {
  const [form, setForm] = useState<ConfigForm>({
    nombre: '',
    descripcion: '',
    servicios: '',
    faq: '',
    horarios: '',
    businessType: 'servicios',
    disclaimers: '',
  })

  const [configGuardada, setConfigGuardada] = useState<ConfigForm | null>(null)
  const [trainingActive, setTrainingActive] = useState(false)
  const [loading, setLoading] = useState(true)

  // Cargar config inicial
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/config`, { headers: getAuthHeaders() })
        if (res.data) {
          setConfigGuardada(res.data)
          setForm({
            nombre: res.data.nombre || '',
            descripcion: res.data.descripcion || '',
            servicios: res.data.servicios || '',
            faq: res.data.faq || '',
            horarios: res.data.horarios || '',
            businessType: (res.data.businessType as BusinessType) || 'servicios',
            disclaimers: res.data.disclaimers || '',
          })
        }
      } catch (err) {
        console.error('Error al cargar configuración existente:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reiniciar entrenamiento (elimina config y, opcional, catálogo)
  const reiniciarEntrenamiento = async () => {
    try {
      if (typeof window !== 'undefined') {
        const ok = window.confirm(
          '¿Reiniciar el entrenamiento?\n\nSe eliminará la configuración actual y se abrirá el asistente. ' +
            'También se eliminará el catálogo si eliges continuar.',
        )
        if (!ok) return
      }

      // 🔥 borra configuración + catálogo (cambia a false si no quieres tocar productos)
      await axios.delete(`${API_URL}/api/config`, {
        params: { withCatalog: true },
        headers: getAuthHeaders(),
      })

      // Deja el formulario vacío y abre el modal de entrenamiento
      const vacio: ConfigForm = {
        nombre: '',
        descripcion: '',
        servicios: '',
        faq: '',
        horarios: '',
        businessType: 'servicios',
        disclaimers: '',
      }

      setConfigGuardada(null)
      setForm(vacio)
      setTrainingActive(true)
    } catch (e: any) {
      console.error('[reiniciarEntrenamiento] error:', e?.response?.data || e?.message || e)
      alert('Error al reiniciar configuración')
    }
  }

  if (loading) return <p className="p-8 text-slate-300">Cargando configuración...</p>

  return (
    <div className="h-full overflow-y-auto max-h-screen px-4 sm:px-6 py-8 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white text-center">Entrenamiento de tu IA</h1>

          {/* Selector de tipo de negocio siempre visible */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-300">Tipo de negocio</label>
            <select
              value={form.businessType}
              onChange={async (e) => {
                const newType = e.target.value as BusinessType
                setForm((f) => ({ ...f, businessType: newType }))
                try {
                  // Persistimos cambio inmediato de tipo
                  const { data } = await axios.put(
                    `${API_URL}/api/config`,
                    { ...form, businessType: newType },
                    { headers: getAuthHeaders() },
                  )
                  setConfigGuardada(data || null)
                } catch (err) {
                  console.error('No se pudo actualizar businessType:', err)
                }
              }}
              className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2"
            >
              <option value="servicios">Servicios</option>
              <option value="productos">Productos</option>
            </select>
          </div>

          {!configGuardada && (
            <button
              onClick={() => setTrainingActive(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              Comenzar entrenamiento
            </button>
          )}
        </div>

        {/* Resumen */}
        {configGuardada && (
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl text-white space-y-4">
            <h2 className="text-xl font-bold">📦 Resumen de la configuración</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm break-words">
              <div>
                <strong>Nombre:</strong> {configGuardada.nombre}
              </div>
              <div>
                <strong>Descripción:</strong> {configGuardada.descripcion}
              </div>
              <div>
                <strong>Servicios/Productos:</strong> {configGuardada.servicios}
              </div>
              <div>
                <strong>FAQ:</strong> {configGuardada.faq}
              </div>
              <div>
                <strong>Horarios:</strong> {configGuardada.horarios}
              </div>
              <div>
                <strong>Tipo de negocio:</strong> {configGuardada.businessType}
              </div>
              {configGuardada.disclaimers && (
                <div className="md:col-span-2">
                  <strong>Disclaimers:</strong> {configGuardada.disclaimers}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setTrainingActive(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
              >
                <Sparkles className="w-4 h-4" />
                Actualizar entrenamiento
              </button>

              <button
                onClick={reiniciarEntrenamiento}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow"
              >
                <RotateCw className="w-4 h-4" />
                Reiniciar entrenamiento
              </button>
            </div>
          </div>
        )}

        {/* Modal de entrenamiento */}
        <ModalEntrenamiento
          trainingActive={trainingActive}
          onClose={async () => {
            setTrainingActive(false)
            try {
              const { data } = await axios.get(`${API_URL}/api/config`, { headers: getAuthHeaders() })
              setConfigGuardada(data || null)
              if (data) {
                setForm({
                  nombre: data.nombre || '',
                  descripcion: data.descripcion || '',
                  servicios: data.servicios || '',
                  faq: data.faq || '',
                  horarios: data.horarios || '',
                  businessType: (data.businessType as BusinessType) || 'servicios',
                  disclaimers: data.disclaimers || '',
                })
              }
            } catch {
              /* noop */
            }
          }}
          initialConfig={{
            ...form,
            businessType: form.businessType as BusinessType,
            disclaimers: form.disclaimers,
          }}
        />

        {/* Config WhatsApp */}
        <WhatsappConfig />
      </div>
    </div>
  )
}
