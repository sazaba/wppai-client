'use client'

import { useEffect, useMemo, useState } from 'react'

type Props = {
  src: string
  alt?: string
  className?: string
  /** cuántos reintentos hacer si falla la carga (por latencia del CDN) */
  retries?: number
}

export default function ImgAlways({
  src,
  alt = '',
  className,
  retries = 4,
}: Props) {
  const [attempt, setAttempt] = useState(0)
  const [showFallback, setShowFallback] = useState(false)

  // Si cambia la src “base”, resetea el estado de error e intentos
  useEffect(() => {
    setAttempt(0)
    setShowFallback(false)
  }, [src])

  // bust evita cache; incluye el número de intento
  const busted = useMemo(() => {
    if (!src) return ''
    if (src.startsWith('data:')) return src
    const sep = src.includes('?') ? '&' : '?'
    return `${src}${sep}_=${Date.now()}-${attempt}`
  }, [src, attempt])

  const fallback =
    'data:image/svg+xml;charset=UTF-8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="112">
        <rect width="100%" height="100%" fill="#0f172a"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
          fill="#94a3b8" font-size="12">imagen no disponible</text>
      </svg>`
    )

  const handleError = () => {
    // Reintenta algunas veces (R2/CDN puede tardar un poco en servir la nueva imagen)
    if (attempt < retries) {
      const next = attempt + 1
      setTimeout(() => setAttempt(next), 250 * next) // backoff suave
    } else {
      setShowFallback(true)
    }
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={showFallback ? fallback : busted}
      alt={alt}
      className={className}
      decoding="async"
      loading="lazy"
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
      onError={handleError}
    />
  )
}
