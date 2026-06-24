import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, TrendingUp, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import StockCard from '../components/StockCard'
import { getMarket, searchStocks } from '../api/stocks'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [market, setMarket] = useState([])
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  // Load market overview on mount
  useEffect(() => {
    getMarket()
      .then((res) => setMarket(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Search with debounce
  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await searchStocks(search)
        setSearchResults(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setSearching(false)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const handleLogout = () => { logout(); navigate('/login') }
  const handleStockClick = (stock) => navigate(`/stock/${stock.symbol}`)

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Navbar */}
      <div className="border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-400" />
          <span className="text-white font-bold text-lg">Invesync</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-gray-500">Virtual Balance</p>
            <p className="text-green-400 font-bold text-sm">
              ₹{user?.balance?.toLocaleString('en-IN')}
            </p>
          </div>
                <button
                onClick={() => navigate('/portfolio')}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                Portfolio
                </button>
          <span className="text-gray-400 text-sm">{user?.name}</span>
          <button onClick={handleLogout} className="text-gray-500 hover:text-white transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="relative mb-8">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search stocks... (e.g. Reliance, TCS, HDFC)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600"
          />
          {/* Search results dropdown */}
          {(searchResults.length > 0 || searching) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden z-10">
              {searching ? (
                <p className="text-gray-500 text-sm px-4 py-3">Searching...</p>
              ) : (
                searchResults.map((s) => (
                  <button
                    key={s.symbol}
                    onClick={() => { navigate(`/stock/${s.symbol}`); setSearch('') }}
                    className="w-full text-left px-4 py-3 hover:bg-[#2a2a2a] transition-colors border-b border-[#2a2a2a] last:border-0"
                  >
                    <span className="text-white text-sm font-medium">
                      {s.symbol.replace('.NS', '')}
                    </span>
                    <span className="text-gray-500 text-xs ml-2">{s.name}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Market Overview */}
        <div className="mb-6">
          <h2 className="text-white font-semibold mb-4">Market Overview</h2>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 h-28 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {market.map((stock) => (
                <StockCard
                  key={stock.symbol}
                  stock={stock}
                  onClick={handleStockClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}