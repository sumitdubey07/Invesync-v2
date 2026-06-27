import express from 'express'
import User from '../models/User.js'
import Holding from '../models/Holding.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find({}, 'name email balance')

    const rankings = await Promise.all(
      users.map(async (user) => {
        const holdings = await Holding.find({ user: user._id })
        const holdingsCount = holdings.reduce((sum, h) => sum + h.qty, 0)

        const startingBalance = 100000
        const returns = +(((user.balance - startingBalance) / startingBalance) * 100).toFixed(2)

        return {
          name: user.name,
          email: user.email.replace(/(.{2}).*(@.*)/, '$1***$2'),
          balance: +user.balance.toFixed(2),
          holdingsValue: 0,
          totalValue: +user.balance.toFixed(2),
          holdingsCount,
          returns,
        }
      })
    )

    rankings.sort((a, b) => b.totalValue - a.totalValue)
    const ranked = rankings.map((r, i) => ({ ...r, rank: i + 1 }))

    res.json(ranked)
  } catch (err) {
    console.log('LEADERBOARD ERROR:', err.message)
    res.status(500).json({ message: err.message })
  }
})

export default router