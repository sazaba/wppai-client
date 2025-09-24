// client/src/lib/axios.ts
import axios from 'axios'

const http = axios.create({
    baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, ''),
    headers: { 'Content-Type': 'application/json' }
})

// Adjunta JWT si existe en localStorage (solo en browser)
http.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token')
        if (token) config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default http
