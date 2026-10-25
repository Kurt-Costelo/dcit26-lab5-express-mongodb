const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./models/Student');

// Load configuration
dotenv.config();

const app = express();

// Parse JSON request bodies
app.use(express.json());

// ---------------------------
// Database Connection
// ---------------------------
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    
    // Start listening only after the database connection succeeds
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
  });

// ---------------------------
// API Routes
// ---------------------------

// GET /api/health - Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Server is healthy and running' });
});

// GET /api/students - Return all student records
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Server error retrieving students' });
  }
});

// GET /api/students/:id - Return one record
app.get('/api/students/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Malformed ID' });
    }
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Server error retrieving student' });
  }
});

// POST /api/students - Create a record
app.post('/api/students', async (req, res) => {
  try {
    const student = new Student(req.body);
    const savedStudent = await student.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input or missing required fields' });
  }
});

// PUT /api/students/:id - Update a record
app.put('/api/students/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Malformed ID' });
    }
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedStudent) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

// DELETE /api/students/:id - Delete a record
app.delete('/api/students/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Malformed ID' });
    }
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting student' });
  }
});