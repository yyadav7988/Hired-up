const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  title: { type: String, required: true },
  description: String,
  skillsRequired: [String],
  status: { type: String, enum: ['ACTIVE', 'CLOSED', 'DRAFT'], default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
