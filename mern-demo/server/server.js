require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  { timestamps: true }
);

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

const memoryStudents = [
  { _id: '1', studentId: 'SV001', name: 'Nguyen Van A', email: 'a@example.com' },
  { _id: '2', studentId: 'SV002', name: 'Tran Thi B', email: 'b@example.com' },
];

async function connectMongo() {
  if (!process.env.MONGODB_URI) {
    console.log('MONGODB_URI is not set. Using in-memory storage for this lab.');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Atlas connected successfully.');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
  }
}

async function getStudents() {
  if (mongoose.connection.readyState === 1) {
    return await Student.find().lean();
  }

  return memoryStudents;
}

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Backend is running successfully.' });
});

app.get('/api/students', async (req, res) => {
  try {
    const students = await getStudents();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
});

app.post('/api/students', async (req, res) => {
  const { studentId, name, email } = req.body || {};

  if (!studentId || !name || !email) {
    return res.status(400).json({ message: 'studentId, name and email are required.' });
  }

  try {
    if (mongoose.connection.readyState === 1) {
      const student = await Student.create({ studentId, name, email });
      return res.status(201).json(student);
    }

    const newStudent = {
      _id: String(Date.now()),
      studentId,
      name,
      email,
    };

    memoryStudents.push(newStudent);
    return res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ message: 'Error creating student', error: error.message });
  }
});

app.put('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  const { studentId, name, email } = req.body || {};

  try {
    if (mongoose.connection.readyState === 1) {
      const student = await Student.findByIdAndUpdate(
        id,
        { studentId, name, email },
        { new: true, runValidators: true }
      );

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      return res.json(student);
    }

    const index = memoryStudents.findIndex((student) => student._id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Student not found' });
    }

    memoryStudents[index] = { ...memoryStudents[index], studentId, name, email };
    return res.json(memoryStudents[index]);
  } catch (error) {
    res.status(400).json({ message: 'Error updating student', error: error.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  const { id } = req.params;

  try {
    if (mongoose.connection.readyState === 1) {
      const student = await Student.findByIdAndDelete(id);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      return res.json({ message: 'Student deleted successfully' });
    }

    const index = memoryStudents.findIndex((student) => student._id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Student not found' });
    }

    memoryStudents.splice(index, 1);
    return res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting student', error: error.message });
  }
});

connectMongo();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
