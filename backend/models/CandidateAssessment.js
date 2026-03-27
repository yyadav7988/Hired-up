const mongoose = require('mongoose');

const candidateAssessmentSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  startedAt: { type: Date, default: Date.now },
  completedAt: Date,
  status: { type: String, enum: ['IN_PROGRESS', 'COMPLETED', 'ABANDONED'], default: 'IN_PROGRESS' },
  rawScore: Number,
  weightedScore: Number
});

candidateAssessmentSchema.index({ candidateId: 1, assessmentId: 1, jobId: 1 }, { unique: true });

const answerSchema = new mongoose.Schema({
  candidateAssessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'CandidateAssessment', required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  response: mongoose.Schema.Types.Mixed,
  isCorrect: Boolean,
  pointsEarned: Number,
  timeSpentSeconds: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  CandidateAssessment: mongoose.model('CandidateAssessment', candidateAssessmentSchema),
  Answer: mongoose.model('Answer', answerSchema)
};
