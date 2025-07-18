const express = require("express");
const router = express.Router();
const db = require("../db");

const multer = require("multer");
const path = require("path");

// Multer config
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  }
});

const upload = multer({ storage: storage });


// Get all blogs
router.get("/", (req, res) => {
  db.query("SELECT * FROM blogs ORDER BY date DESC", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// Get a single blog by ID
router.get("/get_by_id/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM blogs WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: "Blog not found" });
    res.json(result[0]);
  });
});

//add new blog
router.post("/", upload.single("image"), (req, res) => {
  const { title, description, author } = req.body;
  const image = req.file ? "/uploads/" + req.file.filename : null;
  const date = new Date().toISOString().split('T')[0]; // current date in YYYY-MM-DD

  if (!title || !description || !author || !image) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = "INSERT INTO blogs (title, description, image, author, date) VALUES (?, ?, ?, ?, ?)";
  db.query(query, [title, description, image, author, date], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: "Blog added successfully!", blogId: result.insertId });

  });
});


// Update a blog
router.put("/update_by_id/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, image, author } = req.body;
  const query = "UPDATE blogs SET title = ?, description = ?, image = ?, author = ? WHERE id = ?";
  db.query(query, [title, description, image, author, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Blog not found" });
    res.json({ message: "Blog updated successfully!" });
  });
});

// Delete a blog
router.delete("/delete_by_id/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM blogs WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Blog not found" });
    res.json({ message: "Blog deleted successfully!" });
  });
});

module.exports = router;
