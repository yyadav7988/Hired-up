const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'codeExec route is working' });
});

module.exports = router;
