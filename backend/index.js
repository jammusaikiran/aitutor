const express=require('express')
const mongoose=require('mongoose')
const dotenv=require('dotenv')
const cors=require('cors')

dotenv.config()
const app=express()

app.use(cors())
app.use(express.json())

const chatRoutes=require('./routes/chat')
app.use('/api/chat',chatRoutes)


app.get("/welcome",(req,res)=>{
    res.send("welcome")
})

const authRoutes=require('./routes/authRoutes')
app.use('/api/auth',authRoutes)

const adminRoutes=require('./routes/admin') 
app.use('/api/admin', adminRoutes) 

mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser:true, useUnifiedTopology:true })
.then(()=>app.listen(process.env.PORT,()=>console.log(`✅ Server running on port ${process.env.PORT}`)))
.catch(err=>console.log('❌ MongoDB connection error:', err))
