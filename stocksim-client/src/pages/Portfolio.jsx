import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getHoldings, getQuote } from '../api/stocks'
import { getTrades } from '../api/stocks'

export default function Portfolio() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [holdings, setHoldings] = useState([])
  const [trades, setTrades] = useState([])
  const [enriched, setEnriched] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getHoldings(), getTrades()])
      .then(([hRes, tRes]) => {
        setHoldings(hRes.data)
        setTrades(tRes.data)
      })
      .catch(console.error)
  }, [])

  // Fetch live prices for each holding
  useEffect(() => {
    if (!holdings.length) { setLoading(false); return }

    const fetchPrices = async () => {
      const results = await Promise.all(
        holdings.map(async (h) => {
          try {
            const res = await getQuote(h.symbol)
            const livePrice = res.data.price
            const invested = h.avgPrice * h.qty
            const current = livePrice * h.qty
            const pnl = +(current - invested).toFixed(2)
            const pnlPercent = +((pnl / invested) * 100).toFixed(2)
            return { ...h, livePrice, invested, current, pnl, pnlPercent }
          } catch {
            return { ...h, livePrice: h.avgPrice, invested: h.avgPrice * h.qty, current: h.avgPrice * h.qty, pnl: 0, pnlPercent: 0 }
          }
        })
      )
      setEnriched(results)
      setLoading(false)
    }

    fetchPrices()
  }, [holdings])

  const totalInvested = enriched.reduce((sum, h) => sum + h.invested, 0)
  const totalCurrent = enriched.reduce((sum, h) => sum + h.current, 0)
  const totalPnL = +(totalCurrent - totalInvested).toFixed(2)
  const totalPnLPercent = totalInvested > 0 ? +((totalPnL / totalInvested) * 100).toFixed(2) : 0
  const isUp = totalPnL >= 0

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Navbar */}
      <div className="border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Back</span>
        </button>
        <div className="text-right">
          <p className="text-xs text-gray-500">Virtual Balance</p>
          <p className="text-green-400 font-bold text-sm">
            ₹{user?.balance?.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Portfolio</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Invested', value: `₹${totalInvested.toLocaleString('en-IN')}`, color: 'text-white' },
            { label: 'Current Value', value: `₹${totalCurrent.toLocaleString('en-IN')}`, color: 'text-white' },
            {
              label: 'Total P&L',
              value: `${isUp ? '+' : ''}₹${totalPnL.toLocaleString('en-IN')}`,
              color: isUp ? 'text-green-400' : 'text-red-400'
            },
            {
              label: 'Returns',
              value: `${isUp ? '+' : ''}${totalPnLPercent}%`,
              color: isUp ? 'text-green-400' : 'text-red-400'
            },
          ].map((s) => (
            <div key={s.label} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
              <p className="text-gray-500 text-xs mb-1">{s.label}</p>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Holdings table */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-[#2a2a2a]">
            <h2 className="text-white font-semibold">Holdings</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">Loading holdings...</div>
          ) : enriched.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-sm">No holdings yet</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-3 text-blue-400 text-sm hover:underline"
              >
                Buy your first stock
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-[#2a2a2a]">
                  <th className="px-6 py-3 text-left">Stock</th>
                  <th className="px-6 py-3 text-right">Qty</th>
                  <th className="px-6 py-3 text-right">Avg Price</th>
                  <th className="px-6 py-3 text-right">Live Price</th>
                  <th className="px-6 py-3 text-right">Invested</th>
                  <th className="px-6 py-3 text-right">Current</th>
                  <th className="px-6 py-3 text-right">P&L</th>
                </tr>
              </thead>
              <tbody>
                {enriched.map((h) => (
                  <tr
                    key={h.symbol}
                    onClick={() => navigate(`/stock/${h.symbol}`)}
                    className="border-b border-[#2a2a2a] hover:bg-[#2a2a2a] cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{h.symbol.replace('.NS', '')}</p>
                      <p className="text-gray-500 text-xs truncate max-w-[150px]">{h.name}</p>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300">{h.qty}</td>
                    <td className="px-6 py-4 text-right text-gray-300">₹{h.avgPrice.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right text-white font-medium">₹{h.livePrice?.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right text-gray-300">₹{h.invested.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right text-white">₹{h.current.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right">
                      <p className={h.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {h.pnl >= 0 ? '+' : ''}₹{h.pnl.toLocaleString('en-IN')}
                      </p>
                      <p className={`text-xs ${h.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {h.pnlPercent >= 0 ? '+' : ''}{h.pnlPercent}%
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Trade history */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a2a]">
            <h2 className="text-white font-semibold">Trade History</h2>
          </div>
          {trades.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">No trades yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-[#2a2a2a]">
                  <th className="px-6 py-3 text-left">Stock</th>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-right">Qty</th>
                  <th className="px-6 py-3 text-right">Price</th>
                  <th className="px-6 py-3 text-right">Total</th>
                  <th className="px-6 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr key={t._id} className="border-b border-[#2a2a2a] last:border-0">
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{t.symbol.replace('.NS', '')}</p>
                      <p className="text-gray-500 text-xs">{t.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        t.type === 'buy'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {t.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300">{t.qty}</td>
                    <td className="px-6 py-4 text-right text-gray-300">₹{t.price.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right text-white">₹{t.total.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right text-gray-500 text-xs">
                      {new Date(t.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}