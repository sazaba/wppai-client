// Tipos compartidos para el módulo de entrenamiento (training)

export type BusinessType = 'servicios' | 'productos'

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

    // operación (texto libre)
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

    // envío (estructurado)
    envioTipo: string
    envioEntregaEstimado: string
    envioCostoFijo: number | ''    // '' permite limpiar input → se manda como null
    envioGratisDesde: number | ''  // idem

    // pagos
    pagoLinkGenerico: string
    pagoLinkProductoBase: string
    pagoNotas: string
    bancoNombre: string
    bancoTitular: string
    bancoTipoCuenta: string
    bancoNumeroCuenta: string
    bancoDocumento: string
    transferenciaQRUrl: string

    // post-venta
    facturaElectronicaInfo: string
    soporteDevolucionesInfo: string

    // escalamiento
    escalarSiNoConfia: boolean
    escalarPalabrasClave: string
    escalarPorReintentos: number
}

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

// Helpers
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

export interface ModalEntrenamientoProps {
    trainingActive: boolean
    onClose?: () => void
    initialConfig?: Partial<ConfigForm>
}

/** (Opcional) Tipo de lo que devuelve el backend en /api/config */
export type BackendBusinessConfig = Partial<ConfigForm>
