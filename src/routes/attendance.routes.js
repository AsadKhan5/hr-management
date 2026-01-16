const express = require('express');
const router = express.Router();
const { markAttendance, getAttendance, getAttendanceByDate } = require('../controllers/attendance.controller');

router.post('/', markAttendance);
router.get('/:employeeId', getAttendance);
router.get('/', getAttendanceByDate);

module.exports = router;
