import { Suspense } from 'react'
import CallbackManualClient from './CallbackManualClient'

// Evita prerender/SSG para este callback
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        Procesando OAuth…
      </div>
    }>
      <CallbackManualClient />
    </Suspense>
  )
}
