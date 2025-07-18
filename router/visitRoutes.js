const express = require("express");
const router = express.Router();
const db = require("../db");

// Total visits (client only)
router.get("/total-visits", (req, res) => {
  db.query("SELECT COUNT(*) AS total FROM visit_logs WHERE page NOT LIKE '/admin%'", (err, results) => {
    if (err) return res.status(500).send("Error");
    res.json(results[0]);
  });
});

// Unique visitors (client only)
router.get("/unique-visitors", (req, res) => {
  db.query("SELECT COUNT(DISTINCT ip_address) AS unique_visitors FROM visit_logs WHERE page NOT LIKE '/admin%'", (err, results) => {
    if (err) return res.status(500).send("Error");
    res.json(results[0]);
  });
});

// Top visited pages (client only)
router.get("/top-pages", (req, res) => {
  db.query(`
    SELECT page, COUNT(*) AS visits 
    FROM visit_logs 
    WHERE page NOT LIKE '/admin%'
    GROUP BY page 
    ORDER BY visits DESC 
    LIMIT 5
  `, (err, results) => {
    if (err) return res.status(500).send("Error");
    res.json(results);
  });
});

// Visits by date (last 7 days, client only)
router.get("/visits-by-date", (req, res) => {
  db.query(`
    SELECT DATE(visit_time) AS date, COUNT(*) AS visits 
    FROM visit_logs 
    WHERE visit_time > NOW() - INTERVAL 7 DAY
      AND page NOT LIKE '/admin%'
    GROUP BY DATE(visit_time)
    ORDER BY date DESC
  `, (err, results) => {
    if (err) return res.status(500).send("Error");
    res.json(results);
  });
});

// Visits by Month (last 6 months, client only)
router.get("/visits-by-month", (req, res) => {
  db.query(`
    SELECT DATE_FORMAT(visit_time, '%Y-%m') AS month, COUNT(*) AS visits
    FROM visit_logs
    WHERE visit_time >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      AND page NOT LIKE '/admin%'
    GROUP BY month
    ORDER BY month ASC
  `, (err, results) => {
    if (err) return res.status(500).send("Error");
    res.json(results);
  });
});

// Recent visit logs (includes admin — for internal review)
router.get("/visit-logs", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  db.query(`SELECT COUNT(*) AS total FROM visit_logs`, (countErr, countResults) => {
    if (countErr) return res.status(500).send("Error getting count");

    const totalRecords = countResults[0].total;
    const totalPages = Math.ceil(totalRecords / limit);

    db.query(`
      SELECT 
        id,
        ip_address, 
        page, 
        user_agent, 
        country, 
        city, 
        visit_time AS created_at 
      FROM visit_logs 
      ORDER BY visit_time DESC 
      LIMIT ? OFFSET ?
    `, [limit, offset], (err, results) => {
      if (err) return res.status(500).send("Error");

      res.json({
        currentPage: page,
        totalPages: totalPages,
        totalRecords: totalRecords,
        data: results
      });
    });
  });
});

// Total Sessions (client only)
router.get("/total-sessions", (req, res) => {
  db.query(
    `SELECT COUNT(DISTINCT session_id) AS total_sessions FROM visit_logs WHERE page NOT LIKE '/admin%'`,
    (err, results) => {
      if (err) return res.status(500).send("Error");
      res.json(results[0]);
    }
  );
});

// Avg Pages Per Session (client only)
router.get("/avg-pages-per-session", (req, res) => {
  db.query(
    `SELECT AVG(page_count) as avg_pages 
     FROM (
       SELECT COUNT(*) as page_count
       FROM visit_logs
       WHERE page NOT LIKE '/admin%'
       GROUP BY session_id
     ) as session_counts`,
    (err, results) => {
      if (err) return res.status(500).send("Error");
      res.json(results[0]);
    }
  );
});

// Top Browsers (client only)
router.get("/top-browsers", (req, res) => {
  db.query(
    `SELECT browser, COUNT(*) AS count 
     FROM visit_logs 
     WHERE page NOT LIKE '/admin%'
     GROUP BY browser 
     ORDER BY count DESC 
     LIMIT 5`,
    (err, results) => {
      if (err) return res.status(500).send("Error");
      res.json(results);
    }
  );
});

// Top Operating Systems (client only)
router.get("/top-os", (req, res) => {
  db.query(
    `SELECT os, COUNT(*) AS count 
     FROM visit_logs 
     WHERE page NOT LIKE '/admin%'
     GROUP BY os 
     ORDER BY count DESC 
     LIMIT 5`,
    (err, results) => {
      if (err) return res.status(500).send("Error");
      res.json(results);
    }
  );
});

module.exports = router;
