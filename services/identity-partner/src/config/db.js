const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect((err) => {
  if (err) {
    console.error("Lỗi kết nối MySQL:", err);
  } else {
    console.log("Kết nối MySQL thành công!");
  }
});

module.exports = db;

// Kiểm tra đang dùng DB nào
db.query("SELECT DATABASE() AS db", (err, rows) => {
  if (err) {
    console.error("Lỗi query DB:", err);
    return;
  }
  console.log("API đang dùng database:", rows[0].db);
});
