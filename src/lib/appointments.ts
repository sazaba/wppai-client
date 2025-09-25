// lib/appointments.ts
import axios from "axios"

/* ========== Tipos compartidos del módulo de agenda ========== */
export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"
export type Vertical =
    | "none"
    | "salud"
    | "bienestar"
    | "automotriz"
    | "veterinaria"
    | "fitness"
    | "otros"

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

export type AppointmentDTO = {
    id: number
    empresaId: number
    customerName: string
    customerPhone: string
    serviceName: string
    sedeName?: string | null
    providerName?: string | null
    startAt: string // ISO con offset
    endAt: string   // ISO con offset
    notas?: string | null
    status?: "pending" | "confirmed" | "rescheduled" | "cancelled" | "completed" | "no_show"
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "") as string

function getAuthHeaders(): Record<string, string> {
    if (typeof window === "undefined") return {}
    const token = localStorage.getItem("token")
    return token ? { Authorization: `Bearer ${token}` } : {}
}

const ORDER: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]

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

/* ========== TZ helpers ========== */
/** Convierte "YYYY-MM-DDTHH:mm" (de <input type="datetime-local" />)
 * a ISO con offset. Por defecto usa -05:00 (America/Bogota, sin DST).
 */
export function localToISOWithOffset(local: string, offsetMinutes = -300): { iso: string; dateLocal: Date } {
    const [y, m, rest] = local.split("-")
    const [d, hm] = (rest || "").split("T")
    const [H, M] = (hm || "").split(":")
    const dateLocal = new Date(Number(y), Number(m) - 1, Number(d), Number(H || 0), Number(M || 0), 0, 0)

    const sign = offsetMinutes <= 0 ? "-" : "+"
    const abs = Math.abs(offsetMinutes)
    const oh = String(Math.floor(abs / 60)).padStart(2, "0")
    const om = String(abs % 60).padStart(2, "0")
    const tz = `${sign}${oh}:${om}`

    const yyyy = dateLocal.getFullYear()
    const MM = String(dateLocal.getMonth() + 1).padStart(2, "0")
    const dd = String(dateLocal.getDate()).padStart(2, "0")
    const HH = String(dateLocal.getHours()).padStart(2, "0")
    const mm = String(dateLocal.getMinutes()).padStart(2, "0")

    return { iso: `${yyyy}-${MM}-${dd}T${HH}:${mm}:00${tz}`, dateLocal }
}

/* ========== Cargar configuración desde el backend ========== */
export async function fetchAppointmentConfig(): Promise<{
    config: Partial<AppointmentConfigValue>
    hours: AppointmentDay[]
    provider?: ProviderInput | null
}> {
    const headers = { ...getAuthHeaders(), "Cache-Control": "no-cache" }
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
                timezone: input.appointmentTimezone || "America/Bogota",
                bufferMin: Number.isFinite(input.appointmentBufferMin)
                    ? input.appointmentBufferMin
                    : 10,
                policies: input.appointmentPolicies ?? "",
                reminders: !!input.appointmentReminders,
            },
            hours: normalized,
            // provider: input.provider ?? null, // habilitar cuando expongas el endpoint
        },
        { headers }
    )

    return true
}

/* ========== CRUD de citas (opcional, por si prefieres llamar desde aquí) ========== */
export async function listAppointments(params: { empresaId: number; fromISO: string; toISO: string }) {
    const headers = { ...getAuthHeaders() }
    const q = new URLSearchParams({ empresaId: String(params.empresaId), from: params.fromISO, to: params.toISO })
    const { data } = await axios.get<AppointmentDTO[]>(`${API_URL}/api/appointments?${q.toString()}`, { headers })
    return data
}

export async function createAppointment(input: {
    empresaId: number
    name: string
    phone: string
    service: string
    startLocal: string // "YYYY-MM-DDTHH:mm" del input datetime-local
    durationMin?: number
    notes?: string
    tzOffsetMin?: number // default -300
}) {
    const headers = { ...getAuthHeaders() }
    const { iso: startAtISO, dateLocal } = localToISOWithOffset(input.startLocal, input.tzOffsetMin ?? -300)
    const duration = Number.isFinite(input.durationMin as number) ? (input.durationMin as number) : 30
    const endLocal = new Date(dateLocal.getTime() + duration * 60_000)
    const endStr = `${endLocal.getFullYear()}-${String(endLocal.getMonth() + 1).padStart(2, "0")}-${String(
        endLocal.getDate()
    ).padStart(2, "0")}T${String(endLocal.getHours()).padStart(2, "0")}:${String(endLocal.getMinutes()).padStart(2, "0")}`
    const { iso: endAtISO } = localToISOWithOffset(endStr, input.tzOffsetMin ?? -300)

    const body = {
        empresaId: input.empresaId,
        customerName: input.name,
        customerPhone: input.phone,
        serviceName: input.service,
        notas: input.notes ?? null,
        startAt: startAtISO,
        endAt: endAtISO,
        timezone: "America/Bogota",
    }

    const { data } = await axios.post<AppointmentDTO>(`${API_URL}/api/appointments?empresaId=${input.empresaId}`, body, { headers })
    return data
}

export async function updateAppointment(id: number, patch: Partial<AppointmentDTO> & { startLocal?: string; tzOffsetMin?: number }) {
    const headers = { ...getAuthHeaders() }
    let payload: any = { ...patch }

    if (patch.startLocal) {
        // si viene startLocal, convertimos a startAt con offset y dejamos que el backend derive/regule endAt
        const { iso } = localToISOWithOffset(patch.startLocal, patch.tzOffsetMin ?? -300)
        payload.startAt = iso
        delete payload.startLocal
        delete payload.tzOffsetMin
    }

    const { data } = await axios.put<AppointmentDTO>(`${API_URL}/api/appointments/${id}`, payload, { headers })
    return data
}

export async function deleteAppointment(id: number, empresaId?: number) {
    const headers = { ...getAuthHeaders() }
    const url = empresaId ? `${API_URL}/api/appointments/${id}?empresaId=${empresaId}` : `${API_URL}/api/appointments/${id}`
    await axios.delete(url, { headers })
    return true
}
