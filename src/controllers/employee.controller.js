const db = require('../db');

const getAllEmployees = async (req, res) => {
  try {
    const {search, page='1', count='20'} = req.query;
    const pageNum = parseInt(page);
    const limit = parseInt(count);
    const offset = (pageNum - 1) * limit;
    
    let query = 'SELECT * FROM employees';
    const params = [];
    
    if(search){
      query += ' WHERE full_name ILIKE $1 OR email ILIKE $1';
      params.push(`%${search}%`);
      query += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
      params.push(limit, offset);
    } else {
      query += ' ORDER BY created_at DESC LIMIT $1 OFFSET $2';
      params.push(limit, offset);
    }
    
    const employees = await db.query(query, params);
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
    const countResult = await db.query('SELECT COUNT(*) FROM employees');
    const count = parseInt(countResult.rows[0].count);
    const newEmpId = 'emp' + String(count + 1);
    
    const newEmployee = await db.query(
      'INSERT INTO employees (full_name, email, department, empId) VALUES ($1, $2, $3, $4) RETURNING *',
      [full_name, email, department, newEmpId]
    );
    res.status(201).json(newEmployee.rows[0]);
  } catch (err) {
    console.log(err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { full_name, email, department } = req.body;
  
  if (!full_name || !email || !department) {
    return res.status(400).json({ error: 'All fields required' });
  }

  try {
    const result = await db.query(
      'UPDATE employees SET full_name = $1, email = $2, department = $3 WHERE id = $4 RETURNING *',
      [full_name, email, department, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(result.rows[0]);
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
  updateEmployee,
  deleteEmployee
};
