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






//100% automatizado

// 'use client'

// import { useEffect, useState, useCallback, useRef } from 'react'
// import axios from 'axios'
// import { Trash2, RefreshCw, Smartphone, ShieldCheck, MessageSquare, AlertCircle } from 'lucide-react'
// import Swal from 'sweetalert2'
// import 'sweetalert2/dist/sweetalert2.min.css'
// import { useAuth } from '../../../context/AuthContext'
// import clsx from 'clsx'

// const API_URL = process.env.NEXT_PUBLIC_API_URL
// const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID
// const META_WA_CONFIG_ID = process.env.NEXT_PUBLIC_META_WA_CONFIG_ID
// const FB_VERSION = 'v20.0'

// declare global {
//   interface Window { FB: any; fbAsyncInit?: () => void }
// }

// type Estado = 'conectado' | 'desconectado' | 'cargando'

// const DarkSwal = Swal.mixin({
//   background: '#09090b',
//   color: '#e4e4e7',
//   iconColor: '#10b981',
//   customClass: {
//     popup: 'rounded-2xl border border-white/10 shadow-2xl',
//     confirmButton: 'bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold',
//     cancelButton: 'bg-zinc-700 text-white px-4 py-2 rounded-lg'
//   }
// })

// export default function WhatsappConfig() {
//   const { usuario, token } = useAuth()
//   const empresaId = usuario?.empresaId || null

//   const [estado, setEstado] = useState<Estado>('cargando')
//   const [displayPhone, setDisplayPhone] = useState('')
//   const [phoneNumberId, setPhoneNumberId] = useState('')
//   const [wabaId, setWabaId] = useState('')
//   const [businessId, setBusinessId] = useState('')
//   const [loadingAction, setLoadingAction] = useState(false)
//   const [loadingEstado, setLoadingEstado] = useState(false)
  
//   // ✅ Control de SDK
//   const [sdkReady, setSdkReady] = useState(false)
//   const codeRef = useRef<string | null>(null)

//   // --- 1. Carga OFICIAL del SDK de Facebook (fbAsyncInit) ---
//   useEffect(() => {
//     // Si ya existe, marcamos listo y salimos
//     if (window.FB) {
//         setSdkReady(true)
//         return
//     }

//     // Definimos la función que Facebook llamará cuando termine de cargar
//     window.fbAsyncInit = function() {
//         window.FB.init({
//             appId: META_APP_ID,
//             cookie: true,
//             xfbml: false,
//             version: FB_VERSION
//         });
//         console.log("✅ Facebook SDK inicializado (fbAsyncInit)");
//         setSdkReady(true);
//     };

//     // Inyectamos el script solo si no existe
//     if (!document.getElementById('facebook-jssdk')) {
//         const js = document.createElement('script');
//         js.id = 'facebook-jssdk';
//         js.src = "https://connect.facebook.net/en_US/sdk.js";
//         js.async = true;
//         js.defer = true;
//         js.crossOrigin = 'anonymous';
        
//         js.onerror = () => {
//             console.error("❌ Falló la carga del SDK de Facebook.");
//             // No mostramos alerta intrusiva, solo dejamos el botón en estado 'Cargando...'
//         };
        
//         document.body.appendChild(js);
//     }
//   }, [])

//   // --- 2. Listener para finalización visual del Popup ---
//   useEffect(() => {
//     const onMsg = (event: MessageEvent) => {
//         if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") return;
//         try {
//             const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
//             if (data.type === 'WA_EMBEDDED_SIGNUP') {
//                 if (data.event === 'FINISH') {
//                     // El usuario terminó el wizard, pero el CODE viene por el callback del login
//                     console.log("✅ ESU Finalizado Visualmente");
//                 } else if (data.event === 'CANCEL') {
//                     setLoadingAction(false); // Desbloqueamos el botón si cierra el popup
//                 }
//             }
//         } catch (e) {}
//     }
//     window.addEventListener('message', onMsg)
//     return () => window.removeEventListener('message', onMsg)
//   }, [])

//   // --- 3. Obtener Estado ---
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
//         } else {
//           setEstado('desconectado')
//           setDisplayPhone('')
//           setPhoneNumberId('')
//           setWabaId('')
//           setBusinessId('')
//         }
//       } catch {
//         setEstado('desconectado')
//       } finally {
//         setLoadingEstado(false)
//       }
//     },
//     []
//   )

//   useEffect(() => {
//     if (!API_URL) {
//       alertError('Error Config', 'Falta NEXT_PUBLIC_API_URL')
//       return
//     }
//     if (token) fetchEstado(token)
//   }, [token, fetchEstado])

//   // --- 4. Acción del Botón ---
//   const iniciarEmbeddedSignup = () => {
//     if (!empresaId || !token) {
//       DarkSwal.fire({ icon: 'info', title: 'Sesión expirada', text: 'Por favor inicia sesión nuevamente.' })
//       return
//     }
    
//     // Doble chequeo de seguridad
//     if (!window.FB) {
//         alertError('Cargando...', 'Facebook aún no está listo. Revisa tu conexión.')
//         return
//     }

//     if (!META_WA_CONFIG_ID) {
//         alertError('Error', 'Falta el Config ID en las variables de entorno.')
//         return
//     }

//     setLoadingAction(true)

//     window.FB.login(
//       (response: any) => {
//         if (response.authResponse) {
//           const code = response.authResponse.code;
//           if (code) {
//              codeRef.current = code;
//              finalizarVinculacion(code); 
//           } else {
//              setLoadingAction(false);
//              // Si el usuario cierra el popup de login sin aceptar
//              console.log("Login incompleto o cerrado.");
//           }
//         } else {
//           setLoadingAction(false);
//           console.log('Login cancelado por el usuario.');
//         }
//       },
//       {
//         config_id: META_WA_CONFIG_ID,
//         response_type: 'code',
//         override_default_response_type: true,
//         extras: {
//           feature: 'whatsapp_embedded_signup',
//           version: 2,
//           sessionInfoVersion: 2,
//           setup: {
//             type: 'WA_MESSAGING' 
//           }
//         }
//       }
//     )
//   }

//   const finalizarVinculacion = async (code: string) => {
//     try {
//         const rExchange = await axios.post(`${API_URL}/api/auth/exchange-code`, { code });
//         const accessToken = rExchange.data.access_token;

//         // Auto-descubrimiento de IDs
//         const rMeta = await axios.get(`https://graph.facebook.com/${FB_VERSION}/me/assigned_whatsapp_business_accounts`, {
//             params: { access_token: accessToken }
//         });
        
//         const wabaIdFound = rMeta.data?.data?.[0]?.id;
//         if(!wabaIdFound) throw new Error("No encontramos una cuenta de WhatsApp (WABA) asociada.");

//         const rPhone = await axios.get(`https://graph.facebook.com/${FB_VERSION}/${wabaIdFound}/phone_numbers`, {
//              params: { access_token: accessToken }
//         });
        
//         const phoneObj = rPhone.data?.data?.[0];
//         if(!phoneObj) throw new Error("No encontramos un número de teléfono en esa cuenta.");

//         await axios.post(
//             `${API_URL}/api/whatsapp/vincular`,
//             {
//               accessToken: accessToken,
//               wabaId: wabaIdFound,
//               phoneNumberId: phoneObj.id,
//               displayPhoneNumber: phoneObj.display_phone_number,
//             },
//             { headers: { Authorization: `Bearer ${token}` } }
//         );

//         alertSuccess('¡Conectado!', 'WhatsApp Business vinculado correctamente.')
//         if (token) fetchEstado(token)

//     } catch (e: any) {
//         console.error(e);
//         alertError('Error de conexión', e?.response?.data?.error || e.message || 'Error desconocido.')
//     } finally {
//         setLoadingAction(false);
//     }
//   }

//   const eliminarWhatsapp = async () => {
//     if (!token) return
//     const confirm = await DarkSwal.fire({
//       title: '¿Desconectar?',
//       text: 'El bot dejará de funcionar.',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonText: 'Sí, desconectar',
//       confirmButtonColor: '#ef4444'
//     })
//     if (!confirm.isConfirmed) return

//     try {
//       await axios.delete(`${API_URL}/api/whatsapp/eliminar`, {
//         headers: { Authorization: `Bearer ${token}` }
//       })
//       setEstado('desconectado')
//       alertSuccess('Desconectado')
//     } catch {
//       alertError('Error al desconectar')
//     }
//   }

//   const recargar = () => { if (token) fetchEstado(token) }

//   // Componentes de Alerta
//   const alertError = (t: string, m?: string) => DarkSwal.fire({ icon: 'error', title: t, text: m })
//   const alertSuccess = (t: string, m?: string) => DarkSwal.fire({ icon: 'success', title: t, text: m })

//   return (
//     <div className="relative w-full max-w-3xl mx-auto bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
      
//       {/* Luces decorativas */}
//       <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
//       <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-green-600/10 rounded-full blur-[100px] pointer-events-none" />

//       <div className="relative z-10">
          
//           {/* Header */}
//           <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
//             <div className="flex items-center gap-4">
//                 <div className="p-3 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 shadow-[0_0_15px_rgba(37,211,102,0.2)]">
//                     <MessageSquare className="w-6 h-6 text-[#25D366]" />
//                 </div>
//                 <div>
//                     <h2 className="text-xl font-bold text-white tracking-tight">API de WhatsApp</h2>
//                     <p className="text-sm text-zinc-400">Estado de la conexión Cloud API</p>
//                 </div>
//             </div>
//             <button onClick={recargar} className="p-2 hover:bg-white/5 rounded-lg text-zinc-400">
//                 <RefreshCw className={clsx("w-5 h-5", loadingEstado && "animate-spin")} />
//             </button>
//           </div>

//           {/* Estado Cargando */}
//           {estado === 'cargando' && (
//             <div className="flex justify-center py-12">
//               <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
//             </div>
//           )}

//           {/* Estado Conectado */}
//           {estado === 'conectado' && (
//             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
//                 <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full w-fit mb-6 flex items-center gap-2">
//                     <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
//                     <span className="text-xs font-bold text-emerald-400 uppercase">Conectado</span>
//                 </div>
                
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
//                     <div className="bg-zinc-950/50 p-4 rounded-xl border border-white/5">
//                         <p className="text-xs text-zinc-500 font-bold uppercase mb-1">Teléfono</p>
//                         <p className="font-mono text-white text-lg">{displayPhone}</p>
//                     </div>
//                     <div className="bg-zinc-900/30 p-4 rounded-xl border border-white/5">
//                         <p className="text-xs text-zinc-500 font-bold uppercase mb-1">WABA ID</p>
//                         <code className="text-xs text-zinc-300 break-all">{wabaId}</code>
//                     </div>
//                 </div>

//                 <div className="flex gap-3">
//                     <button 
//                         onClick={iniciarEmbeddedSignup} 
//                         disabled={!sdkReady || loadingAction}
//                         className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-semibold border border-white/10 disabled:opacity-50"
//                     >
//                         {loadingAction ? 'Procesando...' : 'Re-conectar'}
//                     </button>
//                     <button 
//                         onClick={eliminarWhatsapp}
//                         className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-semibold border border-red-500/20 flex justify-center gap-2 items-center"
//                     >
//                         <Trash2 className="w-4 h-4" /> Desconectar
//                     </button>
//                 </div>
//             </div>
//           )}

//           {/* Estado Desconectado */}
//           {estado === 'desconectado' && (
//             <div className="text-center py-8">
//                 <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <AlertCircle className="w-8 h-8 text-zinc-500" />
//                 </div>
//                 <h3 className="text-lg font-bold text-white mb-2">Sin conexión</h3>
//                 <p className="text-zinc-400 text-sm mb-6 max-w-xs mx-auto">Conecta tu número oficial para activar el bot.</p>
                
//                 <div className="max-w-xs mx-auto">
//                     <button
//                         onClick={iniciarEmbeddedSignup}
//                         // 👇 LA CLAVE: El botón está deshabilitado hasta que sdkReady es true
//                         disabled={!sdkReady || loadingAction}
//                         className={clsx(
//                             "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
//                             !sdkReady ? "bg-zinc-700 text-zinc-400 cursor-not-allowed" : "bg-[#25D366] hover:bg-[#20bd5a] text-zinc-900 shadow-lg hover:scale-[1.02]"
//                         )}
//                     >
//                         {loadingAction ? (
//                             <><RefreshCw className="w-5 h-5 animate-spin" /> Conectando...</>
//                         ) : !sdkReady ? (
//                             <><RefreshCw className="w-5 h-5 animate-spin" /> Cargando Facebook...</>
//                         ) : (
//                             <>
//                                 <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
//                                 Conectar con Facebook
//                             </>
//                         )}
//                     </button>
//                 </div>
//             </div>
//           )}
//       </div>
//     </div>
//   )
// }