import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' })

    const exists = await User.findOne({ email })
    if (exists)
      return res.status(400).json({ message: 'Email already in use' })

    // Hash password manually — avoid pre-save hook
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      balance: 100000,
    })

    const token = signToken(user._id)
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        role: user.role,
      }
    })
  } catch (err) {
    console.log('REGISTER ERROR:', err.message)
    res.status(500).json({ message: err.message })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password' })

    // Compare manually
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid email or password' })

    const token = signToken(user._id)
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
      }
    })
  } catch (err) {
    console.log('LOGIN ERROR:', err.message)
    res.status(500).json({ message: err.message })
  }
})

// Get me
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        balance: req.user.balance,
      }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router