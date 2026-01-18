const express = require('express');
const router = express.Router();
const { getAllEmployees, addEmployee, updateEmployee, deleteEmployee } = require('../controllers/employee.controller');

router.post('/', addEmployee);
router.get('/', getAllEmployees);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

module.exports = router;
