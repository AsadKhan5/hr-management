CREATE DATABASE hr_management;


CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Table
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  check_in TIMESTAMP,
  check_out TIMESTAMP,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);


INSERT INTO employees (first_name, last_name, email, phone, position, department, salary, status) VALUES
  ('John', 'Doe', 'john.doe@company.com', '555-0101', 'Software Engineer', 'IT', 75000.00, 'active'),
  ('Jane', 'Smith', 'jane.smith@company.com', '555-0102', 'HR Manager', 'Human Resources', 65000.00, 'active'),
  ('Mike', 'Johnson', 'mike.johnson@company.com', '555-0103', 'Sales Representative', 'Sales', 55000.00, 'active'),
  ('Emily', 'Brown', 'emily.brown@company.com', '555-0104', 'Marketing Specialist', 'Marketing', 60000.00, 'active'),
  ('David', 'Wilson', 'david.wilson@company.com', '555-0105', 'Accountant', 'Finance', 70000.00, 'active');

INSERT INTO attendance (employee_id, date, check_in, check_out, status, notes) VALUES
  ((SELECT id FROM employees WHERE email = 'john.doe@company.com'), CURRENT_DATE, '2026-01-17 09:00:00', '2026-01-17 17:30:00', 'present', 'On time'),
  ((SELECT id FROM employees WHERE email = 'jane.smith@company.com'), CURRENT_DATE, '2026-01-17 09:15:00', '2026-01-17 17:45:00', 'late', 'Traffic delay'),
  ((SELECT id FROM employees WHERE email = 'mike.johnson@company.com'), CURRENT_DATE, '2026-01-17 08:45:00', '2026-01-17 17:00:00', 'present', 'Early arrival'),
  ((SELECT id FROM employees WHERE email = 'emily.brown@company.com'), CURRENT_DATE, NULL, NULL, 'on-leave', 'Sick leave'),
  ((SELECT id FROM employees WHERE email = 'david.wilson@company.com'), CURRENT_DATE, '2026-01-17 09:00:00', NULL, 'present', 'Still working');
