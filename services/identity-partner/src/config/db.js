const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "agritour_identity",
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = db;

// Kiểm tra đang dùng DB nào
db.query("SELECT DATABASE() AS db", (err, rows) => {
  if (err) {
    console.error("Lỗi query DB:", err);
    return;
  }
  if (rows[0]?.db) {
    console.log("API đang dùng database:", rows[0].db);
  }
});
