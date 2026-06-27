import mongoose from 'mongoose'

const tradeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  name: { type: String },
  type: { type: String, enum: ['buy', 'sell'], required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
  note: { type: String, default: '' },
}, { timestamps: true })

export default mongoose.model('Trade', tradeSchema)