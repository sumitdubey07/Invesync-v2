import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization
    console.log('AUTH HEADER:', header)

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const token = header.split(' ')[1]
    console.log('TOKEN:', token)

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log('DECODED:', decoded)

    const user = await User.findById(decoded.id)
    console.log('USER:', user?._id)

    if (!user) return res.status(401).json({ message: 'User not found' })

    req.user = user
    console.log('CALLING NEXT')
    next()
  } catch (err) {
    console.log('AUTH ERROR:', err.message)
    res.status(401).json({ message: err.message })
  }
}