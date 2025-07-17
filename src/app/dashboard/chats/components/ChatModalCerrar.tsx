'use client'

interface ChatModalCerrarProps {
  onClose: () => void
  onConfirm: () => void
}

export default function ChatModalCerrar({ onClose, onConfirm }: ChatModalCerrarProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-[#111B21] border border-[#2A3942] rounded-xl p-6 w-full max-w-sm shadow-xl text-white">
        <h2 className="text-lg font-bold mb-2">¿Cerrar conversación?</h2>
        <p className="text-sm text-[#8696a0] mb-4">
          No se podrán enviar más mensajes una vez cerrada.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-[#2A3942] text-[#E9EDEF] hover:bg-[#202C33] transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="px-4 py-2 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white transition"
          >
            Confirmar cierre
          </button>
        </div>
      </div>
    </div>
  )
}
