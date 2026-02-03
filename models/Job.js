const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  requirements: { type: String, trim: true },
  location: { type: String, trim: true },
  jobType: { type: String, trim: true, default: 'Full-time' }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
