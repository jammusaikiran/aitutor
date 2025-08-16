const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Chat = require('../models/Chat')
const mongoose = require('mongoose')

const auth = require('../middleware/auth')
const adminAuth = require('../middleware/adminAuth')

// ✅ Get all users (with message count + last active)
// Get all distinct users with last active time and message count
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    // Fetch users
    const users = await User.find({ role: 'user' }).select('-password')

    // For each user, get chat stats
    const enrichedUsers = await Promise.all(users.map(async (u) => {
      const chat = await Chat.findOne({ userId: u._id }).sort({ updatedAt: -1 })

      return {
        _id: u._id,
        email: u.email,
        createdAt: u.createdAt,
        lastActive: chat ? chat.updatedAt : null,
        messageCount: chat ? chat.messages.length : 0
      }
    }))

    // Sort users by lastActive (latest first)
    enrichedUsers.sort((a, b) => new Date(b.lastActive || 0) - new Date(a.lastActive || 0))

    res.json(enrichedUsers)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})


// ✅ Active users count (last 5 minutes)
router.get('/active-users', auth, adminAuth, async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const activeChats = await Chat.find({ 'messages.timestamp': { $gte: fiveMinutesAgo } })

    const activeUserIds = new Set(activeChats.map(c => c.userId.toString()))
    res.json({ activeUsers: activeUserIds.size })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ✅ Delete a user and their chats
router.delete('/user/:id', auth, adminAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    await Chat.deleteMany({ userId: req.params.id })
    res.json({ msg: 'User and chats deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Delete only chats of a user
router.delete('/user/:id/chats', auth, adminAuth, async (req, res) => {
  try {
    await Chat.deleteMany({ userId: req.params.id })
    res.json({ message: 'All chats of the user deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete chats' })
  }
})


// ✅ Get chat history of a specific user
router.get('/chats/:userId', auth, adminAuth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId)
    const chat = await Chat.findOne({ userId })

    if (!chat || !chat.messages || chat.messages.length === 0) {
      return res.json([])
    }

    const pairs = []
    const messages = chat.messages

    for (let i = 0; i < messages.length - 1; i++) {
      if (messages[i].sender === 'user' && messages[i + 1].sender === 'bot') {
        pairs.push({
          question: messages[i].text,
          answer: messages[i + 1].text,
          timestamp: messages[i].timestamp
        })
        i++
      }
    }

    res.json(pairs)
  } catch (err) {
    console.error('Error fetching chat history:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
