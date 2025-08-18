const User=require('../models/User')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body; // ✅ include role
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).send('User already exists');

    const hashed = await bcrypt.hash(password, 10);

    // ✅ save role from request
    const user = new User({ name, email, password: hashed, role });
    console.log(user.role);
    await user.save();

    res.status(201).send('User registered');
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(400).send('Error registering user');
  }
};



exports.login = async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) return res.status(401).send('Invalid email')

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).send('Invalid password')
    
    user.lastActive = new Date();
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email, // ✅ included now
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.json({
      token,
      role: user.role,
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (err) {
    console.error('Login error:', err.message)
    res.status(500).send('Login error')
  }
}
