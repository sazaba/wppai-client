'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LockClosedIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import Link from 'next/link'

// Componente interno para manejar los Params (Obligatorio en Next.js App Router)
function ResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirm) {
        setStatus('error')
        setErrorMsg('Las contraseñas no coinciden')
        return
    }
    if (password.length < 6) {
        setStatus('error')
        setErrorMsg('La contraseña debe tener al menos 6 caracteres')
        return
    }

    setLoading(true)
    setStatus('idle')

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setTimeout(() => router.push('/login'), 3000)
      } else {
        setStatus('error')
        setErrorMsg(data.error || 'El enlace ha expirado o es inválido.')
      }
    } catch (error) {
      setStatus('error')
      setErrorMsg('Error de conexión. Intenta más tarde.')
    } finally {
      setLoading(false)
    }
  }

  // Si no hay token en la URL
  if (!token) {
      return (
        <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Enlace inválido</h2>
            <p className="text-zinc-400 mb-6">No se encontró el código de seguridad.</p>
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300">Ir al Login</Link>
        </div>
      )
  }

  // Vista de éxito
  if (status === 'success') {
      return (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-emerald-500/50">
                <CheckCircleIcon className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">¡Contraseña Actualizada!</h2>
            <p className="text-zinc-400">Todo listo. Te estamos redirigiendo...</p>
        </motion.div>
      )
  }

  return (
    <>
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white">Nueva Contraseña 🔐</h1>
            <p className="text-zinc-400 text-sm mt-2">Crea una contraseña segura para tu cuenta</p>
        </div>

        {status === 'error' && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-xl p-3 mb-6 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5" />
                {errorMsg}
            </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300 uppercase tracking-wider">Nueva Contraseña</label>
                <div className="relative group">
                    <LockClosedIcon className="w-5 h-5 absolute left-3 top-3 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                        type="password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-zinc-600" 
                        required 
                        placeholder="••••••••" 
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300 uppercase tracking-wider">Confirmar Contraseña</label>
                <div className="relative group">
                    <LockClosedIcon className="w-5 h-5 absolute left-3 top-3 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                        type="password" 
                        value={confirm} 
                        onChange={e => setConfirm(e.target.value)}
                        className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-zinc-600" 
                        required 
                        placeholder="••••••••" 
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
                {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
            </button>
        </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950 to-zinc-950" />
        
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl w-full max-w-md relative z-10 shadow-2xl">
            <Suspense fallback={<div className="text-white text-center py-10">Cargando...</div>}>
                <ResetForm />
            </Suspense>
        </div>
    </div>
  )
}