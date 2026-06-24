import express from 'express'
import Trade from '../models/Trade.js'
import Holding from '../models/Holding.js'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/', protect, async (req, res) => {
  try {
    const { symbol, name, type, qty, price } = req.body

    if (!symbol || !type || !qty || !price) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const total = Number(qty) * Number(price)
    const userId = req.user._id

    if (type === 'buy') {
      const user = await User.findById(userId)
      if (user.balance < total) {
        return res.status(400).json({ message: 'Insufficient balance' })
      }

      // Use findByIdAndUpdate instead of save()
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $inc: { balance: -Math.round(total * 100) / 100 } },
        { new: true }
      )

      const holding = await Holding.findOne({ user: userId, symbol })
      if (holding) {
        const newQty = holding.qty + Number(qty)
        const newAvgPrice = +((holding.avgPrice * holding.qty + total) / newQty).toFixed(2)
        await Holding.findByIdAndUpdate(holding._id, {
          qty: newQty,
          avgPrice: newAvgPrice,
        })
      } else {
        await Holding.create({
          user: userId,
          symbol,
          name,
          qty: Number(qty),
          avgPrice: Number(price),
        })
      }

      const trade = await Trade.create({
        user: userId, symbol, name, type,
        qty: Number(qty), price: Number(price), total,
      })

      return res.status(201).json({ trade, balance: updatedUser.balance })
    }

    if (type === 'sell') {
      const holding = await Holding.findOne({ user: userId, symbol })
      if (!holding || holding.qty < Number(qty)) {
        return res.status(400).json({ message: 'Not enough shares to sell' })
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $inc: { balance: Math.round(total * 100) / 100 } },
        { new: true }
      )

      const newQty = holding.qty - Number(qty)
      if (newQty === 0) {
        await Holding.findByIdAndDelete(holding._id)
      } else {
        await Holding.findByIdAndUpdate(holding._id, { qty: newQty })
      }

      const trade = await Trade.create({
        user: userId, symbol, name, type,
        qty: Number(qty), price: Number(price), total,
      })

      return res.status(201).json({ trade, balance: updatedUser.balance })
    }

    return res.status(400).json({ message: 'Invalid order type' })
  } catch (err) {
    console.log('TRADE ERROR:', err.message)
    console.log('TRADE ERROR STACK:', err.stack)
    res.status(500).json({ message: err.message })
  }
})

router.get('/', protect, async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json(trades)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/holdings', protect, async (req, res) => {
  try {
    const holdings = await Holding.find({ user: req.user._id })
    res.json(holdings)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router