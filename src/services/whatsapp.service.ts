// client/src/services/whatsapp.service.ts
import axios from 'axios'

type MediaType = 'image' | 'video'

/**
 * Envía media (imagen o video/mp4) al backend para que este lo mande a WhatsApp Cloud API.
 */
export async function sendWhatsappMedia({
    empresaId,
    to,
    url,
    type,
    caption,
    token, // opcional: si tu backend valida Bearer JWT
}: {
    empresaId: number
    to: string
    url: string
    type: MediaType
    caption?: string
    token?: string
}) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const { data } = await axios.post(
        '/api/whatsapp/media',
        { empresaId, to, url, type, caption },
        { headers }
    )
    return data
}
