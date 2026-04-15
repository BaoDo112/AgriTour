CREATE DATABASE IF NOT EXISTS agritour_booking
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;
USE agritour_booking;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE bookings (
  booking_id INT(11) NOT NULL AUTO_INCREMENT,
  user_id INT(11) DEFAULT NULL,
  tour_id INT(11) DEFAULT NULL,
  tour_title VARCHAR(255) DEFAULT NULL,
  tour_image_url VARCHAR(255) DEFAULT NULL,
  tour_start_date DATE DEFAULT NULL,
  tour_end_date DATE DEFAULT NULL,
  tour_unit_price DECIMAL(10,2) DEFAULT NULL,
  booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  num_people INT(11) DEFAULT NULL,
  adults INT(11) DEFAULT 0,
  children INT(11) DEFAULT 0,
  small_children INT(11) DEFAULT 0,
  infants INT(11) DEFAULT 0,
  customer_name VARCHAR(150) DEFAULT NULL,
  email VARCHAR(150) DEFAULT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  address VARCHAR(255) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  visa_option TINYINT(1) DEFAULT 0,
  visa_count INT(11) DEFAULT 0,
  single_room_option TINYINT(1) DEFAULT 0,
  single_room_count INT(11) DEFAULT 0,
  payment_method ENUM('cash', 'bank', 'credit_card', 'momo', 'zalo', 'paypal') DEFAULT 'cash',
  total_price DECIMAL(10,2) DEFAULT NULL,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  PRIMARY KEY (booking_id),
  KEY idx_bookings_user_id (user_id),
  KEY idx_bookings_tour_id (tour_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE payments (
  payment_id INT(11) NOT NULL AUTO_INCREMENT,
  booking_id INT(11) DEFAULT NULL,
  amount DECIMAL(10,2) DEFAULT NULL,
  payment_method ENUM('credit_card', 'bank_transfer', 'cash') DEFAULT 'cash',
  payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('paid', 'unpaid', 'refunded') DEFAULT 'paid',
  PRIMARY KEY (payment_id),
  KEY idx_payments_booking_id (booking_id),
  CONSTRAINT fk_payments_booking
    FOREIGN KEY (booking_id) REFERENCES bookings (booking_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE invoices (
  invoice_id INT(11) NOT NULL AUTO_INCREMENT,
  booking_id INT(11) DEFAULT NULL,
  payment_id INT(11) DEFAULT NULL,
  invoice_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(10,2) DEFAULT NULL,
  status ENUM('issued', 'cancelled') DEFAULT 'issued',
  PRIMARY KEY (invoice_id),
  KEY idx_invoices_booking_id (booking_id),
  KEY idx_invoices_payment_id (payment_id),
  CONSTRAINT fk_invoices_booking
    FOREIGN KEY (booking_id) REFERENCES bookings (booking_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT fk_invoices_payment
    FOREIGN KEY (payment_id) REFERENCES payments (payment_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
