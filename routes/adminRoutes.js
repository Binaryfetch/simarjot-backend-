const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    req.session.admin = true;
    req.session.allowSignup = false;
    return res.json({ success: true, redirect: "/admin-dashboard" });
  }
  res.status(401).json({ error: "Invalid Admin Credentials" });
});

router.get("/dashboard", async (req, res) => {
  if (!req.session.admin) return res.status(403).json({ error: "Unauthorized" });

  try {
    const students = await Student.find();
    const eventsData = students.reduce((acc, student) => {
      student.events.forEach((event) => {
        acc[event] = acc[event] || [];
        if (student.student1?.urn) acc[event].push(student.student1);
      });
      return acc;
    }, {});

    res.json({ allowSignup: req.session.allowSignup, eventsData });
  } catch (error) {
    console.error("❌ Error Fetching Data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/toggle-signup", (req, res) => {
  if (!req.session.admin) return res.status(403).json({ error: "Unauthorized" });
  req.session.allowSignup = !req.session.allowSignup;
  res.json({ success: true, allowSignup: req.session.allowSignup });
});

module.exports = router;
