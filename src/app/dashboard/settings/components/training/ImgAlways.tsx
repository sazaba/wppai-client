'use client'

import { useEffect, useMemo, useState } from 'react'

type Props = {
  src: string
  alt?: string
  className?: string
  retries?: number
  disableBust?: boolean
}

function isSignedUrl(url: string) {
  if (!url) return false
  try {
    const u = new URL(url, typeof window !== 'undefined' ? window.location.href : undefined)
    const q = u.searchParams
    return (
      q.has('X-Amz-Signature') ||
      q.has('X-Amz-Algorithm') ||
      q.has('X-Amz-Credential') ||
      q.has('X-Amz-Security-Token') ||
      q.has('X-Amz-Date') ||
      q.has('X-Amz-Expires') ||
      q.has('signature') || q.has('sig') || q.has('token') || q.has('expires')
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
  const [retryOnceForSigned, setRetryOnceForSigned] = useState(false)

  useEffect(() => {
    setAttempt(0)
    setShowFallback(false)
    setRetryOnceForSigned(false)
  }, [src])

  const signed = useMemo(() => isSignedUrl(src), [src])

  const effectiveSrc = useMemo(() => {
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
    // Para firmadas: 1 reintento suave sin modificar la URL (no rompemos la firma)
    if (signed && !retryOnceForSigned) {
      setRetryOnceForSigned(true)
      // Fuerza un recambio de src recreando el nodo <img> con una key distinta
      // (tip: los navegadores a veces no reintentan con el mismo elemento)
      setTimeout(() => setAttempt((a) => a + 1), 50)
      return
    }

    // No firmadas: reintentos con cache-busting
    if (!signed && attempt < retries) {
      const next = attempt + 1
      setTimeout(() => setAttempt(next), 250 * next)
    } else {
      setShowFallback(true)
    }
  }

  const imgCommonProps = {
    alt,
    className,
    decoding: 'async' as const,
    loading: 'lazy' as const,
    onError: handleError,
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={signed ? (retryOnceForSigned ? 'signed-retry' : 'signed') : `u-${attempt}`}
      src={showFallback ? fallback : effectiveSrc}
      {...imgCommonProps}
      {...(!signed && { crossOrigin: 'anonymous' })}
      {...(!signed && { referrerPolicy: 'no-referrer' as const })}
    />
  )
}
