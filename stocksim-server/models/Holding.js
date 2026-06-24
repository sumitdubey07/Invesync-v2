import mongoose from 'mongoose'

const holdingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  name: { type: String },
  qty: { type: Number, required: true, default: 0 },
  avgPrice: { type: Number, required: true },
}, { timestamps: true })

export default mongoose.model('Holding', holdingSchema)