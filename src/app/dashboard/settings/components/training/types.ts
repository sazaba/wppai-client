// Tipos compartidos para el módulo de entrenamiento (training)

// ===============================
// Negocio / pestañas del editor
// ===============================
export type BusinessType = 'servicios' | 'productos'
export type EditorTab = 'servicios' | 'productos' | 'agente'

// ===============================
// IA (mismos unions que el backend)
// ===============================
export type AiMode = 'ecommerce' | 'agente'
export type AgentSpecialty =
    | 'generico'
    | 'medico'
    | 'dermatologia'
    | 'nutricion'
    | 'psicologia'
    | 'odontologia'

// ===============================
// Agenda / Citas (config del negocio)
// ===============================
export type AppointmentVertical =
    | 'none'
    | 'salud'       // odontología, estética, nutrición, etc.
    | 'bienestar'   // spa, peluquería, barbería
    | 'automotriz'  // taller, mantenimiento
    | 'veterinaria'
    | 'fitness'     // gimnasios, entrenadores
    | 'otros'

// Estructura de horario semanal para agenda
export type WeekdayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export type TimeInterval = {
    /** Formato HH:mm (24h). Ej: "08:00" */
    start: string
    /** Formato HH:mm (24h). Ej: "17:30" */
    end: string
}

export type DaySchedule = {
    enabled: boolean
    blocks: TimeInterval[]
}

/** Horario laboral por día de la semana */
export type AppointmentWorkHours = Record<WeekdayKey, DaySchedule>

// ===============================
// ConfigForm (usado por BusinessForm/Modal)
// ===============================

/** Configuración completa usada por el formulario (front) y el backend */
export type ConfigForm = {
    // base
    nombre: string
    descripcion: string
    servicios: string
    faq: string
    horarios: string
    disclaimers: string
    businessType: BusinessType

    // ===== Perfil de IA
    aiMode: AiMode                         // 'ecommerce' | 'agente'
    agentSpecialty: AgentSpecialty         // solo aplica si aiMode = 'agente'
    agentPrompt?: string                   // tono/instrucciones
    agentScope?: string                    // qué atiende / qué no
    agentDisclaimers?: string              // descargos de responsabilidad

    // ===== Operación (texto libre)
    enviosInfo: string
    metodosPago: string
    tiendaFisica: boolean
    direccionTienda: string
    politicasDevolucion: string
    politicasGarantia: string
    promocionesInfo: string
    canalesAtencion: string
    extras: string
    palabrasClaveNegocio: string

    // ===== Envío (estructurado)
    envioTipo: string
    envioEntregaEstimado: string
    /** '' permite limpiar input → se manda como null al backend */
    envioCostoFijo: number | ''
    envioGratisDesde: number | ''

    // ===== Pagos
    pagoLinkGenerico: string
    pagoLinkProductoBase: string
    pagoNotas: string
    bancoNombre: string
    bancoTitular: string
    bancoTipoCuenta: string
    bancoNumeroCuenta: string
    bancoDocumento: string
    transferenciaQRUrl: string

    // ===== Post-venta
    facturaElectronicaInfo: string
    soporteDevolucionesInfo: string

    // ===== Escalamiento
    escalarSiNoConfia: boolean
    escalarPalabrasClave: string
    escalarPorReintentos: number

    // ===== Agenda / Citas (NUEVO)
    /** Habilita el módulo de citas para el negocio */
    appointmentEnabled?: boolean
    /** Vertical del negocio para respuestas/plantillas del agente */
    appointmentVertical?: AppointmentVertical
    /** Zona horaria por defecto (IANA), ej: "America/Bogota" */
    appointmentTimezone?: string
    /** Minutos de colchón entre citas (buffer) */
    appointmentBufferMin?: number
    /** Horario laboral semanal; null si no configurado */
    appointmentWorkHours?: AppointmentWorkHours | null
    /** Políticas/términos visibles para el cliente */
    appointmentPolicies?: string
    /** Enviar recordatorios automáticos */
    appointmentReminders?: boolean
}

// ===============================
// Catálogo (productos)
// ===============================
export interface ImagenProducto {
    id?: number
    url: string
    alt?: string
    objectKey?: string | null
}

export interface Producto {
    id?: number
    nombre: string
    descripcion: string
    beneficios: string
    caracteristicas: string
    precioDesde?: number | null
    imagenes: ImagenProducto[]
}

// Helpers de catálogo
export const emptyProducto = (): Producto => ({
    nombre: '',
    descripcion: '',
    beneficios: '',
    caracteristicas: '',
    precioDesde: null,
    imagenes: [],
})

export const isProducto = (v: unknown): v is Producto => {
    if (!v || typeof v !== 'object') return false
    const p = v as Producto
    return typeof p.nombre === 'string' && Array.isArray(p.imagenes)
}

// ===============================
// Props del modal de entrenamiento
// ===============================
export interface ModalEntrenamientoProps {
    trainingActive: boolean
    onClose?: () => void
    initialConfig?: Partial<ConfigForm>
}

/** (Opcional) Tipo de lo que devuelve el backend en /api/config */
export type BackendBusinessConfig = Partial<ConfigForm>

// ===============================
// Defaults útiles (opcional)
// ===============================
export const defaultWorkHours: AppointmentWorkHours = {
    mon: { enabled: true, blocks: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
    tue: { enabled: true, blocks: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
    wed: { enabled: true, blocks: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
    thu: { enabled: true, blocks: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
    fri: { enabled: true, blocks: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
    sat: { enabled: false, blocks: [{ start: '09:00', end: '13:00' }] },
    sun: { enabled: false, blocks: [] },
}
