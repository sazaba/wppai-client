// 'use client'

// import { useEffect, useState, useCallback } from 'react'
// import axios from 'axios'
// import { Trash2, RefreshCw } from 'lucide-react'
// import Swal from 'sweetalert2'
// import 'sweetalert2/dist/sweetalert2.min.css'
// import { useAuth } from '../../../context/AuthContext'

// const API_URL = process.env.NEXT_PUBLIC_API_URL

// // ⬇️ Añadido: constantes para construir la URL de OAuth
// const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID!
// const FB_VERSION = 'v20.0'
// const REDIRECT_URI = 'https://wasaaa.com/dashboard/callback' // Debe coincidir con tu config en Meta

// type Estado = 'conectado' | 'desconectado' | 'cargando'

// export default function WhatsappConfig() {
//   const { usuario, token } = useAuth()
//   const empresaId = usuario?.empresaId || null

//   const [estado, setEstado] = useState<Estado>('cargando')
//   const [displayPhone, setDisplayPhone] = useState('')
//   const [phoneNumberId, setPhoneNumberId] = useState('')
//   const [wabaId, setWabaId] = useState('')
//   const [businessId, setBusinessId] = useState('')
//   const [redirecting, setRedirecting] = useState(false)
//   const [loadingEstado, setLoadingEstado] = useState(false)

//   const alertError = (titulo: string, texto?: string) =>
//     Swal.fire({ icon: 'error', title: titulo, text: texto, background: '#111827', color: '#fff' })
//   const alertInfo = (titulo: string, html?: string) =>
//     Swal.fire({ icon: 'info', title: titulo, html, background: '#111827', color: '#fff' })
//   const alertSuccess = (titulo: string, texto?: string) =>
//     Swal.fire({ icon: 'success', title: titulo, text: texto, background: '#111827', color: '#fff', confirmButtonColor: '#10b981' })

//   // Estado actual desde backend
//   const fetchEstado = useCallback(
//     async (authToken: string) => {
//       if (!API_URL) return
//       try {
//         setLoadingEstado(true)
//         const { data } = await axios.get(`${API_URL}/api/whatsapp/estado`, {
//           headers: { Authorization: `Bearer ${authToken}` }
//         })

//         if (data?.conectado) {
//           setEstado('conectado')
//           setDisplayPhone(data.displayPhoneNumber || data.phoneNumberId || '')
//           setPhoneNumberId(data.phoneNumberId || '')
//           setWabaId(data.wabaId || '')
//           setBusinessId(data.businessId || '')
//           localStorage.removeItem('tempToken')
//         } else {
//           setEstado('desconectado')
//           setDisplayPhone('')
//           setPhoneNumberId('')
//           setWabaId('')
//           setBusinessId('')
//         }
//       } catch {
//         setEstado('desconectado')
//         setDisplayPhone('')
//         setPhoneNumberId('')
//         setWabaId('')
//         setBusinessId('')
//       } finally {
//         setLoadingEstado(false)
//       }
//     },
//     []
//   )

//   useEffect(() => {
//     if (!API_URL) {
//       alertError('Configuración requerida', 'Falta NEXT_PUBLIC_API_URL en el frontend.')
//       return
//     }
//     if (token) fetchEstado(token)

//     // Leer ?success=1 al volver del callback
//     const params = new URLSearchParams(window.location.search)
//     if (params.get('success') === '1') {
//       alertSuccess('¡Conexión realizada!', 'Tu cuenta de WhatsApp quedó vinculada.')
//       localStorage.setItem('oauthDone', '1')
//       window.history.replaceState({}, document.title, window.location.pathname)
//     }
//   }, [token, fetchEstado])

//   // ✅ Iniciar flujo OAuth desde el frontend con SCOPES correctos (incluye business_management)
//   const iniciarOAuth = () => {
//     if (!empresaId || !token) {
//       alertInfo('Sesión requerida', 'Inicia sesión para conectar tu WhatsApp.')
//       return
//     }
//     if (!API_URL || !META_APP_ID) {
//       alertError('Config requerida', 'Falta NEXT_PUBLIC_API_URL o NEXT_PUBLIC_META_APP_ID')
//       return
//     }

//     // Guardamos el JWT para usarlo en el callback
//     localStorage.setItem('tempToken', token)
//     localStorage.removeItem('oauthDone')

//     const scope = [
//       'whatsapp_business_messaging',
//       'whatsapp_business_management',
//       'business_management',
//       'pages_show_list', // opcional
//     ].join(',')

//     setRedirecting(true)

//     const url =
//       `https://www.facebook.com/${FB_VERSION}/dialog/oauth` +
//       `?client_id=${META_APP_ID}` +
//       `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
//       `&response_type=code` +
//       `&scope=${encodeURIComponent(scope)}` +
//       `&auth_type=rerequest` // por si el usuario negó permisos antes

//     window.location.href = url
//   }

//   const eliminarWhatsapp = async () => {
//     if (!token || !API_URL) return
//     const confirm = await Swal.fire({
//       title: '¿Eliminar conexión?',
//       text: 'Esto desvinculará el número de tu empresa.',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonText: 'Sí, eliminar',
//       cancelButtonText: 'Cancelar',
//       background: '#111827',
//       color: '#fff',
//       confirmButtonColor: '#ef4444',
//       cancelButtonColor: '#6b7280'
//     })
//     if (!confirm.isConfirmed) return

//     try {
//       await axios.delete(`${API_URL}/api/whatsapp/eliminar`, {
//         headers: { Authorization: `Bearer ${token}` }
//       })
//       setEstado('desconectado')
//       setDisplayPhone('')
//       setPhoneNumberId('')
//       setWabaId('')
//       setBusinessId('')
//       localStorage.removeItem('oauthDone')
//       localStorage.removeItem('tempToken')
//       alertSuccess('Conexión eliminada')
//     } catch {
//       alertError('No se pudo eliminar la conexión')
//     }
//   }

//   const recargar = () => {
//     if (!token) return
//     fetchEstado(token)
//   }

//   return (
//     <div className="w-full sm:max-w-xl mx-auto bg-gray-900 text-white rounded-xl shadow-md p-6 mt-8">
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="text-lg sm:text-xl font-semibold">Conexión con WhatsApp</h2>
//         <button
//           onClick={recargar}
//           disabled={loadingEstado}
//           className="inline-flex items-center gap-2 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm disabled:opacity-60"
//           title="Refrescar estado"
//         >
//           <RefreshCw className="w-4 h-4" />
//           {loadingEstado ? 'Actualizando…' : 'Refrescar'}
//         </button>
//       </div>

//       {estado === 'cargando' ? (
//         <div className="flex items-center justify-center gap-3 py-6">
//           <div className="w-6 h-6 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin" />
//           <span className="text-sm text-gray-300">Verificando conexión…</span>
//         </div>
//       ) : estado === 'conectado' ? (
//         <>
//           <p className="text-green-400 font-medium mb-3">✅ Conectado</p>

//           <div className="grid gap-2 text-sm bg-slate-800/60 border border-slate-700 rounded-lg p-4 mb-4">
//             <div className="flex items-center justify-between">
//               <span className="text-slate-400">Número</span>
//               <span className="font-medium">{displayPhone || '—'}</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-slate-400">Phone Number ID</span>
//               <code className="text-slate-300">{phoneNumberId || '—'}</code>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-slate-400">WABA ID</span>
//               <code className="text-slate-300">{wabaId || '—'}</code>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-slate-400">Business ID</span>
//               <code className="text-slate-300">{businessId || '—'}</code>
//             </div>
//           </div>

//           <div className="flex flex-col sm:flex-row justify-center gap-3">
//             <button
//               onClick={iniciarOAuth}
//               className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm disabled:opacity-60"
//               disabled={redirecting}
//             >
//               {redirecting ? 'Redirigiendo…' : 'Re-conectar'}
//             </button>
//             <button
//               onClick={eliminarWhatsapp}
//               className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm flex items-center justify-center gap-2"
//             >
//               <Trash2 className="w-4 h-4" />
//               Desconectar
//             </button>
//           </div>
//         </>
//       ) : (
//         <>
//           <p className="text-yellow-400 font-medium mb-4">⚠️ No hay un número conectado</p>

//           <div className="flex flex-col sm:flex-row justify-center gap-3">
//             <button
//               onClick={iniciarOAuth}
//               className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm disabled:opacity-60"
//               disabled={redirecting}
//             >
//               {redirecting ? 'Redirigiendo…' : 'Conectar con WhatsApp (OAuth)'}
//             </button>
//           </div>

//           <p className="text-xs text-slate-500 mt-4">
//             Al conectar, selecciona tu negocio y el número de WhatsApp. Guardaremos en tu cuenta:
//             <code> businessId</code>, <code>wabaId</code>, <code>phoneNumberId</code>, <code>displayPhoneNumber</code> y el <code>accessToken</code>.
//           </p>
//         </>
//       )}
//     </div>
//   )
// }


'use client'

import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { Trash2, RefreshCw, Smartphone, CheckCircle2, AlertCircle, ShieldCheck, MessageSquare } from 'lucide-react'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import { useAuth } from '../../../context/AuthContext' // Ajusta la ruta según tu estructura
import clsx from 'clsx'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// ⬇️ Constantes de Lógica (INTACTAS)
const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID!
const FB_VERSION = 'v20.0'
const REDIRECT_URI = 'https://wasaaa.com/dashboard/callback'

type Estado = 'conectado' | 'desconectado' | 'cargando'

// Estilos Dark para SweetAlert
const DarkSwal = Swal.mixin({
  background: '#09090b',
  color: '#e4e4e7',
  iconColor: '#10b981',
  customClass: {
    popup: 'rounded-2xl border border-white/10 shadow-2xl',
    confirmButton: 'bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold',
    cancelButton: 'bg-zinc-700 text-white px-4 py-2 rounded-lg'
  }
})

export default function WhatsappConfig() {
  const { usuario, token } = useAuth()
  const empresaId = usuario?.empresaId || null

  const [estado, setEstado] = useState<Estado>('cargando')
  const [displayPhone, setDisplayPhone] = useState('')
  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [wabaId, setWabaId] = useState('')
  const [businessId, setBusinessId] = useState('')
  const [redirecting, setRedirecting] = useState(false)
  const [loadingEstado, setLoadingEstado] = useState(false)

  // Alertas visualmente mejoradas
  const alertError = (titulo: string, texto?: string) =>
    DarkSwal.fire({ icon: 'error', title: titulo, text: texto, iconColor: '#ef4444' })
  const alertInfo = (titulo: string, html?: string) =>
    DarkSwal.fire({ icon: 'info', title: titulo, html, iconColor: '#3b82f6' })
  const alertSuccess = (titulo: string, texto?: string) =>
    DarkSwal.fire({ icon: 'success', title: titulo, text: texto })

  // Estado actual desde backend (LÓGICA INTACTA)
  const fetchEstado = useCallback(
    async (authToken: string) => {
      if (!API_URL) return
      try {
        setLoadingEstado(true)
        const { data } = await axios.get(`${API_URL}/api/whatsapp/estado`, {
          headers: { Authorization: `Bearer ${authToken}` }
        })

        if (data?.conectado) {
          setEstado('conectado')
          setDisplayPhone(data.displayPhoneNumber || data.phoneNumberId || '')
          setPhoneNumberId(data.phoneNumberId || '')
          setWabaId(data.wabaId || '')
          setBusinessId(data.businessId || '')
          localStorage.removeItem('tempToken')
        } else {
          setEstado('desconectado')
          setDisplayPhone('')
          setPhoneNumberId('')
          setWabaId('')
          setBusinessId('')
        }
      } catch {
        setEstado('desconectado')
        setDisplayPhone('')
        setPhoneNumberId('')
        setWabaId('')
        setBusinessId('')
      } finally {
        setLoadingEstado(false)
      }
    },
    []
  )

  useEffect(() => {
    if (!API_URL) {
      alertError('Configuración requerida', 'Falta NEXT_PUBLIC_API_URL en el frontend.')
      return
    }
    if (token) fetchEstado(token)

    // Leer ?success=1 al volver del callback
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === '1') {
      alertSuccess('¡Conexión realizada!', 'Tu cuenta de WhatsApp quedó vinculada.')
      localStorage.setItem('oauthDone', '1')
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [token, fetchEstado])

  // ✅ Iniciar flujo OAuth (LÓGICA INTACTA)
  const iniciarOAuth = () => {
    if (!empresaId || !token) {
      alertInfo('Sesión requerida', 'Inicia sesión para conectar tu WhatsApp.')
      return
    }
    if (!API_URL || !META_APP_ID) {
      alertError('Config requerida', 'Falta NEXT_PUBLIC_API_URL o NEXT_PUBLIC_META_APP_ID')
      return
    }

    // Guardamos el JWT para usarlo en el callback
    localStorage.setItem('tempToken', token)
    localStorage.removeItem('oauthDone')

    const scope = [
      'whatsapp_business_messaging',
      'whatsapp_business_management',
      'business_management',
      'pages_show_list', // opcional
    ].join(',')

    setRedirecting(true)

    const url =
      `https://www.facebook.com/${FB_VERSION}/dialog/oauth` +
      `?client_id=${META_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&auth_type=rerequest` 

    window.location.href = url
  }

  const eliminarWhatsapp = async () => {
    if (!token || !API_URL) return
    const confirm = await DarkSwal.fire({
      title: '¿Eliminar conexión?',
      text: 'Esto desvinculará el número de tu empresa.',
      icon: 'warning',
      iconColor: '#ef4444',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#27272a'
    })
    if (!confirm.isConfirmed) return

    try {
      await axios.delete(`${API_URL}/api/whatsapp/eliminar`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEstado('desconectado')
      setDisplayPhone('')
      setPhoneNumberId('')
      setWabaId('')
      setBusinessId('')
      localStorage.removeItem('oauthDone')
      localStorage.removeItem('tempToken')
      alertSuccess('Conexión eliminada')
    } catch {
      alertError('No se pudo eliminar la conexión')
    }
  }

  const recargar = () => {
    if (!token) return
    fetchEstado(token)
  }

  return (
    // Contenedor Glassmorphism Premium
    <div className="relative w-full max-w-3xl mx-auto bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
      
      {/* Luces ambientales específicas para WhatsApp (Verde) */}
      <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-green-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10">
          
          {/* Header de la sección */}
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 shadow-[0_0_15px_rgba(37,211,102,0.2)]">
                    <MessageSquare className="w-6 h-6 text-[#25D366]" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">API de WhatsApp</h2>
                    <p className="text-sm text-zinc-400">Gestiona la conexión con Meta Cloud API</p>
                </div>
            </div>
            
            <button
              onClick={recargar}
              disabled={loadingEstado}
              className="p-2.5 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
              title="Refrescar estado"
            >
              <RefreshCw className={clsx("w-5 h-5", loadingEstado && "animate-spin")} />
            </button>
          </div>

          {/* Contenido Dinámico */}
          {estado === 'cargando' ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-12 h-12 border-4 border-[#25D366]/30 border-t-[#25D366] rounded-full animate-spin" />
              <span className="text-sm text-zinc-400 animate-pulse">Verificando estado de conexión...</span>
            </div>
          ) : estado === 'conectado' ? (
            // === VISTA CONECTADO ===
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-6 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full w-fit">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Conexión Activa</span>
              </div>

              {/* Grid de Detalles Técnicos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                 <div className="bg-zinc-950/50 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-2 text-zinc-500">
                        <Smartphone className="w-4 h-4" />
                        <span className="text-xs uppercase font-bold tracking-wider">Número Visible</span>
                    </div>
                    <p className="text-lg font-mono text-white tracking-wide">{displayPhone || '—'}</p>
                 </div>
                 
                 <div className="bg-zinc-900/30 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-2 text-zinc-500">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-xs uppercase font-bold tracking-wider">Phone ID</span>
                    </div>
                    <code className="text-xs text-zinc-300 break-all">{phoneNumberId || '—'}</code>
                 </div>

                 <div className="bg-zinc-900/30 p-4 rounded-2xl border border-white/5">
                    <span className="text-xs uppercase font-bold tracking-wider text-zinc-500 block mb-2">WABA ID</span>
                    <code className="text-xs text-zinc-300 break-all">{wabaId || '—'}</code>
                 </div>

                 <div className="bg-zinc-900/30 p-4 rounded-2xl border border-white/5">
                    <span className="text-xs uppercase font-bold tracking-wider text-zinc-500 block mb-2">Business ID</span>
                    <code className="text-xs text-zinc-300 break-all">{businessId || '—'}</code>
                 </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/5">
                <button
                  onClick={iniciarOAuth}
                  disabled={redirecting}
                  className="flex-1 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold transition-all border border-white/10 flex items-center justify-center gap-2"
                >
                   {redirecting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Redirigiendo...
                      </>
                   ) : (
                      'Actualizar Permisos'
                   )}
                </button>
                
                <button
                  onClick={eliminarWhatsapp}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-semibold transition-all flex items-center justify-center gap-2 group"
                >
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Desconectar Número
                </button>
              </div>
            </div>
          ) : (
            // === VISTA DESCONECTADO ===
            <div className="text-center py-8 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-white/5">
                  <AlertCircle className="w-10 h-10 text-zinc-600" />
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2">No hay conexión establecida</h3>
              <p className="text-zinc-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                Para empezar a automatizar mensajes, necesitas vincular una cuenta de WhatsApp Business API a través de Meta.
              </p>

              <div className="max-w-sm mx-auto">
                <button
                  onClick={iniciarOAuth}
                  disabled={redirecting}
                  className="w-full py-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-zinc-900 font-bold shadow-[0_0_20px_rgba(37,211,102,0.4)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-70 disabled:transform-none"
                >
                  {redirecting ? (
                    <>
                       <RefreshCw className="w-5 h-5 animate-spin" />
                       Conectando con Facebook...
                    </>
                  ) : (
                    <>
                       {/* Icono de WhatsApp SVG simple */}
                       <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.0117 2C6.50574 2 2.02344 6.47837 2.02344 11.9844C2.02344 13.7485 2.4816 15.4056 3.29605 16.8701L2 22L7.26881 20.6568C8.66554 21.4424 10.2891 21.8906 12.0137 21.8906H12.0176C17.5216 21.8906 22 17.4443 22 11.9844C22 9.31978 20.9613 6.81412 19.0763 4.93096C17.1913 3.0478 14.6821 2.002 12.0117 2Z" /></svg>
                       Conectar WhatsApp (OAuth)
                    </>
                  )}
                </button>
                
                <p className="text-[10px] text-zinc-500 mt-4">
                   Al conectar, aceptas los términos de Meta. Se guardarán los tokens de acceso necesarios para la operación del bot.
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  )
}