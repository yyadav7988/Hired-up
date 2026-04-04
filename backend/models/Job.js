const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const jobSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  recruiter_id: {
    type: String,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: ''
  },
  skills_required: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    default: 'ACTIVE'
  },
  location: {
    type: String,
    default: ''
  },
  salary_range: {
    type: String,
    default: ''
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

jobSchema.virtual('id').get(function() { return this._id; });

module.exports = mongoose.model('Job', jobSchema);
