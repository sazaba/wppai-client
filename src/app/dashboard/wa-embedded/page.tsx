'use client'

import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID
const META_WA_CONFIG_ID = process.env.NEXT_PUBLIC_META_WA_CONFIG_ID
const FB_VERSION = 'v20.0'

declare global {
  interface Window { FB: any; fbLoaded?: boolean }
}

export default function WAEmbeddedPage() {
  const [loading, setLoading] = useState(false)
  const codeRef = useRef<string | null>(null)
  const wabaRef = useRef<string | null>(null)
  const phoneRef = useRef<string | null>(null)

  // Validar variables de entorno requeridas
  useEffect(() => {
    if (!API_URL || !META_APP_ID || !META_WA_CONFIG_ID) {
      Swal.fire({
        icon: 'error',
        title: 'Configuración incompleta',
        text: 'Faltan variables NEXT_PUBLIC_API_URL, META_APP_ID o META_WA_CONFIG_ID.',
        background: '#111827',
        color: '#fff'
      })
    }
  }, [])

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
    return () => {
      // limpieza opcional si quisieras recargar SDK
    }
  }, [])

  // Captura de resultados ESU via postMessage
  useEffect(() => {
    const onMsg = async (event: MessageEvent) => {
      if (typeof event.data !== 'string') return
      try {
        const data = JSON.parse(event.data)
        if (data?.type !== 'WA_EMBEDDED_SIGNUP') return

        // Guardar IDs si vienen
        if (data.event === 'FINISH' || data.event === 'FINISH_ONLY_WABA') {
          if (data?.data?.waba_id) wabaRef.current = data.data.waba_id
          if (data?.data?.phone_number_id) phoneRef.current = data.data.phone_number_id
        }

        // Guardar code
        if (data?.code) {
          codeRef.current = data.code
          setLoading(true)
          await finalizarVinculacion()
          setLoading(false)
        }
      } catch {
        // ignorar mensajes no válidos
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  const lanzarESU = () => {
    if (!window.FB) {
      Swal.fire({
        icon: 'error',
        title: 'Facebook SDK no cargó',
        background: '#111827',
        color: '#fff'
      })
      return
    }
    if (!META_WA_CONFIG_ID) return
    setLoading(true)

    window.FB.login(
      (response: any) => {
        const code = response?.authResponse?.code
        if (code) {
          codeRef.current = code
          finalizarVinculacion().finally(() => setLoading(false))
        } else {
          setLoading(false)
        }
      },
      {
        config_id: META_WA_CONFIG_ID,
        response_type: 'code',
        override_default_response_type: true,
        scope: 'whatsapp_business_management,whatsapp_business_messaging,public_profile',
        extras: { setup: {} }
      }
    )
  }

  const finalizarVinculacion = async () => {
    try {
      const code = codeRef.current
      if (!code) {
        Swal.fire({
          icon: 'error',
          title: 'Código no recibido',
          text: 'Reinicia el proceso de conexión.',
          background: '#111827',
          color: '#fff'
        })
        return
      }

      // 1) Intercambiar code → access_token
      const r = await axios.post<{ access_token: string }>(
        `${API_URL}/api/auth/exchange-code`,
        { code }
      )
      const accessToken = r.data.access_token

      // 2) Variables locales
      let wabaId = wabaRef.current
      let phoneNumberId = phoneRef.current
      let businessId = ''
      let displayPhoneNumber = ''

      // 3) Si no llegaron IDs, intentar deducirlos
      if (!wabaId || !phoneNumberId) {
        const wab = await axios.get(
          `https://graph.facebook.com/${FB_VERSION}/me/assigned_whatsapp_business_accounts?fields=name&access_token=${accessToken}`
        )
        if (!wabaId) wabaId = wab.data?.data?.[0]?.id || ''
        if (wabaId && !phoneNumberId) {
          const pn = await axios.get(
            `https://graph.facebook.com/${FB_VERSION}/${wabaId}/phone_numbers?fields=display_phone_number&access_token=${accessToken}`
          )
          phoneNumberId = pn.data?.data?.[0]?.id || ''
          displayPhoneNumber = pn.data?.data?.[0]?.display_phone_number || ''
        }
      }

      // 4) Obtener businessId
      if (wabaId) {
        const info = await axios.get(
          `https://graph.facebook.com/${FB_VERSION}/${wabaId}?fields=owner_business_info&access_token=${accessToken}`
        )
        businessId = info.data?.owner_business_info?.id || ''
      }

      // 5) displayPhone si falta
      if (wabaId && phoneNumberId && !displayPhoneNumber) {
        const list = await axios.get(
          `https://graph.facebook.com/${FB_VERSION}/${wabaId}/phone_numbers?fields=display_phone_number&access_token=${accessToken}`
        )
        const match = (list.data?.data || []).find((p: any) => p.id === phoneNumberId)
        displayPhoneNumber = match?.display_phone_number || ''
      }

      // 6) Validaciones antes de guardar
      if (!wabaId || !phoneNumberId) {
        Swal.fire({
          icon: 'error',
          title: 'Datos incompletos',
          text: 'No se pudo obtener el WABA ID o Phone Number ID.',
          background: '#111827',
          color: '#fff'
        })
        return
      }

      // 7) Guardar en backend
      const jwt = localStorage.getItem('tempToken') || ''
      await axios.post(
        `${API_URL}/api/whatsapp/vincular`,
        { accessToken, wabaId, phoneNumberId, businessId, displayPhoneNumber },
        { headers: { Authorization: `Bearer ${jwt}` } }
      )

      // 8) Suscribir webhooks automáticamente
      await axios.post(
        `https://graph.facebook.com/${FB_VERSION}/${wabaId}/subscribed_apps`,
        { subscribed_fields: 'messages' },
        { params: { access_token: accessToken } }
      )

      Swal.fire({
        icon: 'success',
        title: 'Conexión completada',
        background: '#111827',
        color: '#fff'
      })
      window.location.href = '/dashboard/settings?success=1'
    } catch (e: any) {
      const txt =
        typeof e?.response?.data?.error === 'object'
          ? JSON.stringify(e.response.data.error)
          : e?.response?.data?.error || e.message
      Swal.fire({
        icon: 'error',
        title: 'No se pudo completar ESU',
        text: txt,
        background: '#111827',
        color: '#fff'
      })
    } finally {
      setLoading(false)
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
          {loading ? 'Procesando…' : 'Conectar con Facebook'}
        </button>
      </div>
    </div>
  )
}
