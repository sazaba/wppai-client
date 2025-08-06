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
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('usuario')
  
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUsuario(JSON.parse(storedUser))
  
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/api/empresa`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        })
        .then((res) => {
          setEmpresa(res.data)
        })
        .catch((err) => {
          console.error('[AuthContext] Error al cargar empresa:', err)
        })
        .finally(() => setLoading(false))
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

      const payload = JSON.parse(atob(token.split('.')[1]))
      const usuario: Usuario = {
        id: payload.id,
        email: payload.email,
        rol: payload.rol,
        empresaId: payload.empresaId
      }

      localStorage.setItem('token', token)
      localStorage.setItem('usuario', JSON.stringify(usuario))
      localStorage.setItem('empresaId', usuario.empresaId.toString())

      setToken(token)
      setUsuario(usuario)

      // Cargar empresa después del login
      const empresaRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/empresa`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEmpresa(empresaRes.data)

      return true
    } catch (err) {
      console.error('❌ Login fallido:', err)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
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
        setToken,    // ⬅️ ahora disponible en el contexto
        setUsuario,  // ⬅️ ahora disponible en el contexto
        setEmpresa   // ⬅️ ahora disponible en el contexto
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
