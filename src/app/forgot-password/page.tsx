'use client'

import { useState } from 'react'
import Link from 'next/link'
import { EnvelopeIcon, ArrowLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Conectamos con tu backend
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      // Simulamos éxito siempre por seguridad
      setSubmitted(true)
    } catch (error) {
      console.error(error)
      setSubmitted(true) // Igual mostramos éxito para no revelar correos
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 relative overflow-hidden">
      
      {/* Fondos ambientales */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl w-full max-w-md relative z-10 shadow-2xl"
      >
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                <EnvelopeIcon className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Recuperar Acceso</h1>
            <p className="text-zinc-400 text-sm mt-2">
                {!submitted ? 'Te enviaremos las instrucciones a tu correo' : 'Correo enviado'}
            </p>
        </div>

        {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-300 uppercase tracking-wider">Correo electrónico</label>
                    <div className="relative group">
                        <EnvelopeIcon className="w-5 h-5 absolute left-3 top-3 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-600"
                            placeholder="ejemplo@empresa.com"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    {loading ? 'Enviando...' : (
                        <>
                            Enviar Enlace <PaperAirplaneIcon className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>
        ) : (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center"
            >
                <p className="text-emerald-200 text-sm mb-4">
                    Si el correo <strong>{email}</strong> está registrado, recibirás un enlace mágico en los próximos minutos.
                </p>
                <p className="text-zinc-500 text-xs">
                    Revisa tu bandeja de Spam si no lo encuentras.
                </p>
            </motion.div>
        )}

        <div className="mt-8 text-center border-t border-white/5 pt-6">
            <Link href="/login" className="text-zinc-400 hover:text-white text-sm flex items-center justify-center gap-2 transition-colors group">
                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                Volver al Login
            </Link>
        </div>
      </motion.div>
    </div>
  )
}