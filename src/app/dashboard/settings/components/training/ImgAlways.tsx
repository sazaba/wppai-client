'use client'
import { useEffect, useState } from 'react'

type Props = {
  src: string
  alt?: string
  className?: string
  skeletonClass?: string
}

export default function ImgAlways({
  src,
  alt = '',
  className,
  skeletonClass = "bg-slate-700 animate-pulse",
}: Props) {
  const [showFallback, setShowFallback] = useState(false)
  const [showSkeleton, setShowSkeleton] = useState(true)

  useEffect(() => {
    setShowFallback(false)
    setShowSkeleton(true)
  }, [src])

  const fallback =
    'data:image/svg+xml;charset=UTF-8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="112">
        <rect width="100%" height="100%" fill="#0f172a"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
          fill="#94a3b8" font-size="12">imagen no disponible</text>
      </svg>`
    )

  const handleLoad = () => setShowSkeleton(false)

  const handleError = () => {
    setShowFallback(true)
    setShowSkeleton(false)
    // Puedes loguear el src para debug si lo deseas
    // console.error('[ImgAlways] error cargando imagen:', src)
  }

  return (
    <div className={`relative ${className ?? ""}`} style={{ minHeight: 56 }}>
      {showSkeleton && (
        <div className={`absolute inset-0 rounded-lg ${skeletonClass}`} />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={showFallback ? fallback : src}
        alt={alt}
        decoding="async"
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        referrerPolicy="no-referrer"
        style={{
          visibility: showSkeleton ? 'hidden' : 'visible',
          transition: 'visibility 0.2s',
        }}
      />
    </div>
  )
}
