// client/src/services/whatsapp.service.ts
import axios from 'axios'

export type MediaType = 'image' | 'video'

export type OutboundResult = {
    ok?: boolean
    type?: 'text' | 'template' | 'media'
    data?: any
    outboundId?: string | null
}

// ===== Estado (opcional pero útil para obtener phoneNumberId) =====
export async function getWhatsappEstado(token?: string) {
    const { data } = await axios.get('/api/whatsapp/estado', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    return data as {
        conectado: boolean
        phoneNumberId?: string
        displayPhoneNumber?: string
        wabaId?: string
        businessId?: string
    }
}

// ===== TEXTO =====
export async function sendWhatsappText({
    empresaId,
    to,
    body,
    phoneNumberId, // opcional: si no lo pasas lo resolvemos con /estado
    token,
}: {
    empresaId: number
    to: string
    body: string
    phoneNumberId?: string
    token?: string
}) {
    let pnId = phoneNumberId
    if (!pnId) {
        const estado = await getWhatsappEstado(token)
        if (!estado?.conectado || !estado?.phoneNumberId) {
            throw new Error('No hay número de WhatsApp conectado para esta empresa.')
        }
        pnId = estado.phoneNumberId
    }

    const { data } = await axios.post(
        '/api/whatsapp/enviar-prueba',
        { phoneNumberId: pnId, to, body, empresaId },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
    )
    return data as OutboundResult
}

// Alias de conveniencia (por si ya lo usas así)
export const sendOutboundMessage = sendWhatsappText

// ===== MEDIA (tu función original; sin cambios) =====
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
    return data as OutboundResult
}
