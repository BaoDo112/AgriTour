const mysql = require("mysql2");

const db = mysql.createConnection({
  
  host: process.env.DB_HOST || "db-agritour", 
  
  user: process.env.DB_USER || "agritour",
  
  password: process.env.DB_PASSWORD || "your_password",
  
  database: process.env.DB_NAME || "mytour",
  
  port: process.env.DB_PORT || 3306 
});

db.connect((err) => {
  if (err) {
    console.error("❌ Lỗi kết nối MySQL:", err.message);
  } else {
    console.log("✅ Kết nối MySQL thành công!");
  }
});

db.query("SELECT DATABASE() AS db", (err, rows) => {
  if (err) {
    console.error("❌ Lỗi query kiểm tra DB:", err.message);
    return;
  }
  if (rows[0] && rows[0].db) {
    console.log("📂 API đang dùng database:", rows[0].db);
  } else {
    console.log("⚠️ Không tìm thấy database mặc định, hãy kiểm tra file .sql");
  }
});

module.exports = db;