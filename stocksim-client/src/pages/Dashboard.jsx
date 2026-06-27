import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, BarChart2, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Layout from '../components/Layout'
import { getMarket } from '../api/stocks'

export default function Dashboard() {
  const navigate = useNavigate()
  const [market, setMarket] = useState([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    getMarket()
      .then((res) => setMarket(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  const gainers = [...market].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3)
  const losers = [...market].sort((a, b) => a.changePercent - b.changePercent).slice(0, 3)
  const totalUp = market.filter((s) => s.changePercent >= 0).length
  const totalDown = market.length - totalUp
  const avgChange = market.length
    ? (market.reduce((sum, s) => sum + s.changePercent, 0) / market.length).toFixed(2)
    : 0

  return (
    <Layout>
      {/* Keyframe injection */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blobFloat {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(18px,-12px) scale(1.06); }
          66%      { transform: translate(-10px,8px) scale(0.96); }
        }
        @keyframes ping {
          0%,100% { transform: scale(1); opacity: 1; }
          60%      { transform: scale(2.2); opacity: 0; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .stock-card { transition: transform .18s ease, border-color .18s ease, background .18s ease; }
        .stock-card:hover { transform: translateY(-3px); }
        .gl-row { transition: background .15s ease; }
        .gl-row:hover { background: #2a2a3d; }
        .pulse-card { transition: background .2s ease, border-color .2s ease; }
        .pulse-card:hover { background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.18); }
        .shimmer-box {
          background: linear-gradient(90deg,#1a1a2e 25%,#252540 50%,#1a1a2e 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── Hero ── */}
        <div
          className="relative -z-0 rounded-2xl overflow-hidden mb-8 border border-purple-500/20"
          style={{ animation: 'fadeUp .5s ease both' }}
        >
          {/* Layered bg */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-950/80 via-[#0f0f1a] to-blue-950/60" />

          {/* Animated blobs */}
          <div
            className="absolute w-64 h-64 rounded-full bg-purple-600/10 blur-3xl"
            style={{ top: '-60px', left: '22%', animation: 'blobFloat 8s ease-in-out infinite' }}
          />
          <div
            className="absolute w-48 h-48 rounded-full bg-blue-600/10 blur-3xl"
            style={{ bottom: '-40px', right: '18%', animation: 'blobFloat 11s ease-in-out infinite 4s' }}
          />

          <div className="relative px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              {/* Live ping dot */}
              <div className="flex items-center gap-2 mb-3">
                <span className="relative flex h-2 w-2">
                  <span
                    className="absolute inline-flex h-full w-full rounded-full bg-green-400"
                    style={{ animation: 'ping 2s ease-in-out infinite' }}
                  />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                </span>
                <span className="text-green-400 text-xs font-medium tracking-widest uppercase">NSE Live</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight tracking-tight">
                Good day, trader
              </h1>
              <p className="text-[#94a3b8] text-sm">
                Markets are open. Search or click any stock to start trading.
              </p>
            </div>

            {/* Market pulse strip */}
            {!loading && (
              <div className="flex gap-3 shrink-0">
                {[
                  { label: 'Advancing', value: totalUp, cls: 'text-green-400' },
                  { label: 'Declining', value: totalDown, cls: 'text-red-400' },
                  { label: 'Avg move', value: `${Number(avgChange) >= 0 ? '+' : ''}${avgChange}%`, cls: Number(avgChange) >= 0 ? 'text-green-400' : 'text-red-400' },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className="pulse-card bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center"
                    style={{ animation: `fadeUp .5s ease ${0.3 + i * 0.1}s both` }}
                  >
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{item.label}</p>
                    <p className={`font-bold text-xl ${item.cls}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Market Overview ── */}
        <div className="mb-8">
          <div
            className="flex items-center justify-between mb-4"
            style={{ animation: 'fadeUp .5s ease .15s both' }}
          >
            <div className="flex items-center gap-2">
              <BarChart2 size={15} className="text-purple-400" />
              <h2 className="text-white font-semibold text-base">Market Overview</h2>
            </div>
            <span className="text-slate-400 text-xs">15 min delayed</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="shimmer-box rounded-xl h-28"
                  style={{ animationDelay: `${i * 0.07}s` }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {market.map((stock, i) => {
                const isUp = stock.changePercent >= 0
                return (
                  <div
                    key={stock.symbol}
                    onClick={() => navigate(`/stock/${stock.symbol}`)}
                    className="stock-card text-gray-500 border border-[#2a2a3d] rounded-xl p-4 cursor-pointer hover:border-purple-500/50 hover:bg-[#1e1e35]"
                    style={{ animation: `fadeUp .4s ease ${i * 0.045}s both` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white font-semibold text-sm">
                          {stock.symbol.replace('.NS', '')}
                        </p>
                        <p className="text-slate-400 text-[10px] mt-0.5 truncate max-w-[90px]">
                          {stock.name?.split(' ').slice(0, 2).join(' ')}
                        </p>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                        isUp ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {isUp ? '+' : ''}{stock.changePercent}%
                      </span>
                    </div>
                    <p className="text-white font-bold text-sm">
                      ₹{stock.price?.toLocaleString('en-IN')}
                    </p>
                    <p className={`text-xs mt-1 flex items-center gap-0.5 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                      {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      ₹{Math.abs(stock.change)}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Gainers & Losers ── */}
        {!loading && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
            style={{ animation: 'fadeUp .5s ease .35s both' }}
          >
            {[
              { title: 'Top Gainers', icon: <TrendingUp size={13} className="text-green-400" />, iconBg: 'bg-green-500/10', data: gainers, isGain: true },
              { title: 'Top Losers',  icon: <TrendingDown size={13} className="text-red-400" />,  iconBg: 'bg-red-500/10',   data: losers,  isGain: false },
            ].map(({ title, icon, iconBg, data, isGain }) => (
              <div key={title} className="text-gray-500 border border-[#2a2a3d] rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#2a2a3d] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg ${iconBg} flex items-center justify-center`}>
                      {icon}
                    </div>
                    <h3 className="text-white font-semibold text-sm">{title}</h3>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Today</span>
                </div>
                {data.map((s, i) => (
                  <div
                    key={s.symbol}
                    onClick={() => navigate(`/stock/${s.symbol}`)}
                    className="gl-row px-5 py-3.5 flex items-center justify-between cursor-pointer border-b border-[#2a2a3d] last:border-0"
                    style={{ animation: `fadeUp .4s ease ${0.45 + i * 0.08}s both` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold ${
                        isGain ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {s.symbol.replace('.NS', '').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{s.symbol.replace('.NS', '')}</p>
                        <p className="text-slate-400 text-xs">{s.name?.split(' ').slice(0, 2).join(' ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm font-bold">₹{s.price?.toLocaleString('en-IN')}</p>
                      <p className={`text-xs flex items-center justify-end gap-0.5 font-medium ${
                        isGain ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {isGain ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                        {isGain ? '+' : ''}{s.changePercent}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}