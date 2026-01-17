import axios from 'axios'
import { Product, ProductImage } from '@/app/dashboard/settings/components/training/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// --- CRUD Productos ---

export const getProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get(`${API_URL}/api/products`, { headers: getAuthHeaders() })
  return data
}

export const createProduct = async (product: Partial<Product>): Promise<Product> => {
  const { data } = await axios.post(`${API_URL}/api/products`, product, { headers: getAuthHeaders() })
  return data
}

export const updateProduct = async (id: number, product: Partial<Product>): Promise<Product> => {
  const { data } = await axios.put(`${API_URL}/api/products/${id}`, product, { headers: getAuthHeaders() })
  return data
}

export const deleteProduct = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/api/products/${id}`, { headers: getAuthHeaders() })
}

// --- Imágenes (Cloudflare) ---

export const uploadProductImage = async (productId: number, file: File): Promise<ProductImage> => {
  const formData = new FormData()
  // 'file' debe coincidir con uploadImageMem.single('file') en tu ruta del backend
  formData.append('file', file) 

  const { data } = await axios.post(`${API_URL}/api/products/${productId}/images/upload`, formData, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export const setPrimaryImage = async (productId: number, imageId: number): Promise<void> => {
  await axios.put(`${API_URL}/api/products/${productId}/images/${imageId}/primary`, {}, { headers: getAuthHeaders() })
}

export const deleteProductImage = async (productId: number, imageId: number): Promise<void> => {
  await axios.delete(`${API_URL}/api/products/${productId}/images/${imageId}`, { headers: getAuthHeaders() })
}