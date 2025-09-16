// lib/appointments.ts
import axios from 'axios'

/* ========== Tipos compartidos del módulo de agenda ========== */
export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
export type Vertical =
    | 'none'
    | 'salud'
    | 'bienestar'
    | 'automotriz'
    | 'veterinaria'
    | 'fitness'
    | 'otros'

export type AppointmentDay = {
    day: Weekday
    isOpen: boolean
    start1?: string | null
    end1?: string | null
    start2?: string | null
    end2?: string | null
}

export type ProviderInput = {
    id?: number
    nombre?: string
    email?: string
    phone?: string
    cargo?: string
    colorHex?: string
    activo?: boolean
}

export type AppointmentConfigValue = {
    appointmentEnabled: boolean
    appointmentVertical: Vertical
    appointmentTimezone: string
    appointmentBufferMin: number
    appointmentPolicies?: string
    appointmentReminders: boolean
    hours?: AppointmentDay[]
    provider?: ProviderInput | null
}

export type SaveAppointmentConfigInput = {
    appointmentEnabled: boolean
    appointmentVertical: Vertical
    appointmentTimezone: string
    appointmentBufferMin: number
    appointmentPolicies?: string
    appointmentReminders: boolean
    hours?: AppointmentDay[]
    /** opcional, se ignora si viene vacío */
    provider?: ProviderInput | null
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
        base.set(d, {
            day: d,
            isOpen: false,
            start1: null,
            end1: null,
            start2: null,
            end2: null,
        })
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
                base.set(k, {
                    day: k,
                    isOpen: false,
                    start1: null,
                    end1: null,
                    start2: null,
                    end2: null,
                })
            }
        }
    }
    return ORDER.map((d) => base.get(d)!)
}

/* ========== Cargar configuración desde el backend ========== */
export async function fetchAppointmentConfig(): Promise<{
    config: Partial<AppointmentConfigValue>
    hours: AppointmentDay[]
    provider?: ProviderInput | null
}> {
    const headers = { ...getAuthHeaders(), 'Cache-Control': 'no-cache' } // 👈 evita caché
    const { data } = await axios.get(`${API_URL}/api/appointments/config`, { headers })

    return {
        config: data?.data?.config || {},
        hours: Array.isArray(data?.data?.hours) ? data.data.hours : [],
        provider: data?.data?.provider ?? null,
    }
}

/* ========== Guardar configuración (config + hours + provider opcional) ========== */
export async function saveAppointmentConfig(input: SaveAppointmentConfigInput) {
    const headers = { ...getAuthHeaders() }
    const normalized = normalizeDays(input.hours)

    await axios.post(
        `${API_URL}/api/appointments/config`,
        {
            appointment: {
                enabled: !!input.appointmentEnabled,
                vertical: input.appointmentVertical,
                timezone: input.appointmentTimezone || 'America/Bogota',
                bufferMin: Number.isFinite(input.appointmentBufferMin)
                    ? input.appointmentBufferMin
                    : 10,
                policies: input.appointmentPolicies ?? '',
                reminders: !!input.appointmentReminders,
            },
            hours: normalized,
            // provider: input.provider ?? null, // habilitar cuando expongas el endpoint
        },
        { headers }
    )

    return true
}
