'use client'

import { useState, useEffect } from "react"
import { Sparkles, RotateCw } from "lucide-react"
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import ModalEntrenamiento from "./components/ModalEntrenamiento"
import axios from "axios"
import WhatsappConfig from "./components/WhatsappConfig"

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

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/config`, { headers })
        if (Array.isArray(res.data) && res.data.length > 0) {
          setConfigGuardada(res.data[0])
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
        const res = await axios.post(`${API_URL}/api/config`, nuevoForm, { headers })
        setConfigGuardada(res.data.config)
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
      await axios.delete(`${API_URL}/api/config/${configGuardada?.id}`, { headers })
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
    <div className="h-full overflow-y-auto px-6 py-8 scrollbar scrollbar-thumb-zinc-700 scrollbar-track-transparent">
      <div className="space-y-6">
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

        <ModalEntrenamiento
          trainingActive={trainingActive}
          trainingStep={trainingStep}
          setTrainingStep={setTrainingStep}
          respuestaActual={respuestaActual}
          setRespuestaActual={setRespuestaActual}
          avanzarPaso={avanzarPaso}
          retrocederPaso={retrocederPaso}
          preguntas={preguntasEntrenamiento}
        />

        <WhatsappConfig />
      </div>
    </div>
  )
}
