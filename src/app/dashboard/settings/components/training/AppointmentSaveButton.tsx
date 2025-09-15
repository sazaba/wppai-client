// components/AppointmentSaveButton.tsx
'use client'

import { useState } from 'react'
import { saveAppointmentSettings, type AppointmentConfigValue } from '@/lib/appointments'

export default function AppointmentSaveButton({
  value,
  onSaved,
}: {
  value: AppointmentConfigValue
  onSaved?: () => void
}) {
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)
    try {
      // Aviso suave (no bloquea): agenda on sin días abiertos
      const opened = (value.hours || []).some((d) => d.isOpen)
      if (value.appointmentEnabled && !opened) {
        console.warn('Agenda activa sin días abiertos. Se guardará como cerrado en todos los días.')
      }

      await saveAppointmentSettings(value)
      onSaved?.()
      alert('Configuración de agenda guardada ✅')
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'No se pudo guardar'
      alert(`❌ ${msg}`)
      console.error('[AppointmentSaveButton] error:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSave}
      disabled={loading}
      className="inline-flex items-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-60"
    >
      {loading ? 'Guardando…' : 'Guardar agenda'}
    </button>
  )
}
