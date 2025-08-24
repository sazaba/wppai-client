// Tipos compartidos para el módulo de entrenamiento (training)

export type BusinessType = 'servicios' | 'productos'

export interface ConfigForm {
    nombre: string
    descripcion: string
    servicios: string
    faq: string
    horarios: string
    disclaimers: string
    businessType: BusinessType
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

// Helpers opcionales
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
