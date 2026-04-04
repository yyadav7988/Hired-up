const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Job = require('../models/Job');
const Assessment = require('../models/Assessment');
const { authenticate, recruiterOnly } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /jobs - List all active jobs (public for dashboard display)
 */
router.get('/', async (req, res) => {
  try {
    // If a token is present, show only recruiter's jobs; otherwise show all active jobs
    const token = req.headers.authorization?.split(' ')[1];
    let query = {};
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-in-production');
        query = { recruiter_id: decoded.userId };
      } catch (_) { /* invalid token - show all */ }
    }
    const jobs = await Job.find(query).sort({ created_at: -1 });
    res.json(jobs.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      skills_required: job.skills_required,
      techStack: job.skills_required,       // alias for frontend
      status: job.status,
      created_at: job.created_at,
      createdAt: job.created_at
    })));
  } catch (err) {
    console.error('Jobs list error:', err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

/**
 * POST /jobs - Create job (requires recruiter auth)
 */
router.post('/', authenticate, recruiterOnly, async (req, res) => {
  try {
    const { title, description, skillsRequired, techStack, location, salaryRange, challenges, requirements } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const id = uuidv4();
    // Accept either skillsRequired or techStack from the frontend
    const skills = Array.isArray(skillsRequired) ? skillsRequired
                 : Array.isArray(techStack)       ? techStack
                 : [];

    const newJob = new Job({
      _id: id,
      recruiter_id: req.user.id,
      title,
      description: description || '',
      skills_required: skills,
      location: location || '',
      salary_range: salaryRange || '',
    });
    
    await newJob.save();

    res.status(201).json({
      id,
      title,
      description: description || '',
      skillsRequired: skills,
      techStack: skills,
      status: 'ACTIVE',
    });
  } catch (err) {
    console.error('Job create error:', err);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

/**
 * GET /jobs/:id - Get job with assessments (requires auth)
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, recruiter_id: req.user.id });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const assessments = await Assessment.find({ job_id: req.params.id }).sort({ created_at: 1 });

    res.json({
      id: job.id,
      title: job.title,
      description: job.description,
      status: job.status,
      created_at: job.created_at,
      skills_required: job.skills_required,
      skillsRequired: job.skills_required || [],
      assessments: assessments.map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        config: a.config
      }))
    });
  } catch (err) {
    console.error('Job get error:', err);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

/**
 * GET /skillgap/:jobId - Analyze skill gap for a specific job
 */
router.get('/skillgap/:jobId', async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const job = await Job.findOne({ _id: jobId });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Skills can be passed as query param ?skills=react,node
    const userSkillsRaw = req.query.skills || '';
    const userSkills = userSkillsRaw.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
    const requiredSkills = (job.skills_required || []).map(s => s.trim());

    const matched_skills = [];
    const missing_skills = [];
    const partial_matches = [];

    requiredSkills.forEach(reqSkill => {
      const rsLow = reqSkill.toLowerCase();
      
      // Exact match
      if (userSkills.includes(rsLow)) {
        matched_skills.push(reqSkill);
      } else {
        // Advanced partial match: check for substring overlaps
        const partial = userSkills.find(us => us.includes(rsLow) || rsLow.includes(us));
        if (partial) {
          partial_matches.push(reqSkill);
        } else {
          missing_skills.push(reqSkill);
        }
      }
    });

    res.json({
      jobId: job._id,
      jobTitle: job.title,
      matched_skills,
      partial_matches,
      missing_skills,
      match_percentage: Math.round(((matched_skills.length + partial_matches.length * 0.5) / Math.max(requiredSkills.length, 1)) * 100),
      analysis_timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Skill gap error:', err);
    res.status(500).json({ error: 'Failed to analyze skill gap' });
  }
});

/**
 * DELETE /jobs/:id (requires recruiter auth)
 */
router.delete('/:id', authenticate, recruiterOnly, async (req, res) => {
  try {
    const result = await Job.findOneAndDelete({ _id: req.params.id, recruiter_id: req.user.id });
    if (!result) return res.status(404).json({ error: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    console.error('Job delete error:', err);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

module.exports = router;
