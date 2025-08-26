'use client'
import { useEffect, useMemo, useState } from 'react'

type Props = {
  src: string
  alt?: string
  className?: string
  retries?: number
  disableBust?: boolean
  skeletonClass?: string
}

// Cloudflare Images suele demorar ~1s en propagar la URL nueva
const RETRY_DELAYS = [900, 1400, 2200, 3500] // ms

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
  skeletonClass = "bg-slate-700 animate-pulse",
}: Props) {
  const [attempt, setAttempt] = useState(0)
  const [showFallback, setShowFallback] = useState(false)
  const [showSkeleton, setShowSkeleton] = useState(true)
  const [retryOnceForSigned, setRetryOnceForSigned] = useState(false)

  useEffect(() => {
    setAttempt(0)
    setShowFallback(false)
    setShowSkeleton(true)
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

  const handleLoad = () => {
    setShowSkeleton(false)
  }

  const handleError = () => {
    // Log claro para ver el motivo real en consola
    console.error('[ImgAlways] error cargando imagen:', { src: effectiveSrc, signed, attempt })

    if (signed && !retryOnceForSigned) {
      setRetryOnceForSigned(true)
      setTimeout(() => setAttempt((a) => a + 1), 1000)
      return
    }

    if (!signed && attempt < retries) {
      const delay = RETRY_DELAYS[attempt] ?? 1000
      setTimeout(() => setAttempt(attempt + 1), delay)
    } else {
      setShowFallback(true)
      setShowSkeleton(false)
    }
  }

  const imgCommonProps = {
    alt,
    className,
    decoding: 'async' as const,
    loading: 'lazy' as const,
    onError: handleError,
    onLoad: handleLoad,
    referrerPolicy: 'no-referrer' as const,
  }

  return (
    <div className={`relative ${className ?? ""}`} style={{ minHeight: 56 }}>
      {showSkeleton && (
        <div className={`absolute inset-0 rounded-lg ${skeletonClass}`} />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={signed ? (retryOnceForSigned ? 'signed-retry' : 'signed') : `u-${attempt}`}
        src={showFallback ? fallback : effectiveSrc}
        {...imgCommonProps}
        style={{
          visibility: showSkeleton ? 'hidden' : 'visible',
          transition: 'visibility 0.2s',
        }}
        {...(!signed && { crossOrigin: 'anonymous' })}
      />
    </div>
  )
}
