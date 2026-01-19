const prisma = require('../db/prismaClient');

const markAttendance = async (req, res) => {
  const { empId, date, status } = req.body;
  
  if (!empId || !status) {
    return res.status(400).json({ error: 'empId and status required' });
  }

  if (status !== 'Present' && status !== 'Absent') {
    return res.status(400).json({ error: 'status must be Present or Absent' });
  }

  try {
    const employee = await prisma.employees.findUnique({ where: { empId: empId } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    const attendance = await prisma.attendance.create({
      data: {
        empId,
        date: date ? new Date(date) : new Date(),
        status
      }
    });
    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAttendance = async (req, res) => {
  const { empId } = req.params;
  const { date } = req.query;

  try {
    const where = {
      empId,
      ...(date ? { date: new Date(date) } : {})
    };
    const records = await prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        employee: {
          select: {
            full_name: true,
            email: true,
            department: true,
            empId: true
          }
        }
      }
    });
    // Flatten employee info into each record for compatibility
    const result = records.map(r => ({
      id: r.id,
      empid: r.empId,
      date: r.date,
      status: r.status,
      created_at: r.created_at,
      full_name: r.employee?.full_name,
      email: r.employee?.email,
      department: r.employee?.department
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getEmployeeStats = async (req, res) => {
  const { empId } = req.params;

  try {
    const employee = await prisma.employees.findUnique({
      where: { empId },
      include: { attendance: true }
    });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    const total_present = employee.attendance.filter(a => a.status === 'Present').length;
    const total_absent = employee.attendance.filter(a => a.status === 'Absent').length;
    const total_days = employee.attendance.length;
    res.json({
      id: employee.id,
      full_name: employee.full_name,
      email: employee.email,
      department: employee.department,
      empid: employee.empId,
      total_present,
      total_absent,
      total_days
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDashboard = async (req, res) => {
  try {
    // Summary
    const [total_employees, present_today, absent_today] = await Promise.all([
      prisma.employees.count(),
      prisma.attendance.count({ where: { status: 'Present', date: { equals: new Date(new Date().toISOString().split('T')[0]) } } }),
      prisma.attendance.count({ where: { status: 'Absent', date: { equals: new Date(new Date().toISOString().split('T')[0]) } } })
    ]);

    // Employee List
    const employees = await prisma.employees.findMany({
      orderBy: { created_at: 'desc' },
      include: { attendance: true }
    });
    const employeeList = employees.map(e => {
      const total_present = e.attendance.filter(a => a.status === 'Present').length;
      const total_absent = e.attendance.filter(a => a.status === 'Absent').length;
      const last_attendance_date = e.attendance.length > 0 ? e.attendance.reduce((max, a) => a.date > max ? a.date : max, e.attendance[0].date) : null;
      return {
        id: e.id,
        full_name: e.full_name,
        email: e.email,
        department: e.department,
        empid: e.empId,
        total_present,
        total_absent,
        last_attendance_date
      };
    });
    res.json({
      summary: { total_employees, present_today, absent_today },
      employees: employeeList
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
