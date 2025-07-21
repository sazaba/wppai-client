// app/context/AuthContext.tsx
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

interface AuthContextProps {
  usuario: Usuario | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('usuario')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUsuario(JSON.parse(storedUser))
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        email,
        password
      })

      const { token, empresaId } = res.data

      const payload = JSON.parse(atob(token.split('.')[1])) // decodifica el JWT
      const usuario: Usuario = {
        id: payload.id,
        email: payload.email,
        rol: payload.rol,
        empresaId: payload.empresaId
      }

      localStorage.setItem('token', token)
      localStorage.setItem('usuario', JSON.stringify(usuario))

      setToken(token)
      setUsuario(usuario)

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
  }

  return (
    <AuthContext.Provider value={{ usuario, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
