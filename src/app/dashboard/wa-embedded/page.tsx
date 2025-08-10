'use client'

import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID
const META_WA_CONFIG_ID = process.env.NEXT_PUBLIC_META_WA_CONFIG_ID // 👈 agrega esto en tus env
const FB_VERSION = 'v20.0'

declare global {
  interface Window { FB: any }
}

export default function WAEmbeddedPage() {
  const [loading, setLoading] = useState(false)
  const codeRef = useRef<string | null>(null)
  const wabaRef = useRef<string | null>(null)
  const phoneRef = useRef<string | null>(null)

  // Cargar SDK de Facebook
  useEffect(() => {
    if ((window as any).fbLoaded) return
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
      ;(window as any).fbLoaded = true
    }
    document.body.appendChild(script)
  }, [])

  // Captura de resultados ESU via postMessage
  useEffect(() => {
    const onMsg = async (event: MessageEvent) => {
      if (typeof event.data !== 'string') return
      if (!/facebook\.com$/.test(new URL(event.origin).hostname)) return
      try {
        const data = JSON.parse(event.data)
        if (data?.type !== 'WA_EMBEDDED_SIGNUP') return

        // FINISH / FINISH_ONLY_WABA → trae waba_id / phone_number_id
        if (data.event === 'FINISH' || data.event === 'FINISH_ONLY_WABA') {
          wabaRef.current = data?.data?.waba_id || null
          phoneRef.current = data?.data?.phone_number_id || null
        }

        // Siempre viene un code intercambiable
        if (data?.code) {
          codeRef.current = data.code
          await finalizarVinculacion()
        }
      } catch {}
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  const lanzarESU = () => {
    if (!window.FB) {
      Swal.fire({ icon: 'error', title: 'Facebook SDK no cargó', background: '#111827', color: '#fff' })
      return
    }
    setLoading(true)
    window.FB.login(
      // callback FB.login
      (response: any) => {
        // En algunos navegadores también viene code aquí
        const code = response?.authResponse?.code
        if (code) {
          codeRef.current = code
          // El waba/phone puede llegar por postMessage; si no, completamos en finalizarVinculacion()
          finalizarVinculacion().finally(() => setLoading(false))
        } else {
          setLoading(false)
        }
      },
      {
        config_id: META_WA_CONFIG_ID,               // ← configuración “WhatsApp Embedded Signup”
        response_type: 'code',
        override_default_response_type: true,
        scope: 'whatsapp_business_management,whatsapp_business_messaging,public_profile',
        extras: { setup: {} } // opcional: prefills
      }
    )
  }

  const finalizarVinculacion = async () => {
    try {
      const code = codeRef.current
      if (!code) return

      // 1) Intercambiar code → access_token (tu backend)
      const r = await axios.post<{ access_token: string }>(`${API_URL}/api/auth/exchange-code`, { code })
      const accessToken = r.data.access_token

      // 2) Si ESU no trajo IDs por postMessage, los confirmamos después con Graph (opcional).
      //    Pero normalmente ESU trae waba_id y phone_number_id:
      let wabaId = wabaRef.current
      let phoneNumberId = phoneRef.current

      // 3) Obtener businessId y displayPhone
      let businessId = ''
      let displayPhoneNumber = ''

      if (!wabaId || !phoneNumberId) {
        // De respaldo (raro): intentar deducir
        // NOTA: con solo permisos WA puedes listar WABAs asignadas y sus números.
        const wab = await axios.get(
          `https://graph.facebook.com/${FB_VERSION}/me/assigned_whatsapp_business_accounts?fields=name&access_token=${accessToken}`
        )
        const firstWaba = wab.data?.data?.[0]?.id
        if (!wabaId) wabaId = firstWaba || ''
        if (wabaId && !phoneNumberId) {
          const pn = await axios.get(
            `https://graph.facebook.com/${FB_VERSION}/${wabaId}/phone_numbers?fields=display_phone_number&access_token=${accessToken}`
          )
          phoneNumberId = pn.data?.data?.[0]?.id || ''
          displayPhoneNumber = pn.data?.data?.[0]?.display_phone_number || ''
        }
      }

      // businessId desde la WABA
      if (wabaId) {
        const info = await axios.get(
          `https://graph.facebook.com/${FB_VERSION}/${wabaId}?fields=owner_business_info&access_token=${accessToken}`
        )
        businessId = info.data?.owner_business_info?.id || ''
      }

      // displayPhone (si aún falta)
      if (wabaId && phoneNumberId && !displayPhoneNumber) {
        const list = await axios.get(
          `https://graph.facebook.com/${FB_VERSION}/${wabaId}/phone_numbers?fields=display_phone_number&access_token=${accessToken}`
        )
        const match = (list.data?.data || []).find((p: any) => p.id === phoneNumberId)
        displayPhoneNumber = match?.display_phone_number || ''
      }

      // 4) Guardar en tu backend
      const jwt = localStorage.getItem('tempToken') || ''
      await axios.post(
        `${API_URL}/api/whatsapp/vincular`,
        { accessToken, wabaId, phoneNumberId, businessId, displayPhoneNumber },
        { headers: { Authorization: `Bearer ${jwt}` } }
      )

      // (Opcional) suscribir webhooks de la WABA a tu app
      // await axios.post(`https://graph.facebook.com/${FB_VERSION}/${wabaId}/subscribed_apps?subscribed_fields=messages&access_token=${accessToken}`)

      Swal.fire({ icon: 'success', title: 'Conexión completada', background: '#111827', color: '#fff' })
      window.location.href = '/dashboard/settings?success=1'
    } catch (e: any) {
      const txt = typeof e?.response?.data?.error === 'object'
        ? JSON.stringify(e.response.data.error)
        : e?.response?.data?.error || e.message
      Swal.fire({ icon: 'error', title: 'No se pudo completar ESU', text: txt, background: '#111827', color: '#fff' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <div className="max-w-xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">WhatsApp Embedded Signup</h1>
        <p className="text-slate-300 mb-6">Conecta tu número oficial en minutos.</p>
        <button
          onClick={lanzarESU}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded disabled:opacity-50"
        >
          {loading ? 'Abriendo…' : 'Conectar con Facebook'}
        </button>
      </div>
    </div>
  )
}
