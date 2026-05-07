import type { Order } from '../../services/orderService'

interface OrderTableProps {
  type: 'sell' | 'buy'
  orders: Order[]
  title: string
  loading?: boolean
}

export default function OrderTable({ type, orders, title, loading = false }: OrderTableProps) {
  const isBuy = type === 'buy'

  return (
    <div
      className="rounded-2xl p-5 flex flex-col h-full"
      style={{
        background: isBuy ? 'rgba(74,222,128,0.06)' : 'rgba(22,15,53,0.9)',
        border: isBuy
          ? '1px solid rgba(74,222,128,0.15)'
          : '1px solid rgba(162,133,57,0.15)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <div className="flex items-center gap-2">
          {/* Coin selector */}
          <button
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#d1d5db',
            }}
          >
            Dash Coin
            <i className="fas fa-chevron-down text-xs opacity-60" aria-hidden="true" />
          </button>
          {/* Menu */}
          <button
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)' }}
            aria-label="More options"
          >
            <i className="fas fa-ellipsis-h text-xs" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <th className="text-left pb-2 font-medium" style={{ color: '#6b7280' }}>
                Price
              </th>
              <th className="text-right pb-2 font-medium" style={{ color: '#6b7280' }}>
                Amount
              </th>
              <th className="text-right pb-2 font-medium" style={{ color: '#6b7280' }}>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="py-4 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-4 text-center text-gray-500">
                  No orders
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="transition-colors hover:bg-white/5"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <td className="py-2 font-medium" style={{ color: isBuy ? '#4ade80' : '#f87171' }}>
                    ${order.price.toFixed(2)}
                  </td>
                  <td className="py-2 text-right text-gray-300">{order.amount}</td>
                  <td className="py-2 text-right text-gray-300">${order.total.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View All */}
      <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          className="w-full py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
          style={
            isBuy
              ? { background: 'rgba(22,15,53,0.8)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }
              : { background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }
          }
        >
          View All ↗
        </button>
      </div>
    </div>
  )
}
