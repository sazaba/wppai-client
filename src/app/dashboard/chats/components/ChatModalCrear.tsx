'use client'
import { useState } from 'react'

interface Props {
  onClose: () => void
  onCreate: (data: { nombre?: string; phone: string }) => void
}

export default function ChatModalCrear({ onClose, onCreate }: Props) {
  const [nombre, setNombre] = useState('')
  const [phone, setPhone] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) return
    onCreate({ nombre, phone })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white text-black p-6 rounded-lg w-80">
        <h2 className="text-lg font-bold mb-4">Nueva conversación</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">
            Nombre (opcional):
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
            />
          </label>
          <label className="block mb-4">
            Teléfono:
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full mt-1 p-2 border rounded"
            />
          </label>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-300 rounded">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-green-600 text-white rounded">
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
