import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { TrendingUp, Search, LayoutDashboard, Briefcase, LogOut, X, ChevronRight, TrendingDown, RefreshCw, BarChart2, User, Trophy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { searchStocks, getHoldings, getTrades } from '../api/stocks'

const navLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Portfolio', path: '/portfolio', icon: Briefcase },
  { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
]

export default function Navbar() {
  const { user, logout, updateBalance } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [search, setSearch]       = useState('')
  const [results, setResults]     = useState([])
  const [searching, setSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const searchRef = useRef(null)

  const [showProfile, setShowProfile] = useState(false)
  const profileRef = useRef(null)
  const [holdings, setHoldings]   = useState([])
  const [trades, setTrades]       = useState([])
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [resetting, setResetting] = useState(false)

  // ── search debounce ──────────────────────────────────────────────
  useEffect(() => {
    if (!search.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await searchStocks(search)
        setResults(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setSearching(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  // ── close search on outside click ────────────────────────────────
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false); setResults([]); setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // ── close profile on outside click ───────────────────────────────
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // ── fetch profile stats when dropdown opens ───────────────────────
  useEffect(() => {
    if (!showProfile) return
    setLoadingProfile(true)
    Promise.all([getHoldings(), getTrades()])
      .then(([h, t]) => {
        setHoldings(h.data || [])
        setTrades(t.data || [])
      })
      .catch(console.error)
      .finally(() => setLoadingProfile(false))
  }, [showProfile])

  // ── keyboard shortcuts ────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
        searchRef.current?.querySelector('input')?.focus()
      }
      if (e.key === 'Escape') {
        setShowSearch(false); setResults([]); setSearch('')
        setShowProfile(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }
  const handleStockSelect = (symbol) => {
    navigate(`/stock/${symbol}`)
    setSearch(''); setResults([]); setShowSearch(false)
  }

  // ── derived stats ─────────────────────────────────────────────────
  const totalPnL = holdings.reduce((sum, h) => {
    const invested = h.avgPrice * h.quantity
    const current  = (h.currentPrice ?? h.avgPrice) * h.quantity
    return sum + (current - invested)
  }, 0)
  const pnlPositive = totalPnL >= 0
  const totalTrades = trades.length

  // ── reset balance ─────────────────────────────────────────────────
  const handleReset = async () => {
    if (!window.confirm('Reset your balance to ₹1,00,000? This cannot be undone.')) return
    setResetting(true)
    try {
      // optimistic update — adjust if your backend has a reset endpoint
      updateBalance(100000)
    } finally {
      setResetting(false)
    }
  }

  // ── member since ──────────────────────────────────────────────────
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : 'N/A'

  return (
    <nav className="sticky top-0 z-50 border-b border-purple-500/20 bg-[#05050d]/92 backdrop-blur-md">

      <style>{`
        @keyframes navpulse { 0%,100%{opacity:1} 50%{opacity:.25} }
        .nav-active-dot { animation: navpulse 2s ease-in-out infinite; }

        .nav-link-item {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 13px; border-radius: 8px;
          font-size: 13px; font-weight: 500;
          text-decoration: none; transition: all .15s;
          border: 1px solid transparent; color: #cbd5e1;
        }
        .nav-link-item:hover { color: #fff; background: #1a1a2e; }
        .nav-link-item.active {
          color: #a78bfa;
          background: rgba(139,92,246,.1);
          border-color: rgba(139,92,246,.28);
        }

        .search-container {
          display: flex; align-items: center; gap: 8px;
          padding: 7px 13px; border-radius: 10px;
          border: 1px solid rgba(139,92,246,.18);
          background: #0d0d18; cursor: text;
          transition: border-color .2s, background .2s;
        }
        .search-container:focus-within, .search-container.open {
          border-color: rgba(139,92,246,.55); background: #12121f;
        }
        .search-input {
          background: transparent; border: none; outline: none;
          font-size: 12px; color: #fff; width: 100%; caret-color: #a78bfa;
        }
        .search-input::placeholder { color: #94a3b8; }
        .search-kbd {
          font-size: 9px; color: #cbd5e1; font-family: monospace;
          border: 1px solid #475569; border-radius: 4px;
          padding: 1px 5px; white-space: nowrap; flex-shrink: 0;
        }
        @keyframes dropDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .search-dropdown {
          position: absolute; top: calc(100% + 8px); left: 0; right: 0; z-index: 9999;
          background: #0e0e1a; border: 1px solid rgba(139,92,246,.25);
          border-radius: 12px; overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,.6);
          animation: dropDown .15s ease;
        }
        .search-result-btn {
          width: 100%; text-align: left; padding: 10px 14px;
          background: transparent; border: none; border-bottom: 1px solid rgba(139,92,246,.08);
          display: flex; align-items: center; justify-content: space-between;
          cursor: pointer; transition: background .12s; font-family: system-ui, sans-serif;
        }
        .search-result-btn:last-child { border-bottom: none; }
        .search-result-btn:hover { background: rgba(139,92,246,.1); }
        .result-ticker { color: #fff; font-size: 13px; font-weight: 600; }
        .result-name   { color: #cbd5e1; font-size: 11px; margin-left: 8px; }
        .result-arrow  { color: #94a3b8; transition: color .12s; }
        .search-result-btn:hover .result-arrow { color: #a78bfa; }

        .balance-label { font-size: 9px; color: #cbd5e1; text-transform: uppercase; letter-spacing: .8px; font-family: monospace; }
        .balance-val   { font-size: 13px; font-weight: 700; color: #4ade80; font-family: monospace; letter-spacing: .3px; }

        .logout-btn {
          width: 30px; height: 30px; border-radius: 8px;
          border: 1px solid rgba(248,113,113,.15);
          background: rgba(248,113,113,.04);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #cbd5e1;
          transition: border-color .2s, background .2s, color .2s;
        }
        .logout-btn:hover { border-color: rgba(248,113,113,.4); background: rgba(248,113,113,.1); color: #f87171; }

        /* ── Profile dropdown ── */
        .profile-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 12px; font-weight: 700;
          cursor: pointer; position: relative;
          transition: box-shadow .2s;
        }
        .profile-avatar:hover { box-shadow: 0 0 0 2px rgba(139,92,246,.6); }
        .profile-avatar.open  { box-shadow: 0 0 0 2px rgba(139,92,246,.9); }

        .profile-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          width: 260px; z-index: 9999;
          background: #0e0e1a; border: 1px solid rgba(139,92,246,.25);
          border-radius: 14px; overflow: hidden;
          box-shadow: 0 24px 48px rgba(0,0,0,.7);
          animation: dropDown .15s ease;
        }

        .pd-header {
          padding: 14px 16px 12px;
          background: linear-gradient(135deg, rgba(124,58,237,.12), rgba(37,99,235,.08));
          border-bottom: 1px solid rgba(139,92,246,.12);
          display: flex; align-items: center; gap: 10px;
        }
        .pd-avatar-lg {
          width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; font-weight: 700; color: #fff;
          border: 1px solid rgba(139,92,246,.4);
        }
        .pd-name  { color: #fff; font-size: 13px; font-weight: 600; line-height: 1.3; }
        .pd-email { color: #94a3b8; font-size: 10px; margin-top: 1px; }
        .pd-since { color: #64748b; font-size: 9px; margin-top: 2px; font-family: monospace; text-transform: uppercase; letter-spacing: .5px; }

        .pd-stats {
          display: grid; grid-template-columns: 1fr 1fr 1fr;
          border-bottom: 1px solid rgba(139,92,246,.1);
        }
        .pd-stat {
          padding: 10px 8px; text-align: center;
          border-right: 1px solid rgba(139,92,246,.08);
        }
        .pd-stat:last-child { border-right: none; }
        .pd-stat-val   { font-size: 12px; font-weight: 700; font-family: monospace; color: #fff; }
        .pd-stat-label { font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: .5px; margin-top: 2px; }

        .pd-actions { padding: 8px; }
        .pd-action-btn {
          width: 100%; display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 8px; border: none;
          background: transparent; cursor: pointer; text-decoration: none;
          font-size: 12px; color: #cbd5e1; font-family: system-ui, sans-serif;
          transition: background .12s, color .12s;
        }
        .pd-action-btn:hover { background: rgba(139,92,246,.08); color: #fff; }
        .pd-action-btn.danger { color: #f87171; }
        .pd-action-btn.danger:hover { background: rgba(248,113,113,.08); color: #f87171; }
        .pd-action-btn .pd-icon { width: 26px; height: 26px; border-radius: 7px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pd-divider { height: 1px; background: rgba(139,92,246,.1); margin: 4px 0; }

        .pd-loading { padding: 20px; text-align: center; color: #64748b; font-size: 11px; font-family: monospace; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinning { animation: spin .7s linear infinite; }
      `}</style>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-purple-500/40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-purple-500/40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4 relative">

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center relative"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
            <div className="absolute inset-[-1px] rounded-[9px] border border-purple-500/40" />
            <TrendingUp size={15} className="text-white relative" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            Inve<span style={{ background:'linear-gradient(90deg,#a78bfa,#60a5fa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>sync</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1 flex-shrink-0">
          {navLinks.map(({ name, path, icon: Icon }) => {
            const isActive = location.pathname === path
            return (
              <Link key={path} to={path} className={`nav-link-item${isActive ? ' active' : ''}`}>
                {isActive && <span className="nav-active-dot w-1.5 h-1.5 rounded-full bg-purple-400" />}
                <Icon size={13} />
                {name}
              </Link>
            )
          })}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-sm relative z-[9999]" ref={searchRef}>
          <div className={`search-container${showSearch ? ' open' : ''}`} onClick={() => setShowSearch(true)}>
            <Search size={13} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search — RELIANCE, TCS, INFY…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search ? (
              <button onClick={(e) => { e.stopPropagation(); setSearch(''); setResults([]) }}>
                <X size={12} className="text-slate-400 hover:text-white transition-colors" />
              </button>
            ) : (
              <span className="search-kbd">⌘K</span>
            )}
          </div>

          {showSearch && (search || results.length > 0) && (
            <div className="search-dropdown">
              {searching ? (
                <div className="px-4 py-3 text-slate-400 text-xs font-mono">Scanning markets...</div>
              ) : results.length > 0 ? (
                results.map((s) => (
                  <button key={s.symbol} onClick={() => handleStockSelect(s.symbol)} className="search-result-btn">
                    <div>
                      <span className="result-ticker">{s.symbol.replace('.NS', '')}</span>
                      <span className="result-name">{s.name}</span>
                    </div>
                    <ChevronRight size={13} className="result-arrow" />
                  </button>
                ))
              ) : search.length > 1 ? (
                <div className="px-4 py-3 text-slate-400 text-xs font-mono">No results found</div>
              ) : null}
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Balance (hidden on small screens) */}
          <div className="text-right hidden sm:block">
            <p className="balance-label">Balance</p>
            <p className="balance-val">₹{user?.balance?.toLocaleString('en-IN')}</p>
          </div>

          {/* Profile avatar + dropdown */}
          <div className="relative" ref={profileRef}>
            <div
              className={`profile-avatar${showProfile ? ' open' : ''}`}
              style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', border: '1px solid rgba(139,92,246,.4)' }}
              onClick={() => setShowProfile(v => !v)}
              title="Profile"
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            {showProfile && (
              <div className="profile-dropdown">

                {/* Header */}
                <div className="pd-header">
                  <div className="pd-avatar-lg" style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="pd-name">{user?.name || 'Trader'}</div>
                    <div className="pd-email">{user?.email || '—'}</div>
                    <div className="pd-since">Member since {memberSince}</div>
                  </div>
                </div>

                {/* Stats */}
                {loadingProfile ? (
                  <div className="pd-loading">Loading stats…</div>
                ) : (
                  <div className="pd-stats">
                    <div className="pd-stat">
                      <div className="pd-stat-val" style={{ color: '#4ade80' }}>
                        ₹{(user?.balance ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </div>
                      <div className="pd-stat-label">Balance</div>
                    </div>
                    <div className="pd-stat">
                      <div className="pd-stat-val" style={{ color: pnlPositive ? '#4ade80' : '#f87171' }}>
                        {pnlPositive ? '+' : ''}₹{Math.abs(totalPnL).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </div>
                      <div className="pd-stat-label">P&amp;L</div>
                    </div>
                    <div className="pd-stat">
                      <div className="pd-stat-val" style={{ color: '#a78bfa' }}>{holdings.length}</div>
                      <div className="pd-stat-label">Holdings</div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pd-actions">
                  <Link to="/portfolio" className="pd-action-btn" onClick={() => setShowProfile(false)}>
                    <span className="pd-icon" style={{ background: 'rgba(139,92,246,.12)' }}>
                      <BarChart2 size={13} color="#a78bfa" />
                    </span>
                    View Portfolio
                  </Link>

                  <button className="pd-action-btn" onClick={handleReset} disabled={resetting}>
                    <span className="pd-icon" style={{ background: 'rgba(96,165,250,.1)' }}>
                      <RefreshCw size={13} color="#60a5fa" className={resetting ? 'spinning' : ''} />
                    </span>
                    {resetting ? 'Resetting…' : 'Reset Balance'}
                  </button>

                  <div className="pd-divider" />

                  <button className="pd-action-btn danger" onClick={handleLogout}>
                    <span className="pd-icon" style={{ background: 'rgba(248,113,113,.08)' }}>
                      <LogOut size={13} color="#f87171" />
                    </span>
                    Logout
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* Standalone logout button */}
          <button onClick={handleLogout} className="logout-btn" title="Logout" aria-label="Logout">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </nav>
  )
}