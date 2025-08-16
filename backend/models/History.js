const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  question: { type: String },
  answer: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  chatName: { type: String, required: true }, // PDF name or "New Chat"
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('History', chatSchema);
