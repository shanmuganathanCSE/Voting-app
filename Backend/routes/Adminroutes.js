const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const User = require('../models/User');
const { protect, adminOnly } = require('../Middleware/Auth');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// @GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPolls = await Poll.countDocuments();
    const activePolls = await Poll.countDocuments({ status: 'active' });
    const totalVotesResult = await Poll.aggregate([
      { $group: { _id: null, total: { $sum: '$totalVotes' } } }
    ]);
    const totalVotes = totalVotesResult[0]?.total || 0;

    res.json({ totalUsers, totalPolls, activePolls, totalVotes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/admin/polls
router.get('/polls', async (req, res) => {
  try {
    const polls = await Poll.find().populate('createdBy', 'name email').sort({ createdAt: -1 });
    res.json(polls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/admin/polls/:id/status
router.put('/polls/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const poll = await Poll.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    res.json(poll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @DELETE /api/admin/polls/:id
router.delete('/polls/:id', async (req, res) => {
  try {
    await Poll.findByIdAndDelete(req.params.id);
    res.json({ message: 'Poll deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;