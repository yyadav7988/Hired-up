const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const { analyzeCode } = require('../services/aiService');
const { authenticate } = require('../middleware/auth');

// Apply auth to all submission routes
router.use(authenticate);

// POST /api/submissions - Save a new submission
router.post('/', async (req, res) => {
    try {
        const { problemId, code, language, status, output, executionTime } = req.body;
        const userId = req.user.id; // Use authenticated user ID

        if (!problemId || !code || !status) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newSubmission = new Submission({
            userId,
            problemId,
            code,
            language,
            status,
            output,
            executionTime
        });

        // Perform AI Analysis for coding questions
        try {
            const problem = await Problem.findById(problemId);
            if (problem) {
                const aiFeedback = await analyzeCode(code, problem.description, language);
                newSubmission.aiFeedback = aiFeedback;
            }
        } catch (aiErr) {
            console.error('AI Analysis skip:', aiErr.message);
        }

        const savedSubmission = await newSubmission.save();
        res.status(201).json(savedSubmission);
    } catch (err) {
        console.error('Error saving submission:', err);
        res.status(500).json({ error: 'Failed to save submission' });
    }
});

// GET /api/submissions - Fetch all submissions (for AI Analysis)
router.get('/', async (req, res) => {
    if (req.isOffline) {
        return res.json([
            { _id: 's1', problemId: '1', code: 'console.log("hello")', status: 'Accepted', createdAt: new Date() },
            { _id: 's2', problemId: '2', code: 'return s.reverse()', status: 'Accepted', createdAt: new Date() }
        ]);
    }
    try {
        const userId = req.user.id;
        const submissions = await Submission.find({ userId }).sort({ createdAt: -1 }).limit(10);
        res.json(submissions);
    } catch (err) {
        console.error('Error fetching submissions:', err);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

module.exports = router;
