// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { TrendingUp, TrendingDown } from 'lucide-react'
// import { useAuth } from '../context/AuthContext'
// import { getHoldings, getQuote } from '../api/stocks'
// import { getTrades } from '../api/stocks'
// import Layout from '../components/Layout'

// export default function Portfolio() {
//   const { user } = useAuth()
//   const navigate = useNavigate()

//   const [holdings, setHoldings] = useState([])
//   const [trades, setTrades] = useState([])
//   const [enriched, setEnriched] = useState([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     Promise.all([getHoldings(), getTrades()])
//       .then(([hRes, tRes]) => {
//         setHoldings(hRes.data)
//         setTrades(tRes.data)
//       })
//       .catch(console.error)
//   }, [])

//   useEffect(() => {
//     if (!holdings.length) { setLoading(false); return }

//     const fetchPrices = async () => {
//       const results = await Promise.all(
//         holdings.map(async (h) => {
//           try {
//             const res = await getQuote(h.symbol)
//             const livePrice = res.data.price
//             const invested = h.avgPrice * h.qty
//             const current = livePrice * h.qty
//             const pnl = +(current - invested).toFixed(2)
//             const pnlPercent = +((pnl / invested) * 100).toFixed(2)
//             return { ...h, livePrice, invested, current, pnl, pnlPercent }
//           } catch {
//             return { ...h, livePrice: h.avgPrice, invested: h.avgPrice * h.qty, current: h.avgPrice * h.qty, pnl: 0, pnlPercent: 0 }
//           }
//         })
//       )
//       setEnriched(results)
//       setLoading(false)
//     }

//     fetchPrices()
//   }, [holdings])

//   const totalInvested = enriched.reduce((sum, h) => sum + h.invested, 0)
//   const totalCurrent = enriched.reduce((sum, h) => sum + h.current, 0)
//   const totalPnL = +(totalCurrent - totalInvested).toFixed(2)
//   const totalPnLPercent = totalInvested > 0 ? +((totalPnL / totalInvested) * 100).toFixed(2) : 0
//   const isUp = totalPnL >= 0

//   return (
//     <Layout>
//       <div className="max-w-5xl mx-auto px-6 py-8">
//         <h1 className="text-2xl font-bold text-white mb-6">Portfolio</h1>

//         {/* Summary cards */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//           {[
//             { label: 'Total Invested', value: `₹${totalInvested.toLocaleString('en-IN')}`, color: 'text-white' },
//             { label: 'Current Value', value: `₹${totalCurrent.toLocaleString('en-IN')}`, color: 'text-white' },
//             {
//               label: 'Total P&L',
//               value: `${isUp ? '+' : ''}₹${totalPnL.toLocaleString('en-IN')}`,
//               color: isUp ? 'text-green-400' : 'text-red-400'
//             },
//             {
//               label: 'Returns',
//               value: `${isUp ? '+' : ''}${totalPnLPercent}%`,
//               color: isUp ? 'text-green-400' : 'text-red-400'
//             },
//           ].map((s) => (
//             <div key={s.label} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
//               <p className="text-gray-500 text-xs mb-1">{s.label}</p>
//               <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
//             </div>
//           ))}
//         </div>

//         {/* Holdings table */}
//         <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden mb-8">
//           <div className="px-6 py-4 border-b border-[#2a2a2a]">
//             <h2 className="text-white font-semibold">Holdings</h2>
//           </div>

//           {loading ? (
//             <div className="p-8 text-center text-gray-500 text-sm">Loading holdings...</div>
//           ) : enriched.length === 0 ? (
//             <div className="p-8 text-center">
//               <p className="text-gray-500 text-sm">No holdings yet</p>
//               <button
//                 onClick={() => navigate('/dashboard')}
//                 className="mt-3 text-blue-400 text-sm hover:underline"
//               >
//                 Buy your first stock
//               </button>
//             </div>
//           ) : (
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="text-gray-500 text-xs border-b border-[#2a2a2a]">
//                   <th className="px-6 py-3 text-left">Stock</th>
//                   <th className="px-6 py-3 text-right">Qty</th>
//                   <th className="px-6 py-3 text-right">Avg Price</th>
//                   <th className="px-6 py-3 text-right">Live Price</th>
//                   <th className="px-6 py-3 text-right">Invested</th>
//                   <th className="px-6 py-3 text-right">Current</th>
//                   <th className="px-6 py-3 text-right">P&L</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {enriched.map((h) => (
//                   <tr
//                     key={h.symbol}
//                     onClick={() => navigate(`/stock/${h.symbol}`)}
//                     className="border-b border-[#2a2a2a] hover:bg-[#2a2a2a] cursor-pointer transition-colors"
//                   >
//                     <td className="px-6 py-4">
//                       <p className="text-white font-medium">{h.symbol.replace('.NS', '')}</p>
//                       <p className="text-gray-500 text-xs truncate max-w-[150px]">{h.name}</p>
//                     </td>
//                     <td className="px-6 py-4 text-right text-gray-300">{h.qty}</td>
//                     <td className="px-6 py-4 text-right text-gray-300">₹{h.avgPrice.toLocaleString('en-IN')}</td>
//                     <td className="px-6 py-4 text-right text-white font-medium">₹{h.livePrice?.toLocaleString('en-IN')}</td>
//                     <td className="px-6 py-4 text-right text-gray-300">₹{h.invested.toLocaleString('en-IN')}</td>
//                     <td className="px-6 py-4 text-right text-white">₹{h.current.toLocaleString('en-IN')}</td>
//                     <td className="px-6 py-4 text-right">
//                       <p className={h.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
//                         {h.pnl >= 0 ? '+' : ''}₹{h.pnl.toLocaleString('en-IN')}
//                       </p>
//                       <p className={`text-xs ${h.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
//                         {h.pnlPercent >= 0 ? '+' : ''}{h.pnlPercent}%
//                       </p>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>

//         {/* Trade history */}
//         <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
//           <div className="px-6 py-4 border-b border-[#2a2a2a]">
//             <h2 className="text-white font-semibold">Trade History</h2>
//           </div>
//           {trades.length === 0 ? (
//             <div className="p-8 text-center text-gray-500 text-sm">No trades yet</div>
//           ) : (
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="text-gray-500 text-xs border-b border-[#2a2a2a]">
//                   <th className="px-6 py-3 text-left">Stock</th>
//                   <th className="px-6 py-3 text-left">Type</th>
//                   <th className="px-6 py-3 text-right">Qty</th>
//                   <th className="px-6 py-3 text-right">Price</th>
//                   <th className="px-6 py-3 text-right">Total</th>
//                   <th className="px-6 py-3 text-right">Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {trades.map((t) => (
//                   <tr key={t._id} className="border-b border-[#2a2a2a] last:border-0">
//                     <td className="px-6 py-4">
//                       <p className="text-white font-medium">{t.symbol.replace('.NS', '')}</p>
//                       <p className="text-gray-500 text-xs">{t.name}</p>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span className={`text-xs px-2 py-1 rounded-full font-medium ${
//                         t.type === 'buy'
//                           ? 'bg-green-500/10 text-green-400'
//                           : 'bg-red-500/10 text-red-400'
//                       }`}>
//                         {t.type.toUpperCase()}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-right text-gray-300">{t.qty}</td>
//                     <td className="px-6 py-4 text-right text-gray-300">₹{t.price.toLocaleString('en-IN')}</td>
//                     <td className="px-6 py-4 text-right text-white">₹{t.total.toLocaleString('en-IN')}</td>
//                     <td className="px-6 py-4 text-right text-gray-500 text-xs">
//                       {new Date(t.createdAt).toLocaleDateString('en-IN', {
//                         day: 'numeric', month: 'short', year: 'numeric'
//                       })}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>
//     </Layout>
//   )
// }



import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, ArrowDownRight, Briefcase, History } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getHoldings, getQuote, getTrades } from '../api/stocks'
import Layout from '../components/Layout'
import SectorChart from '../components/SectorChart'

export default function Portfolio() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [holdings, setHoldings] = useState([])
  const [trades, setTrades]     = useState([])
  const [enriched, setEnriched] = useState([])
  const [loading, setLoading]   = useState(true)
  const [mounted, setMounted]   = useState(false)

  useEffect(() => {
    Promise.all([getHoldings(), getTrades()])
      .then(([hRes, tRes]) => { setHoldings(hRes.data); setTrades(tRes.data) })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!holdings.length) { setLoading(false); return }
    const fetchPrices = async () => {
      const results = await Promise.all(
        holdings.map(async (h) => {
          try {
            const res = await getQuote(h.symbol)
            const livePrice = res.data.price
            const invested = h.avgPrice * h.qty
            const current  = livePrice * h.qty
            const pnl        = +(current - invested).toFixed(2)
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

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t) }, [])

  const totalInvested   = enriched.reduce((sum, h) => sum + h.invested, 0)
  const totalCurrent    = enriched.reduce((sum, h) => sum + h.current, 0)
  const totalPnL        = +(totalCurrent - totalInvested).toFixed(2)
  const totalPnLPercent = totalInvested > 0 ? +((totalPnL / totalInvested) * 100).toFixed(2) : 0
  const isUp            = totalPnL >= 0

  return (
    <Layout>
      <style>{`
        @keyframes pfadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pShimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes ppulse { 0%,100%{opacity:1} 50%{opacity:.3} }

        .p-shimmer {
          background: linear-gradient(90deg,#1a1a2e 25%,#252540 50%,#1a1a2e 75%);
          background-size: 200% 100%;
          animation: pShimmer 1.5s infinite;
          border-radius: 12px;
        }
        .p-section {
          background: #0a0a14;
          border: 1px solid rgba(139,92,246,.18);
          border-radius: 14px;
          overflow: hidden;
          position: relative;
        }
        .p-section::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,.4), transparent);
          pointer-events: none;
        }
        .p-section-head {
          padding: 14px 20px;
          border-bottom: 1px solid rgba(139,92,246,.12);
          display: flex; align-items: center; gap: 8px;
        }
        .p-col-head {
          font-size: 10px; font-weight: 600; color: #f1f5f9;
          text-transform: uppercase; letter-spacing: 1px;
          padding: 10px 20px;
          border-bottom: 1px solid rgba(139,92,246,.1);
        }
        .p-row {
          border-bottom: 1px solid rgba(139,92,246,.07);
          transition: background .15s;
          cursor: pointer;
        }
        .p-row:last-child { border-bottom: none; }
        .p-row:hover { background: rgba(139,92,246,.07); }
        .p-row td { padding: 14px 20px; font-size: 12px; }

        .p-trade-row {
          border-bottom: 1px solid rgba(139,92,246,.07);
        }
        .p-trade-row:last-child { border-bottom: none; }
        .p-trade-row td { padding: 13px 20px; font-size: 12px; }

        .p-stat-card {
          background: #0a0a14;
          border: 1px solid rgba(139,92,246,.18);
          border-radius: 12px;
          padding: 16px;
          position: relative;
          overflow: hidden;
          transition: border-color .2s, transform .15s;
        }
        .p-stat-card:hover { border-color: rgba(139,92,246,.4); transform: translateY(-2px); }
        .p-stat-card::after {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,.3), transparent);
        }
        .p-stat-label {
          font-size: 9px; color: #cbd5e1; text-transform: uppercase;
          letter-spacing: 1px; font-family: monospace; margin-bottom: 6px;
        }
        .p-stat-val { font-size: 18px; font-weight: 700; font-family: monospace; }

        .p-corner-tl { position: absolute; top: 0; left: 0; width: 10px; height: 10px; border-top: 1px solid rgba(139,92,246,.5); border-left: 1px solid rgba(139,92,246,.5); }
        .p-corner-br { position: absolute; bottom: 0; right: 0; width: 10px; height: 10px; border-bottom: 1px solid rgba(139,92,246,.5); border-right: 1px solid rgba(139,92,246,.5); }
      `}</style>

      <div
        className="max-w-5xl mx-auto px-6 py-8"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity .5s ease, transform .5s ease' }}
      >
        {/* Page header */}
        <div className="flex items-center gap-3 mb-8" style={{ animation: 'pfadeUp .5s ease both' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', border: '1px solid rgba(139,92,246,.4)' }}>
            <Briefcase size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Portfolio</h1>
            <p className="text-[10px] text-[#d6dae1] font-mono uppercase tracking-wider">Live positions · NSE</p>
          </div>
        </div>

        {/* Summary stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Invested',      value: `₹${totalInvested.toLocaleString('en-IN')}`, color: '#fff' },
            { label: 'Current Value', value: `₹${totalCurrent.toLocaleString('en-IN')}`,  color: '#fff' },
            { label: 'Total P&L',    value: `${isUp?'+':''}₹${totalPnL.toLocaleString('en-IN')}`, color: isUp ? '#4ade80' : '#f87171' },
            { label: 'Returns',       value: `${isUp?'+':''}${totalPnLPercent}%`,          color: isUp ? '#4ade80' : '#f87171' },
          ].map((s, i) => (
            <div
              key={s.label}
              className="p-stat-card"
              style={{ animation: `pfadeUp .4s ease ${i * 0.08}s both` }}
            >
              <div className="p-corner-tl" /><div className="p-corner-br" />
              <p className="p-stat-label">{s.label}</p>
              <p className="p-stat-val" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Sector breakdown chart */}
        {!loading && enriched.length > 0 && (
          <div className="mb-8" style={{ animation: 'pfadeUp .5s ease .2s both' }}>
            <SectorChart holdings={enriched} />
          </div>
        )}

        {/* Holdings */}
        <div className="p-section mb-6" style={{ animation: 'pfadeUp .5s ease .25s both' }}>
          <div className="p-section-head">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" style={{ animation: 'ppulse 2s infinite' }} />
            <h2 className="text-white text-sm font-semibold">Holdings</h2>
            {!loading && enriched.length > 0 && (
              <span className="ml-auto text-[10px] font-mono text-slate-400">{enriched.length} position{enriched.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          {loading ? (
            <div className="p-6 flex flex-col gap-3">
              {[...Array(3)].map((_, i) => <div key={i} className="p-shimmer h-14" style={{ animationDelay: `${i*0.15}s` }} />)}
            </div>
          ) : enriched.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-slate-400 text-sm font-mono mb-3">NO_POSITIONS_FOUND</p>
              <button onClick={() => navigate('/dashboard')} className="text-purple-400 text-xs hover:text-purple-300 transition-colors border border-purple-500/30 px-4 py-2 rounded-lg hover:border-purple-500/60">
                Browse markets →
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="p-col-head">
                  <th className="text-left font-medium">Stock</th>
                  <th className="text-right font-medium">Qty</th>
                  <th className="text-right font-medium">Avg Price</th>
                  <th className="text-right font-medium">Live Price</th>
                  <th className="text-right font-medium">Invested</th>
                  <th className="text-right font-medium">Current</th>
                  <th className="text-center font-medium">P&L</th>
                </tr>
              </thead>
              <tbody>
                {enriched.map((h, i) => (
                  <tr
                    key={h.symbol}
                    className="p-row"
                    onClick={() => navigate(`/stock/${h.symbol}`)}
                    style={{ animation: `pfadeUp .35s ease ${0.3 + i * 0.06}s both` }}
                  >
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                          style={{ background: 'rgba(139,92,246,.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,.2)' }}
                        >
                          {h.symbol.replace('.NS','').slice(0,2)}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-xs">{h.symbol.replace('.NS','')}</p>
                          <p className="text-slate-400 text-[10px] truncate max-w-[120px]">{h.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-right text-[#94a3b8] font-mono">{h.qty}</td>
                    <td className="text-right text-[#94a3b8] font-mono">₹{h.avgPrice.toLocaleString('en-IN')}</td>
                    <td className="text-right text-white font-mono font-semibold">₹{h.livePrice?.toLocaleString('en-IN')}</td>
                    <td className="text-right text-[#94a3b8] font-mono">₹{h.invested.toLocaleString('en-IN')}</td>
                    <td className="text-right text-white font-mono">₹{h.current.toLocaleString('en-IN')}</td>
                    <td className="text-right">
                      <p className={`font-mono font-semibold text-xs flex items-center justify-end gap-0.5 ${h.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {h.pnl >= 0 ? <ArrowUpRight size={11}/> : <ArrowDownRight size={11}/>}
                        {h.pnl >= 0 ? '+' : ''}₹{h.pnl.toLocaleString('en-IN')}
                      </p>
                      <p className={`text-[10px] font-mono ${h.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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
        <div className="p-section" style={{ animation: 'pfadeUp .5s ease .4s both' }}>
          <div className="p-section-head">
            <History size={13} className="text-purple-400" />
            <h2 className="text-white text-sm font-semibold">Trade History</h2>
            {trades.length > 0 && (
              <span className="ml-auto text-[10px] font-mono text-slate-400">{trades.length} trade{trades.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          {trades.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs font-mono">NO_TRADES_RECORDED</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="p-col-head">
                  <th className="text-left font-medium">Stock</th>
                  <th className="text-left font-medium">Type</th>
                  <th className="text-right font-medium">Qty</th>
                  <th className="text-right font-medium">Price</th>
                  <th className="text-right font-medium">Total</th>
                  <th className="text-left font-medium">Note</th>
                  <th className="text-right font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t, i) => (
                  <tr
                    key={t._id}
                    className="p-trade-row"
                    style={{ animation: `pfadeUp .35s ease ${0.45 + i * 0.05}s both` }}
                  >
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                          style={{
                            background: t.type === 'buy' ? 'rgba(74,222,128,.08)' : 'rgba(248,113,113,.08)',
                            color: t.type === 'buy' ? '#4ade80' : '#f87171',
                            border: `1px solid ${t.type === 'buy' ? 'rgba(74,222,128,.2)' : 'rgba(248,113,113,.2)'}`,
                          }}
                        >
                          {t.symbol.replace('.NS','').slice(0,2)}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-xs">{t.symbol.replace('.NS','')}</p>
                          <p className="text-slate-400 text-[10px]">{t.name}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold"
                        style={{
                          background: t.type === 'buy' ? 'rgba(74,222,128,.1)' : 'rgba(248,113,113,.1)',
                          color: t.type === 'buy' ? '#4ade80' : '#f87171',
                          border: `1px solid ${t.type === 'buy' ? 'rgba(74,222,128,.2)' : 'rgba(248,113,113,.2)'}`,
                        }}
                      >
                        {t.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-right text-[#94a3b8] font-mono">{t.qty}</td>
                    <td className="text-right text-[#94a3b8] font-mono">₹{t.price.toLocaleString('en-IN')}</td>
                    <td className="text-right text-white font-mono">₹{t.total.toLocaleString('en-IN')}</td>
                    <td className="text-[#475569] text-xs italic max-w-[150px] truncate">
                      {t.note || '—'}
                    </td>
                    <td className="text-right text-slate-400 text-[10px] font-mono">
                      {new Date(t.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  )
}