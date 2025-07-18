const db = require("../db");
const geoip = require("geoip-lite");
const { v4: uuidv4 } = require("uuid");
const useragent = require("useragent");

function visitLogger(req, res, next) {
  const page = req.originalUrl;

  // Exclude unwanted paths and assets
  const ignoredPaths = [
    "/favicon.ico",
    "/robots.txt"
  ];

  const ignoredPrefixes = [
    "/.well-known/",
    "/assets/",
    "/static/",
    "/uploads/",
    "/admin",          
    "/api" ,
    "/dashboard"
  ];

  const ignoredExtensions = [
    ".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg",
    ".ico", ".webp", ".woff", ".woff2", ".ttf", ".eot", ".mp4",
    ".json", ".map"
  ];

  // Check if path matches any ignored pattern
  const isIgnored =
    ignoredPaths.includes(page) ||
    ignoredPrefixes.some(prefix => page.startsWith(prefix)) ||
    ignoredExtensions.some(ext => page.toLowerCase().endsWith(ext));

  if (isIgnored) {
    return next(); // skip logging
  }

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const normalizedIP = ip === "::1" || ip === "127.0.0.1" ? "localhost" : ip;
  const userAgentString = req.get("User-Agent") || "Unknown";

  let country = "Unknown";
  let city = "Unknown";

  if (normalizedIP !== "localhost") {
    const geo = geoip.lookup(normalizedIP);
    country = geo?.country || "Unknown";
    city = geo?.city || "Unknown";
  } else {
    country = "Localhost";
    city = "Localhost";
  }

  const agent = useragent.parse(userAgentString);
  const browser = agent.toAgent();
  const os = agent.os.toString();
  const deviceType = /mobile/i.test(userAgentString)
    ? "Mobile"
    : /tablet/i.test(userAgentString)
    ? "Tablet"
    : "Desktop";

  let sessionId = null;
  const cookies = req.headers.cookie?.split("; ").reduce((acc, cookie) => {
    const [key, value] = cookie.split("=");
    acc[key] = value;
    return acc;
  }, {}) || {};

  if (cookies.anon_session_id) {
    sessionId = cookies.anon_session_id;
  } else {
    sessionId = uuidv4();
    res.setHeader("Set-Cookie", `anon_session_id=${sessionId}; Path=/; Max-Age=1800`);
  }

  const query = `
    INSERT INTO visit_logs (ip_address, page, user_agent, country, city, session_id, browser, os, device_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [ip, page, userAgentString, country, city, sessionId, browser, os, deviceType], (err) => {
    if (err) console.error("Visit log error:", err);
  });

  next();
}

module.exports = visitLogger;
