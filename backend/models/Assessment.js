const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['MCQ', 'CODING', 'MIXED'], required: true },
  config: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
});

const questionSchema = new mongoose.Schema({
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  type: { type: String, enum: ['MCQ_SINGLE', 'MCQ_MULTIPLE', 'CODING'], required: true },
  content: { type: String, required: true },
  options: mongoose.Schema.Types.Mixed,
  correctAnswer: mongoose.Schema.Types.Mixed,
  difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'MEDIUM' },
  points: { type: Number, default: 10 },
  orderIndex: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const testCaseSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  inputData: String,
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  Assessment: mongoose.model('Assessment', assessmentSchema),
  Question: mongoose.model('Question', questionSchema),
  TestCase: mongoose.model('TestCase', testCaseSchema)
};
