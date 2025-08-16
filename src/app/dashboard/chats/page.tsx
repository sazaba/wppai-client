'use client'

import { useState } from 'react'
import ChatInput from './components/ChatInput'
import { sendWhatsappMedia, sendOutboundMessage } from '../../../services/whatsapp.service'

export default function ChatsPage() {
  const [respuesta, setRespuesta] = useState('')
  const [activoId, setActivoId] = useState<number | null>(null)
  const [chats, setChats] = useState<any[]>([])

  // ⚠️ Ajusta según tu lógica real (probablemente venga del AuthContext o props)
  const empresaId = 1
  const token: string | undefined = undefined // ej: useAuth()?.token
  const chatPhone = chats.find((c) => c.id === activoId)?.telefono || ''

  // 👉 Enviar texto normal (usa el service del frontend contra /api/whatsapp/enviar-prueba)
  const handleSendMessage = async () => {
    const body = respuesta.trim()
    if (!body) return
    if (!chatPhone) {
      console.warn('No hay número para este chat activo')
      return
    }
    try {
      await sendOutboundMessage({
        empresaId,
        to: chatPhone,
        body,
        token, // opcional si tu backend exige Bearer
      })
      setRespuesta('')
    } catch (err) {
      console.error('❌ Error enviando mensaje:', err)
    }
  }

  // 👉 Enviar media (imagen o video/mp4 para GIFs)
  const handleSendMedia = async ({
    url,
    type,
  }: {
    url: string
    type: 'image' | 'video'
  }) => {
    if (!chatPhone) {
      console.warn('No hay número para este chat activo')
      return
    }
    try {
      await sendWhatsappMedia({ empresaId, to: chatPhone, url, type, token })
      console.log('✅ Media enviada:', url)
    } catch (err) {
      console.error('❌ Error enviando media:', err)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Aquí va tu header, sidebar, lista de mensajes... */}

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
