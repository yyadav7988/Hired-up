
const express = require('express');
const router = express.Router();

router.post('/run', (req, res) => {
  res.json({ output: "Code execution placeholder" });
});

module.exports = router;
