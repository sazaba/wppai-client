// 🧠 SettingsPage con navegación hacia atrás reestructurada y alerta premium

'use client'

import { useState, useEffect } from "react"
import { Dialog } from "@headlessui/react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle, AlertCircle, Sparkles, RotateCw } from "lucide-react"
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface ConfigForm {
  id?: number
  nombre: string
  descripcion: string
  servicios: string
  faq: string
  horarios: string
  escalarSiNoConfia: boolean
  escalarPalabrasClave: string
  escalarPorReintentos: number
}

type CampoConfig = keyof ConfigForm

interface Pregunta {
  campo: CampoConfig
  tipo: "input" | "textarea"
  pregunta: string
}

const preguntasEntrenamiento: Pregunta[] = [
  {
    campo: "nombre",
    tipo: "input",
    pregunta: "¿Cómo se llama tu empresa? Incluye el nombre completo y si aplica, siglas o marca comercial."
  },
  {
    campo: "descripcion",
    tipo: "textarea",
    pregunta: "¿Qué hace tu empresa? Describe detalladamente a qué se dedica y qué la hace especial."
  },
  {
    campo: "servicios",
    tipo: "textarea",
    pregunta: "¿Qué servicios o productos ofreces? Sé lo más específico posible e incluye ejemplos."
  },
  {
    campo: "faq",
    tipo: "textarea",
    pregunta: "¿Qué preguntas frecuentes recibes de tus clientes? Enuméralas con posibles respuestas."
  },
  {
    campo: "horarios",
    tipo: "input",
    pregunta: "¿Cuál es tu horario de atención? Incluye días y horas."
  },
  {
    campo: "escalarPalabrasClave",
    tipo: "input",
    pregunta: "¿Qué palabras clave deberían hacer que la IA escale a un agente humano? (separadas por coma)"
  }
]

export default function SettingsPage() {
  const [form, setForm] = useState<ConfigForm>({
    nombre: "",
    descripcion: "",
    servicios: "",
    faq: "",
    horarios: "",
    escalarSiNoConfia: true,
    escalarPalabrasClave: "",
    escalarPorReintentos: 2
  })

  const [respuestaActual, setRespuestaActual] = useState<string>("")
  const [configGuardada, setConfigGuardada] = useState<ConfigForm | null>(null)
  const [trainingStep, setTrainingStep] = useState(0)
  const [trainingActive, setTrainingActive] = useState(false)
  const [showResumen, setShowResumen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${API_URL}/api/config`)
        const data = await res.json()

        if (Array.isArray(data) && data.length > 0) {
          setConfigGuardada(data[0])
        }
      } catch (err) {
        console.error("Error al cargar configuración existente:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  const avanzarPaso = async () => {
    const campo = preguntasEntrenamiento[trainingStep].campo
    const valor = respuestaActual.trim()

    if (valor === "") {
      Swal.fire({
        icon: 'warning',
        title: 'Campo vacío',
        text: 'Por favor escribe una respuesta antes de continuar.',
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#3b82f6',
        iconColor: '#facc15'
      })
      return
    }

    const nuevoForm = { ...form, [campo]: valor } as ConfigForm
    setForm(nuevoForm)
    setRespuestaActual("")

    if (trainingStep < preguntasEntrenamiento.length - 1) {
      setTrainingStep(trainingStep + 1)
    } else {
      try {
        const res = await fetch(`${API_URL}/api/config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevoForm)
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setConfigGuardada(data.config)
        setTrainingActive(false)
        setShowResumen(true)
      } catch (err) {
        alert("❌ Error al guardar configuración")
      }
    }
  }

  const retrocederPaso = () => {
    if (trainingStep > 0) {
      const pasoAnterior = trainingStep - 1
      const campo = preguntasEntrenamiento[pasoAnterior].campo
      const respuestaAnterior = form[campo as keyof ConfigForm]
      setRespuestaActual(typeof respuestaAnterior === 'string' ? respuestaAnterior : "")
      setTrainingStep(pasoAnterior)
    }
  }

  const reiniciarEntrenamiento = async () => {
    try {
      await fetch(`${API_URL}/api/config/${configGuardada?.id}`, {
        method: 'DELETE'
      })
      setConfigGuardada(null)
      setTrainingActive(true)
      setTrainingStep(0)
      setRespuestaActual("")
      setShowResumen(false)
    } catch {
      alert("Error al reiniciar configuración")
    }
  }

  if (loading) return <p className="p-8 text-slate-300">Cargando configuración...</p>

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Entrenamiento de tu IA</h1>
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

      {configGuardada && (
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl text-white space-y-4">
          <h2 className="text-xl font-bold text-white">📦 Resumen de la configuración</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong>Nombre:</strong> {configGuardada.nombre}</div>
            <div><strong>Descripción:</strong> {configGuardada.descripcion}</div>
            <div><strong>Servicios:</strong> {configGuardada.servicios}</div>
            <div><strong>FAQ:</strong> {configGuardada.faq}</div>
            <div><strong>Horarios:</strong> {configGuardada.horarios}</div>
            <div><strong>Palabras clave para escalar:</strong> {configGuardada.escalarPalabrasClave}</div>
          </div>
          <button
            onClick={reiniciarEntrenamiento}
            className="mt-4 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow"
          >
            <RotateCw className="w-4 h-4" />
            Reiniciar entrenamiento
          </button>
        </div>
      )}

      <AnimatePresence>
        {trainingActive && (
          <Dialog open={trainingActive} onClose={() => {}} className="relative z-50">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 text-white rounded-xl p-6 w-full max-w-md border border-slate-700 shadow-xl"
              >
                <Dialog.Panel>
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold">Paso {trainingStep + 1} de {preguntasEntrenamiento.length}</h2>
                    <p className="text-slate-300">{preguntasEntrenamiento[trainingStep].pregunta}</p>
                    {preguntasEntrenamiento[trainingStep].tipo === "textarea" ? (
                      <textarea
                        rows={4}
                        value={respuestaActual}
                        onChange={(e) => setRespuestaActual(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 px-3 py-2 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={respuestaActual}
                        onChange={(e) => setRespuestaActual(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 px-3 py-2 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                      />
                    )}
                    <div className="flex justify-between">
                      {trainingStep > 0 && (
                        <button
                          onClick={retrocederPaso}
                          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg shadow"
                        >
                          Atrás
                        </button>
                      )}
                      <button
                        onClick={avanzarPaso}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
                      >
                        {trainingStep < preguntasEntrenamiento.length - 1 ? 'Siguiente' : 'Finalizar'}
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </motion.div>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}
