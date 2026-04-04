const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const certificateSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  candidate_id: { type: String, required: true, ref: 'User' },
  platform: { type: String, default: 'unknown' },
  file_path: { type: String },
  credential_url: { type: String },
  trust_score: { type: Number, default: 0 },
  status: { type: String, default: 'PENDING' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

certificateSchema.virtual('id').get(function() { return this._id; });

module.exports = mongoose.model('Certificate', certificateSchema);
