-- CREATE DATABASE hr_management;


-- CREATE TABLE employees (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   full_name VARCHAR(100) NOT NULL,
--   email VARCHAR(255) UNIQUE NOT NULL,
--   department VARCHAR(100) NOT NULL,
--   empId VARCHAR(50) UNIQUE NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Attendance Table
-- CREATE TABLE attendance (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   empId VARCHAR(50) NOT NULL,
--   date DATE DEFAULT CURRENT_DATE,
--   status VARCHAR(50) NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (empId) REFERENCES employees(empId) ON DELETE CASCADE
-- );

-- CREATE INDEX idx_attendance_empid ON attendance(empId);
-- CREATE INDEX idx_attendance_date ON attendance(date);