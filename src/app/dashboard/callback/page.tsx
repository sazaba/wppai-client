import CallbackHandler from './CallbackHandler'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-slate-900">
      <CallbackHandler />
    </div>
  )
}
