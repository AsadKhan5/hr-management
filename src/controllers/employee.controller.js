const prisma = require('../db/prismaClient');

const getAllEmployees = async (req, res) => {
  try {
    const { search, page = '1', count = '20' } = req.query;
    const pageNum = parseInt(page);
    const limit = parseInt(count);
    const skip = (pageNum - 1) * limit;

    const where = search
      ? {
          OR: [
            { full_name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { department: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {};

    const employees = await prisma.employees.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit
    });
    res.json(employees);
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
    // Get the highest empId number and increment it
    const lastEmp = await prisma.employees.findFirst({
      orderBy: { created_at: 'desc' },
      select: { empId: true }
    });
    let newEmpId = 'emp1';
    if (lastEmp && lastEmp.empId) {
      const num = parseInt(lastEmp.empId.replace('emp', ''));
      newEmpId = 'emp' + (isNaN(num) ? 1 : num + 1);
    }
console.log('New Employee ID:', newEmpId);
    const newEmployee = await prisma.employees.create({
      data: {
        full_name,
        email,
        department,
        empId: newEmpId
      }
    });
    res.status(201).json(newEmployee);
  } catch (err) {
    console.log(err);
    if (err.code === 'P2002') {
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
    const updated = await prisma.employees.update({
      where: { id },
      data: { full_name, email, department }
    });
    res.json(updated);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.status(500).json({ error: err.message });
  }
};

const deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.employees.delete({ where: { id } });
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee
};
