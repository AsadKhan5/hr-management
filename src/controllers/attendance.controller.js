const db = require('../db');

const markAttendance = async (req, res) => {
  const { empId, date, status } = req.body;
  
  if (!empId || !status) {
    return res.status(400).json({ error: 'empId and status required' });
  }

  if (status !== 'Present' && status !== 'Absent') {
    return res.status(400).json({ error: 'status must be Present or Absent' });
  }

  try {
    const employee = await db.query('SELECT empid FROM employees WHERE empid = $1', [empId]);
    
    if (employee.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    const attendance = await db.query(
      'INSERT INTO attendance (empId, date, status) VALUES ($1, $2, $3) RETURNING *',
      [empId, date || new Date().toISOString().split('T')[0], status]
    );
    res.status(201).json(attendance.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAttendance = async (req, res) => {
  const { empId } = req.params;
  const { date } = req.query;

  try {
    let query = `
      SELECT a.id, a.empid, a.date, a.status, a.created_at, 
             e.full_name, e.email, e.department, e.empid
      FROM attendance a 
      JOIN employees e ON a.empid = e.empid 
      WHERE e.empid = $1
    `;
    const params = [empId];

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

const getEmployeeStats = async (req, res) => {
  const { empId } = req.params;

  try {
    const stats = await db.query(
      `SELECT 
         e.id, e.full_name, e.email, e.department, e.empid,
         COUNT(CASE WHEN a.status = 'Present' THEN 1 END) as total_present,
         COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) as total_absent,
         COUNT(a.id) as total_days
       FROM employees e
       LEFT JOIN attendance a ON e.empid = a.empid
       WHERE e.empid = $1
       GROUP BY e.id`,
      [empId]
    );
    
    if (stats.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(stats.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDashboard = async (req, res) => {
  try {
    const summary = await db.query(`
      SELECT 
        COUNT(DISTINCT e.id) as total_employees,
        COUNT(CASE WHEN a.status = 'Present' AND a.date = CURRENT_DATE THEN 1 END) as present_today,
        COUNT(CASE WHEN a.status = 'Absent' AND a.date = CURRENT_DATE THEN 1 END) as absent_today
      FROM employees e
      LEFT JOIN attendance a ON e.empid = a.empid
    `);

    const employeeList = await db.query(`
      SELECT 
        e.id, e.full_name, e.email, e.department, e.empid,
        COUNT(CASE WHEN a.status = 'Present' THEN 1 END) as total_present,
        COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) as total_absent,
        MAX(a.date) as last_attendance_date
      FROM employees e
      LEFT JOIN attendance a ON e.empid = a.empid
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `);

    res.json({
      summary: summary.rows[0],
      employees: employeeList.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  markAttendance,
  getAttendance,
  getEmployeeStats,
  getDashboard
};
