import express from 'express'
import axios from 'axios'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Simple in-memory cache
const cache = new Map()
const cacheGet = (key) => {
  const item = cache.get(key)
  if (!item) return null
  if (Date.now() > item.expires) { cache.delete(key); return null }
  return item.value
}
const cacheSet = (key, value, ttl = 60) => {
  cache.set(key, { value, expires: Date.now() + ttl * 1000 })
}

const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance'

const fetchQuote = async (symbol) => {
  const cacheKey = `quote_${symbol}`
  const cached = cacheGet(cacheKey)
  if (cached) return cached

  const url = `${YAHOO_BASE}/chart/${symbol}?interval=1d&range=1d`
  const { data } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })

  const meta = data.chart.result[0].meta
  const quote = {
    symbol,
    name: meta.longName || meta.shortName || symbol,
    price: meta.regularMarketPrice,
    previousClose: meta.chartPreviousClose,
    change: +(meta.regularMarketPrice - meta.chartPreviousClose).toFixed(2),
    changePercent: +(
      ((meta.regularMarketPrice - meta.chartPreviousClose) /
        meta.chartPreviousClose) *
      100
    ).toFixed(2),
    volume: meta.regularMarketVolume,
    high: meta.regularMarketDayHigh,
    low: meta.regularMarketDayLow,
    currency: meta.currency,
  }

  cacheSet(cacheKey, quote)
  return quote
}

// GET /api/stocks/quote/:symbol
router.get('/quote/:symbol', protect, async (req, res) => {
  try {
    const quote = await fetchQuote(req.params.symbol.toUpperCase())
    res.json(quote)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stock data', error: err.message })
  }
})

// GET /api/stocks/search?q=reliance
router.get('/search', protect, async (req, res) => {
  try {
    const { q } = req.query
    if (!q) return res.status(400).json({ message: 'Query required' })

    const cacheKey = `search_${q}`
    const cached = cacheGet(cacheKey)
    if (cached) return res.json(cached)

    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${q}+NSE&quotesCount=6&newsCount=0`
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })

    const results = (data.quotes || [])
      .filter((item) => item.exchange === 'NSI' || item.quoteType === 'EQUITY')
      .slice(0, 6)
      .map((item) => ({
        symbol: item.symbol,
        name: item.longname || item.shortname || item.symbol,
        exchange: item.exchange,
      }))

    cacheSet(cacheKey, results, 300)
    res.json(results)
  } catch (err) {
    res.status(500).json({ message: 'Search failed', error: err.message })
  }
})

// GET /api/stocks/history/:symbol?range=1mo
router.get('/history/:symbol', protect, async (req, res) => {
  try {
    const { symbol } = req.params
    const range = req.query.range || '1mo'

    const intervalMap = {
      '1d': '5m',
      '1wk': '15m',
      '1mo': '1d',
      '3mo': '1d',
      '1y': '1wk',
    }
    const interval = intervalMap[range] || '1d'

    const cacheKey = `history_${symbol}_${range}`
    const cached = cacheGet(cacheKey)
    if (cached) return res.json(cached)

    const url = `${YAHOO_BASE}/chart/${symbol}?interval=${interval}&range=${range}`
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })

    const result = data.chart.result[0]
    const timestamps = result.timestamp
    const closes = result.indicators.quote[0].close
    const opens = result.indicators.quote[0].open
    const highs = result.indicators.quote[0].high
    const lows = result.indicators.quote[0].low
    const volumes = result.indicators.quote[0].volume

    const isIntraday = ['5m', '15m', '30m'].includes(interval)

    const history = timestamps.map((t, i) => {
      const close = closes[i]
      const open = opens[i]
      const high = highs[i]
      const low = lows[i]
      const volume = volumes[i]

      if (!close || !open || !high || !low) return null

      const time = isIntraday
        ? t
        : new Date(t * 1000).toISOString().split('T')[0]

      return {
        time,
        open: +open.toFixed(2),
        high: +high.toFixed(2),
        low: +low.toFixed(2),
        close: +close.toFixed(2),
        volume: volume || 0,
      }
    }).filter(Boolean)

    cacheSet(cacheKey, history, 300)
    res.json(history)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch history', error: err.message })
  }
})

// GET /api/stocks/market
router.get('/market', protect, async (req, res) => {
  try {
    const cacheKey = 'market_overview'
    const cached = cacheGet(cacheKey)
    if (cached) return res.json(cached)

    const topStocks = [
      'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS',
      'ICICIBANK.NS', 'HINDUNILVR.NS', 'SBIN.NS', 'BHARTIARTL.NS',
      'WIPRO.NS', 'KOTAKBANK.NS',
    ]

    const quotes = await Promise.all(topStocks.map(fetchQuote))
    cacheSet(cacheKey, quotes, 120)
    res.json(quotes)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch market data', error: err.message })
  }
})

export default router