const express = require("express");
const router = express.Router();
const db = require("../db");


// Get all sent emails
router.get("/", (req, res) => {
  const query = "SELECT * FROM email_logs ORDER BY sent_at DESC";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Email logs fetch error:", err);
      return res.status(500).send("Error fetching email logs");
    }
    res.json(results);
  });
});

module.exports = router;
