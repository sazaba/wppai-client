'use client'

import { useAuth } from '@/app/context/AuthContext'

export default function TestAuthPage() {
  const { usuario, token, isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-xl font-bold mb-4">Test de Autenticación</h1>

        <p><strong>Autenticado:</strong> {isAuthenticated ? 'Sí' : 'No'}</p>

        {usuario && (
          <div className="mt-4 text-sm">
            <p><strong>Email:</strong> {usuario.email}</p>
            <p><strong>Rol:</strong> {usuario.rol}</p>
            <p><strong>Empresa ID:</strong> {usuario.empresaId}</p>
          </div>
        )}

        {!usuario && <p className="text-red-500 text-sm mt-2">No hay información de usuario.</p>}

        {token && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 truncate">
              <strong>Token:</strong> {token.slice(0, 30)}... (truncado)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
