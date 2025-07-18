// const express = require("express");
// const router = express.Router();
// const db = require("../db");

// //  Get all admins
// router.get("/", (req, res) => {
//   db.query("SELECT id, username, email, photo FROM admin", (err, result) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(result);
//   });
// });

// // Get admin profile by ID (MUST be before `/:id`)
// router.get("/profile/:id", (req, res) => {
//   const { id } = req.params;
//    console.log("Profile request for ID:", id);
//   db.query("SELECT id, username, email, photo FROM admin WHERE id = ?", [id], (err, result) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (result.length === 0) return res.status(404).json({ message: "Admin not found" });
//     res.json(result[0]);
//   });
// });

// // Get single admin by ID
// router.get("/:id", (req, res) => {
//   const { id } = req.params;
//   db.query("SELECT id, username, email, photo FROM admin WHERE id = ?", [id], (err, result) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (result.length === 0) return res.status(404).json({ message: "Admin not found" });
//     res.json(result[0]);
//   });
// });

// // Update admin (username, password, email, photo)
// router.put("/:id", (req, res) => {
//   const { id } = req.params;
//   const { username, password, email, photo } = req.body;

//   const query = "UPDATE admin SET username = ?, password = ?, email = ?, photo = ? WHERE id = ?";
//   db.query(query, [username, password, email, photo, id], (err, result) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (result.affectedRows === 0) return res.status(404).json({ message: "Admin not found" });
//     res.json({ message: "Admin updated successfully!" });
//   });
// });

// // Delete admin
// router.delete("/:id", (req, res) => {
//   const { id } = req.params;
//   db.query("DELETE FROM admin WHERE id = ?", [id], (err, result) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (result.affectedRows === 0) return res.status(404).json({ message: "Admin not found" });
//     res.json({ message: "Admin deleted successfully!" });
//   });
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all admins
router.get("/", (req, res) => {
  db.query("SELECT id, username, email, photo FROM admin", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// Get admin profile by ID (MUST be before the generic /:id route)
router.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  console.log("Profile request for ID:", id);
  db.query("SELECT id, username, email, photo FROM admin WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: "Admin not found" });
    res.json(result[0]);
  });
});

// Update admin (username, password, email, photo)
router.put("/update_admin_details/:id", (req, res) => {
  const { id } = req.params;
  const { username, password, email, photo } = req.body;

  const query = "UPDATE admin SET username = ?, password = ?, email = ?, photo = ? WHERE id = ?";
  db.query(query, [username, password, email, photo, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Admin not found" });
    res.json({ message: "Admin updated successfully!" });
  });
});

// Delete admin
router.delete("/delete_admin/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM admin WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Admin not found" });
    res.json({ message: "Admin deleted successfully!" });
  });
});

// Get single admin by ID (this should be last among GET routes)
router.get("/get_admin_by_id/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT id, username, email, photo FROM admin WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: "Admin not found" });
    res.json(result[0]);
  });
});

module.exports = router;