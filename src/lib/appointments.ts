// lib/appointments.ts
import axios from 'axios'

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
export type Vertical =
    | 'none' | 'salud' | 'bienestar' | 'automotriz' | 'veterinaria' | 'fitness' | 'otros'

export type AppointmentDay = {
    day: Weekday
    isOpen: boolean
    start1?: string | null
    end1?: string | null
    start2?: string | null
    end2?: string | null
}

export type AppointmentConfigValue = {
    appointmentEnabled: boolean
    appointmentVertical: Vertical
    appointmentTimezone: string
    appointmentBufferMin: number
    appointmentPolicies?: string
    appointmentReminders: boolean
    hours?: AppointmentDay[]
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '') as string

function getAuthHeaders(): Record<string, string> {
    if (typeof window === 'undefined') return {}
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
}

const ORDER: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

/** Normaliza a 7 filas y limpia horas cuando isOpen=false */
export function normalizeDays(days?: AppointmentDay[]): AppointmentDay[] {
    const base = new Map<Weekday, AppointmentDay>()
    for (const d of ORDER) {
        base.set(d, { day: d, isOpen: false, start1: null, end1: null, start2: null, end2: null })
    }
    if (Array.isArray(days)) {
        for (const it of days) {
            const k = it.day as Weekday
            if (!ORDER.includes(k)) continue
            if (it.isOpen) {
                base.set(k, {
                    day: k,
                    isOpen: true,
                    start1: it.start1 ?? null,
                    end1: it.end1 ?? null,
                    start2: it.start2 ?? null,
                    end2: it.end2 ?? null,
                })
            } else {
                base.set(k, { day: k, isOpen: false, start1: null, end1: null, start2: null, end2: null })
            }
        }
    }
    return ORDER.map((d) => base.get(d)!)
}

/** Guarda config + hours (bulk). Lanza si falla. */
export async function saveAppointmentSettings(value: AppointmentConfigValue) {
    const headers = { ...getAuthHeaders() }

    // 1) PATCH configuración general
    await axios.patch(
        `${API_URL}/api/business-config`,
        {
            appointmentEnabled: !!value.appointmentEnabled,
            appointmentVertical: value.appointmentVertical,
            appointmentTimezone: value.appointmentTimezone || 'America/Bogota',
            appointmentBufferMin: Number.isFinite(value.appointmentBufferMin)
                ? value.appointmentBufferMin
                : 10,
            appointmentPolicies: value.appointmentPolicies ?? '',
            appointmentReminders: !!value.appointmentReminders,
        },
        { headers }
    )

    // 2) PUT los 7 días
    const days = normalizeDays(value.hours)
    await axios.put(`${API_URL}/api/appointment-hours`, { days }, { headers })

    return true
}
