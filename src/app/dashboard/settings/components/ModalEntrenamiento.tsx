'use client'

import { Dialog } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'

interface Pregunta {
    campo: string
    tipo: 'input' | 'textarea'
    pregunta: string
  }
  

interface ModalEntrenamientoProps {
  trainingActive: boolean
  trainingStep: number
  setTrainingStep: (step: number) => void
  respuestaActual: string
  setRespuestaActual: (valor: string) => void
  avanzarPaso: () => void
  retrocederPaso: () => void
  preguntas: Pregunta[]
}

export default function ModalEntrenamiento({
  trainingActive,
  trainingStep,
  setTrainingStep,
  respuestaActual,
  setRespuestaActual,
  avanzarPaso,
  retrocederPaso,
  preguntas
}: ModalEntrenamientoProps) {
  const preguntaActual = preguntas[trainingStep]

  return (
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
                  <h2 className="text-lg font-bold">
                    Paso {trainingStep + 1} de {preguntas.length}
                  </h2>
                  <p className="text-slate-300">{preguntaActual.pregunta}</p>

                  {preguntaActual.tipo === 'textarea' ? (
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
                      {trainingStep < preguntas.length - 1 ? 'Siguiente' : 'Finalizar'}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
