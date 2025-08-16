const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ----------------- EXISTING ROUTES -----------------
const chatRoutes = require('./routes/chat');
app.use('/api/chat', chatRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const adminRoutes = require('./routes/admin'); 
app.use('/api/admin', adminRoutes);

// ----------------- WELCOME -----------------
app.get("/welcome", (req,res) => {
    res.send("welcome");
});


// ----------------- DATABASE & SERVER -----------------
mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser:true, useUnifiedTopology:true })
.then(() => app.listen(process.env.PORT, ()=>console.log(`✅ Server running on port ${process.env.PORT}`)))
.catch(err => console.log('❌ MongoDB connection error:', err));
