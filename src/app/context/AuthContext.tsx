'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

type Rol = 'admin' | 'agente' | 'invitado'

interface Usuario {
  id: number
  email: string
  rol: Rol
  empresaId: number
}

interface Empresa {
  id: number
  nombre: string
}

interface AuthContextProps {
  usuario: Usuario | null
  empresa: Empresa | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  setToken: (token: string | null) => void
  setUsuario: (usuario: Usuario | null) => void
  setEmpresa: (empresa: Empresa | null) => void
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Cargar todo del LocalStorage INMEDIATAMENTE
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('usuario')
    const storedEmpresa = localStorage.getItem('empresa') // NUEVO: Cacheamos empresa también
  
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUsuario(JSON.parse(storedUser))
      
      if (storedEmpresa) {
        setEmpresa(JSON.parse(storedEmpresa))
      }

      // 🔥 CLAVE DE LA OPTIMIZACIÓN 🔥
      // Liberamos la UI de inmediato si tenemos datos locales.
      // No esperamos a que el backend responda para mostrar la web.
      setLoading(false) 
  
      // 2. Actualización en Background (Silenciosa)
      // Si el backend tarda 15s, no importa, el usuario ya está viendo la página.
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/api/empresa`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        })
        .then((res) => {
          setEmpresa(res.data)
          // Actualizamos el cache local para la próxima vez
          localStorage.setItem('empresa', JSON.stringify(res.data))
        })
        .catch((err) => {
          console.error('[AuthContext] Error background sync:', err)
          // Si el token es inválido, podríamos cerrar sesión aquí si quisiéramos
          if (err.response?.status === 401) {
             logout()
          }
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        email,
        password
      })

      const { token } = res.data

      // Decodificar payload (asegúrate que tu JWT tenga esta estructura)
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      
      const payload = JSON.parse(jsonPayload)

      const usuario: Usuario = {
        id: payload.id,
        email: payload.email,
        rol: payload.rol,
        empresaId: payload.empresaId
      }

      // Guardar en Storage
      localStorage.setItem('token', token)
      localStorage.setItem('usuario', JSON.stringify(usuario))
      localStorage.setItem('empresaId', usuario.empresaId.toString())

      setToken(token)
      setUsuario(usuario)

      // Fetch Empresa y guardar en Storage
      try {
          const empresaRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/empresa`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          setEmpresa(empresaRes.data)
          localStorage.setItem('empresa', JSON.stringify(empresaRes.data)) // Cachear
      } catch (e) {
          console.warn('No se pudo cargar la empresa inmediatamente', e)
      }

      return true
    } catch (err) {
      console.error('❌ Login fallido:', err)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    localStorage.removeItem('empresaId')
    localStorage.removeItem('empresa') // Limpiar cache
    setToken(null)
    setUsuario(null)
    setEmpresa(null)
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        empresa,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
        setToken,
        setUsuario,
        setEmpresa
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)