CREATE DATABASE IF NOT EXISTS medictrack;
USE medictrack;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'DOCTOR', 'NURSE', 'STAFF') NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staff_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  department VARCHAR(100),
  specialty VARCHAR(100),
  shift_start TIME,
  shift_end TIME,
  status ENUM('On Duty', 'Off Duty', 'In Surgery', 'On Break', 'Active') DEFAULT 'Off Duty',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  dob DATE,
  gender ENUM('Male', 'Female', 'Other'),
  phone VARCHAR(20),
  address TEXT,
  medical_condition VARCHAR(255),
  status ENUM('Stable', 'Critical', 'Discharged', 'Attention') DEFAULT 'Stable',
  last_visit DATE,
  assigned_doctor_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_doctor_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT,
  doctor_id INT,
  appointment_time DATETIME NOT NULL,
  type VARCHAR(50),
  status ENUM('Scheduled', 'Completed', 'In Progress', 'Cancelled') DEFAULT 'Scheduled',
  notes TEXT,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS pharmacies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  city VARCHAR(80) NOT NULL,
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  UNIQUE KEY uk_pharmacy_name_city (name, city)
);

CREATE TABLE IF NOT EXISTS medicines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS pharmacy_inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pharmacy_id INT NOT NULL,
  medicine_id INT NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  price DECIMAL(10,2) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_pharmacy_medicine (pharmacy_id, medicine_id),
  FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
);

CREATE INDEX idx_pharmacy_city ON pharmacies(city);
CREATE INDEX idx_inventory_stock ON pharmacy_inventory(stock);

INSERT INTO users (email, password, role, full_name)
SELECT 'admin@medictrack.com', 'admin123', 'ADMIN', 'Dr. Admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@medictrack.com');

INSERT INTO users (email, password, role, full_name)
SELECT 'ayesha@medictrack.com', 'admin123', 'DOCTOR', 'Dr. Ayesha Rao'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ayesha@medictrack.com');

INSERT INTO users (email, password, role, full_name)
SELECT 'smith@medictrack.com', 'admin123', 'DOCTOR', 'Dr. John Smith'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'smith@medictrack.com');

INSERT INTO users (email, password, role, full_name)
SELECT 'nurse.keza@medictrack.com', 'admin123', 'NURSE', 'Keza Umutoni'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'nurse.keza@medictrack.com');

INSERT INTO users (email, password, role, full_name)
SELECT 'staff.eric@medictrack.com', 'admin123', 'STAFF', 'Eric Nshimiyimana'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'staff.eric@medictrack.com');

INSERT INTO staff_details (user_id, department, specialty, shift_start, shift_end, status)
SELECT u.id, 'Cardiology', 'Cardiologist', '08:00:00', '16:00:00', 'On Duty'
FROM users u
WHERE u.email = 'ayesha@medictrack.com'
  AND NOT EXISTS (SELECT 1 FROM staff_details sd WHERE sd.user_id = u.id);

INSERT INTO staff_details (user_id, department, specialty, shift_start, shift_end, status)
SELECT u.id, 'Surgery', 'General Surgeon', '09:00:00', '17:00:00', 'On Duty'
FROM users u
WHERE u.email = 'smith@medictrack.com'
  AND NOT EXISTS (SELECT 1 FROM staff_details sd WHERE sd.user_id = u.id);

INSERT INTO staff_details (user_id, department, specialty, shift_start, shift_end, status)
SELECT u.id, 'Emergency', 'Critical Care', '07:00:00', '15:00:00', 'Active'
FROM users u
WHERE u.email = 'nurse.keza@medictrack.com'
  AND NOT EXISTS (SELECT 1 FROM staff_details sd WHERE sd.user_id = u.id);

INSERT INTO staff_details (user_id, department, specialty, shift_start, shift_end, status)
SELECT u.id, 'Front Desk', 'Administration', '08:30:00', '16:30:00', 'Active'
FROM users u
WHERE u.email = 'staff.eric@medictrack.com'
  AND NOT EXISTS (SELECT 1 FROM staff_details sd WHERE sd.user_id = u.id);

INSERT INTO patients (full_name, dob, gender, phone, address, medical_condition, status, last_visit, assigned_doctor_id)
SELECT 'Sarah Jenkins', '1990-05-15', 'Female', '+250788111111', 'Kimironko, Kigali', 'Hypertension', 'Stable', '2026-03-20', u.id
FROM users u
WHERE u.email = 'ayesha@medictrack.com'
  AND NOT EXISTS (SELECT 1 FROM patients p WHERE p.full_name = 'Sarah Jenkins');

INSERT INTO patients (full_name, dob, gender, phone, address, medical_condition, status, last_visit, assigned_doctor_id)
SELECT 'Michael Chen', '1966-02-10', 'Male', '+250788222222', 'Kacyiru, Kigali', 'Type 2 Diabetes', 'Attention', '2026-03-18', u.id
FROM users u
WHERE u.email = 'ayesha@medictrack.com'
  AND NOT EXISTS (SELECT 1 FROM patients p WHERE p.full_name = 'Michael Chen');

INSERT INTO patients (full_name, dob, gender, phone, address, medical_condition, status, last_visit, assigned_doctor_id)
SELECT 'Robert Wilson', '1979-11-30', 'Male', '+250788333333', 'Remera, Kigali', 'Post-Op Recovery', 'Critical', '2026-03-24', u.id
FROM users u
WHERE u.email = 'smith@medictrack.com'
  AND NOT EXISTS (SELECT 1 FROM patients p WHERE p.full_name = 'Robert Wilson');

INSERT INTO appointments (patient_id, doctor_id, appointment_time, type, status, notes)
SELECT p.id, d.id, '2026-04-02 09:00:00', 'Consultation', 'Scheduled', 'Blood pressure follow-up'
FROM patients p
JOIN users d ON d.email = 'ayesha@medictrack.com'
WHERE p.full_name = 'Sarah Jenkins'
  AND NOT EXISTS (
    SELECT 1 FROM appointments a WHERE a.patient_id = p.id AND a.appointment_time = '2026-04-02 09:00:00'
  );

INSERT INTO appointments (patient_id, doctor_id, appointment_time, type, status, notes)
SELECT p.id, d.id, '2026-04-02 11:00:00', 'Checkup', 'Scheduled', 'Diabetes monthly review'
FROM patients p
JOIN users d ON d.email = 'ayesha@medictrack.com'
WHERE p.full_name = 'Michael Chen'
  AND NOT EXISTS (
    SELECT 1 FROM appointments a WHERE a.patient_id = p.id AND a.appointment_time = '2026-04-02 11:00:00'
  );

INSERT INTO appointments (patient_id, doctor_id, appointment_time, type, status, notes)
SELECT p.id, d.id, '2026-04-03 14:30:00', 'Surgery', 'In Progress', 'Post operation review'
FROM patients p
JOIN users d ON d.email = 'smith@medictrack.com'
WHERE p.full_name = 'Robert Wilson'
  AND NOT EXISTS (
    SELECT 1 FROM appointments a WHERE a.patient_id = p.id AND a.appointment_time = '2026-04-03 14:30:00'
  );

INSERT INTO pharmacies (name, city, address, phone, latitude, longitude)
SELECT 'Kigali Central Pharmacy', 'Kigali', 'KN 3 Rd, Nyarugenge', '+250788555101', -1.9499500, 30.0588000
WHERE NOT EXISTS (SELECT 1 FROM pharmacies WHERE name = 'Kigali Central Pharmacy' AND city = 'Kigali');

INSERT INTO pharmacies (name, city, address, phone, latitude, longitude)
SELECT 'Remera Care Pharmacy', 'Kigali', 'KG 11 Ave, Remera', '+250788555102', -1.9554000, 30.1089000
WHERE NOT EXISTS (SELECT 1 FROM pharmacies WHERE name = 'Remera Care Pharmacy' AND city = 'Kigali');

INSERT INTO pharmacies (name, city, address, phone, latitude, longitude)
SELECT 'Kacyiru Health Pharmacy', 'Kigali', 'KG 7 Ave, Kacyiru', '+250788555103', -1.9386000, 30.0943000
WHERE NOT EXISTS (SELECT 1 FROM pharmacies WHERE name = 'Kacyiru Health Pharmacy' AND city = 'Kigali');

INSERT INTO pharmacies (name, city, address, phone, latitude, longitude)
SELECT 'Musanze Family Pharmacy', 'Musanze', 'Main Street, Musanze', '+250788555201', -1.4995000, 29.6338000
WHERE NOT EXISTS (SELECT 1 FROM pharmacies WHERE name = 'Musanze Family Pharmacy' AND city = 'Musanze');

INSERT INTO medicines (name, description)
SELECT 'Paracetamol', 'Pain and fever reducer'
WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE name = 'Paracetamol');

INSERT INTO medicines (name, description)
SELECT 'Amoxicillin', 'Antibiotic used for bacterial infections'
WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE name = 'Amoxicillin');

INSERT INTO medicines (name, description)
SELECT 'Ibuprofen', 'Anti-inflammatory pain reliever'
WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE name = 'Ibuprofen');

INSERT INTO medicines (name, description)
SELECT 'Metformin', 'Blood sugar control for type 2 diabetes'
WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE name = 'Metformin');

INSERT INTO medicines (name, description)
SELECT 'Aspirin', 'Pain relief and blood thinner'
WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE name = 'Aspirin');

INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, stock, price)
SELECT p.id, m.id, 140, 2.50
FROM pharmacies p, medicines m
WHERE p.name = 'Kigali Central Pharmacy' AND m.name = 'Paracetamol'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_inventory i WHERE i.pharmacy_id = p.id AND i.medicine_id = m.id);

INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, stock, price)
SELECT p.id, m.id, 40, 9.50
FROM pharmacies p, medicines m
WHERE p.name = 'Kigali Central Pharmacy' AND m.name = 'Amoxicillin'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_inventory i WHERE i.pharmacy_id = p.id AND i.medicine_id = m.id);

INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, stock, price)
SELECT p.id, m.id, 80, 4.80
FROM pharmacies p, medicines m
WHERE p.name = 'Kigali Central Pharmacy' AND m.name = 'Ibuprofen'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_inventory i WHERE i.pharmacy_id = p.id AND i.medicine_id = m.id);

INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, stock, price)
SELECT p.id, m.id, 55, 6.20
FROM pharmacies p, medicines m
WHERE p.name = 'Remera Care Pharmacy' AND m.name = 'Metformin'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_inventory i WHERE i.pharmacy_id = p.id AND i.medicine_id = m.id);

INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, stock, price)
SELECT p.id, m.id, 120, 2.20
FROM pharmacies p, medicines m
WHERE p.name = 'Remera Care Pharmacy' AND m.name = 'Paracetamol'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_inventory i WHERE i.pharmacy_id = p.id AND i.medicine_id = m.id);

INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, stock, price)
SELECT p.id, m.id, 75, 3.10
FROM pharmacies p, medicines m
WHERE p.name = 'Kacyiru Health Pharmacy' AND m.name = 'Aspirin'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_inventory i WHERE i.pharmacy_id = p.id AND i.medicine_id = m.id);

INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, stock, price)
SELECT p.id, m.id, 35, 10.80
FROM pharmacies p, medicines m
WHERE p.name = 'Kacyiru Health Pharmacy' AND m.name = 'Amoxicillin'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_inventory i WHERE i.pharmacy_id = p.id AND i.medicine_id = m.id);

INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, stock, price)
SELECT p.id, m.id, 48, 6.00
FROM pharmacies p, medicines m
WHERE p.name = 'Musanze Family Pharmacy' AND m.name = 'Metformin'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_inventory i WHERE i.pharmacy_id = p.id AND i.medicine_id = m.id);

INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, stock, price)
SELECT p.id, m.id, 98, 2.40
FROM pharmacies p, medicines m
WHERE p.name = 'Musanze Family Pharmacy' AND m.name = 'Paracetamol'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_inventory i WHERE i.pharmacy_id = p.id AND i.medicine_id = m.id);
