require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const errorHandler = require('./middlewares/error.middleware');

// Import routes
const employeeRoutes = require('./routes/employee.routes');
const attendanceRoutes = require('./routes/attendance.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/employees', employeeRoutes);
app.use('/attendance', attendanceRoutes);
app.get('/dashboard', require('./controllers/attendance.controller').getDashboard);

// test
app.get('/test', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.use(errorHandler);

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
  } else {
    console.log('Database connected successfully');
    release();
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/test`);
});
