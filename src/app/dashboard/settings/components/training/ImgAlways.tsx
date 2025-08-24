'use client'

import { useState } from 'react'

type Props = {
  src: string
  alt?: string
  className?: string
}

export default function ImgAlways({ src, alt = '', className }: Props) {
  const [broken, setBroken] = useState(false)

  const bust =
    src && !src.startsWith('data:')
      ? `${src}${src.includes('?') ? '&' : '?'}_=${Date.now()}`
      : src

  const fallback =
    'data:image/svg+xml;charset=UTF-8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="112">
        <rect width="100%" height="100%" fill="#0f172a"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
          fill="#94a3b8" font-size="12">imagen no disponible</text>
      </svg>`
    )

  return (
    <img
      src={broken ? fallback : bust}
      alt={alt}
      className={className}
      decoding="async"
      loading="lazy"
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      onError={() => setBroken(true)}
    />
  )
}
