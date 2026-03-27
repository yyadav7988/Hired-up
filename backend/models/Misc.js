const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  platform: { type: String, required: true },
  credentialId: String,
  credentialUrl: String,
  filePath: String,
  trustScore: { type: Number, min: 0, max: 100 },
  status: { type: String, enum: ['PENDING', 'VERIFIED', 'FAILED', 'UNVERIFIABLE'], default: 'PENDING' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
});

const credibilityScoreSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  totalScore: { type: Number, required: true },
  breakdown: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now }
});

credibilityScoreSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });

const refreshTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  Certificate: mongoose.model('Certificate', certificateSchema),
  CredibilityScore: mongoose.model('CredibilityScore', credibilityScoreSchema),
  RefreshToken: mongoose.model('RefreshToken', refreshTokenSchema)
};
