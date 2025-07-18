// const express = require("express");
// const bodyParser = require("body-parser");
// const path = require("path");
// const session = require("express-session");

// require("dotenv").config();

// const app = express(); 

// const formRoute = require("./router/submitRoutes");
// const adminAuth = require("./router/adminAuth");

// const analyticsRoutes = require("./router/visitRoutes");
// const visitLogger = require("./middleware/visitLogger");
// const blogRoutes =require("./router/blogRoutes");
// const adminRoutes = require("./router/adminRoutes");
// const adminEmailsRoutes = require("./router/adminEmails");


// // Middleware
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false } //true if https
// }));


// app.use(express.static(path.join(__dirname, "public")));
// app.use("/uploads", express.static("public/uploads"));

// app.use(visitLogger);
// //admin auth
// app.use("/admin", adminAuth);
// //admin -> analytics -> dashboard
// app.use("/admin/analytics",analyticsRoutes); 
// //api for blogs
// app.use("/api/blogs", blogRoutes);
// //api for admin
// app.use("/api/admin", adminRoutes);

// app.use("/api/emails", adminEmailsRoutes);


// // Serve HTML files 
// app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
// app.get("/about", (req, res) => res.sendFile(path.join(__dirname, "about.html")));
// app.get("/service", (req, res) => res.sendFile(path.join(__dirname, "service.html")));
// app.get("/service-details", (req, res) => res.sendFile(path.join(__dirname, "service-details.html")));
// app.get("/blog", (req, res) => res.sendFile(path.join(__dirname, "blog.html")));
// app.get("/contact", (req, res) => res.sendFile(path.join(__dirname, "contact.html")));
// app.get("/form", (req, res) => res.sendFile(path.join(__dirname, "form.html")));
// app.get("/tradex", (req, res) => res.sendFile(path.join(__dirname, "tradex.html")));
// app.get("/growth", (req, res) => res.sendFile(path.join(__dirname, "growth.html")));
// app.get("/enterprise", (req, res) => res.sendFile(path.join(__dirname, "enterprise.html")));



// app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "admin_login.html")));

// app.get("/dashboard", (req, res) => {
//   if (req.session && req.session.admin) {
//     res.sendFile(path.join(__dirname, "admindashboard.html"));
//   } else {
//     res.redirect("/admin");
//   }
// });


// // Form routes
// app.use("/", formRoute);


// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();

const app = express(); 

// Import routes
const formRoute = require("./router/submitRoutes");
const adminAuth = require("./router/adminAuth");
const analyticsRoutes = require("./router/visitRoutes");
const visitLogger = require("./middleware/visitLogger");
const blogRoutes = require("./router/blogRoutes");
const adminRoutes = require("./router/adminRoutes");
const adminEmailsRoutes = require("./router/adminEmails");

// CORS configuration
const corsOptions = {
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, sameSite: 'lax' }
}));

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("public/uploads"));

// Apply visit logger to all /api routes
app.use('/api', visitLogger);

// Authentication check endpoint for frontend
app.get("/api/auth/check", (req, res) => {
  if (req.session && req.session.admin) {
    res.json({ authenticated: true, admin: req.session.admin });
  } else {
    res.json({ authenticated: false });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date().toISOString() });
});

// Mount routes with proper base paths
app.use("/api/admin/auth", adminAuth);        // Changed from "/admin" to "/api/admin/auth"
app.use("/api/admin/analytics", analyticsRoutes);  // Changed from "/admin/analytics"
app.use("/api/blogs", blogRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/emails", adminEmailsRoutes);
app.use("/api/form", formRoute);             // Changed from "/form"

// Catch-all route for undefined API endpoints (must be last)
// app.use("/api/*", (req, res) => {
//   res.status(404).json({ error: "API endpoint not found" });
// });

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;