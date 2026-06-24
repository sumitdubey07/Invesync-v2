import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import stockRoutes from './routes/stocks.js'
import tradeRoutes from './routes/trades.js'
import predictRoutes from './routes/predict.js'

dotenv.config()

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/stocks', stockRoutes)
app.use('/api/trades', tradeRoutes)
app.use('/api/predict', predictRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'StockSim server running' })
})

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${process.env.PORT}`)
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB error:', err.message)
  })