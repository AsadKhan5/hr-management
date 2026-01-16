const express = require('express');
const router = express.Router();
const { getAllEmployees, addEmployee, deleteEmployee } = require('../controllers/employee.controller');

router.post('/', addEmployee);
router.get('/', getAllEmployees);
router.delete('/:id', deleteEmployee);

module.exports = router;
