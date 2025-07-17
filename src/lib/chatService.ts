import axios from './axios'

export const responderConIA = async ({
    chatId,
    mensaje,
    intentosFallidos = 0
}: {
    chatId: number
    mensaje: string
    intentosFallidos?: number
}) => {
    try {
        const response = await axios.post('/api/chats/responder', {
            chatId,
            mensaje,
            intentosFallidos
        })

        return response.data
    } catch (error) {
        console.error('Error al llamar a la IA:', error)
        throw error
    }
}
