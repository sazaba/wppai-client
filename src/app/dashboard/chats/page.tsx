'use client'

import { useState } from 'react'
import ChatInput from './components/ChatInput'
import { sendWhatsappMedia } from '../../../services/whatsapp.service'

export default function ChatsPage() {
  const [respuesta, setRespuesta] = useState('')
  const [activoId, setActivoId] = useState<number | null>(null)
  const [chats, setChats] = useState<any[]>([])

  // ⚠️ Ajusta según tu lógica real (probablemente venga del AuthContext o props)
  const empresaId = 1 
  const chatPhone = chats.find(c => c.id === activoId)?.telefono || ''

  // 👉 Enviar texto normal
  const handleSendMessage = async () => {
    if (!respuesta.trim()) return
    try {
      console.log('✉️ Enviar texto:', respuesta)
      // Aquí pones tu lógica actual de enviar mensaje de texto al backend
      setRespuesta('')
    } catch (err) {
      console.error('❌ Error enviando mensaje:', err)
    }
  }

  // 👉 Enviar media (imagen o video/gif)
  const handleSendMedia = async ({
    url,
    type,
  }: {
    url: string
    type: 'image' | 'video'
  }) => {
    try {
      await sendWhatsappMedia({ empresaId, to: chatPhone, url, type })
      console.log('✅ Media enviada:', url)
    } catch (err) {
      console.error('❌ Error enviando media:', err)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Aquí va tu header, sidebar, mensajes... */}

      <ChatInput
        value={respuesta}
        onChange={setRespuesta}
        onSend={handleSendMessage}
        onSendGif={(url, isMp4) =>
          handleSendMedia({
            url,
            type: isMp4 ? 'video' : 'image',
          })
        }
        disabled={chats.find((c) => c.id === activoId)?.estado === 'cerrado'}
      />
    </div>
  )
}
