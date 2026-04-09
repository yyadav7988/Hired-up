const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json([
    { question: "2+2=?", options: [2, 3, 4], answer: 4 }
  ]);
});

module.exports = router;
