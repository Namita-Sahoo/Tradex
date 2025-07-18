const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const transporter = require("../mailer");
const bcrypt = require("bcryptjs");

// In-memory OTP store
const otpStore = {};  // { email: { otp: '123456', expiresAt: timestamp } }

// Multer config for photo upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage: storage });


//----------------------------------- Register Admin
router.post("/register", upload.single("photo"), (req, res) => {
  const { username, password, email } = req.body;
  const photoPath = req.file ? "/uploads/" + req.file.filename : null;

  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = "INSERT INTO admin (username, password, email, photo) VALUES (?, ?, ?, ?)";
  db.query(sql, [username, hashedPassword, email, photoPath], (err, result) => {
    if (err) {
      console.error("Registration error:", err);
      return res.status(500).json({ message: "Registration failed" });
    }
    res.json({ message: "Admin registered successfully" });
  });
});

//--------------------------- Admin Login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log("Login attempt:", username, password);

  db.query("SELECT * FROM admin WHERE username = ?", [username], (err, results) => {
  if (err) {
    console.error("Login DB error:", err);
    return res.status(500).json({ message: "Database error during login" });
  }

  if (results.length === 0) {
    console.warn(`No admin found with username: '${username}'`);
    return res.status(404).json({ message: "Admin not found" });
  }

  const validPass = bcrypt.compareSync(password, results[0].password);
  if (!validPass) {
    console.warn(`Incorrect password for user: '${username}'`);
    return res.status(401).json({ message: "Incorrect password" });
  }

  req.session.admin = {
    id: results[0].id,
    username: results[0].username,
    email: results[0].email,
    photo: results[0].photo
  };

  res.json({
    message: "Login successful",
    adminId: results[0].id,
    admin: req.session.admin
  });
});

});


//-------------------------------------- Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin");
  });
});

//-------------------------------------- Fetch all admins
router.get("/all", (req, res) => {
  const sql = "SELECT id, username, email, photo FROM admin";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching admin data:", err);
      return res.status(500).json({ message: "Failed to fetch admin data" });
    }
    res.json({ admins: results });
  });
});

//-------------------------------------- Check Session
router.get("/session", (req, res) => {
  if (req.session.admin) {
    res.json({ admin: req.session.admin });
  } else {
    res.status(401).json({ message: "Not logged in" });
  }
});


// -------------------------------------- 📩 Send OTP to Admin Email
router.post("/send-otp", (req, res) => {
  const { email } = req.body;

  db.query("SELECT * FROM admin WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0)
      return res.status(404).json({ message: "Admin email not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity

    otpStore[email] = { otp, expiresAt };

    const mailOptions = {
      from: `"Tradexx Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for Password Reset",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error)
        return res.status(500).json({ message: "Failed to send OTP email", error });

      res.json({ message: "OTP sent successfully to admin email." });
    });
  });
});

// -------------------------------------- 🔐 Reset Password with OTP
router.post("/reset-password", (req, res) => {
  const { email, otp, newPassword } = req.body;

  const record = otpStore[email];
  if (!record || record.otp !== otp || record.expiresAt < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  db.query(
    "UPDATE admin SET password = ? WHERE email = ?",
    [hashedPassword, email],
    (err) => {
      if (err)
        return res.status(500).json({ message: "Failed to update password", err });

      delete otpStore[email]; // Clear used OTP

      res.json({ message: "Admin password reset successfully!" });
    }
  );
});


module.exports = router;
