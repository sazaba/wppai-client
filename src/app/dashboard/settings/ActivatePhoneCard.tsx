// 'use client'

// import { useState } from 'react'
// import axios from 'axios'
// import Swal from 'sweetalert2'
// import 'sweetalert2/dist/sweetalert2.min.css'

// const API_URL = process.env.NEXT_PUBLIC_API_URL

// type Phone = {
//   id: string
//   display_phone_number: string
// }

// export default function ActivateWabaPhone() {
//   const [wabaId, setWabaId] = useState('')
//   const [pin, setPin] = useState('') // ← requerido por Meta si el número ya tiene 2FA
//   const [phones, setPhones] = useState<Phone[]>([])
//   const [selected, setSelected] = useState<Phone | null>(null)
//   const [loading, setLoading] = useState(false)
//   const [activating, setActivating] = useState(false)
//   const [status, setStatus] = useState<any>(null)

//   const jwt = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''

//   const listPhones = async () => {
//     if (!API_URL) return alert('Falta NEXT_PUBLIC_API_URL')
//     if (!wabaId.trim()) {
//       Swal.fire({
//         icon: 'info',
//         title: 'Falta WABA ID',
//         text: 'Pega el WABA ID de tu cuenta de WhatsApp Business.',
//         background: '#0f172a',
//         color: '#e2e8f0'
//       })
//       return
//     }
//     try {
//       setLoading(true)
//       setSelected(null)
//       setPhones([])
//       setStatus(null)
//       const { data } = await axios.get(`${API_URL}/api/whatsapp/waba/${wabaId}/phones`, {
//         headers: { Authorization: `Bearer ${jwt}` },
//       })
//       const list: Phone[] = data?.data || []
//       setPhones(list)
//       if (!list.length) {
//         Swal.fire({
//           icon: 'info',
//           title: 'Sin números',
//           text: 'Esa WABA no tiene teléfonos configurados.',
//           background: '#0f172a',
//           color: '#e2e8f0'
//         })
//       }
//     } catch (e: any) {
//       const msg = e?.response?.data?.error?.message || e?.message || 'Error listando números'
//       Swal.fire({ icon: 'error', title: 'Error', text: String(msg), background: '#0f172a', color: '#e2e8f0' })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const activate = async () => {
//     if (!API_URL) return alert('Falta NEXT_PUBLIC_API_URL')
//     if (!selected) {
//       return Swal.fire({
//         icon: 'info',
//         title: 'Elige un número',
//         text: 'Selecciona un teléfono de la lista.',
//         background: '#0f172a',
//         color: '#e2e8f0'
//       })
//     }

//     // ⚠️ En tu caso Meta está exigiendo PIN sí o sí (logs: #100 y #133005)
//     const cleanPin = pin.trim()
//     if (!/^\d{6}$/.test(cleanPin)) {
//       return Swal.fire({
//         icon: 'warning',
//         title: 'PIN requerido',
//         html:
//           'Meta exige un PIN de <b>6 dígitos</b> para registrar este número. ' +
//           'Si el número ya fue registrado antes, debes ingresar el <b>mismo PIN</b>. ' +
//           'Si no lo recuerdas, resetea la verificación en dos pasos desde WhatsApp Manager.',
//         background: '#0f172a',
//         color: '#e2e8f0'
//       })
//     }

//     try {
//       setActivating(true)
//       setStatus(null)

//       await axios.post(
//         `${API_URL}/api/whatsapp/activar-numero`,
//         {
//           wabaId: wabaId.trim(),
//           phoneNumberId: selected.id,
//           pin: cleanPin,
//         },
//         { headers: { Authorization: `Bearer ${jwt}` } }
//       )

//       const st = await axios.get(`${API_URL}/api/whatsapp/numero/${selected.id}/estado`, {
//         headers: { Authorization: `Bearer ${jwt}` },
//       })
//       setStatus(st.data?.data || null)

//       Swal.fire({
//         icon: 'success',
//         title: '¡Listo!',
//         text: 'El número fue activado (registro exitoso).',
//         background: '#0f172a',
//         color: '#e2e8f0'
//       })
//     } catch (e: any) {
//       const statusCode = e?.response?.status
//       const backendMsg =
//         e?.response?.data?.error ||
//         e?.response?.data?.message ||
//         e?.response?.data?.error?.message ||
//         e?.message ||
//         'No se pudo activar'

//       // Mensajes más claros para casos frecuentes
//       const text =
//         /pin.*required/i.test(String(backendMsg))
//           ? 'Meta exige PIN de 6 dígitos para este número. Ingresa el PIN correcto.'
//           : /two step verification pin mismatch|133005/i.test(String(backendMsg))
//           ? 'PIN incorrecto. Debes usar el PIN exacto que se configuró anteriormente o resetearlo desde WhatsApp Manager.'
//           : String(backendMsg)

//       if (statusCode === 409) {
//         Swal.fire({
//           icon: 'warning',
//           title: 'Número ya conectado',
//           text:
//             'Este número ya está vinculado a otra empresa en tu cuenta. Desconéctalo allí primero o usa otro número.',
//           background: '#0f172a',
//           color: '#e2e8f0'
//         })
//       } else {
//         Swal.fire({ icon: 'error', title: 'Error', text, background: '#0f172a', color: '#e2e8f0' })
//       }
//     } finally {
//       setActivating(false)
//     }
//   }

//   return (
//     <div className="rounded-xl border border-slate-700 bg-slate-900 text-slate-100 p-5 space-y-5">
//       <h3 className="font-semibold text-base">Activar número por WABA ID</h3>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//         <label className="text-sm text-slate-300 col-span-2">
//           WABA ID
//           <input
//             className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//             placeholder="789815586744507"
//             value={wabaId}
//             onChange={(e) => setWabaId(e.target.value)}
//           />
//         </label>

//         <label className="text-sm text-slate-300">
//           PIN (2FA)
//           <input
//             className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//             placeholder="6 dígitos"
//             value={pin}
//             onChange={(e) => setPin(e.target.value)}
//             inputMode="numeric"
//             maxLength={6}
//           />
//         </label>
//       </div>

//       <div className="flex items-center gap-3">
//         <button
//           type="button"
//           onClick={listPhones}
//           disabled={loading || !wabaId.trim()}
//           className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
//         >
//           {loading ? 'Buscando…' : 'Listar números'}
//         </button>

//         {selected && (
//           <button
//             type="button"
//             onClick={activate}
//             disabled={activating}
//             className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
//           >
//             {activating ? 'Activando…' : 'Activar este número'}
//           </button>
//         )}

//         {selected && (
//           <div className="text-xs text-slate-400">
//             Seleccionado: <span className="text-slate-200">{selected.display_phone_number}</span>{' '}
//             · ID: <code className="text-slate-300">{selected.id}</code>
//           </div>
//         )}
//       </div>

//       {!!phones.length && (
//         <div className="space-y-2">
//           <div className="text-sm text-slate-400">Números encontrados:</div>
//           {phones.map((p) => (
//             <button
//               key={p.id}
//               onClick={() => {
//                 setSelected(p)
//                 setStatus(null)
//               }}
//               className={`w-full text-left rounded-lg px-3 py-2 border transition ${
//                 selected?.id === p.id
//                   ? 'border-indigo-500 bg-slate-800/80'
//                   : 'border-slate-700 bg-slate-800 hover:bg-slate-800/70'
//               }`}
//             >
//               <div className="text-sm text-slate-100">{p.display_phone_number}</div>
//               <div className="text-[11px] text-slate-400">phone_number_id: {p.id}</div>
//             </button>
//           ))}
//         </div>
//       )}

//       {status && (
//         <pre className="bg-slate-800 border border-slate-700 text-xs text-slate-200 p-3 rounded-lg overflow-auto">
// {JSON.stringify(
//   {
//     id: status.id,
//     display_phone_number: status.display_phone_number,
//     status: status.status,
//     name_status: status.name_status,
//     account_mode: status.account_mode,
//     quality_rating: status.quality_rating,
//   },
//   null,
//   2
// )}
//         </pre>
//       )}

//       <p className="text-xs text-slate-400 leading-relaxed">
//         Meta puede exigir PIN (verificación en dos pasos) para registrar el número. Si ves error de
//         <span className="font-medium"> PIN incorrecto</span>, usa el PIN exacto configurado
//         anteriormente o <span className="font-medium">restablécelo</span> desde WhatsApp Manager.
//       </p>
//     </div>
//   )
// }



'use client'

import { useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import { Smartphone, KeyRound, Search, Check, Server, ShieldAlert, Loader2, ShieldCheck } from 'lucide-react'
import clsx from 'clsx'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type Phone = {
  id: string
  display_phone_number: string
}

export default function ActivateWabaPhone() {
  const [wabaId, setWabaId] = useState('')
  const [pin, setPin] = useState('') // ← requerido por Meta si el número ya tiene 2FA
  const [phones, setPhones] = useState<Phone[]>([])
  const [selected, setSelected] = useState<Phone | null>(null)
  const [loading, setLoading] = useState(false)
  const [activating, setActivating] = useState(false)
  const [status, setStatus] = useState<any>(null)

  const jwt = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''

  const listPhones = async () => {
    if (!API_URL) return alert('Falta NEXT_PUBLIC_API_URL')
    if (!wabaId.trim()) {
      Swal.fire({
        icon: 'info',
        title: 'Falta WABA ID',
        text: 'Pega el WABA ID de tu cuenta de WhatsApp Business.',
        background: '#09090b',
        color: '#e2e8f0',
        confirmButtonColor: '#6366f1'
      })
      return
    }
    try {
      setLoading(true)
      setSelected(null)
      setPhones([])
      setStatus(null)
      const { data } = await axios.get(`${API_URL}/api/whatsapp/waba/${wabaId}/phones`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      const list: Phone[] = data?.data || []
      setPhones(list)
      if (!list.length) {
        Swal.fire({
          icon: 'info',
          title: 'Sin números',
          text: 'Esa WABA no tiene teléfonos configurados.',
          background: '#09090b',
          color: '#e2e8f0',
          confirmButtonColor: '#6366f1'
        })
      }
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message || e?.message || 'Error listando números'
      Swal.fire({ icon: 'error', title: 'Error', text: String(msg), background: '#09090b', color: '#e2e8f0', confirmButtonColor: '#ef4444' })
    } finally {
      setLoading(false)
    }
  }

  const activate = async () => {
    if (!API_URL) return alert('Falta NEXT_PUBLIC_API_URL')
    if (!selected) {
      return Swal.fire({
        icon: 'info',
        title: 'Elige un número',
        text: 'Selecciona un teléfono de la lista.',
        background: '#09090b',
        color: '#e2e8f0',
        confirmButtonColor: '#6366f1'
      })
    }

    // ⚠️ En tu caso Meta está exigiendo PIN sí o sí (logs: #100 y #133005)
    const cleanPin = pin.trim()
    if (!/^\d{6}$/.test(cleanPin)) {
      return Swal.fire({
        icon: 'warning',
        title: 'PIN requerido',
        html:
          'Meta exige un PIN de <b>6 dígitos</b> para registrar este número. ' +
          'Si el número ya fue registrado antes, debes ingresar el <b>mismo PIN</b>. ' +
          'Si no lo recuerdas, resetea la verificación en dos pasos desde WhatsApp Manager.',
        background: '#09090b',
        color: '#e2e8f0',
        confirmButtonColor: '#f59e0b'
      })
    }

    try {
      setActivating(true)
      setStatus(null)

      await axios.post(
        `${API_URL}/api/whatsapp/activar-numero`,
        {
          wabaId: wabaId.trim(),
          phoneNumberId: selected.id,
          pin: cleanPin,
        },
        { headers: { Authorization: `Bearer ${jwt}` } }
      )

      const st = await axios.get(`${API_URL}/api/whatsapp/numero/${selected.id}/estado`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      setStatus(st.data?.data || null)

      Swal.fire({
        icon: 'success',
        title: '¡Listo!',
        text: 'El número fue activado (registro exitoso).',
        background: '#09090b',
        color: '#e2e8f0',
        confirmButtonColor: '#10b981'
      })
    } catch (e: any) {
      const statusCode = e?.response?.status
      const backendMsg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.response?.data?.error?.message ||
        e?.message ||
        'No se pudo activar'

      // Mensajes más claros para casos frecuentes
      const text =
        /pin.*required/i.test(String(backendMsg))
          ? 'Meta exige PIN de 6 dígitos para este número. Ingresa el PIN correcto.'
          : /two step verification pin mismatch|133005/i.test(String(backendMsg))
          ? 'PIN incorrecto. Debes usar el PIN exacto que se configuró anteriormente o resetearlo desde WhatsApp Manager.'
          : String(backendMsg)

      if (statusCode === 409) {
        Swal.fire({
          icon: 'warning',
          title: 'Número ya conectado',
          text:
            'Este número ya está vinculado a otra empresa en tu cuenta. Desconéctalo allí primero o usa otro número.',
          background: '#09090b',
          color: '#e2e8f0',
          confirmButtonColor: '#f59e0b'
        })
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text, background: '#09090b', color: '#e2e8f0', confirmButtonColor: '#ef4444' })
      }
    } finally {
      setActivating(false)
    }
  }

  return (
    // Contenedor Glassmorphism Premium
    <div className="relative w-full max-w-3xl mx-auto bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
      
      {/* Luces ambientales (Azul/Violeta para configuración técnica) */}
      <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10">
          
          {/* Header Sección */}
          <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <Smartphone className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Activación Manual</h3>
                <p className="text-sm text-zinc-400">Configuración avanzada por WABA ID y PIN</p>
            </div>
          </div>

          {/* Grid de Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                 <Server className="w-3 h-3" /> WABA ID
              </label>
              <input
                className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="Ej: 789815586744507"
                value={wabaId}
                onChange={(e) => setWabaId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                 <KeyRound className="w-3 h-3" /> PIN (2FA)
              </label>
              <input
                className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all tracking-widest text-center"
                placeholder="000000"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                inputMode="numeric"
                maxLength={6}
              />
            </div>
          </div>

          {/* Botón Listar */}
          <div className="flex items-center justify-end gap-4 mb-8">
            <button
                type="button"
                onClick={listPhones}
                disabled={loading || !wabaId.trim()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {loading ? 'Buscando...' : 'Listar Números'}
            </button>
          </div>

          {/* Lista de Teléfonos */}
          {phones.length > 0 && (
             <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">Números Encontrados</h4>
                    <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded-md border border-white/5">
                        {phones.length} disponibles
                    </span>
                </div>
                
                <div className="grid gap-3">
                    {phones.map((p) => {
                        const isSelected = selected?.id === p.id
                        return (
                            <button
                                key={p.id}
                                onClick={() => {
                                    setSelected(p)
                                    setStatus(null)
                                }}
                                className={clsx(
                                    "w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left group",
                                    isSelected 
                                        ? "bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-900/10" 
                                        : "bg-zinc-900/50 border-white/5 hover:bg-zinc-800 hover:border-white/10"
                                )}
                            >
                                <div>
                                    <p className={clsx("font-mono text-lg font-medium", isSelected ? "text-emerald-400" : "text-white")}>
                                        {p.display_phone_number}
                                    </p>
                                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                                        ID: <code className="bg-black/30 px-1 py-0.5 rounded text-zinc-400">{p.id}</code>
                                    </p>
                                </div>
                                {isSelected && (
                                    <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                                        <Check className="w-5 h-5" />
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
                
                {/* Botón Activar (Solo visible si hay selección) */}
                {selected && (
                    <div className="flex justify-end pt-4 border-t border-white/5 mt-4">
                         <button
                            type="button"
                            onClick={activate}
                            disabled={activating}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all transform hover:scale-[1.02] disabled:opacity-70"
                        >
                            {activating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                            {activating ? 'Activando...' : `Activar ${selected.display_phone_number}`}
                        </button>
                    </div>
                )}
             </div>
          )}

          {/* Consola de Estado */}
          {status && (
            <div className="mt-8 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-2 mb-2">
                    <Server className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Estado de la Conexión</h4>
                </div>
                <div className="bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-xs text-zinc-300 overflow-x-auto shadow-inner relative group">
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <pre className="whitespace-pre-wrap">
{JSON.stringify({
    id: status.id,
    display_phone_number: status.display_phone_number,
    status: status.status,
    name_status: status.name_status,
    account_mode: status.account_mode,
    quality_rating: status.quality_rating,
}, null, 2)}
                    </pre>
                </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="mt-8 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-3">
             <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
             <p className="text-xs text-amber-200/80 leading-relaxed">
                Meta puede exigir el PIN de verificación en dos pasos (2FA) para registrar el número. 
                Si obtienes un error de <span className="font-bold text-amber-400">PIN incorrecto</span>, asegúrate de usar el PIN exacto configurado anteriormente o restablécelo desde el WhatsApp Manager de Meta.
             </p>
          </div>

      </div>
    </div>
  )
}