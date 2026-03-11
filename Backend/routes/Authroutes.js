const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'votingsystem_super_secret_key_2024';
const generateToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });

// @POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // --- Input validation ---
    if (!name || !name.trim())
      return res.status(400).json({ message: 'Name is required' });

    if (name.trim().length < 2)
      return res.status(400).json({ message: 'Name must be at least 2 characters' });

    if (!email || !email.trim())
      return res.status(400).json({ message: 'Email is required' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim()))
      return res.status(400).json({ message: 'Please enter a valid email address' });

    if (!password)
      return res.status(400).json({ message: 'Password is required' });

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const allowedRoles = ['voter', 'admin'];
    const userRole = allowedRoles.includes(role) ? role : 'voter';

    // --- Check duplicate ---
    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists)
      return res.status(400).json({ message: 'This email is already registered. Please sign in instead.' });

    // --- Create user ---
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: userRole,
    });

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (err) {
    // Handle mongoose duplicate key error (race condition)
    if (err.code === 11000)
      return res.status(400).json({ message: 'This email is already registered.' });

    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// @POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = generateToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// @GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({
    user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role }
  });
});

module.exports = router;