// 'use client'

// import { useEffect, useRef, useState } from 'react'
// import axios from 'axios'
// import Swal from 'sweetalert2'

// const API_URL = process.env.NEXT_PUBLIC_API_URL
// const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID
// const META_WA_CONFIG_ID = process.env.NEXT_PUBLIC_META_WA_CONFIG_ID
// const FB_VERSION = 'v20.0'

// declare global {
//   interface Window { FB: any; fbLoaded?: boolean }
// }

// export default function WAEmbeddedPage() {
//   const [loading, setLoading] = useState(false)
//   const codeRef = useRef<string | null>(null)
//   const wabaRef = useRef<string | null>(null)
//   const phoneRef = useRef<string | null>(null)

//   // Validar variables de entorno requeridas
//   useEffect(() => {
//     if (!API_URL || !META_APP_ID || !META_WA_CONFIG_ID) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Configuración incompleta',
//         text: 'Faltan variables NEXT_PUBLIC_API_URL, META_APP_ID o META_WA_CONFIG_ID.',
//         background: '#111827',
//         color: '#fff'
//       })
//     }
//   }, [])

//   // Cargar SDK de Facebook
//   useEffect(() => {
//     if (window.fbLoaded) return
//     const script = document.createElement('script')
//     script.src = 'https://connect.facebook.net/en_US/sdk.js'
//     script.async = true
//     script.onload = () => {
//       window.FB?.init({
//         appId: META_APP_ID,
//         cookie: true,
//         xfbml: false,
//         version: FB_VERSION
//       })
//       window.fbLoaded = true
//     }
//     document.body.appendChild(script)
//     return () => {
//       // limpieza opcional si quisieras recargar SDK
//     }
//   }, [])

//   // Captura de resultados ESU via postMessage
//   useEffect(() => {
//     const onMsg = async (event: MessageEvent) => {
//       if (typeof event.data !== 'string') return
//       try {
//         const data = JSON.parse(event.data)
//         if (data?.type !== 'WA_EMBEDDED_SIGNUP') return

//         // Guardar IDs si vienen
//         if (data.event === 'FINISH' || data.event === 'FINISH_ONLY_WABA') {
//           if (data?.data?.waba_id) wabaRef.current = data.data.waba_id
//           if (data?.data?.phone_number_id) phoneRef.current = data.data.phone_number_id
//         }

//         // Guardar code
//         if (data?.code) {
//           codeRef.current = data.code
//           setLoading(true)
//           await finalizarVinculacion()
//           setLoading(false)
//         }
//       } catch {
//         // ignorar mensajes no válidos
//       }
//     }
//     window.addEventListener('message', onMsg)
//     return () => window.removeEventListener('message', onMsg)
//   }, [])

//   const lanzarESU = () => {
//     if (!window.FB) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Facebook SDK no cargó',
//         background: '#111827',
//         color: '#fff'
//       })
//       return
//     }
//     if (!META_WA_CONFIG_ID) return
//     setLoading(true)

//     window.FB.login(
//       (response: any) => {
//         const code = response?.authResponse?.code
//         if (code) {
//           codeRef.current = code
//           finalizarVinculacion().finally(() => setLoading(false))
//         } else {
//           setLoading(false)
//         }
//       },
//       {
//         config_id: META_WA_CONFIG_ID,
//         response_type: 'code',
//         override_default_response_type: true,
//         scope: 'whatsapp_business_management,whatsapp_business_messaging,public_profile',
//         extras: { setup: {} }
//       }
//     )
//   }

//   const finalizarVinculacion = async () => {
//     try {
//       const code = codeRef.current
//       if (!code) {
//         Swal.fire({
//           icon: 'error',
//           title: 'Código no recibido',
//           text: 'Reinicia el proceso de conexión.',
//           background: '#111827',
//           color: '#fff'
//         })
//         return
//       }

//       // 1) Intercambiar code → access_token
//       const r = await axios.post<{ access_token: string }>(
//         `${API_URL}/api/auth/exchange-code`,
//         { code }
//       )
//       const accessToken = r.data.access_token

//       // 2) Variables locales
//       let wabaId = wabaRef.current
//       let phoneNumberId = phoneRef.current
//       let businessId = ''
//       let displayPhoneNumber = ''

//       // 3) Si no llegaron IDs, intentar deducirlos
//       if (!wabaId || !phoneNumberId) {
//         const wab = await axios.get(
//           `https://graph.facebook.com/${FB_VERSION}/me/assigned_whatsapp_business_accounts?fields=name&access_token=${accessToken}`
//         )
//         if (!wabaId) wabaId = wab.data?.data?.[0]?.id || ''
//         if (wabaId && !phoneNumberId) {
//           const pn = await axios.get(
//             `https://graph.facebook.com/${FB_VERSION}/${wabaId}/phone_numbers?fields=display_phone_number&access_token=${accessToken}`
//           )
//           phoneNumberId = pn.data?.data?.[0]?.id || ''
//           displayPhoneNumber = pn.data?.data?.[0]?.display_phone_number || ''
//         }
//       }

//       // 4) Obtener businessId
//       if (wabaId) {
//         const info = await axios.get(
//           `https://graph.facebook.com/${FB_VERSION}/${wabaId}?fields=owner_business_info&access_token=${accessToken}`
//         )
//         businessId = info.data?.owner_business_info?.id || ''
//       }

//       // 5) displayPhone si falta
//       if (wabaId && phoneNumberId && !displayPhoneNumber) {
//         const list = await axios.get(
//           `https://graph.facebook.com/${FB_VERSION}/${wabaId}/phone_numbers?fields=display_phone_number&access_token=${accessToken}`
//         )
//         const match = (list.data?.data || []).find((p: any) => p.id === phoneNumberId)
//         displayPhoneNumber = match?.display_phone_number || ''
//       }

//       // 6) Validaciones antes de guardar
//       if (!wabaId || !phoneNumberId) {
//         Swal.fire({
//           icon: 'error',
//           title: 'Datos incompletos',
//           text: 'No se pudo obtener el WABA ID o Phone Number ID.',
//           background: '#111827',
//           color: '#fff'
//         })
//         return
//       }

//       // 7) Guardar en backend
//       const jwt = localStorage.getItem('tempToken') || ''
//       await axios.post(
//         `${API_URL}/api/whatsapp/vincular`,
//         { accessToken, wabaId, phoneNumberId, businessId, displayPhoneNumber },
//         { headers: { Authorization: `Bearer ${jwt}` } }
//       )

//       // 8) Suscribir webhooks automáticamente
//       await axios.post(
//         `https://graph.facebook.com/${FB_VERSION}/${wabaId}/subscribed_apps`,
//         { subscribed_fields: 'messages' },
//         { params: { access_token: accessToken } }
//       )

//       Swal.fire({
//         icon: 'success',
//         title: 'Conexión completada',
//         background: '#111827',
//         color: '#fff'
//       })
//       window.location.href = '/dashboard/settings?success=1'
//     } catch (e: any) {
//       const txt =
//         typeof e?.response?.data?.error === 'object'
//           ? JSON.stringify(e.response.data.error)
//           : e?.response?.data?.error || e.message
//       Swal.fire({
//         icon: 'error',
//         title: 'No se pudo completar ESU',
//         text: txt,
//         background: '#111827',
//         color: '#fff'
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
//       <div className="max-w-xl mx-auto text-center">
//         <h1 className="text-2xl font-bold mb-4">WhatsApp Embedded Signup</h1>
//         <p className="text-slate-300 mb-6">Conecta tu número oficial en minutos.</p>
//         <button
//           onClick={lanzarESU}
//           disabled={loading}
//           className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded disabled:opacity-50"
//         >
//           {loading ? 'Procesando…' : 'Conectar con Facebook'}
//         </button>
//       </div>
//     </div>
//   )
// }


'use client'

import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID
// Debes crear una configuración de Login en el panel de Meta y poner el ID aquí
const META_WA_CONFIG_ID = process.env.NEXT_PUBLIC_META_WA_CONFIG_ID 
const FB_VERSION = 'v20.0'

declare global {
  interface Window { FB: any; fbLoaded?: boolean }
}

export default function WAEmbeddedPage() {
  const [loading, setLoading] = useState(false)
  
  // Variables para almacenar lo que Meta nos devuelve el frontend
  const codeRef = useRef<string | null>(null)

  // Cargar SDK de Facebook
  useEffect(() => {
    if (window.fbLoaded) return
    const script = document.createElement('script')
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.onload = () => {
      window.FB?.init({
        appId: META_APP_ID,
        cookie: true,
        xfbml: false,
        version: FB_VERSION
      })
      window.fbLoaded = true
    }
    document.body.appendChild(script)
  }, [])

  // Listener para cuando el usuario termina el flujo en el popup
  // Meta envía un evento 'message' a la ventana padre
  useEffect(() => {
    const onMsg = async (event: MessageEvent) => {
        // Filtramos mensajes que no sean de Facebook
        if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") return;

        try {
            const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            
            // Detectar el tipo de mensaje de Embedded Signup
            if (data.type === 'WA_EMBEDDED_SIGNUP') {
                if (data.event === 'FINISH') {
                    // El usuario terminó el wizard exitosamente
                    const { phone_number_id, waba_id } = data.data;
                    console.log("✅ ESU Finalizado:", { phone_number_id, waba_id });
                    
                    // Nota: El 'code' no viene en este mensaje, viene en el callback del login original
                    // Pero este evento nos confirma que el usuario verificó el número.
                } else if (data.event === 'CANCEL') {
                    setLoading(false);
                    Swal.fire({ icon: 'info', title: 'Cancelado', text: 'El usuario canceló el proceso.' });
                }
            }
        } catch (e) {
            // Ignorar errores de parsing de otros mensajes
        }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  const lanzarESU = () => {
    if (!window.FB) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Facebook SDK no cargó. Desactiva adblockers.' })
      return
    }
    if (!META_WA_CONFIG_ID) {
        Swal.fire({ icon: 'warning', title: 'Falta Config ID', text: 'Define NEXT_PUBLIC_META_WA_CONFIG_ID en tu .env' })
        return
    }

    setLoading(true)

    window.FB.login(
      (response: any) => {
        if (response.authResponse) {
          const code = response.authResponse.code;
          if (code) {
             // TENEMOS EL CÓDIGO MÁGICO
             codeRef.current = code;
             // Enviamos al backend para intercambio y guardado
             finalizarVinculacion(code); 
          } else {
             setLoading(false);
             Swal.fire('Error', 'No se recibió el código de autorización.', 'error');
          }
        } else {
          setLoading(false);
          console.log('User cancelled login or did not fully authorize.');
        }
      },
      {
        config_id: META_WA_CONFIG_ID, // Tu configuración de permisos en Meta
        response_type: 'code',        // Importante: pedimos code, no token implícito
        override_default_response_type: true,
        
        // 👇 AQUÍ ESTÁ LA MAGIA DEL MANYCHAT FLOW 👇
        extras: {
          feature: 'whatsapp_embedded_signup',
          version: 2,
          sessionInfoVersion: 2,
          setup: {
            // Esto fuerza a que el wizard sea exclusivo de WhatsApp Messaging
            type: 'WA_MESSAGING' 
          }
        }
      }
    )
  }

  const finalizarVinculacion = async (code: string) => {
    try {
        const jwt = localStorage.getItem('tempToken') || ''; // Tu token de sesión local

        // Llamamos a tu backend existente. 
        // Tu backend "vincular" ya es inteligente: si le pasas el code, él debería hacer el exchange
        // O si tu endpoint /auth/exchange-code ya existe, úsalo primero.
        
        // PASO 1: Intercambio de Code por Token en tu backend
        const rExchange = await axios.post(`${API_URL}/api/auth/exchange-code`, { code });
        const accessToken = rExchange.data.access_token;

        // PASO 2: Como ya tienes el accessToken del usuario, tu backend puede autodescubrir
        // el WABA y el Phone ID si no los tienes.
        // Enviamos al endpoint 'vincular' que ya tienes en whatsapp.controller.ts
        // Nota: Tu controller espera 'wabaId' y 'phoneNumberId'. 
        // Como el frontend en sessionInfoVersion:2 no siempre retorna los IDs en el callback del login,
        // es más seguro que el backend los consulte con el accessToken.
        
        // MODIFICACIÓN RECOMENDADA EN FRONTEND:
        // Intentar obtener los IDs consultando a Meta con el accessToken recién obtenido antes de llamar a vincular
        // O dejar que el backend lo haga. Hagámoslo aquí rápido para asegurar:
        
        const rMeta = await axios.get(`https://graph.facebook.com/${FB_VERSION}/me/assigned_whatsapp_business_accounts`, {
            params: { access_token: accessToken }
        });
        
        const wabaId = rMeta.data?.data?.[0]?.id;
        
        if(!wabaId) throw new Error("No se encontró WABA asociada al usuario.");

        // Obtener teléfono de esa WABA
        const rPhone = await axios.get(`https://graph.facebook.com/${FB_VERSION}/${wabaId}/phone_numbers`, {
             params: { access_token: accessToken }
        });
        
        const phoneObj = rPhone.data?.data?.[0];
        if(!phoneObj) throw new Error("No se encontró número de teléfono verificado.");

        // PASO 3: Vincular en tu DB
        await axios.post(
            `${API_URL}/api/whatsapp/vincular`,
            {
              accessToken: accessToken,
              wabaId: wabaId,
              phoneNumberId: phoneObj.id,
              displayPhoneNumber: phoneObj.display_phone_number,
              // Business ID se resuelve en backend o aquí
            },
            { headers: { Authorization: `Bearer ${jwt}` } }
        );

        Swal.fire({ icon: 'success', title: '¡Conectado!', text: 'Tu WhatsApp está listo.' });
        // Redirigir
        // window.location.href = ...

    } catch (e: any) {
        console.error(e);
        Swal.fire('Error', 'Falló la conexión automática. ' + (e.message || ''), 'error');
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-10 bg-slate-900 rounded-xl border border-slate-700">
       <div className="mb-4 bg-emerald-500/10 p-3 rounded-full">
         {/* Icono de WhatsApp */}
         <svg className="w-10 h-10 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
       </div>
       
       <h2 className="text-xl font-bold text-white mb-2">Conectar WhatsApp</h2>
       <p className="text-slate-400 text-sm text-center mb-6 max-w-xs">
         Inicia sesión con Facebook para seleccionar o crear tu línea de WhatsApp Business automáticamente.
       </p>

       <button
         onClick={lanzarESU}
         disabled={loading}
         className="w-full py-3 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
       >
         {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
         ) : (
            <>
              {/* Logo de Facebook pequeño */}
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Continuar con Facebook
            </>
         )}
       </button>
    </div>
  )
}