// import mongoose from 'mongoose'
// import bcrypt from 'bcryptjs'

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true, lowercase: true },
//   password: { type: String, required: true },
//   balance: { type: Number, default: 100000 },
// }, { timestamps: true })

// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next()
//   this.password = await bcrypt.hash(this.password, 12)
//   next()
// })

// userSchema.methods.comparePassword = async function (candidate) {
//   return bcrypt.compare(candidate, this.password)
// }

// userSchema.set('toJSON', {
//   transform: (doc, ret) => { delete ret.password; return ret }
// })

// export default mongoose.model('User', userSchema)

import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 100000 },
}, { timestamps: true })

export default mongoose.model('User', userSchema)