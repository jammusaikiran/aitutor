const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  lastActive: { type: Date, default: Date.now }  // ✅ Added
}, { timestamps: true })  // ✅ createdAt, updatedAt

module.exports = mongoose.model('User', userSchema)
