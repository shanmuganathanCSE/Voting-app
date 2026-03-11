const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const { protect } = require('../Middleware/Auth');

// @GET /api/polls - Get all active public polls
router.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = { isPublic: true };
    if (category) query.category = category;
    if (status) query.status = status;
    else query.status = 'active';
    if (search) query.title = { $regex: search, $options: 'i' };

    const polls = await Poll.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(polls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/polls/:id
router.get('/:id', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate('createdBy', 'name email');
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    res.json(poll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/polls - Create poll (authenticated)
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, options, endDate, isPublic } = req.body;
    if (!options || options.length < 2)
      return res.status(400).json({ message: 'At least 2 options required' });

    const poll = await Poll.create({
      title, description, category,
      options: options.map(opt => ({ text: opt })),
      createdBy: req.user._id,
      endDate,
      isPublic: isPublic !== false
    });

    res.status(201).json(poll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/polls/:id/vote
router.post('/:id/vote', protect, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    if (poll.status !== 'active') return res.status(400).json({ message: 'Poll is not active' });
    if (new Date() > poll.endDate) return res.status(400).json({ message: 'Poll has ended' });

    // Check if user already voted
    const alreadyVoted = poll.options.some(opt =>
      opt.voters.includes(req.user._id)
    );
    if (alreadyVoted) return res.status(400).json({ message: 'You have already voted on this poll' });

    if (optionIndex < 0 || optionIndex >= poll.options.length)
      return res.status(400).json({ message: 'Invalid option' });

    poll.options[optionIndex].votes += 1;
    poll.options[optionIndex].voters.push(req.user._id);
    poll.totalVotes += 1;
    await poll.save();

    res.json({ message: 'Vote cast successfully', poll });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/polls/user/mypols - Get user's polls
router.get('/user/mypolls', protect, async (req, res) => {
  try {
    const polls = await Poll.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(polls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;