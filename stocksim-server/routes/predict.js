import express from 'express'
import axios from 'axios'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Simple linear regression
const linearRegression = (prices) => {
  const n = prices.length
  const xSum = prices.reduce((sum, _, i) => sum + i, 0)
  const ySum = prices.reduce((sum, p) => sum + p, 0)
  const xySum = prices.reduce((sum, p, i) => sum + i * p, 0)
  const x2Sum = prices.reduce((sum, _, i) => sum + i * i, 0)

  const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum)
  const intercept = (ySum - slope * xSum) / n

  return { slope, intercept }
}

router.get('/:symbol', protect, async (req, res) => {
  try {
    const { symbol } = req.params

    // Fetch 3 months of daily data
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=3mo`
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })

    const result = data.chart.result[0]
    const timestamps = result.timestamp
    const closes = result.indicators.quote[0].close

    // Clean data — remove nulls
    const clean = timestamps
      .map((t, i) => ({ time: t, close: closes[i] }))
      .filter((d) => d.close !== null && d.close !== undefined)

    // Use last 30 data points for regression
    const recent = clean.slice(-30)
    const prices = recent.map((d) => d.close)

    const { slope, intercept } = linearRegression(prices)

    // Calculate R² (confidence score)
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length
    const ssTot = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0)
    const ssRes = prices.reduce((sum, p, i) => {
      const predicted = intercept + slope * i
      return sum + Math.pow(p - predicted, 2)
    }, 0)
    const r2 = +(1 - ssRes / ssTot).toFixed(4)
    const confidence = Math.min(100, Math.max(0, Math.round(r2 * 100)))

    // Generate 7-day prediction
    const lastTimestamp = recent[recent.length - 1].time
    const lastIndex = recent.length - 1
    const predictions = []

    for (let i = 1; i <= 7; i++) {
      const predictedPrice = +(intercept + slope * (lastIndex + i)).toFixed(2)
      const futureTimestamp = lastTimestamp + i * 86400 // add 1 day in seconds
      const date = new Date(futureTimestamp * 1000).toISOString().split('T')[0]

      predictions.push({
        time: date,
        value: predictedPrice,
      })
    }

    // Last actual point (to connect the dotted line to the chart)
    const lastActual = {
      time: new Date(lastTimestamp * 1000).toISOString().split('T')[0],
      value: +recent[recent.length - 1].close.toFixed(2),
    }

    const direction = slope > 0 ? 'bullish' : 'bearish'
    const targetPrice = predictions[predictions.length - 1].value
    const currentPrice = prices[prices.length - 1]
    const expectedChange = +(targetPrice - currentPrice).toFixed(2)
    const expectedChangePercent = +((expectedChange / currentPrice) * 100).toFixed(2)

    res.json({
      symbol,
      predictions: [lastActual, ...predictions],
      confidence,
      direction,
      currentPrice: +currentPrice.toFixed(2),
      targetPrice,
      expectedChange,
      expectedChangePercent,
      summary: `Based on the last 30 days, ${symbol.replace('.NS', '')} shows a ${direction} trend with a predicted ${expectedChange >= 0 ? 'rise' : 'fall'} of ₹${Math.abs(expectedChange)} (${expectedChangePercent}%) over the next 7 days.`
    })
  } catch (err) {
    console.log('PREDICT ERROR:', err.message)
    res.status(500).json({ message: err.message })
  }
})

export default router