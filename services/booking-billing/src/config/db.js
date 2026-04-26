const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "agritour_booking",
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error(" Lỗi kết nối MySQL:", err);
    return;
  }

  console.log(" Kết nối MySQL thành công!");
  connection.release();
});

module.exports = db;

// Kiểm tra đang dùng DB nào
db.query("SELECT DATABASE() AS db", (err, rows) => {
  if (err) {
    console.error(" Lỗi query DB:", err);
    return;
  }
  console.log(" API đang dùng database:", rows[0].db);
});

