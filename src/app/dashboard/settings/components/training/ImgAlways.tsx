'use client'

import { useEffect, useMemo, useState } from 'react'

type Props = {
  src: string
  alt?: string
  className?: string
  /** reintentos si falla la carga (solo para URLs NO firmadas) */
  retries?: number
  /** desactivar cache-busting manualmente */
  disableBust?: boolean
}

function isSignedUrl(url: string) {
  if (!url) return false
  try {
    const u = new URL(url, typeof window !== 'undefined' ? window.location.href : undefined)
    const q = u.searchParams
    // señales típicas de URLs firmadas (S3/R2/presigned/secure)
    return (
      q.has('X-Amz-Signature') ||
      q.has('X-Amz-Algorithm') ||
      q.has('X-Amz-Credential') ||
      q.has('X-Amz-Security-Token') ||
      q.has('signature') ||
      q.has('token') ||
      q.has('expires') ||
      q.has('sig')
    )
  } catch {
    return false
  }
}

export default function ImgAlways({
  src,
  alt = '',
  className,
  retries = 4,
  disableBust = false,
}: Props) {
  const [attempt, setAttempt] = useState(0)
  const [showFallback, setShowFallback] = useState(false)

  // reset al cambiar src
  useEffect(() => {
    setAttempt(0)
    setShowFallback(false)
  }, [src])

  const signed = useMemo(() => isSignedUrl(src), [src])

  // Solo hacemos bust si NO está firmada y no se desactivó
  const busted = useMemo(() => {
    if (!src) return ''
    if (src.startsWith('data:')) return src
    if (disableBust || signed) return src
    const sep = src.includes('?') ? '&' : '?'
    return `${src}${sep}_=${Date.now()}-${attempt}`
  }, [src, attempt, disableBust, signed])

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
    // si la URL está firmada, no reintentamos con bust porque romperíamos la firma
    if (!signed && attempt < retries) {
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
