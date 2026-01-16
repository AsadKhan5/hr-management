const db = require('../db');

const getAllEmployees = async (req, res) => {
  try {
    const employees = await db.query('SELECT * FROM employees ORDER BY created_at DESC');
    res.json(employees.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addEmployee = async (req, res) => {
  const { full_name, email, department } = req.body;
  
  if (!full_name || !email || !department) {
    return res.status(400).json({ error: 'All fields required' });
  }

  try {
    const newEmployee = await db.query(
      'INSERT INTO employees (full_name, email, department) VALUES ($1, $2, $3) RETURNING *',
      [full_name, email, department]
    );
    res.status(201).json(newEmployee.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

const deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM employees WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllEmployees,
  addEmployee,
  deleteEmployee
};
