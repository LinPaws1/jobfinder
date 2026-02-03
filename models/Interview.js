const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  jobSeeker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  preferredDate: { type: Date },
  preferredTime: { type: String, trim: true },
  message: { type: String, trim: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  confirmedDate: { type: Date },
  confirmedTime: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
