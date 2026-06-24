import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import StockChart from '../components/StockChart'
import { getQuote, getHistory, getPrediction } from '../api/stocks'
import api from '../api/axios'

const RANGES = ['1d', '1wk', '1mo', '3mo', '1y']

export default function StockDetail() {
  const { symbol } = useParams()
  const navigate = useNavigate()
  const { user, updateBalance } = useAuth()

  const [quote, setQuote] = useState(null)
  const [history, setHistory] = useState([])
  const [range, setRange] = useState('1mo')
  const [chartType, setChartType] = useState('line')
  const [loading, setLoading] = useState(true)
  const [prediction, setPrediction] = useState(null)
  const [predictionData, setPredictionData] = useState(null)
  const [showPrediction, setShowPrediction] = useState(false)

  const [orderType, setOrderType] = useState('buy')
  const [qty, setQty] = useState(1)
  const [orderMsg, setOrderMsg] = useState('')
  const [orderError, setOrderError] = useState('')
  const [orderLoading, setOrderLoading] = useState(false)

  const fetchPrediction = async () => {
    if (predictionData) { setShowPrediction(true); return }
    try {
      const res = await getPrediction(symbol)
      setPrediction(res.data)
      setPredictionData(res.data.predictions)
      setShowPrediction(true)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([getQuote(symbol), getHistory(symbol, range)])
      .then(([quoteRes, histRes]) => {
        setQuote(quoteRes.data)
        setHistory(histRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [symbol, range])

  const totalCost = quote ? (quote.price * qty).toFixed(2) : 0
  const isUp = quote?.changePercent >= 0

  const handleOrder = async () => {
    setOrderMsg('')
    setOrderError('')
    setOrderLoading(true)
    try {
      const res = await api.post('/trades', {
        symbol,
        name: quote.name,
        type: orderType,
        qty: Number(qty),
        price: quote.price,
      })
      updateBalance(res.data.balance)
      setOrderMsg(
        `${orderType === 'buy' ? 'Bought' : 'Sold'} ${qty} share(s) of ${symbol.replace('.NS', '')} at ₹${quote.price}`
      )
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Order failed')
    } finally {
      setOrderLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

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

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Chart */}
          <div className="lg:col-span-2">
            {/* Stock header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">
                {symbol.replace('.NS', '')}
              </h1>
              <p className="text-gray-500 text-sm">{quote?.name}</p>
              <div className="flex items-end gap-3 mt-3">
                <span className="text-4xl font-bold text-white">
                  ₹{quote?.price?.toLocaleString('en-IN')}
                </span>
                <span className={`flex items-center gap-1 text-sm font-medium mb-1 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                  {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {isUp ? '+' : ''}{quote?.change} ({isUp ? '+' : ''}{quote?.changePercent}%)
                </span>
              </div>
            </div>

            {/* Chart controls */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-1">
                {RANGES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      range === r
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                {['line', 'candlestick'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setChartType(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${
                      chartType === t
                        ? 'bg-[#2a2a2a] text-white'
                        : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
                <button
                  onClick={showPrediction ? () => setShowPrediction(false) : fetchPrediction}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    showPrediction
                      ? 'bg-amber-500 text-white'
                      : 'text-gray-500 hover:text-white border border-[#2a2a2a]'
                  }`}
                >
                  AI Forecast
                </button>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
              <StockChart
                data={history}
                type={chartType}
                prediction={showPrediction ? predictionData : null}
              />
            </div>

            {/* Stock stats */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: 'Day High', value: `₹${quote?.high?.toLocaleString('en-IN')}` },
                { label: 'Day Low', value: `₹${quote?.low?.toLocaleString('en-IN')}` },
                { label: 'Prev Close', value: `₹${quote?.previousClose?.toLocaleString('en-IN')}` },
              ].map((s) => (
                <div key={s.label} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                  <p className="text-gray-500 text-xs">{s.label}</p>
                  <p className="text-white font-semibold mt-1">{s.value}</p>
                </div>
              ))}
            </div>

            {/* AI Prediction card — inside left column */}
            {prediction && showPrediction && (
              <div className="mt-4 bg-[#1a1a1a] border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-amber-400 text-sm font-semibold">AI Forecast</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
                    {prediction.confidence}% confidence
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    prediction.direction === 'bullish'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {prediction.direction.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{prediction.summary}</p>
                <div className="flex gap-6 mt-3">
                  <div>
                    <p className="text-gray-500 text-xs">Target Price (7d)</p>
                    <p className="text-white font-bold">₹{prediction.targetPrice?.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Expected Change</p>
                    <p className={`font-bold ${prediction.expectedChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {prediction.expectedChange >= 0 ? '+' : ''}₹{prediction.expectedChange} ({prediction.expectedChangePercent}%)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Order panel */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 h-fit">
            <h2 className="text-white font-semibold mb-4">Place Order</h2>

            <div className="flex rounded-lg overflow-hidden border border-[#2a2a2a] mb-4">
              <button
                onClick={() => setOrderType('buy')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  orderType === 'buy'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setOrderType('sell')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  orderType === 'sell'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                Sell
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-500 text-xs mb-1">Market Price</p>
              <p className="text-white font-bold text-lg">
                ₹{quote?.price?.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-gray-500 text-xs mb-1">Quantity</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 bg-[#2a2a2a] text-white rounded-lg text-lg hover:bg-[#3a3a3a] transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                  className="flex-1 bg-[#0f0f0f] border border-[#2a2a2a] text-white text-center rounded-lg py-1.5 text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-8 h-8 bg-[#2a2a2a] text-white rounded-lg text-lg hover:bg-[#3a3a3a] transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-[#0f0f0f] rounded-lg p-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total</span>
                <span className="text-white font-bold">
                  ₹{Number(totalCost).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-600">Available</span>
                <span className="text-gray-400">
                  ₹{user?.balance?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {orderMsg && (
              <p className="text-green-400 text-xs bg-green-400/10 px-3 py-2 rounded-lg mb-3">
                ✓ {orderMsg}
              </p>
            )}
            {orderError && (
              <p className="text-red-400 text-xs bg-red-400/10 px-3 py-2 rounded-lg mb-3">
                {orderError}
              </p>
            )}

            <button
              onClick={handleOrder}
              disabled={orderLoading}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                orderType === 'buy'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {orderLoading
                ? 'Placing order...'
                : `${orderType === 'buy' ? 'Buy' : 'Sell'} ${qty} share(s)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}