const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  event: { type: String, required: true },
  students: {
    student1: {
      name: { type: String, required: true },
      urn: { type: String, required: true, unique: true },
      idCard: { type: String },
    },
    student2: {
      name: { type: String },
      urn: { type: String, unique: false }, // Can be in multiple events
      idCard: { type: String },
    },
  },
});

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
