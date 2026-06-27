
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

        /* ── CHANGED: CSS variables on section card ── */
        .p-section {
          background: var(--card);
          border: 1px solid var(--border);
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

        /* ── CHANGED: CSS variable on section header border ── */
        .p-section-head {
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; gap: 8px;
        }

        /* ── CHANGED: CSS variables on column header ── */
        .p-col-head {
          font-size: 10px; font-weight: 600; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 1px;
          padding: 10px 20px;
          border-bottom: 1px solid var(--border);
        }

        /* ── CHANGED: CSS variable on row border and hover ── */
        .p-row {
          border-bottom: 1px solid var(--border);
          transition: background .15s;
          cursor: pointer;
        }
        .p-row:last-child { border-bottom: none; }
        .p-row:hover { background: var(--row-hover); }
        .p-row td { padding: 14px 20px; font-size: 12px; }

        .p-trade-row {
          border-bottom: 1px solid var(--border);
        }
        .p-trade-row:last-child { border-bottom: none; }
        .p-trade-row td { padding: 13px 20px; font-size: 12px; }

        /* ── CHANGED: CSS variables on stat card ── */
        .p-stat-card {
          background: var(--card);
          border: 1px solid var(--border);
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

        /* ── CHANGED: CSS variable on stat label ── */
        .p-stat-label {
          font-size: 9px; color: var(--text-muted); text-transform: uppercase;
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
            {/* ── CHANGED: CSS variable on page title ── */}
            <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Portfolio</h1>
            {/* ── CHANGED: CSS variable on subtitle ── */}
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Live positions · NSE</p>
          </div>
        </div>

        {/* Summary stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Invested',      value: `₹${totalInvested.toLocaleString('en-IN')}`, color: 'var(--text)' },
            { label: 'Current Value', value: `₹${totalCurrent.toLocaleString('en-IN')}`,  color: 'var(--text)' },
            { label: 'Total P&L',     value: `${isUp?'+':''}₹${totalPnL.toLocaleString('en-IN')}`, color: isUp ? '#4ade80' : '#f87171' },
            { label: 'Returns',       value: `${isUp?'+':''}${totalPnLPercent}%`,          color: isUp ? '#4ade80' : '#f87171' },
          ].map((s, i) => (
            <div
              key={s.label}
              className="p-stat-card"
              style={{ animation: `pfadeUp .4s ease ${i * 0.08}s both` }}
            >
              <div className="p-corner-tl" /><div className="p-corner-br" />
              <p className="p-stat-label">{s.label}</p>
              {/* ── CHANGED: dynamic color already uses var(--text) for neutral cards ── */}
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
            {/* ── CHANGED: CSS variable on section title ── */}
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Holdings</h2>
            {!loading && enriched.length > 0 && (
              <span className="ml-auto text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                {enriched.length} position{enriched.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {loading ? (
            <div className="p-6 flex flex-col gap-3">
              {[...Array(3)].map((_, i) => <div key={i} className="p-shimmer h-14" style={{ animationDelay: `${i*0.15}s` }} />)}
            </div>
          ) : enriched.length === 0 ? (
            <div className="p-10 text-center">
              {/* ── CHANGED: CSS variable on empty state text ── */}
              <p className="text-sm font-mono mb-3" style={{ color: 'var(--text-muted)' }}>NO_POSITIONS_FOUND</p>
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
                          {/* ── CHANGED: CSS variable on ticker + name ── */}
                          <p className="font-semibold text-xs" style={{ color: 'var(--text)' }}>{h.symbol.replace('.NS','')}</p>
                          <p className="text-[10px] truncate max-w-[120px]" style={{ color: 'var(--text-faint)' }}>{h.name}</p>
                        </div>
                      </div>
                    </td>
                    {/* ── CHANGED: CSS variable on all data cells ── */}
                    <td className="text-right font-mono" style={{ color: 'var(--text-muted)' }}>{h.qty}</td>
                    <td className="text-right font-mono" style={{ color: 'var(--text-muted)' }}>₹{h.avgPrice.toLocaleString('en-IN')}</td>
                    <td className="text-right font-mono font-semibold" style={{ color: 'var(--text)' }}>₹{h.livePrice?.toLocaleString('en-IN')}</td>
                    <td className="text-right font-mono" style={{ color: 'var(--text-muted)' }}>₹{h.invested.toLocaleString('en-IN')}</td>
                    <td className="text-right font-mono" style={{ color: 'var(--text)' }}>₹{h.current.toLocaleString('en-IN')}</td>
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
            {/* ── CHANGED: CSS variable on section title ── */}
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Trade History</h2>
            {trades.length > 0 && (
              <span className="ml-auto text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                {trades.length} trade{trades.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {trades.length === 0 ? (
            <div className="p-10 text-center text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              NO_TRADES_RECORDED
            </div>
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
                          {/* ── CHANGED: CSS variable on ticker + name ── */}
                          <p className="font-semibold text-xs" style={{ color: 'var(--text)' }}>{t.symbol.replace('.NS','')}</p>
                          <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{t.name}</p>
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
                    {/* ── CHANGED: CSS variables on trade data cells ── */}
                    <td className="text-right font-mono" style={{ color: 'var(--text-muted)' }}>{t.qty}</td>
                    <td className="text-right font-mono" style={{ color: 'var(--text-muted)' }}>₹{t.price.toLocaleString('en-IN')}</td>
                    <td className="text-right font-mono" style={{ color: 'var(--text)' }}>₹{t.total.toLocaleString('en-IN')}</td>
                    {/* ── CHANGED: CSS variable on note cell ── */}
                    <td className="text-xs italic max-w-[150px] truncate" style={{ color: 'var(--text-faint)' }}>
                      {t.note || '—'}
                    </td>
                    {/* ── CHANGED: CSS variable on date cell ── */}
                    <td className="text-right text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
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