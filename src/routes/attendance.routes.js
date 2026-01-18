const express = require('express');
const router = express.Router();
const { markAttendance, getAttendance, getEmployeeStats, getDashboard } = require('../controllers/attendance.controller');

router.post('/', markAttendance);
router.get('/:empId/stats', getEmployeeStats);
router.get('/:empId', getAttendance);

module.exports = router;
