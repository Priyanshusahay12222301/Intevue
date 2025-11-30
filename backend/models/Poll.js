const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true
  }],
  timeLimit: {
    type: Number,
    default: 60 // seconds
  },
  createdBy: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  results: {
    type: Map,
    of: Number,
    default: {}
  },
  totalAnswers: {
    type: Number,
    default: 0
  },
  endedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Poll', pollSchema);