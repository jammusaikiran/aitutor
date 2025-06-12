const express=require('express')
const router=express.Router()
const User=require('../models/User')
const Chat=require('../models/Chat')
const mongoose = require('mongoose')


const auth=require('../middleware/auth')         // Auth middleware
const adminAuth=require('../middleware/adminAuth') // Admin role check

// Get all users (excluding admins)
router.get('/users', auth, adminAuth, async(req,res)=>{
  try {
    const users=await User.find({role:'user'}).select('-password')
    res.json(users)
  } catch (err) {
    res.status(500).json({error:'Server error'})
  }
})

// Delete a user and their chats
router.delete('/user/:id', auth, adminAuth, async(req,res)=>{
  try {
    await User.findByIdAndDelete(req.params.id)
    await Chat.deleteMany({userId:req.params.id})
    res.json({msg:'User and chats deleted'})
  } catch (err) {
    res.status(500).json({error:'Server error'})
  }
})

// Get chat history of a specific user
// Get chat history of a specific user
// routes/admin.js or similar

router.get('/chats/:userId', auth, adminAuth, async (req, res) => {
  try {
    const userIdParam = req.params.userId
    // console.log(typeof userIdParam);
    // console.log('Raw userId param:', userIdParam)

    const userId = new mongoose.Types.ObjectId(userIdParam)
    // console.log(typeof userId);
    const chat = await Chat.findOne({ userId })
    // console.log(chat)

    if (!chat || !chat.messages || chat.messages.length === 0) {
      console.log('No chat messages found')
      return res.json([])
    }

    const pairs = []
    const messages = chat.messages

    for (let i = 0; i < messages.length - 1; i++) {
      if (messages[i].sender === 'user' && messages[i + 1].sender === 'bot') {
        pairs.push({
          question: messages[i].text,
          answer: messages[i + 1].text
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






module.exports=router
