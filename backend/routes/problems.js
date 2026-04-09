const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json([
    { id: 1, title: "Two Sum", difficulty: "Easy" },
    { id: 2, title: "Reverse Linked List", difficulty: "Medium" }
  ]);
});

module.exports = router;
