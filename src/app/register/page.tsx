'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

export default function RegisterPage() {
  const router = useRouter()

  const [nombreEmpresa, setNombreEmpresa] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreEmpresa, email, password }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        setError(error || 'Error al registrar')
        setLoading(false)
        return
      }

      const { token } = await res.json()

      localStorage.setItem('token', token)

      // 🔹 Mostrar mensaje de bienvenida
      await Swal.fire({
        title: `¡Bienvenido a Wasaaa! 🎉`,
        html: `
          <p>Tu empresa <strong>${nombreEmpresa}</strong> ha sido registrada con éxito.</p>
          <p>Estás en el <strong>Plan Gratis</strong> con 100 mensajes y 30 días de prueba.</p>
          <ul style="text-align:left; margin-top:10px;">
            <li>✅ Respuestas automáticas con IA</li>
            <li>✅ Clasificación de conversaciones</li>
            <li>✅ Conexión con WhatsApp Business</li>
          </ul>
        `,
        icon: 'success',
        confirmButtonText: 'Ir al Dashboard 🚀',
        background: '#1e1e1e',
        color: '#fff',
        confirmButtonColor: '#2563eb'
      })

      // Redirigir al dashboard después del mensaje
      router.push('/dashboard')

    } catch (err) {
      setError('Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Registro de Empresa</h1>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre de la empresa</label>
          <input
            type="text"
            value={nombreEmpresa}
            onChange={(e) => setNombreEmpresa(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Correo</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500 text-sm"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
    </div>
  )
}
