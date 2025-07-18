const express = require("express");
const router = express.Router();
const db = require("../db");
const transporter = require("../mailer");

// Application Form Submission
router.post("/apply-form", (req, res) => {
  const { fullName, phone, whatsapp, applyAs, email, city } = req.body;

  // Insert application into DB
  const query = `
    INSERT INTO applications (full_name, phone, whatsapp, apply_as, email, city)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [fullName, phone, whatsapp, applyAs, email, city], (err) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).send("Database error");
    }

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: `${process.env.EMAIL_USER}, ${email}`,
      subject: "New Application Received",
      html: `
        <h3>New Application Submission</h3>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>WhatsApp:</strong> ${whatsapp}</p>
        <p><strong>Role Applied As:</strong> ${applyAs}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>City:</strong> ${city}</p>
      `
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email Error:", error);
        return res.status(500).send("Form saved but email failed");
      }

      console.log("Email sent:", info.response);

      // Log sent email to database
      const logQuery = `
        INSERT INTO email_logs (to_email, subject, message)
        VALUES (?, ?, ?)
      `;

      db.query(
        logQuery,
        [process.env.EMAIL_USER, mailOptions.subject, mailOptions.html],
        (logErr) => {
          if (logErr) console.error("Failed to log email:", logErr);
        }
      );

      return res.send("Application submitted and email sent!");
    });
  });
});

// API route to get admin emails
router.get("/admin/emails", (req, res) => {
  db.query(
    `SELECT * FROM email_logs ORDER BY sent_at DESC`,
    (err, results) => {
      if (err) {
        console.error("Failed to fetch email logs:", err);
        return res.status(500).send("Error fetching emails");
      }
      res.json(results);
    }
  );
});

module.exports = router;
