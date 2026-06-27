import express from 'express'
import axios from 'axios'
import { protect } from '../middleware/auth.js'

const router = express.Router()

const newsCache = new Map()
const cacheGet = (key) => {
  const item = newsCache.get(key)
  if (!item) return null
  if (Date.now() > item.expires) { newsCache.delete(key); return null }
  return item.value
}
const cacheSet = (key, value, ttl = 300) => {
  newsCache.set(key, { value, expires: Date.now() + ttl * 1000 })
}

router.get('/:symbol', protect, async (req, res) => {
  try {
    const { symbol } = req.params
    const cacheKey = `news_${symbol}`
    const cached = cacheGet(cacheKey)
    if (cached) return res.json(cached)

    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${symbol}&newsCount=8&quotesCount=0`
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })

    const news = (data.news || [])
      .filter((n) => n.title && n.link)
      .slice(0, 6)
      .map((n) => ({
        headline: n.title,
        source: n.publisher || 'Yahoo Finance',
        url: n.link,
        datetime: n.providerPublishTime,
        summary: '',
        image: n.thumbnail?.resolutions?.[0]?.url || null,
      }))

    cacheSet(cacheKey, news)
    res.json(news)
  } catch (err) {
    console.log('NEWS ERROR:', err.message)
    res.status(500).json({ message: err.message })
  }
})

export default router