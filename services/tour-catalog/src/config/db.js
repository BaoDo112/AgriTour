const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "agritour_catalog",
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.query("SELECT DATABASE() AS db", (err, rows) => {
  if (err) {
    console.error("❌ Lỗi query kiểm tra DB:", err.message);
    return;
  }

  if (rows[0]?.db) {
    console.log("📂 API đang dùng database:", rows[0].db);
  } else {
    console.log("⚠️ Không tìm thấy database mặc định, hãy kiểm tra file .sql");
  }
});

module.exports = db;