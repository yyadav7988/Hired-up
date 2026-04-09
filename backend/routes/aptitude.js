const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'aptitude route is working' });
});

module.exports = router;
