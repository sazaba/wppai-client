import axios from 'axios'
import { EcommerceConfigForm } from '@/app/dashboard/settings/components/training/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const getEcommerceConfig = async (): Promise<EcommerceConfigForm | null> => {
  try {
    const { data } = await axios.get(`${API_URL}/api/ecommerce/config`, {
      headers: getAuthHeaders(),
    })
    return data
  } catch (error) {
    console.error('Error cargando config ecommerce:', error)
    return null
  }
}

export const saveEcommerceConfig = async (config: EcommerceConfigForm) => {
  const { data } = await axios.post(`${API_URL}/api/ecommerce/config`, config, {
    headers: getAuthHeaders(),
  })
  return data
}