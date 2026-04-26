CREATE TABLE IF NOT EXISTS users (
  user_id INT NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  role ENUM('customer', 'admin', 'partner') DEFAULT 'customer',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS partners (
  partner_id INT NOT NULL AUTO_INCREMENT,
  user_id INT DEFAULT NULL,
  company_name VARCHAR(150) DEFAULT NULL,
  business_license VARCHAR(100) DEFAULT NULL,
  address VARCHAR(255) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  approved TINYINT(1) DEFAULT 0,
  PRIMARY KEY (partner_id),
  UNIQUE KEY uq_partners_user_id (user_id),
  CONSTRAINT fk_partners_user FOREIGN KEY (user_id) REFERENCES users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO users (user_id, full_name, email, password_hash, phone, role)
VALUES
  (1, 'Admin Tester', 'admin@example.com', '$2a$10$cGSDGlaSjuN1UDZRiZlaDeBUOHeimifpjxOfgmIKDjWEEWxKlrud6', '0900000001', 'admin'),
  (2, 'Partner Tester', 'partner@example.com', '$2a$10$Ys3Xx21F2RoPWUrfhqXbPeufa6sSr3bW7DAZEc0GRq.l7YTVkKNia', '0900000002', 'partner'),
  (3, 'Customer Tester', 'customer@example.com', '$2a$10$wKh/2iXQvohrKB7uCosaCuJol4AkSMl6an.mEdIo1QacCB6Nk6ZmG', '0900000003', 'customer')
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  password_hash = VALUES(password_hash),
  phone = VALUES(phone),
  role = VALUES(role);

INSERT INTO partners (partner_id, user_id, company_name, business_license, address, description, approved)
VALUES
  (1, 2, 'Agri Partner Co', 'BL-001', 'Thu Duc City, Vietnam', 'Seed partner account for local integration testing.', 1)
ON DUPLICATE KEY UPDATE
  company_name = VALUES(company_name),
  business_license = VALUES(business_license),
  address = VALUES(address),
  description = VALUES(description),
  approved = VALUES(approved);