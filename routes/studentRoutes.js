const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const Student = require("../models/Student");

const router = express.Router();

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "student_images",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});
const upload = multer({ storage });

const uploadFields = upload.fields([
  { name: "student1Image", maxCount: 1 },
  { name: "student2Image", maxCount: 1 },
]);

router.post("/register", uploadFields, async (req, res) => {
  try {
    if (!req.session.username) {
      return res.status(401).json({ error: "Unauthorized! Please login first." });
    }

    console.log("Received body:", req.body);
    console.log("Received files:", req.files);

    let { events, student1Name, student1URN, student2Name, student2URN } = req.body;

    // Fix: Extract the first event if `events` is an array
    const event = Array.isArray(events) ? events[0] : events;

    // Validate required fields
    if (!event || !student1Name || !student1URN) {
      return res.status(400).json({ error: "Event, Student 1 Name, and URN are required!" });
    }

    // Check if student1 is already registered
    const existingStudent = await Student.findOne({ "students.student1.urn": student1URN });
    if (existingStudent) {
      return res.status(400).json({ error: "Student with this URN is already registered." });
    }

    // Handle uploaded images safely
    const student1ImageUrl = req.files["student1Image"] ? req.files["student1Image"][0].path : null;
    const student2ImageUrl = req.files["student2Image"] ? req.files["student2Image"][0].path : null;

    const newStudent = new Student({
      event,
      students: {
        student1: { name: student1Name, urn: student1URN, idCard: student1ImageUrl },
        student2: student2URN ? { name: student2Name, urn: student2URN, idCard: student2ImageUrl } : undefined,
      },
    });

    await newStudent.save();
    res.json({ success: true, message: "Student registered successfully!" });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ error: "Internal Server Error!" });
  }
});

module.exports = router;
