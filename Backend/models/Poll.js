const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 },
  voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const pollSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: {
    type: String,
    enum: ['Politics', 'Technology', 'Sports', 'Entertainment', 'Education', 'Other'],
    default: 'Other'
  },
  options: [optionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'closed', 'draft'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  totalVotes: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

pollSchema.methods.getTotalVotes = function () {
  return this.options.reduce((sum, opt) => sum + opt.votes, 0);
};

module.exports = mongoose.model('Poll', pollSchema);