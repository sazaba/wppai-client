'use client'

import { useRef, useState, useEffect } from 'react'
import { FiArrowUp } from 'react-icons/fi'

export default function DashboardScrollWrapper({
  children
}: {
  children: React.ReactNode
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const handleScroll = () => {
    const scrollTop = containerRef.current?.scrollTop || 0
    setShowScrollTop(scrollTop > 200)
  }

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const el = containerRef.current
    if (el) {
      el.addEventListener('scroll', handleScroll)
      return () => el.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="relative flex-1 h-full overflow-hidden">
      <div
        ref={containerRef}
        className="h-full overflow-y-auto px-4 py-6 scrollbar scrollbar-thumb-zinc-700 scrollbar-track-transparent"
      >
        {children}
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-10 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow transition"
          aria-label="Subir"
        >
          <FiArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
