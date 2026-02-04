'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircleIcon, XCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

function ActivationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMsg('Enlace inválido. No se encontró el token de activación.')
      return
    }

    const activate = async () => {
      try {
        // Llamada al endpoint que creamos en el backend
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/activate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        
        const data = await res.json()

        if (res.ok) {
          setStatus('success')
        } else {
          setStatus('error')
          setMsg(data.error || 'El enlace ha expirado o ya fue utilizado.')
        }
      } catch (error) {
        setStatus('error')
        setMsg('Error de conexión con el servidor. Intenta más tarde.')
      }
    }

    activate()
  }, [token])

  return (
    <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl max-w-md w-full text-center relative overflow-hidden">
      
      {/* Loading State */}
      {status === 'loading' && (
        <div className="flex flex-col items-center py-8">
          <div className="relative w-16 h-16 mb-6">
             <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500/30 rounded-full"></div>
             <div className="absolute top-0 left-0 w-full h-full border-4 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl text-white font-semibold animate-pulse">Verificando tu cuenta...</h2>
          <p className="text-zinc-500 text-sm mt-2">Un momento por favor</p>
        </div>
      )}

      {/* Success State */}
      {status === 'success' && (
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 ring-1 ring-emerald-500/50">
            <CheckCircleIcon className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl text-white font-bold mb-2">¡Cuenta Activada! 🚀</h2>
          <p className="text-zinc-400 mb-8 leading-relaxed">
            Tu correo ha sido confirmado exitosamente. Ya puedes acceder a la plataforma y comenzar a usar Wasaaa.
          </p>
          <Link 
            href="/login" 
            className="group w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
          >
            Ir al Login
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="flex flex-col items-center animate-in shake duration-300">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 ring-1 ring-red-500/50">
             <XCircleIcon className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl text-white font-bold mb-2">Ups, algo salió mal</h2>
          <p className="text-zinc-400 mb-8 bg-white/5 p-4 rounded-xl border border-white/5 text-sm">
            {msg}
          </p>
          <Link 
            href="/register" 
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium hover:underline underline-offset-4"
          >
            Volver a intentar el registro
          </Link>
        </div>
      )}
    </div>
  )
}

export default function ActivatePage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950 to-zinc-950" />
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />
        
        <Suspense fallback={<div className="text-zinc-500">Cargando interfaz...</div>}>
            <ActivationContent />
        </Suspense>
    </div>
  )
}