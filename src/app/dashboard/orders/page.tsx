'use client'

import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  RefreshCw,
  Eye,
  Trash2,
  CheckCircle2,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  Banknote,
} from 'lucide-react'
import clsx from 'clsx'

type OrderItem = {
  id: number
  productId: number
  name: string
  price: number
  qty: number
  total: number
}

type PaymentReceipt = {
  id: number
  imageUrl: string
  amount: number | null
  reference: string
  method: string
  isVerified: boolean
  createdAt: string
}

type OrderDTO = {
  id: number
  conversationId: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'canceled' | string
  subtotal: number
  shippingCost: number
  total: number
  notes: string
  customerName?: string | null
  customerPhone: string
  city?: string | null
  address?: string | null
  items: OrderItem[]
  payments: PaymentReceipt[]
  Conversation?: { phone: string; estado: string }
}

const API = (process.env.NEXT_PUBLIC_API_URL || '') as string

function authHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const STATUSES = ['all', 'pending', 'paid', 'shipped', 'delivered', 'canceled'] as const
type StatusFilter = typeof STATUSES[number]

export default function OrdersPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [status, setStatus] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('') // conversationId o teléfono
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [orders, setOrders] = useState<OrderDTO[]>([])
  const [selected, setSelected] = useState<OrderDTO | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  async function load() {
    try {
      setLoading(true)
      setError(null)

      const params: any = {}
      if (status !== 'all') params.status = status
      if (query && /^\d+$/.test(query.trim())) {
        // si es numérico, lo tratamos como conversationId
        params.conversationId = Number(query.trim())
      }

      const { data } = await axios.get(`${API}/api/orders`, {
        headers: authHeaders(),
        params,
      })

      // Filtro adicional por teléfono si query no es numérico
      const filtered = Array.isArray(data)
        ? data.filter((o: OrderDTO) =>
            query && !/^\d+$/.test(query.trim())
              ? (o.customerPhone || '').includes(query.trim()) ||
                (o.Conversation?.phone || '').includes(query.trim())
              : true
          )
        : []

      setOrders(filtered)
    } catch (e: any) {
      setError(e?.response?.data?.error || 'No se pudieron cargar los pedidos.')
    } finally {
      setLoading(false)
      setPage(1)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const totalPages = Math.max(1, Math.ceil(orders.length / pageSize))
  const paginated = useMemo(
    () => orders.slice((page - 1) * pageSize, page * pageSize),
    [orders, page]
  )

  async function openDetail(id: number) {
    try {
      const { data } = await axios.get(`${API}/api/orders/${id}`, { headers: authHeaders() })
      setSelected(data)
    } catch (e: any) {
      setError(e?.response?.data?.error || 'No se pudo abrir el detalle.')
    }
  }

  async function recalc(id: number) {
    try {
      setBusyId(id)
      await axios.post(`${API}/api/orders/${id}/recalc`, {}, { headers: authHeaders() })
      await load()
      if (selected?.id === id) await openDetail(id)
    } catch (e: any) {
      setError(e?.response?.data?.error || 'No se pudo recalcular.')
    } finally {
      setBusyId(null)
    }
  }

  async function setStatusOrder(id: number, newStatus: OrderDTO['status']) {
    try {
      setBusyId(id)
      await axios.patch(
        `${API}/api/orders/${id}/status`,
        { status: newStatus },
        { headers: authHeaders() }
      )
      await load()
      if (selected?.id === id) await openDetail(id)
    } catch (e: any) {
      setError(e?.response?.data?.error || 'No se pudo actualizar el estado.')
    } finally {
      setBusyId(null)
    }
  }

  async function removeOrder(id: number) {
    if (!confirm('¿Eliminar pedido?')) return
    try {
      setBusyId(id)
      await axios.delete(`${API}/api/orders/${id}`, { headers: authHeaders() })
      await load()
      if (selected?.id === id) setSelected(null)
    } catch (e: any) {
      setError(e?.response?.data?.error || 'No se pudo eliminar el pedido.')
    } finally {
      setBusyId(null)
    }
  }

  async function verifyPayment(paymentId: number) {
    try {
      setBusyId(paymentId)
      await axios.patch(
        `${API}/api/payments/${paymentId}/verify`,
        { isVerified: true },
        { headers: authHeaders() }
      )
      if (selected) await openDetail(selected.id)
      await load()
    } catch (e: any) {
      setError(e?.response?.data?.error || 'No se pudo verificar el comprobante.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 rounded-lg bg-slate-800 text-xs font-medium border border-slate-700">
            Pedidos
          </div>
          <span className="text-slate-400 text-sm flex items-center gap-1">
            <Filter className="w-4 h-4" />
            Filtros
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Actualizar
          </button>
        </div>
      </div>

      {/* filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'Todos' : s}
            </option>
          ))}
        </select>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void load()
          }}
          placeholder="Buscar por conversationId o teléfono"
          className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl text-sm"
        />

        <button
          onClick={() => void load()}
          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm"
        >
          Aplicar filtros
        </button>
      </div>

      {/* tabla */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/60 text-slate-300">
            <tr>
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">Conversación</th>
              <th className="text-left p-3">Cliente</th>
              <th className="text-left p-3">Estado</th>
              <th className="text-right p-3">Total</th>
              <th className="text-right p-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-4 text-slate-300">
                  Cargando…
                </td>
              </tr>
            ) : paginated.length ? (
              paginated.map((o) => (
                <tr key={o.id} className="hover:bg-slate-900/40">
                  <td className="p-3 text-slate-300">#{o.id}</td>
                  <td className="p-3 text-slate-400">
                    {o.conversationId} • {o.Conversation?.estado}
                  </td>
                  <td className="p-3 text-slate-300">
                    {o.customerName || '—'} <span className="text-slate-500">• {o.customerPhone}</span>
                  </td>
                  <td className="p-3">
                    <span
                      className={clsx(
                        'text-xs px-2 py-0.5 rounded border',
                        o.status === 'paid'
                          ? 'bg-emerald-900/30 text-emerald-300 border-emerald-700'
                          : o.status === 'pending'
                          ? 'bg-amber-900/20 text-amber-300 border-amber-700'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      )}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3 text-right text-slate-200">{formatCOP(o.total)}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openDetail(o.id)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => recalc(o.id)}
                        disabled={busyId === o.id}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-60"
                        title="Recalcular totales"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>

                      {o.status !== 'paid' && (
                        <button
                          onClick={() => setStatusOrder(o.id, 'paid')}
                          disabled={busyId === o.id}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60"
                          title="Marcar como pagado"
                        >
                          <Banknote className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => removeOrder(o.id)}
                        disabled={busyId === o.id}
                        className="px-2.5 py-1.5 rounded-lg border border-rose-800 bg-rose-900/30 hover:bg-rose-900/50 text-rose-200 disabled:opacity-60"
                        title="Eliminar pedido"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-4 text-slate-400">
                  No hay pedidos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* paginación */}
      {orders.length > pageSize && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <div>
            Página {page} de {totalPages} • {orders.length} pedidos
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* detalle lateral / modal simple */}
      {selected && (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-slate-100 font-semibold">
                Detalle pedido #{selected.id}
              </h3>
              <span
                className={clsx(
                  'text-xs px-2 py-0.5 rounded border',
                  selected.status === 'paid'
                    ? 'bg-emerald-900/30 text-emerald-300 border-emerald-700'
                    : selected.status === 'pending'
                    ? 'bg-amber-900/20 text-amber-300 border-amber-700'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                )}
              >
                {selected.status}
              </span>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-sm"
            >
              Cerrar
            </button>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl border border-slate-800 p-3 bg-slate-900/40">
              <div className="text-slate-400">Cliente</div>
              <div className="text-slate-200">
                {selected.customerName || '—'} • {selected.customerPhone}
              </div>
              {(selected.city || selected.address) && (
                <>
                  <div className="mt-2 text-slate-400">Envío</div>
                  <div className="text-slate-200">
                    {selected.city || '—'} • {selected.address || '—'}
                  </div>
                </>
              )}
              {selected.notes ? (
                <>
                  <div className="mt-2 text-slate-400">Notas</div>
                  <div className="text-slate-200 whitespace-pre-wrap">{selected.notes}</div>
                </>
              ) : null}
            </div>

            <div className="rounded-xl border border-slate-800 p-3 bg-slate-900/40">
              <div className="flex items-center justify-between">
                <div className="text-slate-400">Totales</div>
                <button
                  onClick={() => recalc(selected.id)}
                  className="px-2 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs"
                >
                  Recalcular
                </button>
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-slate-200">{formatCOP(selected.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Envío</span>
                  <span className="text-slate-200">{formatCOP(selected.shippingCost)}</span>
                </div>
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-200">Total</span>
                  <span className="text-slate-100">{formatCOP(selected.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mt-4">
            <div className="text-slate-200 font-medium mb-2">Items</div>
            <div className="rounded-xl border border-slate-800 overflow-hidden">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-900/60 text-slate-300">
                  <tr>
                    <th className="text-left p-2">Producto</th>
                    <th className="text-right p-2">Cantidad</th>
                    <th className="text-right p-2">Precio</th>
                    <th className="text-right p-2">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {selected.items.map((it) => (
                    <tr key={it.id}>
                      <td className="p-2 text-slate-300">{it.name}</td>
                      <td className="p-2 text-right text-slate-300">×{it.qty}</td>
                      <td className="p-2 text-right text-slate-300">{formatCOP(it.price)}</td>
                      <td className="p-2 text-right text-slate-200">{formatCOP(it.total)}</td>
                    </tr>
                  ))}
                  {!selected.items.length && (
                    <tr>
                      <td className="p-3 text-slate-400" colSpan={4}>
                        Sin ítems.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comprobantes */}
          <div className="mt-4">
            <div className="text-slate-200 font-medium mb-2">Comprobantes</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(selected.payments || []).map((p) => (
                <div key={p.id} className="rounded-xl border border-slate-800 p-3 bg-slate-900/40">
                  <div className="flex items-center justify-between">
                    <div className="text-slate-300 text-sm">Ref: {p.reference || '—'}</div>
                    <div
                      className={clsx(
                        'text-xs px-2 py-0.5 rounded border',
                        p.isVerified
                          ? 'bg-emerald-900/30 text-emerald-300 border-emerald-700'
                          : 'bg-amber-900/20 text-amber-300 border-amber-700'
                      )}
                    >
                      {p.isVerified ? 'Verificado' : 'Pendiente'}
                    </div>
                  </div>
                  <div className="mt-2 text-slate-400 text-xs">
                    {new Date(p.createdAt).toLocaleString()}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-slate-400">Monto</div>
                      <div className="text-slate-200">
                        {p.amount != null ? formatCOP(p.amount) : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Método</div>
                      <div className="text-slate-200">{p.method || '—'}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href={p.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-sm inline-flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Ver imagen
                    </a>
                    {!p.isVerified && (
                      <button
                        onClick={() => verifyPayment(p.id)}
                        disabled={busyId === p.id}
                        className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm disabled:opacity-60 inline-flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Verificar
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {!selected.payments?.length && (
                <div className="text-slate-400 text-sm">Sin comprobantes.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 text-sm text-red-300 bg-red-900/20 border border-red-800 rounded-xl px-3 py-2">
          {error}
        </div>
      )}
    </div>
  )
}

/* utils */
function formatCOP(n: number) {
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(Number(n || 0))
  } catch {
    return String(n)
  }
}
