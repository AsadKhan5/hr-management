const db = require('../db');

const markAttendance = async (req, res) => {
  const { employee_id, status, check_in, check_out } = req.body;
  
  if (!employee_id || !status) {
    return res.status(400).json({ error: 'employee_id and status required' });
  }

  try {
    const attendance = await db.query(
      'INSERT INTO attendance (employee_id, status, check_in, check_out) VALUES ($1, $2, $3, $4) RETURNING *',
      [employee_id, status, check_in || null, check_out || null]
    );
    res.status(201).json(attendance.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAttendance = async (req, res) => {
  const { employeeId } = req.params;
  const { date } = req.query;

  try {
    let query = `
      SELECT a.*, e.full_name, e.email, e.department 
      FROM attendance a 
      JOIN employees e ON a.employee_id = e.id 
      WHERE a.employee_id = $1
    `;
    const params = [employeeId];

    if (date) {
      query += ' AND a.date = $2';
      params.push(date);
    }

    query += ' ORDER BY a.date DESC';

    const records = await db.query(query, params);
    res.json(records.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAttendanceByDate = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: 'date parameter required' });
  }

  try {
    const records = await db.query(
      `SELECT a.*, e.full_name, e.email, e.department 
       FROM attendance a 
       JOIN employees e ON a.employee_id = e.id 
       WHERE a.date = $1 
       ORDER BY a.created_at DESC`,
      [date]
    );
    res.json(records.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  markAttendance,
  getAttendance,
  getAttendanceByDate
};
