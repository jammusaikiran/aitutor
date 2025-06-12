const { GoogleGenerativeAI } = require('@google/generative-ai')
const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const Chat = require('../models/Chat')
const mongoose = require('mongoose')
require('dotenv').config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id)
    const chat = await Chat.findOne({ userId }).select('messages');

    if (!chat || !chat.messages || chat.messages.length === 0) {
      return res.json([])
    }

    // Group messages into question-answer pairs with timestamps
    const pairs = []
    for (let i = 0; i < chat.messages.length; i += 2) {
      const userMsg = chat.messages[i]
      const botMsg = chat.messages[i + 1]

      if (userMsg?.text && botMsg?.text) {
        pairs.push({
          question: userMsg.text,
          answer: botMsg.text,
          createdAt: botMsg.timestamp || userMsg.timestamp || new Date()
        })
      }
    }

    res.json(pairs.reverse())
  } catch (err) {
    console.error('Fetch history error:', err.message)
    res.status(500).json({ error: 'Failed to fetch chat history' })
  }
})


router.post('/', authMiddleware, async (req, res) => {
  try {
    const { question } = req.body
    if (!question) return res.status(400).json({ error: 'Question is required' })

    const result = await model.generateContent(question)
    const answer = await result.response.text()

    const userId = new mongoose.Types.ObjectId(req.user.id)

    await Chat.findOneAndUpdate(
      { userId },
      {
        $push: {
            messages: [
              { sender: 'user', text: question },
              { sender: 'bot', text: answer }
            ]
          }

      },
      { upsert: true, new: true }
    )

    res.json({ question, answer })
  } catch (err) {
    console.error('Chat error:', err.message)
    res.status(500).json({ error: 'Gemini error', details: err.message })
  }
})
module.exports=router